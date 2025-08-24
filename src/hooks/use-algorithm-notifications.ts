import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export interface AlgorithmNotification {
  id: string;
  algorithm_id: string;
  algorithm_name: string;
  type: "rejected" | "approved";
  message: string;
  rejection_reason?: string;
  created_at: string;
  read: boolean;
}

export function useAlgorithmNotifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<AlgorithmNotification[]>([]);
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

      // Récupérer les algorithmes rejetés ET approuvés de l'utilisateur
      const { data: algorithms, error } = await supabase
        .from("algorithms")
        .select("id, name, status, rejection_reason, reviewed_at")
        .eq("created_by", user.id)
        .in("status", ["rejected", "approved"])
        .order("reviewed_at", { ascending: false });

      if (error) throw error;

      // Transformer en notifications
      const algorithmNotifications: AlgorithmNotification[] = (algorithms || [])
        .filter(algo => algo.reviewed_at) // Seulement ceux qui ont été modérés
        .map((algo) => ({
          id: `notification_${algo.id}_${algo.status}`,
          algorithm_id: algo.id,
          algorithm_name: algo.name,
          type: algo.status as "rejected" | "approved",
          message: algo.status === "rejected" 
            ? `Votre algorithme "${algo.name}" a été rejeté`
            : `Votre algorithme "${algo.name}" a été approuvé !`,
          rejection_reason: algo.rejection_reason,
          created_at: algo.reviewed_at,
          read: false, // Toujours non lu au début
        }));

      // Filtrer les notifications déjà marquées comme lues (stockage local)
      const readNotifications = JSON.parse(localStorage.getItem(`read_notifications_${user.id}`) || '[]');
      const filteredNotifications = algorithmNotifications.filter(
        notif => !readNotifications.includes(notif.id)
      );

      setNotifications(filteredNotifications);
      setUnreadCount(filteredNotifications.length);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Marquer une notification comme lue (persistant)
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    // Ajouter à la liste des notifications lues dans localStorage
    const readNotifications = JSON.parse(localStorage.getItem(`read_notifications_${user.id}`) || '[]');
    if (!readNotifications.includes(notificationId)) {
      readNotifications.push(notificationId);
      localStorage.setItem(`read_notifications_${user.id}`, JSON.stringify(readNotifications));
    }

    // Mettre à jour l'état local
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Marquer toutes les notifications comme lues (persistant)
  const markAllAsRead = async () => {
    if (!user) return;

    // Ajouter toutes les notifications actuelles à la liste des lues
    const readNotifications = JSON.parse(localStorage.getItem(`read_notifications_${user.id}`) || '[]');
    const currentNotificationIds = notifications.map(notif => notif.id);
    const newReadNotifications = [...new Set([...readNotifications, ...currentNotificationIds])];
    localStorage.setItem(`read_notifications_${user.id}`, JSON.stringify(newReadNotifications));

    // Vider l'état local
    setNotifications([]);
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
