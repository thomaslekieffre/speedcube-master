import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

export type UserRole = "user" | "moderator" | "admin";

export function useUserRole() {
  const { user } = useUser();
  const [role, setRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(true);

  // Charger le rôle de l'utilisateur
  const loadUserRole = useCallback(async () => {
    if (!user) {
      setRole("user");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Vérifier d'abord dans la table user_roles
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError && roleError.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Erreur lors du chargement du rôle:", roleError);
      }

      if (roleData) {
        setRole(roleData.role as UserRole);
      } else {
        // Par défaut, l'utilisateur est un "user"
        setRole("user");
      }
    } catch (err) {
      console.error("Erreur lors du chargement du rôle:", err);
      setRole("user");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Charger le rôle au montage et quand l'utilisateur change
  useEffect(() => {
    loadUserRole();
  }, [loadUserRole]);

  // Vérifier si l'utilisateur est modérateur ou admin
  const isModerator = useCallback((): boolean => {
    return role === "moderator" || role === "admin";
  }, [role]);

  // Vérifier si l'utilisateur est admin
  const isAdmin = useCallback((): boolean => {
    return role === "admin";
  }, [role]);

  // Vérifier si l'utilisateur peut créer des algorithmes
  const canCreateAlgorithms = useCallback((): boolean => {
    return !!user; // Tous les utilisateurs connectés peuvent créer
  }, [user]);

  // Vérifier si l'utilisateur peut modérer des algorithmes
  const canModerateAlgorithms = useCallback((): boolean => {
    return isModerator();
  }, [isModerator]);

  // Vérifier si l'utilisateur peut éditer un algorithme spécifique
  const canEditAlgorithm = useCallback(
    (algorithm: any): boolean => {
      if (!user) return false;

      // Les modérateurs peuvent éditer tous les algorithmes
      if (isModerator()) return true;

      // Les créateurs peuvent éditer leurs propres algorithmes (si pas encore approuvés)
      return algorithm.created_by === user.id && algorithm.status === "pending";
    },
    [user, isModerator]
  );

  // Vérifier si l'utilisateur peut supprimer un algorithme
  const canDeleteAlgorithm = useCallback(
    (algorithm: any): boolean => {
      if (!user) return false;

      // Les modérateur peuvent supprimer tous les algorithmes
      if (isModerator()) return true;

      // Les créateurs peuvent supprimer leurs propres algorithmes (si pas encore approuvés)
      return algorithm.created_by === user.id && algorithm.status === "pending";
    },
    [user, isModerator]
  );

  return {
    role,
    loading,
    isModerator,
    isAdmin,
    canCreateAlgorithms,
    canModerateAlgorithms,
    canEditAlgorithm,
    canDeleteAlgorithm,
    loadUserRole,
  };
}
