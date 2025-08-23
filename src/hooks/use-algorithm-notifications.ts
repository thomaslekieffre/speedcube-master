import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export interface AlgorithmNotification {
  id: string;
  algorithm_id: string;
  algorithm_name: string;
  type: "rejected";
  message: string;
  rejection_reason: string;
  created_at: string;
  read: boolean;
}

export function useAlgorithmNotifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<AlgorithmNotification[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Charger les notifications de l'utilisateur
  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Récupérer les algorithmes rejetés de l'utilisateur
      const { data: rejectedAlgorithms, error } = await supabase
        .from("algorithms")
        .select("id, name, rejection_reason, updated_at")
        .eq("created_by", user.id)
        .eq("status", "rejected")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Transformer en notifications
      const algorithmNotifications: AlgorithmNotification[] = (
        rejectedAlgorithms || []
      ).map((algo) => ({
        id: algo.id,
        algorithm_id: algo.id,
        algorithm_name: algo.name,
        type: "rejected" as const,
        message: `Votre algorithme "${algo.name}" a été rejeté`,
        rejection_reason: algo.rejection_reason || "Aucune raison fournie",
        created_at: algo.updated_at,
        read: false, // On considère que les nouvelles notifications sont non lues
      }));

      setNotifications(algorithmNotifications);
      setUnreadCount(algorithmNotifications.length);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  // Charger au montage et quand l'utilisateur change
  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };
}
