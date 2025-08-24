import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useUserRole } from "./use-user-role";
import { useAlgorithms } from "./use-algorithms";
import { supabase } from "@/lib/supabase";

export function useModerationBadge() {
  const { user } = useUser();
  const { isModerator } = useUserRole();
  const { countPendingAlgorithms } = useAlgorithms();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Charger le nombre total d'éléments en attente
  const loadPendingCount = async () => {
    if (!user || !isModerator()) {
      setPendingCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Compter les méthodes en attente directement
      const { count: methodsCount, error: methodsError } = await supabase
        .from("custom_methods")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (methodsError) throw methodsError;

      const [algorithmsCount] = await Promise.all([countPendingAlgorithms()]);

      setPendingCount(algorithmsCount + (methodsCount || 0));
    } catch (error) {
      console.error("Erreur lors du chargement du compteur:", error);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage et quand l'utilisateur change
  useEffect(() => {
    loadPendingCount();
  }, [user?.id]);

  // Recharger quand le rôle change
  useEffect(() => {
    if (!isModerator()) {
      setPendingCount(0);
    } else {
      loadPendingCount();
    }
  }, [isModerator]);

  return {
    pendingCount,
    loading,
    loadPendingCount,
  };
}
