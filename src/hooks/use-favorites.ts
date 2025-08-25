"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createSupabaseClientWithUser } from "@/lib/supabase";
import type { Database } from "@/types/database";

type AlgorithmFavorite =
  Database["public"]["Tables"]["algorithm_favorites"]["Row"];

export function useFavorites() {
  const [favorites, setFavorites] = useState<AlgorithmFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const loadFavorites = async () => {
    if (!user?.id) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user.id);

      const { data, error } = await supabase
        .from("algorithm_favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur lors du chargement des favoris:", error);
        setError(error.message);
      } else {
        setFavorites(data || []);
      }
    } catch (err) {
      console.error("Erreur inattendue:", err);
      setError("Erreur inattendue lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user?.id]);

  const addToFavorites = async (algorithmId: string) => {
    if (!user?.id) return;

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user.id);

      const { data, error } = await supabase
        .from("algorithm_favorites")
        .insert({
          user_id: user.id,
          algorithm_id: algorithmId,
        })
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de l'ajout aux favoris:", error);
        throw error;
      }

      setFavorites((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error("Erreur lors de l'ajout aux favoris:", err);
      throw err;
    }
  };

  const removeFromFavorites = async (algorithmId: string) => {
    if (!user?.id) return;

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user.id);

      const { error } = await supabase
        .from("algorithm_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("algorithm_id", algorithmId);

      if (error) {
        console.error("Erreur lors de la suppression des favoris:", error);
        throw error;
      }

      setFavorites((prev) =>
        prev.filter((fav) => fav.algorithm_id !== algorithmId)
      );
    } catch (err) {
      console.error("Erreur lors de la suppression des favoris:", err);
      throw err;
    }
  };

  const isFavorite = (algorithmId: string) => {
    return favorites.some((fav) => fav.algorithm_id === algorithmId);
  };

  const toggleFavorite = async (algorithmId: string) => {
    if (isFavorite(algorithmId)) {
      await removeFromFavorites(algorithmId);
    } else {
      await addToFavorites(algorithmId);
    }
  };

  // Obtenir tous les IDs des algorithmes favoris
  const getFavoriteIds = (): string[] => {
    return favorites.map((fav) => fav.algorithm_id);
  };

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    getFavoriteIds,
    refresh: loadFavorites,
  };
}
