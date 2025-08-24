"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

export function useFavorites() {
  const { user } = useUser();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les favoris de l'utilisateur
  const loadFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("algorithm_favorites")
        .select("algorithm_id")
        .eq("user_id", user.id);

      if (error) throw error;

      const favoriteIds = data?.map((fav) => fav.algorithm_id) || [];
      setFavorites(favoriteIds);
    } catch (err) {
      console.error("Erreur lors du chargement des favoris:", err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les favoris au montage et quand l'utilisateur change
  useEffect(() => {
    loadFavorites();
  }, [user]);

  // Ajouter/retirer un favori
  const toggleFavorite = async (algorithmId: string) => {
    if (!user) return;

    try {
      const isCurrentlyFavorite = favorites.includes(algorithmId);

      if (isCurrentlyFavorite) {
        // Retirer du favori
        const { error } = await supabase
          .from("algorithm_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("algorithm_id", algorithmId);

        if (error) throw error;

        setFavorites((prev) => prev.filter((id) => id !== algorithmId));
      } else {
        // Ajouter aux favoris
        const { error } = await supabase.from("algorithm_favorites").insert({
          user_id: user.id,
          algorithm_id: algorithmId,
        });

        if (error) throw error;

        setFavorites((prev) => [...prev, algorithmId]);
      }
    } catch (err) {
      console.error("Erreur lors de la modification du favori:", err);
    }
  };

  // Vérifier si un algorithme est en favori
  const isFavorite = (algorithmId: string): boolean => {
    return favorites.includes(algorithmId);
  };

  // Obtenir tous les IDs des algorithmes favoris
  const getFavoriteIds = (): string[] => {
    return favorites;
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    getFavoriteIds,
    loadFavorites,
  };
}
