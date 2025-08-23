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

  // Charger tous les algorithmes
  const loadAlgorithms = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("algorithms")
        .select("*")
        .order("created_at", { ascending: false });

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
    algorithmData: Omit<Algorithm, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const { data, error } = await supabase
        .from("algorithms")
        .insert(algorithmData)
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
      const { data, error } = await supabase
        .from("algorithms")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Erreur lors de la récupération de l'algorithme:", err);
      return null;
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
  };
}
