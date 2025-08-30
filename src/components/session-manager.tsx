"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Settings, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSessions } from "@/hooks/use-sessions";
import { useSessionStats } from "@/hooks/use-session-stats";
import { toast } from "sonner";
import { formatTime } from "@/lib/time";
import type { PuzzleType } from "./puzzle-selector";

interface SessionManagerProps {
  selectedPuzzle: PuzzleType;
  onSessionChange?: (sessionId: string | null) => void;
}

export function SessionManager({
  selectedPuzzle,
  onSessionChange,
}: SessionManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const createInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const {
    sessions,
    activeSession,
    loading,
    createSession,
    activateSession,
    updateSession,
    deleteSession,
  } = useSessions(selectedPuzzle);

  const { sessionStats, refresh: refreshSessionStats } =
    useSessionStats(selectedPuzzle);

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) {
      toast.error("Le nom de la session ne peut pas être vide");
      return;
    }

    try {
      await createSession(newSessionName.trim(), selectedPuzzle);
      setNewSessionName("");
      setIsCreateDialogOpen(false);
      toast.success("Session créée avec succès");
      onSessionChange?.(activeSession?.id || null);

      // Rafraîchir les statistiques après la création de session
      await refreshSessionStats();
    } catch (error) {
      console.error("Erreur lors de la création de la session:", error);
      toast.error("Erreur lors de la création de la session");
    }
  };

  const handleActivateSession = async (sessionId: string) => {
    try {
      await activateSession(sessionId);
      toast.success("Session activée");
      onSessionChange?.(sessionId);

      // Rafraîchir les statistiques après le changement de session
      await refreshSessionStats();
    } catch (error) {
      console.error("Erreur lors de l'activation de la session:", error);
      toast.error("Erreur lors de l'activation de la session");
    }
  };

  const handleUpdateSession = async (sessionId: string) => {
    if (!editName.trim()) {
      toast.error("Le nom de la session ne peut pas être vide");
      return;
    }

    try {
      await updateSession(sessionId, { name: editName.trim() });
      setIsEditing(null);
      setEditName("");
      toast.success("Session mise à jour");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la session:", error);
      toast.error("Erreur lors de la mise à jour de la session");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      toast.success("Session supprimée");
      onSessionChange?.(activeSession?.id || null);

      // Rafraîchir les statistiques après la suppression de session
      await refreshSessionStats();
    } catch (error) {
      console.error("Erreur lors de la suppression de la session:", error);
      toast.error("Erreur lors de la suppression de la session");
    }
  };

  const startEditing = (session: any) => {
    setIsEditing(session.id);
    setEditName(session.name);
  };

  const cancelEditing = () => {
    setIsEditing(null);
    setEditName("");
  };

  const getSessionStats = (sessionId: string) => {
    return sessionStats.find((stats) => stats.session_id === sessionId);
  };

  // Empêcher le timer de se déclencher quand on tape dans les champs de saisie
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Si on est dans un champ de saisie et qu'on appuie sur espace
      if (
        e.key === " " &&
        (document.activeElement === createInputRef.current ||
          document.activeElement === editInputRef.current)
      ) {
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  // Rafraîchir les statistiques quand la session active change
  useEffect(() => {
    if (activeSession) {
      refreshSessionStats();
    }
  }, [activeSession?.id]);

  // Écouter les événements de mise à jour des solves pour rafraîchir les stats des sessions
  useEffect(() => {
    const handleSolvesUpdated = () => {
      console.log("📥 Événement solves-updated reçu dans SessionManager");
      refreshSessionStats();
    };

    window.addEventListener("solves-updated", handleSolvesUpdated);
    return () =>
      window.removeEventListener("solves-updated", handleSolvesUpdated);
  }, [refreshSessionStats]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-8 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec session active */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">Session</h3>
          {activeSession && (
            <Badge variant="secondary" className="text-xs">
              {activeSession.name}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-3 w-3 mr-1" />
                Nouvelle session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Nom de la session
                  </label>
                  <Input
                    ref={createInputRef}
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="Ex: Session matin, Compétition, etc."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateSession();
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleCreateSession}>Créer</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Liste des sessions */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Aucune session créée</p>
            <p className="text-xs">
              Créez votre première session pour commencer
            </p>
          </div>
        ) : (
          sessions.map((session) => {
            const stats = getSessionStats(session.id);
            return (
              <div
                key={session.id}
                className={`flex flex-col p-3 rounded-lg border transition-colors ${
                  session.is_active
                    ? "bg-primary/10 border-primary/20"
                    : "bg-muted/30 border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {session.is_active && (
                      <Check className="h-3 w-3 text-primary flex-shrink-0" />
                    )}

                    {isEditing === session.id ? (
                      <Input
                        ref={editInputRef}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleUpdateSession(session.id);
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            cancelEditing();
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {session.name}
                        </div>
                        {stats ? (
                          <div className="text-xs text-muted-foreground mt-1">
                            {stats.total_solves} solves
                            {stats.best_time && (
                              <span className="ml-2">
                                • PB: {formatTime(stats.best_time)}
                              </span>
                            )}
                            {stats.average_time && (
                              <span className="ml-2">
                                • Moy: {formatTime(stats.average_time)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground mt-1">
                            Aucun solve
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isEditing === session.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUpdateSession(session.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditing}
                        className="h-6 w-6 p-0"
                      >
                        <span className="text-xs">✕</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      {!session.is_active && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleActivateSession(session.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => startEditing(session)}
                          >
                            Renommer
                          </DropdownMenuItem>
                          {!session.is_active && (
                            <DropdownMenuItem
                              onClick={() => handleActivateSession(session.id)}
                            >
                              Activer
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
