"use client";

import { useState } from "react";
import { Algorithm } from "@/lib/supabase";
import { useAlgorithmModifications } from "@/hooks/use-algorithm-modifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
  Edit3,
  Clock,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ModerationAlgorithmCardProps {
  algorithm: Algorithm;
  onApprove: (algorithmId: string) => void;
  onReject: (algorithmId: string, reason: string) => void;
  loading?: boolean;
}

export function ModerationAlgorithmCard({
  algorithm,
  onApprove,
  onReject,
  loading = false,
}: ModerationAlgorithmCardProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const { getModificationHistory } = useAlgorithmModifications();
  const [modificationHistory, setModificationHistory] = useState<any[]>([]);

  const loadModificationHistory = async () => {
    if (!showHistory) return;
    const history = await getModificationHistory(algorithm.id);
    setModificationHistory(history);
  };

  const handleShowHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory) {
      loadModificationHistory();
    }
  };

  const getStatusIcon = () => {
    switch (algorithm.status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "modified":
        return <Edit3 className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (algorithm.status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "modified":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon()}
              {algorithm.name}
              <Badge className={getStatusColor()}>
                {algorithm.status === "approved" && "Approuvé"}
                {algorithm.status === "rejected" && "Rejeté"}
                {algorithm.status === "modified" && "Modifié"}
                {algorithm.status === "pending" && "En attente"}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {algorithm.created_by.substring(0, 8)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(algorithm.created_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </div>
              {algorithm.modification_count > 0 && (
                <div className="flex items-center gap-1">
                  <Edit3 className="h-3 w-3" />
                  {algorithm.modification_count} modification(s)
                </div>
              )}
            </div>
          </div>

          {algorithm.modification_count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowHistory}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              Historique
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Détails de l'algorithme */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Notation :</span>
            <p className="font-mono bg-muted p-2 rounded mt-1">
              {algorithm.notation}
            </p>
          </div>
          <div>
            <span className="font-medium">Difficulté :</span>
            <p className="capitalize">{algorithm.difficulty}</p>
          </div>
          <div>
            <span className="font-medium">Puzzle :</span>
            <p>{algorithm.puzzle_type}</p>
          </div>
          <div>
            <span className="font-medium">Méthode :</span>
            <p>{algorithm.method}</p>
          </div>
        </div>

        {algorithm.description && (
          <div>
            <span className="font-medium text-sm">Description :</span>
            <p className="text-sm text-muted-foreground mt-1">
              {algorithm.description}
            </p>
          </div>
        )}

        {/* Historique des modifications */}
        {showHistory && modificationHistory.length > 0 && (
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <History className="h-4 w-4" />
              Historique des modifications
            </h4>
            <ScrollArea className="h-40">
              <div className="space-y-3">
                {modificationHistory.map((mod, index) => (
                  <div key={mod.id} className="text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">
                        Modification #{modificationHistory.length - index}
                      </span>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(mod.modified_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                    {mod.modification_reason && (
                      <p className="text-muted-foreground mb-1">
                        Raison : {mod.modification_reason}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Modifié par :{" "}
                      {mod.modified_by_user?.username || "Utilisateur"}
                    </div>
                    {index < modificationHistory.length - 1 && (
                      <Separator className="mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Raison de rejet si applicable */}
        {algorithm.rejection_reason && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
              Raison du rejet :
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              {algorithm.rejection_reason}
            </p>
          </div>
        )}

        {/* Actions de modération */}
        {algorithm.status === "pending" || algorithm.status === "modified" ? (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => onApprove(algorithm.id)}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approuver
            </Button>
            <Button
              onClick={() => setShowRejectionDialog(true)}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
          </div>
        ) : (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Cet algorithme a déjà été{" "}
              {algorithm.status === "approved" ? "approuvé" : "rejeté"}
            </p>
          </div>
        )}

        {/* Dialog de rejet */}
        {showRejectionDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="font-medium mb-4">Raison du rejet</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Expliquez pourquoi vous rejetez cet algorithme..."
                className="w-full p-3 border rounded-lg mb-4 h-24 resize-none"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectionDialog(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => {
                    onReject(algorithm.id, rejectionReason);
                    setShowRejectionDialog(false);
                    setRejectionReason("");
                  }}
                  disabled={!rejectionReason.trim() || loading}
                  variant="destructive"
                  className="flex-1"
                >
                  Rejeter
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
