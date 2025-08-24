"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

export interface Algorithm {
  id: string;
  name: string;
  notation: string;
  puzzle_type: string;
  method: string;
  set_name: string;
  difficulty: string;
  description: string;
  scramble: string;
  solution: string;
  fingertricks: string;
  notes: string;
  alternatives: string[];
  status: "pending" | "approved" | "rejected";
  created_by: string;
  creator_username?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

interface FilterOptions {
  puzzle_type?: string;
  method?: string;
  set_name?: string;
  difficulty?: string;
  search?: string;
}

export function useAlgorithms() {
  const { user } = useUser();
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les algorithmes (seulement les approuvés pour les utilisateurs normaux)
  const loadAlgorithms = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("algorithms")
        .select("*")
        .order("created_at", { ascending: false });

      // Si l'utilisateur n'est pas connecté, ne montrer que les algorithmes approuvés
      if (!user) {
        query = query.eq("status", "approved");
      } else {
        // Vérifier le rôle de l'utilisateur
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (roleData?.role === "moderator" || roleData?.role === "admin") {
          // Les modérateurs ne voient que les algorithmes approuvés dans /algos
          // (les algorithmes en attente sont visibles uniquement dans /algos/moderate)
          query = query.eq("status", "approved");
        } else {
          // Les utilisateurs normaux ne voient que les algorithmes approuvés
          // ET leurs propres algorithmes en attente (mais pas les rejetés)
          query = query.or(
            `status.eq.approved,and(created_by.eq.${user.id},status.eq.pending)`
          );
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setAlgorithms(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des algorithmes:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // Charger les algorithmes au montage
  useEffect(() => {
    loadAlgorithms();
  }, []);

  // Filtrer les algorithmes
  const filterAlgorithms = (
    algorithms: Algorithm[],
    filters: FilterOptions
  ): Algorithm[] => {
    return algorithms.filter((algo) => {
      // Filtre par type de puzzle
      if (filters.puzzle_type && algo.puzzle_type !== filters.puzzle_type) {
        return false;
      }

      // Filtre par méthode
      if (filters.method && algo.method !== filters.method) {
        return false;
      }

      // Filtre par set
      if (filters.set_name && algo.set_name !== filters.set_name) {
        return false;
      }

      // Filtre par difficulté
      if (filters.difficulty && algo.difficulty !== filters.difficulty) {
        return false;
      }

      // Filtre par recherche
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = algo.name.toLowerCase().includes(searchLower);
        const matchesNotation = algo.notation
          .toLowerCase()
          .includes(searchLower);
        const matchesDescription = algo.description
          .toLowerCase()
          .includes(searchLower);

        if (!matchesName && !matchesNotation && !matchesDescription) {
          return false;
        }
      }

      return true;
    });
  };

  // Créer un nouvel algorithme
  const createAlgorithm = async (
    algorithmData: Omit<
      Algorithm,
      "id" | "created_at" | "updated_at" | "status" | "created_by"
    >
  ) => {
    if (!user) throw new Error("Utilisateur non connecté");

    try {
      const { data, error } = await supabase
        .from("algorithms")
        .insert({
          ...algorithmData,
          status: "pending",
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setAlgorithms((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error("Erreur lors de la création de l'algorithme:", err);
      throw err;
    }
  };

  // Mettre à jour un algorithme
  const updateAlgorithm = async (id: string, updates: Partial<Algorithm>) => {
    try {
      const { data, error } = await supabase
        .from("algorithms")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setAlgorithms((prev) =>
        prev.map((algo) => (algo.id === id ? data : algo))
      );
      return data;
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'algorithme:", err);
      throw err;
    }
  };

  // Supprimer un algorithme
  const deleteAlgorithm = async (id: string) => {
    try {
      const { error } = await supabase.from("algorithms").delete().eq("id", id);

      if (error) throw error;

      setAlgorithms((prev) => prev.filter((algo) => algo.id !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression de l'algorithme:", err);
      throw err;
    }
  };

  // Obtenir un algorithme par ID
  const getAlgorithmById = async (id: string): Promise<Algorithm | null> => {
    try {
      // D'abord récupérer l'algorithme
      const { data: algorithm, error: algorithmError } = await supabase
        .from("algorithms")
        .select("*")
        .eq("id", id)
        .single();

      if (algorithmError) throw algorithmError;

      // Ensuite récupérer le nom d'utilisateur depuis profiles
      let creatorUsername = "Utilisateur";
      if (algorithm.created_by) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", algorithm.created_by)
            .single();

          if (!profileError && profileData?.username) {
            creatorUsername = profileData.username;
          } else {
            // Fallback vers l'ID si pas de nom trouvé
            creatorUsername = algorithm.created_by.substring(0, 8);
          }
        } catch (profileErr) {
          console.warn(
            "Impossible de récupérer le nom d'utilisateur:",
            profileErr
          );
          creatorUsername = algorithm.created_by.substring(0, 8);
        }
      }

      // Ajouter le nom d'utilisateur
      const algorithmWithUsername = {
        ...algorithm,
        creator_username: creatorUsername,
      };

      return algorithmWithUsername;
    } catch (err) {
      console.error("Erreur lors de la récupération de l'algorithme:", err);
      return null;
    }
  };

  // Fonctions de modération (pour les modérateurs)
  const approveAlgorithm = async (algorithmId: string) => {
    if (!user) throw new Error("Utilisateur non connecté");

    try {
      const { data, error } = await supabase
        .from("algorithms")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", algorithmId)
        .select()
        .single();

      if (error) throw error;

      setAlgorithms((prev) =>
        prev.map((algo) => (algo.id === algorithmId ? data : algo))
      );
      return data;
    } catch (err) {
      console.error("Erreur lors de l'approbation de l'algorithme:", err);
      throw err;
    }
  };

  const rejectAlgorithm = async (algorithmId: string, reason: string) => {
    if (!user) throw new Error("Utilisateur non connecté");

    try {
      const { data, error } = await supabase
        .from("algorithms")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq("id", algorithmId)
        .select()
        .single();

      if (error) throw error;

      setAlgorithms((prev) =>
        prev.map((algo) => (algo.id === algorithmId ? data : algo))
      );
      return data;
    } catch (err) {
      console.error("Erreur lors du rejet de l'algorithme:", err);
      throw err;
    }
  };

  // Charger les algorithmes en attente de modération
  const loadPendingAlgorithms = async () => {
    try {
      const { data, error } = await supabase
        .from("algorithms")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(
        "Erreur lors du chargement des algorithmes en attente:",
        err
      );
      throw err;
    }
  };

  // Compter les algorithmes en attente (pour le badge de modération)
  const countPendingAlgorithms = async (): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from("algorithms")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.error("Erreur lors du comptage des algorithmes en attente:", err);
      return 0;
    }
  };

  return {
    algorithms,
    loading,
    error,
    loadAlgorithms,
    filterAlgorithms,
    createAlgorithm,
    updateAlgorithm,
    deleteAlgorithm,
    getAlgorithmById,
    approveAlgorithm,
    rejectAlgorithm,
    loadPendingAlgorithms,
    countPendingAlgorithms,
  };
}
