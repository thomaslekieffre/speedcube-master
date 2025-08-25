import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import type { Database } from "@/lib/supabase";

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
      window.dispatchEvent(new CustomEvent("solves-updated"));

      return data;
    } catch (err) {
      console.error("Erreur lors de l'ajout du solve:", err);
      throw err;
    }
  };

  const updateSolve = async (id: string, updates: UpdateSolve) => {
    try {
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
      return data;
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      throw err;
    }
  };

  const deleteSolve = async (id: string) => {
    try {
      const { error } = await supabase.from("solves").delete().eq("id", id);

      if (error) {
        console.error("Erreur lors de la suppression:", error);
        throw error;
      }

      setSolves((prev) => prev.filter((solve) => solve.id !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      throw err;
    }
  };

  const clearAllSolves = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("solves")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("Erreur lors de la suppression:", error);
        throw error;
      }

      setSolves([]);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
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
    exportSolves,
    refresh: loadSolves,
  };
}
