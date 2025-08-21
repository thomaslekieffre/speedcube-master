"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
      const { data, error } = await supabase
        .from("algorithm_favorites")
        .select("algorithm_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Erreur lors du chargement des favoris:", error);
        toast.error("Erreur lors du chargement des favoris");
        return;
      }

      const favoriteIds = data?.map((fav) => fav.algorithm_id) || [];
      setFavorites(favoriteIds);
    } catch (error) {
      console.error("Erreur lors du chargement des favoris:", error);
      toast.error("Erreur lors du chargement des favoris");
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un algorithme aux favoris
  const addFavorite = async (algorithmId: string) => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter des favoris");
      return false;
    }

    try {
      const { error } = await supabase
        .from("algorithm_favorites")
        .insert({
          user_id: user.id,
          algorithm_id: algorithmId,
        });

      if (error) {
        if (error.code === "23505") {
          // Déjà en favoris
          toast.info("Cet algorithme est déjà dans vos favoris");
          return false;
        }
        console.error("Erreur lors de l'ajout aux favoris:", error);
        toast.error("Erreur lors de l'ajout aux favoris");
        return false;
      }

      setFavorites((prev) => [...prev, algorithmId]);
      toast.success("Ajouté aux favoris");
      return true;
    } catch (error) {
      console.error("Erreur lors de l'ajout aux favoris:", error);
      toast.error("Erreur lors de l'ajout aux favoris");
      return false;
    }
  };

  // Retirer un algorithme des favoris
  const removeFavorite = async (algorithmId: string) => {
    if (!user) {
      toast.error("Vous devez être connecté pour gérer vos favoris");
      return false;
    }

    try {
      const { error } = await supabase
        .from("algorithm_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("algorithm_id", algorithmId);

      if (error) {
        console.error("Erreur lors de la suppression des favoris:", error);
        toast.error("Erreur lors de la suppression des favoris");
        return false;
      }

      setFavorites((prev) => prev.filter((id) => id !== algorithmId));
      toast.success("Retiré des favoris");
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression des favoris:", error);
      toast.error("Erreur lors de la suppression des favoris");
      return false;
    }
  };

  // Toggle favoris (ajouter/retirer)
  const toggleFavorite = async (algorithmId: string) => {
    const isFavorite = favorites.includes(algorithmId);
    
    if (isFavorite) {
      return await removeFavorite(algorithmId);
    } else {
      return await addFavorite(algorithmId);
    }
  };

  // Vérifier si un algorithme est en favoris
  const isFavorite = (algorithmId: string) => {
    return favorites.includes(algorithmId);
  };

  // Charger les favoris au montage et quand l'utilisateur change
  useEffect(() => {
    loadFavorites();
  }, [user?.id]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    loadFavorites,
  };
}
