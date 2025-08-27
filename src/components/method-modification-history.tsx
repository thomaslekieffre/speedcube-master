"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, User, Calendar, Edit, ArrowRight } from "lucide-react";
import { useCustomMethods } from "@/hooks/use-custom-methods";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface MethodModification {
  id: string;
  method_id: string;
  modified_by: string;
  modified_at: string;
  previous_data: any;
  new_data: any;
  reason: string | null;
  modified_by_user?: {
    username: string;
    avatar_url: string | null;
  };
}

interface MethodModificationHistoryProps {
  methodId: string;
}

export function MethodModificationHistory({
  methodId,
}: MethodModificationHistoryProps) {
  const { user } = useUser();
  const { getMethodModificationHistory } = useCustomMethods();
  const [modifications, setModifications] = useState<MethodModification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModifications = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const data = await getMethodModificationHistory(methodId);
        setModifications(data);
      } catch (err) {
        console.error("Erreur lors du chargement de l'historique:", err);
        toast.error("Erreur lors du chargement de l'historique");
      } finally {
        setLoading(false);
      }
    };

    loadModifications();
  }, [methodId, user?.id, getMethodModificationHistory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getChangedFields = (previous: any, current: any) => {
    const changes: string[] = [];
    const fields = [
      { key: "name", label: "Nom" },
      { key: "puzzle_type", label: "Type de puzzle" },
      { key: "description_markdown", label: "Description" },
      { key: "cubing_notation_example", label: "Notation" },
      { key: "is_public", label: "Visibilité" },
      { key: "algorithm_references", label: "Algorithmes de référence" },
    ];

    fields.forEach(({ key, label }) => {
      if (JSON.stringify(previous[key]) !== JSON.stringify(current[key])) {
        changes.push(label);
      }
    });

    return changes;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des modifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (modifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des modifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aucune modification pour le moment
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historique des modifications ({modifications.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {modifications.map((modification) => {
              const changedFields = getChangedFields(
                modification.previous_data,
                modification.new_data
              );

              return (
                <div
                  key={modification.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Edit className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {modification.modified_by_user?.username ||
                            "Utilisateur"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(modification.modified_at)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {changedFields.length} champ(s) modifié(s)
                    </Badge>
                  </div>

                  {changedFields.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-2">
                        Champs modifiés :
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {changedFields.map((field) => (
                          <Badge
                            key={field}
                            variant="secondary"
                            className="text-xs"
                          >
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {modification.reason && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Raison :</p>
                      <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                        {modification.reason}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Modifié le {formatDate(modification.modified_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
