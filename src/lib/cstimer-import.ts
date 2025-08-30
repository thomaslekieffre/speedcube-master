import {
  mapCSTimerPuzzle,
  mapCSTimerScrType,
  isValidPuzzle,
} from "@/lib/puzzle-types";

export interface CSTimerSolve {
  penalty: number;
  time: number;
  scramble: string;
  notes: string;
  timestamp: number;
}

export interface CSTimerSession {
  name: string;
  solves: CSTimerSolve[];
  options?: Record<string, any>;
  scrType?: string;
  puzzleType?: string;
}

export interface CSTimerData {
  sessions: Record<string, CSTimerSession>;
  properties?: Record<string, any>;
}

export interface ImportResult {
  success: boolean;
  message: string;
  data?: {
    sessions: CSTimerSession[];
    totalSolves: number;
    puzzles: string[];
  };
  errors?: string[];
}

export function parseCSTimerFile(content: string): ImportResult {
  try {
    const data = JSON.parse(content);
    const sessions: CSTimerSession[] = [];
    const errors: string[] = [];
    let totalSolves = 0;
    const puzzles = new Set<string>();

    // Traiter chaque session directement dans le JSON
    for (const [sessionKey, sessionData] of Object.entries(data)) {
      if (!sessionKey.startsWith("session") || !Array.isArray(sessionData)) {
        continue;
      }

      // Extraire le type de puzzle depuis les métadonnées
      let puzzleType = "333"; // défaut
      let sessionDisplayName = sessionKey; // nom par défaut
      let scrType = null;

      if (data.properties?.sessionData) {
        try {
          const sessionInfo = JSON.parse(data.properties.sessionData);
          const sessionNumber = sessionKey.replace("session", "");
          if (sessionInfo[sessionNumber]) {
            const sessionData = sessionInfo[sessionNumber];
            // Utiliser le scrType pour déterminer le puzzle (plus fiable)
            if (sessionData.opt?.scrType) {
              scrType = sessionData.opt.scrType;

              // Vérifier si c'est un scrType non supporté
              const unsupportedScrTypes = [
                "pll",
                "oll",
                "ll",
                "f2l",
                "corners",
                "edges",
                "input",
                "r234w",
              ];
              if (unsupportedScrTypes.includes(scrType.toLowerCase())) {
                console.log(
                  `Session ${sessionNumber}: scrType "${scrType}" -> non supporté (ignoré)`
                );
                continue; // Ignorer cette session complètement
              }

              const mappedPuzzleFromScrType = mapCSTimerScrType(scrType);
              if (mappedPuzzleFromScrType) {
                puzzleType = mappedPuzzleFromScrType;
                console.log(
                  `Session ${sessionNumber}: scrType "${scrType}" -> puzzle "${puzzleType}"`
                );
              } else {
                console.log(
                  `Session ${sessionNumber}: scrType "${scrType}" -> puzzle non supporté (ignoré)`
                );
                continue; // Ignorer cette session si le scrType ne correspond à aucun puzzle supporté
              }
            } else {
              // Fallback sur le nom si pas de scrType
              const mappedPuzzleFromName = mapCSTimerPuzzle(sessionData.name);
              if (mappedPuzzleFromName) {
                puzzleType = mappedPuzzleFromName;
                console.log(
                  `Session ${sessionNumber}: nom "${sessionData.name}" -> puzzle "${puzzleType}" (mappé)`
                );
              } else {
                // Si le nom ne correspond pas, essayer de deviner basé sur le nom
                const name = sessionData.name.toLowerCase();

                // Vérifier d'abord si c'est un puzzle non supporté
                if (
                  name.includes("oll") ||
                  name.includes("pll") ||
                  name.includes("ll") ||
                  name.includes("f2l") ||
                  name.includes("cross") ||
                  name.includes("relay") ||
                  name.includes("challenge") ||
                  name.includes("train") ||
                  name.includes("exercise") ||
                  name.includes("method") ||
                  name.includes("practice") ||
                  name.includes("drill") ||
                  name.includes("magic") ||
                  name.includes("other") ||
                  name.includes("input")
                ) {
                  console.log(
                    `Session ${sessionNumber}: nom "${sessionData.name}" -> puzzle non supporté (ignoré)`
                  );
                  continue; // Ignorer cette session complètement
                }

                if (name.includes("3x3") || name.includes("333")) {
                  puzzleType = "333";
                } else if (name.includes("2x2") || name.includes("222")) {
                  puzzleType = "222";
                } else if (name.includes("4x4") || name.includes("444")) {
                  puzzleType = "444";
                } else if (name.includes("5x5") || name.includes("555")) {
                  puzzleType = "555";
                } else if (name.includes("6x6") || name.includes("666")) {
                  puzzleType = "666";
                } else if (name.includes("7x7") || name.includes("777")) {
                  puzzleType = "777";
                } else if (
                  name.includes("pyram") ||
                  name.includes("pyraminx")
                ) {
                  puzzleType = "pyraminx";
                } else if (name.includes("skewb")) {
                  puzzleType = "skewb";
                } else if (name.includes("sq1") || name.includes("square")) {
                  puzzleType = "sq1";
                } else if (name.includes("clock")) {
                  puzzleType = "clock";
                } else if (name.includes("megaminx") || name.includes("minx")) {
                  puzzleType = "minx";
                } else {
                  console.log(
                    `Session ${sessionNumber}: nom "${sessionData.name}" -> puzzle inconnu (ignoré)`
                  );
                  continue; // Ignorer cette session si on ne peut pas identifier le puzzle
                }
                console.log(
                  `Session ${sessionNumber}: nom "${sessionData.name}" -> puzzle "${puzzleType}" (devine)`
                );
              }
            }
            // Utiliser le nom de session personnalisé pour l'affichage
            sessionDisplayName = `${
              sessionData.name || sessionKey
            } (${sessionKey})`;
          }
        } catch (e) {
          console.error("Erreur parsing sessionData:", e);
        }
      }

      // Mapper le type de puzzle final
      const mappedPuzzle = mapCSTimerPuzzle(puzzleType);
      if (mappedPuzzle) {
        puzzles.add(mappedPuzzle);
        console.log(
          `Session ${sessionKey}: puzzleType "${puzzleType}" -> mapped "${mappedPuzzle}" (ajouté)`
        );
      } else {
        // Si le mapping échoue, essayer de valider directement
        if (isValidPuzzle(puzzleType)) {
          puzzles.add(puzzleType);
          console.log(
            `Session ${sessionKey}: puzzleType "${puzzleType}" -> validé directement (ajouté)`
          );
        } else {
          console.log(
            `Session ${sessionKey}: puzzleType "${puzzleType}" -> non supporté (ignoré)`
          );
          // Ignorer cette session complètement si le puzzle n'est pas supporté
          continue;
        }
      }

      // Utiliser le nom de session pour l'affichage
      const displayName = sessionDisplayName;

      const solves: CSTimerSolve[] = [];

      for (const solve of sessionData) {
        if (!Array.isArray(solve) || solve.length < 4) {
          errors.push(
            `Solve invalide dans ${sessionKey}: ${JSON.stringify(solve)}`
          );
          continue;
        }

        const [penaltyTime, scramble, notes, timestamp] = solve;

        if (!Array.isArray(penaltyTime) || penaltyTime.length < 2) {
          errors.push(
            `Format penalty/time invalide dans ${sessionKey}: ${JSON.stringify(
              penaltyTime
            )}`
          );
          continue;
        }

        const [penalty, time] = penaltyTime;

        // Validation des données
        if (typeof penalty !== "number" || typeof time !== "number") {
          errors.push(
            `Types penalty/time invalides dans ${sessionKey}: penalty=${penalty}, time=${time}`
          );
          continue;
        }

        if (typeof scramble !== "string") {
          errors.push(`Scramble invalide dans ${sessionKey}: ${scramble}`);
          continue;
        }

        if (typeof timestamp !== "number") {
          errors.push(`Timestamp invalide dans ${sessionKey}: ${timestamp}`);
          continue;
        }

        solves.push({
          penalty,
          time,
          scramble: scramble || "",
          notes: typeof notes === "string" ? notes : "",
          timestamp,
        });
      }

      if (solves.length > 0) {
        // Créer un nom de session plus court et lisible
        let shortName = sessionKey;
        if (sessionDisplayName !== sessionKey) {
          // Extraire le nom personnalisé sans le suffixe (sessionX)
          const customName = sessionDisplayName.replace(
            /\s*\(session\d+\)$/,
            ""
          );
          // Limiter la longueur du nom
          shortName =
            customName.length > 30
              ? customName.substring(0, 27) + "..."
              : customName;
        }

        sessions.push({
          name: shortName,
          solves,
          options: {},
          scrType: scrType || undefined,
          puzzleType:
            mappedPuzzle ||
            (isValidPuzzle(puzzleType) ? puzzleType : undefined),
        });
        totalSolves += solves.length;
      }
    }

    return {
      success: true,
      message: `Import réussi: ${totalSolves} solves de ${sessions.length} sessions`,
      data: {
        sessions,
        totalSolves,
        puzzles: Array.from(puzzles),
      },
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erreur lors du parsing du fichier: ${
        error instanceof Error ? error.message : "Erreur inconnue"
      }`,
      errors: [error instanceof Error ? error.message : "Erreur inconnue"],
    };
  }
}

// Convertir les données cstimer vers le format Speedcube Master
export function convertToSpeedcubeFormat(cstimerData: CSTimerSession[]) {
  const convertedSolves: (Omit<import("@/hooks/use-solves").Solve, "id"> & {
    sessionName?: string;
  })[] = [];

  for (const session of cstimerData) {
    for (const solve of session.solves) {
      // Déterminer la pénalité basée sur la valeur cstimer
      let penalty: "none" | "plus2" | "dnf" = "none";
      if (solve.penalty === -1) {
        penalty = "dnf";
      } else if (solve.penalty === 2000) {
        penalty = "plus2";
      }

      // Utiliser le type de puzzle stocké dans la session
      const mappedPuzzle = session.puzzleType;

      // Ne convertir que si le puzzle est supporté
      if (mappedPuzzle && isValidPuzzle(mappedPuzzle)) {
        convertedSolves.push({
          time: solve.time, // Temps en millisecondes
          penalty,
          date: new Date(solve.timestamp * 1000), // Convertir timestamp en Date
          scramble: solve.scramble,
          notes: solve.notes,
          puzzle: mappedPuzzle,
          sessionName: session.name, // Ajouter le nom de session cstimer complet
        });
      } else {
        console.log(`Solve ignoré: puzzle non supporté "${mappedPuzzle}"`);
      }
    }
  }

  return convertedSolves;
}

// Fonction utilitaire pour valider un fichier cstimer
export function validateCSTimerFile(content: string): boolean {
  try {
    const data = JSON.parse(content);

    // Vérifier la structure de base
    if (typeof data !== "object" || data === null) {
      return false;
    }

    // Vérifier qu'il y a au moins une session
    const hasSessions = Object.keys(data).some(
      (key) => key.startsWith("session") && Array.isArray(data[key])
    );

    return hasSessions;
  } catch {
    return false;
  }
}
