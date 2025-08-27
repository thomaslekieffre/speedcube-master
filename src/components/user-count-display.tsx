"use client";

import { Users } from "lucide-react";
import { useUserCount } from "@/hooks/use-user-count";

export function UserCountDisplay() {
  const { userCount, loading, error } = useUserCount();

  // Fonction pour formater le nombre d'utilisateurs
  const formatUserCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M+`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k+`;
    } else {
      return `${count}+`;
    }
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <span className="text-sm text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  // Affichage en cas d'erreur ou si pas de données
  if (error || userCount === null) {
    return (
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <span className="text-sm text-muted-foreground">
          1000+ utilisateurs
        </span>
      </div>
    );
  }

  // Affichage normal
  return (
    <div className="flex items-center gap-2">
      <Users className="h-5 w-5 text-primary" />
      <span className="text-sm text-muted-foreground">
        {formatUserCount(userCount)} utilisateurs
      </span>
    </div>
  );
}
