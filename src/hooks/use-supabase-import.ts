import { useState } from "react";
import { createSupabaseClientWithUser } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { mapCSTimerPuzzle, isValidPuzzle } from "@/lib/puzzle-types";

export interface ImportStats {
  totalSolves: number;
  importedSolves: number;
  skippedSolves: number;
  unsupportedPuzzles: Set<string>;
  errors: string[];
}

export interface ImportProgress {
  currentSession: number;
  totalSessions: number;
  currentSessionName: string;
  currentBatch: number;
  totalBatches: number;
  importedSolves: number;
  totalSolves: number;
}

export function useSupabaseImport() {
  const [isImporting, setIsImporting] = useState(false);
  const { user } = useUser();

  const importSolves = async (
    solves: Array<{
      time: number;
      penalty: "none" | "plus2" | "dnf";
      date: Date;
      scramble: string;
      notes?: string;
      puzzle: string;
      sessionName?: string; // Ajouter le nom de session cstimer
    }>,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportStats> => {
    if (!user) {
      throw new Error("Utilisateur non connecté");
    }

    console.log(`Début import pour utilisateur: ${user.id}`);
    console.log(`Nombre de solves à importer: ${solves.length}`);

    setIsImporting(true);
    const stats: ImportStats = {
      totalSolves: solves.length,
      importedSolves: 0,
      skippedSolves: 0,
      unsupportedPuzzles: new Set(),
      errors: [],
    };

    try {
      // Grouper les solves par session cstimer (pas par puzzle)
      const solvesBySession = new Map<string, typeof solves>();

      for (const solve of solves) {
        // Vérifier si le puzzle est supporté
        if (!isValidPuzzle(solve.puzzle)) {
          stats.skippedSolves++;
          stats.unsupportedPuzzles.add(solve.puzzle);
          continue;
        }

        // Utiliser le nom de session cstimer comme clé unique
        const sessionKey = solve.sessionName || "default";

        if (!solvesBySession.has(sessionKey)) {
          solvesBySession.set(sessionKey, []);
        }
        solvesBySession.get(sessionKey)!.push(solve);
      }

      const sessionEntries = Array.from(solvesBySession.entries());
      const totalSessions = sessionEntries.length;
      let currentSession = 0;

      // Créer les sessions et importer les solves
      for (const [sessionKey, sessionSolves] of sessionEntries) {
        currentSession++;
        try {
          // Déterminer le puzzle type (tous les solves d'une session ont le même puzzle)
          const puzzleType = sessionSolves[0]?.puzzle || "333";

          // Créer le nom de session
          const displaySessionName =
            sessionKey === "default"
              ? `Import cstimer - ${puzzleType}`
              : `Import cstimer - ${sessionKey}`;

          // Créer un nom plus court et lisible
          let finalSessionName = displaySessionName;
          if (finalSessionName.length > 50) {
            finalSessionName = finalSessionName.substring(0, 47) + "...";
          }

          const sessionName = displaySessionName;

          console.log(
            `Tentative création session: ${finalSessionName} (${puzzleType}) pour user: ${user.id}`
          );

          // Utiliser le client Supabase avec l'ID utilisateur pour RLS
          const supabaseWithUser = await createSupabaseClientWithUser(user.id);

          // Utiliser la fonction RPC pour créer la session
          const { data: newSessionData, error: createError } =
            await supabaseWithUser.rpc("create_session_with_auth", {
              p_user_id: user.id,
              p_name: finalSessionName,
              p_puzzle_type: puzzleType,
              p_is_active: true,
            });

          if (createError) {
            console.error(
              `Erreur création session ${puzzleType}:`,
              createError
            );
            stats.errors.push(
              `Erreur création session ${puzzleType}: ${createError.message}`
            );
            continue;
          }

          if (!newSessionData || newSessionData.length === 0) {
            console.error(`Aucune session créée pour ${puzzleType}`);
            stats.errors.push(`Aucune session créée pour ${puzzleType}`);
            continue;
          }

          const newSession = newSessionData[0];

          const sessionId = newSession.id;

          // Préparer les solves pour l'insertion
          const solvesToInsert = sessionSolves.map((solve) => ({
            user_id: user.id,
            session_id: sessionId,
            puzzle_type: puzzleType,
            time: solve.time,
            penalty: solve.penalty,
            scramble: solve.scramble,
            notes: solve.notes || null,
            created_at: solve.date.toISOString(),
          }));

          console.log(`Exemple de solve à insérer:`, solvesToInsert[0]);

          // Insérer les solves par batch de 100
          const batchSize = 100;
          const totalBatches = Math.ceil(solvesToInsert.length / batchSize);

          for (let i = 0; i < solvesToInsert.length; i += batchSize) {
            const currentBatch = Math.floor(i / batchSize) + 1;
            const batch = solvesToInsert.slice(i, i + batchSize);

            // Mettre à jour le progrès pour ce batch
            if (onProgress) {
              onProgress({
                currentSession,
                totalSessions,
                currentSessionName: sessionName,
                currentBatch,
                totalBatches,
                importedSolves: stats.importedSolves + i,
                totalSolves: stats.totalSolves,
              });
            }

            console.log(
              `Tentative insertion batch ${currentBatch}/${totalBatches}: ${batch.length} solves pour session: ${sessionId}`
            );

            // Validation des données avant insertion
            const validBatch = batch.filter((solve) => {
              if (!solve.user_id || !solve.session_id || !solve.puzzle_type) {
                console.error("Solve invalide - données manquantes:", solve);
                return false;
              }
              if (typeof solve.time !== "number" || solve.time <= 0) {
                console.error("Solve invalide - temps incorrect:", solve);
                return false;
              }
              return true;
            });

            if (validBatch.length !== batch.length) {
              console.error(
                `${
                  batch.length - validBatch.length
                } solves invalides dans le batch`
              );
              stats.errors.push(
                `${
                  batch.length - validBatch.length
                } solves invalides dans le batch ${currentBatch}`
              );
            }

            if (validBatch.length === 0) {
              console.error(
                "Aucun solve valide dans le batch, passage au suivant"
              );
              continue;
            }

            try {
              // Utiliser la fonction RPC directe pour importer les solves
              console.log(
                `Tentative import batch ${currentBatch}/${totalBatches}:`,
                {
                  user_id: user.id,
                  session_id: sessionId,
                  puzzle_type: puzzleType,
                  batch_size: validBatch.length,
                  first_solve: validBatch[0],
                }
              );

              const { data: insertedCount, error: insertError } =
                await supabaseWithUser.rpc("import_solves_direct", {
                  p_user_id: user.id,
                  p_session_id: sessionId,
                  p_puzzle_type: puzzleType,
                  p_solves_data: validBatch,
                });

              if (insertError) {
                console.error(
                  `Erreur insertion batch ${currentBatch}/${totalBatches}:`,
                  insertError
                );
                console.error("Détails de l'erreur:", {
                  code: insertError.code,
                  message: insertError.message,
                  details: insertError.details,
                  hint: insertError.hint,
                });
                stats.errors.push(
                  `Erreur insertion batch ${currentBatch}/${totalBatches}: ${insertError.message}`
                );
                continue;
              }

              console.log(
                `✅ Batch ${currentBatch}/${totalBatches} traité: ${
                  insertedCount || 0
                } solves insérés sur ${validBatch.length}`
              );

              if (insertedCount !== validBatch.length) {
                console.warn(
                  `⚠️ ${
                    validBatch.length - (insertedCount || 0)
                  } solves non insérés dans ce batch`
                );
              }

              // Déclencher l'événement de mise à jour des solves
              window.dispatchEvent(new CustomEvent("solves-updated"));
            } catch (insertException) {
              console.error(
                `Exception lors de l'insertion batch ${currentBatch}/${totalBatches}:`,
                insertException
              );
              stats.errors.push(
                `Exception insertion batch ${currentBatch}/${totalBatches}: ${
                  insertException instanceof Error
                    ? insertException.message
                    : "Erreur inconnue"
                }`
              );
              continue;
            }
          }

          stats.importedSolves += sessionSolves.length;

          // Déclencher l'événement de mise à jour des sessions
          window.dispatchEvent(new CustomEvent("sessions-updated"));
        } catch (error) {
          stats.errors.push(
            `Erreur traitement session: ${
              error instanceof Error ? error.message : "Erreur inconnue"
            }`
          );
        }
      }
    } catch (error) {
      stats.errors.push(
        `Erreur générale: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
    } finally {
      setIsImporting(false);

      // Déclencher les événements de mise à jour finale immédiatement
      console.log("🔄 Déclenchement immédiat des événements de mise à jour");
      window.dispatchEvent(new CustomEvent("solves-updated"));
      window.dispatchEvent(new CustomEvent("sessions-updated"));
      window.dispatchEvent(new CustomEvent("stats-updated"));
    }

    return stats;
  };

  return {
    importSolves,
    isImporting,
  };
}
