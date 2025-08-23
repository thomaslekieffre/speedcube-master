"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface ModerationNotification {
  id: string;
  algorithm_id: string;
  type: 'new_algorithm' | 'algorithm_approved' | 'algorithm_rejected';
  message: string;
  created_at: string;
}

export function ModerationNotifications() {
  const { user } = useUser();
  const router = useRouter();
  const [notifications, setNotifications] = useState<ModerationNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("moderation_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_algorithm':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'algorithm_approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'algorithm_rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_algorithm':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-600';
      case 'algorithm_approved':
        return 'bg-green-500/10 text-green-600 border-green-600';
      case 'algorithm_rejected':
        return 'bg-red-500/10 text-red-600 border-red-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getNotificationText = (type: string) => {
    switch (type) {
      case 'new_algorithm':
        return 'Nouveau';
      case 'algorithm_approved':
        return 'Approuvé';
      case 'algorithm_rejected':
        return 'Rejeté';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Aucune notification pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications récentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getNotificationColor(notification.type)}`}
                  >
                    {getNotificationText(notification.type)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <p className="text-sm text-foreground mb-2">
                  {notification.message}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/algos/${notification.algorithm_id}`)}
                  className="h-6 px-2 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Voir l'algorithme
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
