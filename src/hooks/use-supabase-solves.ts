import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import type { Database } from "@/lib/supabase";

type Solve = Database["public"]["Tables"]["solves"]["Row"];
type InsertSolve = Database["public"]["Tables"]["solves"]["Insert"];
type UpdateSolve = Database["public"]["Tables"]["solves"]["Update"];

export function useSupabaseSolves() {
  const [solves, setSolves] = useState<Solve[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const loadSolves = async () => {
    if (!user) {
      setSolves([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Chargement des solves pour user:", user.id);

      const { data, error } = await supabase
        .from("solves")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur lors du chargement des solves:", error);
        setError(error.message);
      } else {
        console.log("Solves chargés:", data?.length || 0);
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
  }, [user?.id]);

  const addSolve = async (solve: Omit<InsertSolve, "user_id">) => {
    if (!user) {
      console.error("Utilisateur non connecté");
      return;
    }

    try {
      const newSolve = {
        ...solve,
        user_id: user.id,
      };

      console.log("Tentative d'ajout du solve:", newSolve);

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

      console.log("Solve ajouté avec succès:", data);
      setSolves((prev) => [data, ...prev]);
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
