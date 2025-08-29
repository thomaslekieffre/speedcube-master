"use client";

import { useState } from "react";
import { createSupabaseClientWithUser } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { Algorithm, AlgorithmModification } from "@/lib/supabase";

export function useAlgorithmModifications() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modifyAlgorithm = async (
    algorithmId: string,
    modifications: Partial<Algorithm>,
    reason?: string
  ) => {
    if (!user) {
      setError("Vous devez être connecté pour modifier un algorithme");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = await createSupabaseClientWithUser(user.id);

      // 1. Récupérer l'algorithme actuel
      const { data: currentAlgorithm, error: fetchError } = await supabase
        .from("algorithms")
        .select("*")
        .eq("id", algorithmId)
        .single();

      if (fetchError) {
        throw new Error("Impossible de récupérer l'algorithme");
      }

      // 2. Créer l'enregistrement de modification via RPC
      const previousData = {
        name: currentAlgorithm.name,
        notation: currentAlgorithm.notation,
        description: currentAlgorithm.description,
        scramble: currentAlgorithm.scramble,
        solution: currentAlgorithm.solution,
        fingertricks: currentAlgorithm.fingertricks,
        notes: currentAlgorithm.notes,
        alternatives: currentAlgorithm.alternatives,
        difficulty: currentAlgorithm.difficulty,
      };

      const { error: modificationError } = await supabase.rpc(
        "insert_algorithm_modification",
        {
          p_algorithm_id: algorithmId,
          p_modified_by: user.id,
          p_previous_data: previousData,
          p_new_data: modifications,
          p_reason: reason || null,
        }
      );

      if (modificationError) {
        throw new Error("Erreur lors de l'enregistrement de la modification");
      }

      // 3. Mettre à jour l'algorithme
      const updateData = {
        ...modifications,
        status: "modified" as const,
        updated_at: new Date().toISOString(),
        modification_count: (currentAlgorithm.modification_count || 0) + 1,
        last_modified_at: new Date().toISOString(),
        last_modified_by: user.id,
        reviewed_by: null, // Reset la modération
        reviewed_at: null,
        rejection_reason: null,
      };

      const { error: updateError } = await supabase
        .from("algorithms")
        .update(updateData)
        .eq("id", algorithmId);

      if (updateError) {
        throw new Error("Erreur lors de la mise à jour de l'algorithme");
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getModificationHistory = async (algorithmId: string) => {
    if (!user) return [];

    try {
      const supabase = await createSupabaseClientWithUser(user.id);

      const { data, error } = await supabase
        .from("algorithm_modifications")
        .select(
          `
          *,
          modified_by_user:profiles!algorithm_modifications_modified_by_fkey(username, avatar_url)
        `
        )
        .eq("algorithm_id", algorithmId)
        .order("modified_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      return [];
    }
  };

  const canModifyAlgorithm = (algorithm: Algorithm) => {
    if (!user) return false;

    // Seul le créateur peut modifier son algorithme
    return algorithm.created_by === user.id;
  };

  return {
    modifyAlgorithm,
    getModificationHistory,
    canModifyAlgorithm,
    loading,
    error,
  };
}
