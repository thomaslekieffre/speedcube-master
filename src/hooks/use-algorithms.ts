"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Algorithm {
  id: string;
  name: string;
  notation: string;
  puzzle_type: string;
  method: string;
  set_name: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  description: string;
  scramble: string;
  solution: string;
  fingertricks?: string;
  notes?: string;
  alternatives?: string[];
  created_at: string;
  updated_at: string;
}

export function useAlgorithms() {
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
        .order("name");

      if (error) {
        console.error("Erreur lors du chargement des algorithmes:", error);
        setError("Erreur lors du chargement des algorithmes");
        toast.error("Erreur lors du chargement des algorithmes");
        return;
      }

      setAlgorithms(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des algorithmes:", error);
      setError("Erreur lors du chargement des algorithmes");
      toast.error("Erreur lors du chargement des algorithmes");
    } finally {
      setLoading(false);
    }
  };

  // Charger un algorithme par ID
  const getAlgorithmById = async (id: string): Promise<Algorithm | null> => {
    try {
      const { data, error } = await supabase
        .from("algorithms")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erreur lors du chargement de l'algorithme:", error);
        toast.error("Erreur lors du chargement de l'algorithme");
        return null;
      }

      return data;
    } catch (error) {
      console.error("Erreur lors du chargement de l'algorithme:", error);
      toast.error("Erreur lors du chargement de l'algorithme");
      return null;
    }
  };

  // Rechercher des algorithmes
  const searchAlgorithms = async (query: string): Promise<Algorithm[]> => {
    try {
      const { data, error } = await supabase
        .from("algorithms")
        .select("*")
        .or(`name.ilike.%${query}%,notation.ilike.%${query}%,description.ilike.%${query}%`)
        .order("name");

      if (error) {
        console.error("Erreur lors de la recherche:", error);
        toast.error("Erreur lors de la recherche");
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast.error("Erreur lors de la recherche");
      return [];
    }
  };

  // Filtrer les algorithmes
  const filterAlgorithms = (
    algorithms: Algorithm[],
    filters: {
      puzzle_type?: string;
      method?: string;
      set_name?: string;
      difficulty?: string;
      search?: string;
    }
  ): Algorithm[] => {
    return algorithms.filter((algo) => {
      const matchesPuzzle =
        !filters.puzzle_type || algo.puzzle_type === filters.puzzle_type;
      const matchesMethod =
        !filters.method || algo.method.toLowerCase() === filters.method.toLowerCase();
      const matchesSet =
        !filters.set_name || algo.set_name.toLowerCase() === filters.set_name.toLowerCase();
      const matchesDifficulty =
        !filters.difficulty || algo.difficulty === filters.difficulty;
      const matchesSearch =
        !filters.search ||
        algo.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        algo.notation.toLowerCase().includes(filters.search.toLowerCase()) ||
        algo.description.toLowerCase().includes(filters.search.toLowerCase());

      return (
        matchesPuzzle &&
        matchesMethod &&
        matchesSet &&
        matchesDifficulty &&
        matchesSearch
      );
    });
  };

  // Charger les algorithmes au montage
  useEffect(() => {
    loadAlgorithms();
  }, []);

  return {
    algorithms,
    loading,
    error,
    loadAlgorithms,
    getAlgorithmById,
    searchAlgorithms,
    filterAlgorithms,
  };
}
