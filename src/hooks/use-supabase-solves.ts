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
      const supabase = createSupabaseClientWithUser(targetUserId);

      let query = supabase
        .from("solves")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      // Si une session est spécifiée, filtrer par session
      if (sessionId) {
        query = query.eq("session_id", sessionId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erreur lors du chargement des solves:", error);
        setError(error.message);
      } else {
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

  const addSolve = async (solve: Omit<InsertSolve, "user_id">) => {
    if (!user) {
      console.error("Utilisateur non connecté");
      return;
    }

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user.id);

      const newSolve = {
        ...solve,
        user_id: user.id,
        // session_id sera géré automatiquement par le trigger SQL
        // si sessionId est fourni, on l'utilise, sinon le trigger créera une session par défaut
        session_id: sessionId || null,
      };

      const { data, error } = await supabase
        .from("solves")
        .insert(newSolve)
        .select()
        .single();

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

      setSolves((prev) => [data, ...prev]);

      // Notifier que de nouveaux solves ont été ajoutés
      console.log("📤 Déclenchement de l'événement solves-updated (ajout)");
      window.dispatchEvent(new CustomEvent("solves-updated"));

      return data;
    } catch (err) {
      console.error("Erreur lors de l'ajout du solve:", err);
      throw err;
    }
  };

  const updateSolve = async (id: string, updates: UpdateSolve) => {
    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user?.id || '');

      const { data, error } = await supabase
        .from("solves")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la mise à jour:", error);
        throw error;
      }

      setSolves((prev) =>
        prev.map((solve) => (solve.id === id ? data : solve))
      );

      // Notifier que des solves ont été mis à jour
      console.log(
        "📤 Déclenchement de l'événement solves-updated (mise à jour)"
      );
      window.dispatchEvent(new CustomEvent("solves-updated"));

      return data;
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      throw err;
    }
  };

  const deleteSolve = async (id: string) => {
    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user?.id || '');

      const { error } = await supabase.from("solves").delete().eq("id", id);

      if (error) {
        console.error("Erreur lors de la suppression:", error);
        throw error;
      }

      setSolves((prev) => prev.filter((solve) => solve.id !== id));

      // Notifier que des solves ont été supprimés
      console.log(
        "📤 Déclenchement de l'événement solves-updated (suppression)"
      );
      window.dispatchEvent(new CustomEvent("solves-updated"));
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      throw err;
    }
  };

  const clearAllSolves = async () => {
    if (!user) return;

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user.id);

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
      const supabase = createSupabaseClientWithUser(user?.id || '');

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
