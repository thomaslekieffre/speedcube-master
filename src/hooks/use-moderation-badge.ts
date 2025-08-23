import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useUserRole } from "./use-user-role";
import { useAlgorithms } from "./use-algorithms";

export function useModerationBadge() {
  const { user } = useUser();
  const { isModerator } = useUserRole();
  const { countPendingAlgorithms } = useAlgorithms();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Charger le nombre d'algorithmes en attente
  const loadPendingCount = async () => {
    if (!user || !isModerator()) {
      setPendingCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const count = await countPendingAlgorithms();
      setPendingCount(count);
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
