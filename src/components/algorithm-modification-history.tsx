"use client";

import { useState, useEffect } from "react";
import { useAlgorithmModifications } from "@/hooks/use-algorithm-modifications";
import { Algorithm } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { History, Clock, User, Edit3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface AlgorithmModificationHistoryProps {
  algorithm: Algorithm;
}

export function AlgorithmModificationHistory({
  algorithm,
}: AlgorithmModificationHistoryProps) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { getModificationHistory } = useAlgorithmModifications();

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open, algorithm.id]);

  const loadHistory = async () => {
    setLoading(true);
    const modifications = await getModificationHistory(algorithm.id);
    setHistory(modifications);
    setLoading(false);
  };

  const getChangedFields = (previous: any, current: any) => {
    const changes: string[] = [];
    Object.keys(current).forEach((key) => {
      if (JSON.stringify(previous[key]) !== JSON.stringify(current[key])) {
        changes.push(key);
      }
    });
    return changes;
  };

  const formatFieldName = (field: string) => {
    const fieldNames: Record<string, string> = {
      name: "Nom",
      notation: "Notation",
      description: "Description",
      scramble: "Scramble",
      solution: "Solution",
      fingertricks: "Fingertricks",
      notes: "Notes",
      alternatives: "Alternatives",
      difficulty: "Difficulté",
    };
    return fieldNames[field] || field;
  };

  const formatValue = (value: any) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "string" && value.length > 50) {
      return value.substring(0, 50) + "...";
    }
    return value;
  };

  if (algorithm.modification_count === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground"
        >
          <History className="h-4 w-4" />
          Historique ({algorithm.modification_count})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des modifications
          </DialogTitle>
          <DialogDescription>
            Historique complet des modifications apportées à cet algorithme
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Chargement...</div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun historique disponible
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((modification, index) => {
                const changedFields = getChangedFields(
                  modification.previous_data,
                  modification.new_data
                );

                return (
                  <div key={modification.id} className="space-y-4">
                    {/* En-tête de la modification */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Edit3 className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          Modification #{history.length - index}
                        </span>
                        <Badge variant="outline">
                          {changedFields.length} champ(s) modifié(s)
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(
                          new Date(modification.modified_at),
                          {
                            addSuffix: true,
                            locale: fr,
                          }
                        )}
                      </div>
                    </div>

                    {/* Auteur */}
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3 w-3" />
                      <span>Modifié par :</span>
                      <span className="font-medium">
                        {modification.modified_by_user?.username ||
                          "Utilisateur"}
                      </span>
                    </div>

                    {/* Raison */}
                    {modification.modification_reason && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Raison :</p>
                        <p className="text-sm text-muted-foreground">
                          {modification.modification_reason}
                        </p>
                      </div>
                    )}

                    {/* Changements */}
                    <div className="space-y-3">
                      {changedFields.map((field) => (
                        <div key={field} className="border rounded-lg p-3">
                          <h4 className="font-medium text-sm mb-2">
                            {formatFieldName(field)}
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground mb-1">
                                Avant :
                              </p>
                              <p className="bg-red-50 dark:bg-red-950/20 p-2 rounded border-l-2 border-red-200 dark:border-red-800">
                                {formatValue(
                                  modification.previous_data[field]
                                ) || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">
                                Après :
                              </p>
                              <p className="bg-green-50 dark:bg-green-950/20 p-2 rounded border-l-2 border-green-200 dark:border-green-800">
                                {formatValue(modification.new_data[field]) ||
                                  "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {index < history.length - 1 && <Separator />}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
