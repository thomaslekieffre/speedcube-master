import { useState, useEffect } from "react";
import { createSupabaseClientWithUser } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import type { Database } from "@/types/database";

type Solve = Database["public"]["Tables"]["solves"]["Row"];
type InsertSolve = Database["public"]["Tables"]["solves"]["Insert"];
type UpdateSolve = Database["public"]["Tables"]["solves"]["Update"];

export function useSupabaseSolves(userId?: string, sessionId?: string | null) {
  const [solves, setSolves] = useState<Solve[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const targetUserId = userId || user?.id;

  const loadSolves = async () => {
    if (!targetUserId) {
      setSolves([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = await createSupabaseClientWithUser(targetUserId);

      let data;
      let error;

      // Utiliser les fonctions RPC pour contourner les limites Supabase
      if (sessionId) {
        // Récupérer les solves d'une session spécifique
        console.log(`🔍 Récupération des solves pour session: ${sessionId}`);
        const result = await supabase.rpc("get_session_solves", {
          p_user_id: targetUserId,
          p_session_id: sessionId,
        });
        data = result.data;
        error = result.error;
      } else {
        // Récupérer tous les solves de l'utilisateur
        console.log(
          `🔍 Récupération de tous les solves pour user: ${targetUserId}`
        );
        const result = await supabase.rpc("get_all_solves_for_user", {
          p_user_id: targetUserId,
        });
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("Erreur lors du chargement des solves:", error);
        setError(error.message);
      } else {
        console.log(
          `📊 Solves récupérés: ${data?.length || 0} solves (sessionId: ${
            sessionId || "toutes"
          })`
        );
        setSolves(data || []);
      }
    } catch (err) {
      console.error("Erreur inattendue:", err);
      setError("Erreur inattendue lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSolves();
  }, [targetUserId, sessionId]);

  // Écouter les événements de mise à jour des solves
  useEffect(() => {
    const handleSolvesUpdated = () => {
      console.log("📥 Événement solves-updated reçu dans useSupabaseSolves");
      loadSolves();
    };

    window.addEventListener("solves-updated", handleSolvesUpdated);

    return () => {
      window.removeEventListener("solves-updated", handleSolvesUpdated);
    };
  }, [targetUserId, sessionId]);

  const addSolve = async (solve: Omit<InsertSolve, "user_id">) => {
    if (!user) {
      console.error("Utilisateur non connecté");
      return;
    }

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = await createSupabaseClientWithUser(user.id);

      // Utiliser la fonction RPC pour créer le solve
      const { data, error } = await supabase.rpc("create_solve_with_auth", {
        p_user_id: user.id,
        p_session_id: sessionId || null,
        p_puzzle_type: solve.puzzle_type,
        p_time_ms: solve.time,
        p_penalty: solve.penalty,
        p_scramble: solve.scramble,
        p_notes: solve.notes || null,
        p_created_at: solve.created_at || new Date().toISOString(),
      });

      if (error) {
        console.error("Erreur détaillée lors de l'ajout du solve:", {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      if (data && data.length > 0) {
        const newSolve = data[0];
        setSolves((prev) => [newSolve, ...prev]);

        // Notifier que de nouveaux solves ont été ajoutés
        console.log("📤 Déclenchement de l'événement solves-updated (ajout)");
        window.dispatchEvent(new CustomEvent("solves-updated"));

        return newSolve;
      } else {
        throw new Error("Aucun solve créé");
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout du solve:", err);
      throw err;
    }
  };

  const updateSolve = async (id: string, updates: UpdateSolve) => {
    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = await createSupabaseClientWithUser(user?.id || "");

      // Utiliser la fonction RPC pour mettre à jour le solve
      const { data, error } = await supabase.rpc("update_solve_with_auth", {
        p_solve_id: id,
        p_user_id: user?.id || "",
        p_time_ms: updates.time,
        p_penalty: updates.penalty,
        p_scramble: updates.scramble,
        p_notes: updates.notes,
      });

      if (error) {
        console.error("Erreur lors de la mise à jour:", error);
        throw error;
      }

      if (data && data.length > 0) {
        const updatedSolve = data[0];
        setSolves((prev) =>
          prev.map((solve) => (solve.id === id ? updatedSolve : solve))
        );

        // Notifier que des solves ont été mis à jour
        console.log(
          "📤 Déclenchement de l'événement solves-updated (mise à jour)"
        );
        window.dispatchEvent(new CustomEvent("solves-updated"));

        return updatedSolve;
      } else {
        throw new Error("Aucun solve mis à jour");
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      throw err;
    }
  };

  const deleteSolve = async (id: string) => {
    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = await createSupabaseClientWithUser(user?.id || "");

      // Utiliser la fonction RPC pour supprimer le solve
      const { data, error } = await supabase.rpc("delete_solve_with_auth", {
        p_solve_id: id,
        p_user_id: user?.id || "",
      });

      if (error) {
        console.error("Erreur lors de la suppression:", error);
        throw error;
      }

      if (data) {
        setSolves((prev) => prev.filter((solve) => solve.id !== id));

        // Notifier que des solves ont été supprimés
        console.log(
          "📤 Déclenchement de l'événement solves-updated (suppression)"
        );
        window.dispatchEvent(new CustomEvent("solves-updated"));
      } else {
        throw new Error("Erreur lors de la suppression du solve");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      throw err;
    }
  };

  const clearAllSolves = async () => {
    if (!user) return;

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = await createSupabaseClientWithUser(user.id);

      const { error } = await supabase
        .from("solves")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("Erreur lors de la suppression:", error);
        throw error;
      }

      setSolves([]);

      // Notifier que tous les solves ont été supprimés
      console.log("📤 Déclenchement de l'événement solves-updated (clear all)");
      window.dispatchEvent(new CustomEvent("solves-updated"));
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      throw err;
    }
  };

  const moveSolve = async (solveId: string, targetSessionId: string) => {
    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = await createSupabaseClientWithUser(user?.id || "");

      const { data, error } = await supabase
        .from("solves")
        .update({ session_id: targetSessionId })
        .eq("id", solveId)
        .select()
        .single();

      if (error) {
        console.error("Erreur lors du déplacement du solve:", error);
        throw error;
      }

      // Retirer le solve de la liste actuelle
      setSolves((prev) => prev.filter((solve) => solve.id !== solveId));

      // Notifier que des solves ont été déplacés
      console.log(
        "📤 Déclenchement de l'événement solves-updated (déplacement)"
      );
      window.dispatchEvent(new CustomEvent("solves-updated"));

      return data;
    } catch (err) {
      console.error("Erreur lors du déplacement du solve:", err);
      throw err;
    }
  };

  const exportSolves = () => {
    const exportData = solves.map((solve) => ({
      ...solve,
      date: new Date(solve.created_at).toISOString(),
      time: (solve.time / 1000).toFixed(2), // Convertir en secondes
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solves-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    solves,
    loading,
    error,
    addSolve,
    updateSolve,
    deleteSolve,
    clearAllSolves,
    moveSolve,
    exportSolves,
    refresh: loadSolves,
  };
}
