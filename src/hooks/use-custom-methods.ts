"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import type {
  CustomMethod,
  CustomSet,
  CubeVisualizationData,
  AlgorithmReference,
  MethodModerationNotification,
} from "@/types/database";

interface CreateMethodData {
  name: string;
  puzzle_type: string;
  description_markdown: string;
  cubing_notation_example?: string;
  cube_visualization_data?: CubeVisualizationData;
  algorithm_references?: AlgorithmReference[];
  is_public?: boolean;
}

interface UpdateMethodData {
  name?: string;
  puzzle_type?: string;
  description_markdown?: string;
  cubing_notation_example?: string;
  cube_visualization_data?: CubeVisualizationData;
  algorithm_references?: AlgorithmReference[];
  is_public?: boolean;
  status?: "draft" | "pending" | "approved" | "rejected";
}

export function useCustomMethods() {
  const { user } = useUser();
  const [methods, setMethods] = useState<CustomMethod[]>([]);
  const [sets, setSets] = useState<CustomSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction utilitaire pour obtenir l'ID utilisateur
  const getUserId = useCallback((): string => {
    if (!user) throw new Error("Utilisateur non connecté");
    return user.id;
  }, [user]);

  // Charger toutes les méthodes (selon le rôle de l'utilisateur)
  const loadMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("custom_methods")
        .select("*")
        .order("created_at", { ascending: false });

      // Si l'utilisateur n'est pas connecté, ne montrer que les méthodes approuvées et publiques
      if (!user) {
        query = query.eq("status", "approved").eq("is_public", true);
      } else {
        // Vérifier le rôle de l'utilisateur
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (roleData?.role === "moderator" || roleData?.role === "admin") {
          // Les modérateurs voient toutes les méthodes
          query = query.or("status.eq.approved,status.eq.pending");
        } else {
          // Les utilisateurs normaux voient seulement les méthodes approuvées et publiques
          query = query.eq("status", "approved").eq("is_public", true);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setMethods(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des méthodes:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Charger les sets
  const loadSets = useCallback(async () => {
    try {
      let query = supabase
        .from("custom_sets")
        .select("*")
        .order("created_at", { ascending: false });

      if (!user) {
        query = query.eq("status", "approved").eq("is_public", true);
      } else {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (roleData?.role === "moderator" || roleData?.role === "admin") {
          query = query.or("status.eq.approved,status.eq.pending");
        } else {
          query = query.eq("status", "approved").eq("is_public", true);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setSets(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des sets:", err);
    }
  }, [user]);

  // Charger les méthodes au montage
  useEffect(() => {
    loadMethods();
    loadSets();
  }, [loadMethods, loadSets]);

  // Créer une nouvelle méthode
  const createMethod = useCallback(
    async (methodData: CreateMethodData): Promise<CustomMethod | null> => {
      if (!user) {
        toast.error("Vous devez être connecté pour créer une méthode");
        return null;
      }

      try {
        const userId = getUserId();

        const { data, error } = await supabase
          .from("custom_methods")
          .insert({
            ...methodData,
            created_by: userId,
            status: "pending",
          })
          .select()
          .single();

        if (error) throw error;

        toast.success(
          "Méthode créée avec succès ! Elle sera modérée avant publication."
        );
        await loadMethods(); // Recharger la liste
        return data;
      } catch (err) {
        console.error("Erreur lors de la création de la méthode:", err);
        toast.error("Erreur lors de la création de la méthode");
        return null;
      }
    },
    [user, loadMethods, getUserId]
  );

  // Mettre à jour une méthode
  const updateMethod = useCallback(
    async (
      methodId: string,
      updateData: UpdateMethodData
    ): Promise<boolean> => {
      if (!user) {
        toast.error("Vous devez être connecté pour modifier une méthode");
        return false;
      }

      try {
        const userId = getUserId();

        const { error } = await supabase
          .from("custom_methods")
          .update(updateData)
          .eq("id", methodId)
          .eq("created_by", userId); // Sécurité : seul le créateur peut modifier

        if (error) throw error;

        toast.success("Méthode mise à jour avec succès !");
        await loadMethods();
        return true;
      } catch (err) {
        console.error("Erreur lors de la mise à jour de la méthode:", err);
        toast.error("Erreur lors de la mise à jour de la méthode");
        return false;
      }
    },
    [user, loadMethods, getUserId]
  );

  // Supprimer une méthode
  const deleteMethod = useCallback(
    async (methodId: string): Promise<boolean> => {
      if (!user) {
        toast.error("Vous devez être connecté pour supprimer une méthode");
        return false;
      }

      try {
        const userId = getUserId();

        const { error } = await supabase
          .from("custom_methods")
          .delete()
          .eq("id", methodId)
          .eq("created_by", userId); // Sécurité : seul le créateur peut supprimer

        if (error) throw error;

        toast.success("Méthode supprimée avec succès !");
        await loadMethods();
        return true;
      } catch (err) {
        console.error("Erreur lors de la suppression de la méthode:", err);
        toast.error("Erreur lors de la suppression de la méthode");
        return false;
      }
    },
    [user, loadMethods, getUserId]
  );

  // Obtenir une méthode par ID
  const getMethodById = useCallback(
    async (methodId: string): Promise<CustomMethod | null> => {
      try {
        const { data, error } = await supabase
          .from("custom_methods")
          .select("*")
          .eq("id", methodId)
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Erreur lors de la récupération de la méthode:", err);
        return null;
      }
    },
    []
  );

  // Filtrer les méthodes
  const filterMethods = useCallback(
    (
      methods: CustomMethod[],
      filters: {
        puzzle_type?: string;
        status?: string;
        search?: string;
        created_by?: string;
      }
    ) => {
      return methods.filter((method) => {
        if (filters.puzzle_type && method.puzzle_type !== filters.puzzle_type) {
          return false;
        }
        if (filters.status && method.status !== filters.status) {
          return false;
        }
        if (filters.created_by && method.created_by !== filters.created_by) {
          return false;
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            method.name.toLowerCase().includes(searchLower) ||
            (method.description_markdown &&
              method.description_markdown.toLowerCase().includes(searchLower))
          );
        }
        return true;
      });
    },
    []
  );

  // Fonctions de modération (pour les modérateurs)
  const approveMethod = useCallback(
    async (methodId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const userId = getUserId();

        const { error } = await supabase
          .from("custom_methods")
          .update({
            status: "approved",
            reviewed_by: userId,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", methodId);

        if (error) throw error;

        toast.success("Méthode approuvée !");
        await loadMethods();
        return true;
      } catch (err) {
        console.error("Erreur lors de l'approbation:", err);
        toast.error("Erreur lors de l'approbation");
        return false;
      }
    },
    [user, loadMethods, getUserId]
  );

  const rejectMethod = useCallback(
    async (methodId: string, reason: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const userId = getUserId();

        const { error } = await supabase
          .from("custom_methods")
          .update({
            status: "rejected",
            reviewed_by: userId,
            reviewed_at: new Date().toISOString(),
            rejection_reason: reason,
          })
          .eq("id", methodId);

        if (error) throw error;

        toast.success("Méthode rejetée");
        await loadMethods();
        return true;
      } catch (err) {
        console.error("Erreur lors du rejet:", err);
        toast.error("Erreur lors du rejet");
        return false;
      }
    },
    [user, loadMethods, getUserId]
  );

  // Charger les méthodes en attente de modération
  const loadPendingMethods = useCallback(async (): Promise<CustomMethod[]> => {
    try {
      const { data, error } = await supabase
        .from("custom_methods")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Erreur lors du chargement des méthodes en attente:", err);
      return [];
    }
  }, []);

  // Créer une notification de modération
  const createModerationNotification = useCallback(
    async (
      methodId: string,
      type: "report" | "review_needed" | "approval_request",
      message?: string
    ): Promise<boolean> => {
      if (!user) return false;

      try {
        const userId = getUserId();

        const { error } = await supabase
          .from("method_moderation_notifications")
          .insert({
            method_id: methodId,
            type,
            message,
            created_by: userId,
          });

        if (error) throw error;

        toast.success("Notification envoyée aux modérateurs");
        return true;
      } catch (err) {
        console.error("Erreur lors de l'envoi de la notification:", err);
        toast.error("Erreur lors de l'envoi de la notification");
        return false;
      }
    },
    [user, getUserId]
  );

  return {
    methods,
    sets,
    loading,
    error,
    createMethod,
    updateMethod,
    deleteMethod,
    getMethodById,
    filterMethods,
    approveMethod,
    rejectMethod,
    loadPendingMethods,
    createModerationNotification,
    refresh: loadMethods,
  };
}
