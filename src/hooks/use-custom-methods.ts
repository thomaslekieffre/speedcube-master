"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseClientWithUser } from "@/lib/supabase";
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
    if (!user?.id) throw new Error("Utilisateur non connecté");
    return user.id;
  }, [user?.id]);

  // Charger toutes les méthodes (selon le rôle de l'utilisateur)
  const loadMethods = useCallback(async () => {
    if (!user?.id) {
      setMethods([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const supabase = await createSupabaseClientWithUser(user.id);

      let query = supabase
        .from("custom_methods")
        .select("*")
        .order("created_at", { ascending: false });

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

      const { data, error } = await query;

      if (error) throw error;
      setMethods(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des méthodes:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Charger les sets
  const loadSets = useCallback(async () => {
    if (!user?.id) {
      setSets([]);
      return;
    }

    try {
      const supabase = await createSupabaseClientWithUser(user.id);

      let query = supabase
        .from("custom_sets")
        .select("*")
        .order("created_at", { ascending: false });

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

      const { data, error } = await query;
      if (error) throw error;
      setSets(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des sets:", err);
    }
  }, [user?.id]);

  // Charger les méthodes au montage
  useEffect(() => {
    loadMethods();
    loadSets();
  }, [loadMethods, loadSets]);

  // Créer une nouvelle méthode
  const createMethod = useCallback(
    async (methodData: CreateMethodData): Promise<CustomMethod | null> => {
      if (!user?.id) {
        toast.error("Vous devez être connecté pour créer une méthode");
        return null;
      }

      try {
        const userId = getUserId();
        const supabase = await createSupabaseClientWithUser(userId);

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
    [user?.id, loadMethods, getUserId]
  );

  // Mettre à jour une méthode
  const updateMethod = useCallback(
    async (
      methodId: string,
      updateData: UpdateMethodData,
      reason?: string
    ): Promise<boolean> => {
      if (!user?.id) {
        toast.error("Vous devez être connecté pour modifier une méthode");
        return false;
      }

      try {
        const userId = getUserId();
        const supabase = await createSupabaseClientWithUser(userId);

        // 1. Récupérer la méthode actuelle
        const { data: currentMethod, error: fetchError } = await supabase
          .from("custom_methods")
          .select("*")
          .eq("id", methodId)
          .single();

        if (fetchError) {
          throw new Error("Impossible de récupérer la méthode");
        }

        // 2. Créer l'enregistrement de modification via RPC (cela met aussi à jour la méthode automatiquement)
        const previousData = {
          name: currentMethod.name,
          puzzle_type: currentMethod.puzzle_type,
          description_markdown: currentMethod.description_markdown,
          cubing_notation_example: currentMethod.cubing_notation_example,
          is_public: currentMethod.is_public,
          algorithm_references: currentMethod.algorithm_references,
        };

        const { error: modificationError } = await supabase.rpc(
          "insert_method_modification",
          {
            p_method_id: methodId,
            p_modified_by: userId,
            p_previous_data: previousData,
            p_new_data: updateData,
            p_reason: reason || null,
          }
        );

        if (modificationError) {
          throw new Error("Erreur lors de l'enregistrement de la modification");
        }

        // 3. Mettre à jour la méthode (séparément car la RPC ne met pas à jour tous les champs)
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
    [user?.id, loadMethods, getUserId]
  );

  // Supprimer une méthode
  const deleteMethod = useCallback(
    async (methodId: string): Promise<boolean> => {
      if (!user?.id) {
        toast.error("Vous devez être connecté pour supprimer une méthode");
        return false;
      }

      try {
        const userId = getUserId();
        const supabase = await createSupabaseClientWithUser(userId);

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
    [user?.id, loadMethods, getUserId]
  );

  // Obtenir une méthode par ID
  const getMethodById = useCallback(
    async (methodId: string): Promise<CustomMethod | null> => {
      if (!user?.id) return null;

      try {
        const supabase = await createSupabaseClientWithUser(user.id);

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
    [user?.id]
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
      if (!user?.id) return false;

      try {
        const userId = getUserId();
        const supabase = await createSupabaseClientWithUser(userId);

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
    [user?.id, loadMethods, getUserId]
  );

  const rejectMethod = useCallback(
    async (methodId: string, reason: string): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        const userId = getUserId();
        const supabase = await createSupabaseClientWithUser(userId);

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
    [user?.id, loadMethods, getUserId]
  );

  // Charger les méthodes en attente de modération
  const loadPendingMethods = useCallback(async (): Promise<CustomMethod[]> => {
    if (!user?.id) return [];

    try {
      const supabase = await createSupabaseClientWithUser(user.id);

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
  }, [user?.id]);

  // Créer une notification de modération
  const createModerationNotification = useCallback(
    async (
      methodId: string,
      type: "report" | "review_needed" | "approval_request",
      message?: string
    ): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        const userId = getUserId();
        const supabase = await createSupabaseClientWithUser(userId);

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
    [user?.id, getUserId]
  );

  // Récupérer l'historique des modifications d'une méthode
  const getMethodModificationHistory = useCallback(
    async (methodId: string) => {
      if (!user) return [];

      try {
        const supabase = await createSupabaseClientWithUser(user.id);

        const { data, error } = await supabase
          .from("method_modifications")
          .select(
            `
            *,
            modified_by_user:profiles!method_modifications_modified_by_fkey(username, avatar_url)
          `
          )
          .eq("method_id", methodId)
          .order("modified_at", { ascending: false });

        if (error) {
          throw error;
        }

        return data || [];
      } catch (err) {
        console.error("Erreur lors du chargement de l'historique:", err);
        return [];
      }
    },
    [user]
  );

  // Vérifier si l'utilisateur peut modifier une méthode
  const canModifyMethod = useCallback(
    (method: CustomMethod): boolean => {
      if (!user) return false;
      return method.created_by === user.id;
    },
    [user]
  );

  return {
    methods,
    sets,
    loading,
    error,
    loadMethods,
    loadSets,
    createMethod,
    updateMethod,
    deleteMethod,
    getMethodById,
    filterMethods,
    approveMethod,
    rejectMethod,
    createModerationNotification,
    getMethodModificationHistory,
    canModifyMethod,
  };
}
