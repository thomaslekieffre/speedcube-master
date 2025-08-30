"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Play,
  Square,
  RotateCcw,
  Plus,
  X,
  Download,
  Trash2,
  Box,
  Move,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SolveList } from "./solve-list";
import { useSupabaseSolves } from "@/hooks/use-supabase-solves";
import { usePersonalBests } from "@/hooks/use-personal-bests";
import { useSessions } from "@/hooks/use-sessions";
import { useSolvesStats } from "@/hooks/use-solves-stats";
import { SessionManager } from "./session-manager";
import { ManualTimeInput } from "./manual-time-input";
import type { Database } from "@/types/database";

type Solve = Database["public"]["Tables"]["solves"]["Row"];
import { toast } from "sonner";
import {
  PuzzleSelector,
  type PuzzleType,
  type PuzzleSelectorRef,
  PUZZLES,
} from "./puzzle-selector";
import { generateScramble } from "@/app/(pages)/timer/_utils/cstimer-scramble";
import { CubeViewer } from "./cube-viewer";
import { formatTime } from "@/lib/time";

export function TimerCard() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [inspection, setInspection] = useState(0);
  const [inspectionStartTime, setInspectionStartTime] = useState<number | null>(
    null
  );
  const [isInspection, setIsInspection] = useState(false);
  const [currentScramble, setCurrentScramble] = useState("R U R' U'");
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleType>("333");
  const [dnfAlreadySaved, setDnfAlreadySaved] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const isInitialized = useRef(false);

  const {
    solves,
    addSolve,
    updateSolve,
    deleteSolve,
    clearAllSolves,
    moveSolve,
    exportSolves,
    loading: solvesLoading,
    error: solvesError,
  } = useSupabaseSolves(undefined, activeSessionId);

  // Stats en temps réel pour la session active
  const { stats: puzzleStats } = useSolvesStats(
    selectedPuzzle,
    activeSessionId
  );

  const { isNewPersonalBest } = usePersonalBests();

  const {
    sessions,
    activeSession,
    loading: sessionsLoading,
  } = useSessions(selectedPuzzle);

  // Mettre à jour la session active quand le puzzle change
  useEffect(() => {
    // Attendre que les sessions soient chargées
    if (sessionsLoading) return;

    // Si on a une session active pour ce puzzle, l'utiliser
    if (activeSession && activeSession.puzzle_type === selectedPuzzle) {
      setActiveSessionId(activeSession.id);
    } else {
      // Sinon, chercher la première session disponible pour ce puzzle
      const firstSession = sessions.find(
        (s) => s.puzzle_type === selectedPuzzle
      );
      if (firstSession) {
        setActiveSessionId(firstSession.id);
      } else {
        setActiveSessionId(null);
      }
    }
  }, [activeSession, sessions, selectedPuzzle, sessionsLoading]);

  // Forcer le rafraîchissement des données au chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("🔄 Forçage du rafraîchissement des données");
      window.dispatchEvent(new CustomEvent("solves-updated"));
      window.dispatchEvent(new CustomEvent("sessions-updated"));
      window.dispatchEvent(new CustomEvent("stats-updated"));
    }, 2000); // Augmenter le délai pour laisser le temps aux données de se charger

    return () => clearTimeout(timer);
  }, []);

  // Forcer le rafraîchissement quand la session active change
  useEffect(() => {
    if (activeSessionId) {
      console.log("🔄 Session active changée, rafraîchissement des données");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("solves-updated"));
        window.dispatchEvent(new CustomEvent("sessions-updated"));
        window.dispatchEvent(new CustomEvent("stats-updated"));
      }, 500);
    }
  }, [activeSessionId]);

  // Filtrer les sessions disponibles pour le déplacement (exclure la session actuelle)
  const availableSessions = sessions.filter(
    (session) => session.id !== activeSessionId
  );

  // Générer le premier scramble côté client seulement
  useEffect(() => {
    if (!isInitialized.current) {
      setCurrentScramble(generateScramble(selectedPuzzle));
      isInitialized.current = true;
    }
  }, []);

  // Générer un nouveau scramble quand le puzzle change
  useEffect(() => {
    if (isInitialized.current) {
      setCurrentScramble(generateScramble(selectedPuzzle));
    }
  }, [selectedPuzzle]);

  // Timer principal
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning && startTime) {
      // Commencer immédiatement
      setTime(Date.now() - startTime);

      interval = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 10);
    }

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  // Inspection timer avec règles WCA
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isInspection && inspectionStartTime) {
      // Commencer immédiatement
      setInspection(Date.now() - inspectionStartTime);

      interval = setInterval(() => {
        const currentInspection = Date.now() - inspectionStartTime;
        setInspection(currentInspection);

        // Règles WCA : +2 si > 15s, DNF si > 17s
        if (currentInspection > 17000) {
          // DNF automatique
          setIsInspection(false);
          setInspection(0);
          setInspectionStartTime(null);
          setDnfAlreadySaved(true);
          toast.error("DNF - Inspection > 17 secondes");
        }
      }, 10);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInspection, inspectionStartTime]);

  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();

        // Empêcher la répétition de touches
        if (event.repeat) return;

        handleSpacePress();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRunning, isInspection, inspectionStartTime]);

  const handleSpacePress = useCallback(() => {
    // Vérifier si c'est un event blind
    const isBlindEvent = ["333bf", "444bf", "555bf", "333mbf"].includes(
      selectedPuzzle
    );

    if (isRunning) {
      // Arrêter le timer immédiatement
      const finalTime = Date.now() - (startTime || 0);
      setIsRunning(false);
      setTime(finalTime); // Fixer le temps affiché

      // Ajouter le solve
      const penalty =
        inspection > 17000 ? "dnf" : inspection > 15000 ? "plus2" : "none";
      const solveData = {
        time: penalty === "dnf" ? 0 : finalTime,
        penalty: penalty as "none" | "plus2" | "dnf",
        puzzle_type: selectedPuzzle,
        scramble: currentScramble,
        notes: "",
      };

      addSolve(solveData);

      // Vérifier si c'est un nouveau PB
      if (
        isNewPersonalBest(
          selectedPuzzle,
          finalTime,
          penalty as "none" | "plus2" | "dnf"
        )
      ) {
        toast.success("Nouveau record personnel ! 🎉");
      }

      // Le PB sera mis à jour automatiquement via le trigger SQL

      // Générer un nouveau scramble
      setCurrentScramble(generateScramble(selectedPuzzle));
      setDnfAlreadySaved(false);

      toast.success("Solve sauvegardé !");
    } else if (isInspection && !isBlindEvent) {
      // Démarrer le solve depuis l'inspection (uniquement pour les events non-blind)
      setIsInspection(false);
      setInspection(0);
      setInspectionStartTime(null);
      setIsRunning(true);
      setStartTime(Date.now());
    } else if (!isBlindEvent) {
      // Commencer l'inspection (uniquement pour les events non-blind)
      setIsInspection(true);
      setInspectionStartTime(Date.now());
    } else {
      // Pour les events blind : démarrer directement le timer
      setIsRunning(true);
      setStartTime(Date.now());
    }
  }, [
    isRunning,
    isInspection,
    inspectionStartTime,
    startTime,
    selectedPuzzle,
    currentScramble,
    addSolve,
    isNewPersonalBest,
  ]);

  const handlePuzzleChange = useCallback((puzzleType: PuzzleType) => {
    setSelectedPuzzle(puzzleType);
    setCurrentScramble(generateScramble(puzzleType));
    // Ne pas réinitialiser la session active quand on change de puzzle
    // setActiveSessionId(null);
  }, []);

  const handleResetCube = useCallback(() => {
    // Reset du cube viewer si nécessaire
  }, []);

  const handleExport = useCallback(() => {
    exportSolves();
  }, [exportSolves]);

  const handleDeleteSolve = useCallback(
    async (solveId: string) => {
      try {
        // Supprimer le solve
        await deleteSolve(solveId);

        // La synchronisation automatique se chargera de mettre à jour le PB
        toast.success("Solve supprimé");
      } catch (error) {
        console.error("Erreur lors de la suppression du solve:", error);
        toast.error("Erreur lors de la suppression du solve");
      }
    },
    [deleteSolve]
  );

  const handleUpdateSolve = useCallback(
    async (solveId: string, updates: Partial<Solve>) => {
      try {
        await updateSolve(solveId, updates);
        // Les stats se mettront à jour automatiquement via le hook useSolvesStats
        toast.success("Solve mis à jour");
      } catch (error) {
        console.error("Erreur lors de la mise à jour du solve:", error);
        toast.error("Erreur lors de la mise à jour du solve");
      }
    },
    [updateSolve]
  );

  const handleClearAll = useCallback(() => {
    clearAllSolves();
    toast.success("Tous les solves supprimés");
  }, [clearAllSolves]);

  const handleMoveSolve = useCallback(
    async (solveId: string, targetSessionId: string) => {
      try {
        await moveSolve(solveId, targetSessionId);
        toast.success("Solve déplacé avec succès");
      } catch (error) {
        console.error("Erreur lors du déplacement:", error);
        toast.error("Erreur lors du déplacement");
      }
    },
    [moveSolve]
  );

  const handleManualTimeSave = useCallback(
    async (
      time: number,
      penalty: "none" | "plus2" | "dnf",
      puzzleType: string,
      scramble?: string
    ) => {
      try {
        const solveData = {
          time: penalty === "dnf" ? 0 : time,
          penalty,
          puzzle_type: puzzleType,
          scramble: scramble || "",
          notes: "",
        };

        await addSolve(solveData);
        toast.success("Temps ajouté manuellement !");
      } catch (error) {
        console.error("Erreur lors de l'ajout du temps:", error);
        toast.error("Erreur lors de l'ajout du temps");
      }
    },
    [addSolve]
  );

  const formatInspection = (ms: number) => {
    const seconds = ms / 1000;
    return seconds.toFixed(1);
  };

  // Calculer les statistiques
  const puzzleSolves = solves.filter((s) => s.puzzle_type === selectedPuzzle);

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec puzzle selector - Responsive */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Puzzle selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {/* Puzzle buttons - Responsive grid */}
              <div className="grid grid-cols-8 sm:flex sm:flex-wrap gap-1 sm:gap-2">
                {[
                  "333",
                  "222",
                  "444",
                  "555",
                  "666",
                  "777",
                  "pyram",
                  "skewb",
                  "sq1",
                  "clock",
                  "minx",
                  "333bf",
                  "444bf",
                  "555bf",
                  "333mbf",
                ].map((puzzleId) => {
                  const puzzle = PUZZLES.find((p: any) => p.id === puzzleId);
                  if (!puzzle) return null;
                  return (
                    <Button
                      key={puzzle.id}
                      variant={
                        selectedPuzzle === puzzle.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handlePuzzleChange(puzzle.id)}
                      className={`h-8 sm:h-9 px-2 sm:px-3 transition-all duration-200 ${
                        selectedPuzzle === puzzle.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-muted/50 hover:border-primary/30"
                      }`}
                    >
                      <div
                        className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full ${puzzle.color} mr-1 sm:mr-2`}
                      />
                      <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                        {puzzle.name}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Actions - Responsive */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Les boutons seront repositionnés dans les sections appropriées */}
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Timer and Cube Section */}
          <div className="xl:col-span-2">
            <Card className="w-full">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* Mobile: Stack vertically */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {/* Timer Section - Responsive */}
                  <div className="space-y-4 sm:space-y-6 flex flex-col justify-between">
                    {/* Timer Display - Responsive sizes */}
                    <div
                      className="text-center space-y-3 sm:space-y-4 cursor-pointer touch-manipulation relative group"
                      onClick={handleSpacePress}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSpacePress();
                        }
                      }}
                    >
                      {isInspection ? (
                        <div className="space-y-3 sm:space-y-4">
                          <div
                            className={`text-4xl sm:text-5xl lg:text-6xl font-mono font-bold ${
                              inspection > 17000
                                ? "text-destructive"
                                : inspection > 15000
                                ? "text-warning"
                                : "text-primary"
                            }`}
                          >
                            {formatInspection(inspection)}
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 relative overflow-hidden">
                            <div
                              className={`h-1.5 sm:h-2 rounded-full transition-all duration-200 ${
                                inspection > 17000
                                  ? "bg-destructive"
                                  : inspection > 15000
                                  ? "bg-warning"
                                  : "bg-primary"
                              }`}
                              style={{
                                width: `${Math.min(
                                  (inspection / 15000) * 100,
                                  100
                                )}%`,
                              }}
                            />
                            {inspection > 15000 && (
                              <div
                                className={`h-1.5 sm:h-2 rounded-full transition-all duration-200 ${
                                  inspection > 17000
                                    ? "bg-destructive"
                                    : "bg-warning"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    ((inspection - 15000) / 2000) * 100,
                                    100
                                  )}%`,
                                  marginLeft: "100%",
                                }}
                              />
                            )}
                          </div>

                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0s</span>
                            <span>15s (WCA)</span>
                            <span>17s (DNF)</span>
                          </div>

                          <p
                            className={`text-xs ${
                              inspection > 17000
                                ? "text-destructive"
                                : inspection > 15000
                                ? "text-warning"
                                : "text-muted-foreground"
                            }`}
                          >
                            {inspection > 17000 ? (
                              "DNF - Inspection > 17 secondes"
                            ) : inspection > 15000 ? (
                              "+2 - Inspection > 15 secondes"
                            ) : (
                              <span>
                                <span className="hidden sm:inline">
                                  Inspection en cours... Appuie sur espace pour
                                  démarrer
                                </span>
                                <span className="sm:hidden">
                                  Inspection en cours... Appuie sur le timer
                                  pour démarrer
                                </span>
                              </span>
                            )}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="text-5xl sm:text-6xl lg:text-7xl font-mono font-bold text-foreground">
                            {formatTime(time)}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {["333bf", "444bf", "555bf", "333mbf"].includes(
                              selectedPuzzle
                            ) ? (
                              <span>
                                <span className="hidden sm:inline">
                                  Appuie sur espace pour démarrer
                                </span>
                                <span className="sm:hidden">
                                  Appuie sur le timer pour démarrer
                                </span>
                              </span>
                            ) : (
                              <span>
                                <span className="hidden sm:inline">
                                  Appuie sur espace pour commencer l'inspection
                                </span>
                                <span className="sm:hidden">
                                  Appuie sur le timer pour commencer
                                  l'inspection
                                </span>
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Control Button - Responsive */}
                    <div className="flex justify-center">
                      <Button
                        onClick={handleSpacePress}
                        disabled={isInspection}
                        className="h-10 sm:h-12 px-4 sm:px-6 text-base sm:text-lg font-semibold min-h-[44px] flex-1 sm:flex-none"
                        size="lg"
                      >
                        {isRunning ? (
                          <>
                            <Square className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            <span className="hidden sm:inline">Arrêter</span>
                            <span className="sm:hidden">Stop</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            {isInspection ? (
                              <span className="hidden sm:inline">Démarrer</span>
                            ) : ["333bf", "444bf", "555bf", "333mbf"].includes(
                                selectedPuzzle
                              ) ? (
                              <span className="hidden sm:inline">Démarrer</span>
                            ) : (
                              <span className="hidden sm:inline">
                                Inspection
                              </span>
                            )}
                            <span className="sm:hidden">
                              {isInspection
                                ? "Start"
                                : [
                                    "333bf",
                                    "444bf",
                                    "555bf",
                                    "333mbf",
                                  ].includes(selectedPuzzle)
                                ? "Start"
                                : "Insp"}
                            </span>
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Quick Stats - Responsive */}
                    {puzzleStats && (
                      <div className="pt-3 sm:pt-4 border-t border-border">
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                          <div className="space-y-1">
                            <div className="text-lg sm:text-xl font-bold text-foreground">
                              {puzzleStats.total}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Solves
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-lg sm:text-xl font-bold text-primary">
                              {puzzleStats.pb
                                ? formatTime(puzzleStats.pb)
                                : "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              PB
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-lg sm:text-xl font-bold text-accent">
                              {puzzleStats.average12
                                ? formatTime(puzzleStats.average12)
                                : "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Moyenne
                            </div>
                          </div>
                        </div>
                        {/* Boutons temporaires pour debug */}
                      </div>
                    )}

                    {/* Scramble Display - Responsive */}
                    {selectedPuzzle !== "333mbf" && (
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold mb-2">
                          Scramble actuel
                        </h3>
                        <div className="bg-muted/50 p-2 sm:p-3 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              {PUZZLES.find((p) => p.id === selectedPuzzle)
                                ?.shortName || "2x2x2"}
                            </span>
                          </div>
                          <code className="text-xs sm:text-sm font-mono break-all leading-relaxed text-foreground">
                            {currentScramble}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cube Viewer Section - Responsive */}
                  <div className="lg:col-span-2 flex flex-col">
                    {currentScramble &&
                      currentScramble.trim() !== "" &&
                      !["333bf", "444bf", "555bf", "333mbf"].includes(
                        selectedPuzzle
                      ) && (
                        <div className="bg-muted/30 rounded-lg p-3 sm:p-4 lg:p-6 border border-border flex-1 flex flex-col min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
                          <div className="flex-1">
                            <CubeViewer
                              puzzleType={selectedPuzzle}
                              scramble={currentScramble}
                              onReset={handleResetCube}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground text-center mt-2 sm:mt-3">
                            Utilisez la souris pour faire tourner le cube
                          </p>
                        </div>
                      )}
                    {/* Affichage spécial pour le multi-blind */}
                    {currentScramble &&
                      currentScramble.trim() !== "" &&
                      selectedPuzzle === "333mbf" && (
                        <div className="bg-muted/30 rounded-lg p-3 sm:p-4 lg:p-6 border border-border flex-1 flex flex-col min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
                          <div className="flex-1 flex flex-col">
                            {/* Header */}
                            <div className="text-center mb-6">
                              <div className="text-3xl font-bold text-foreground mb-2">
                                Multi-Blind
                              </div>
                              <div className="text-sm text-muted-foreground">
                                5 cubes • Mémorisation + Résolution
                              </div>
                            </div>

                            {/* Scrambles Grid */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              {currentScramble
                                .split("\n")
                                .map((scramble, index) => (
                                  <div
                                    key={index}
                                    className="bg-background/80 rounded-lg p-3 sm:p-4 border border-border/50 hover:border-border transition-colors"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                                        <span className="font-semibold text-sm text-foreground">
                                          Cube {index + 1}
                                        </span>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {index + 1}/5
                                      </Badge>
                                    </div>
                                    <div className="bg-muted/50 rounded p-2 sm:p-3">
                                      <code className="text-xs sm:text-sm font-mono text-foreground break-all leading-relaxed">
                                        {scramble}
                                      </code>
                                    </div>
                                  </div>
                                ))}
                            </div>

                            {/* Instructions */}
                            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
                              <div className="text-center">
                                <div className="text-sm font-medium text-primary mb-1">
                                  Instructions
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div>
                                    • Mémorisez tous les cubes avant de
                                    commencer
                                  </div>
                                  <div>• Résolvez-les dans l'ordre (1 → 5)</div>
                                  <div>
                                    • Temps total = mémorisation + résolution
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    {/* Bouton Nouveau scramble dans la section visualisation */}
                    <div className="mt-4 flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentScramble(generateScramble(selectedPuzzle))
                        }
                        className="h-8 sm:h-9 px-3 sm:px-4"
                      >
                        <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">
                          Nouveau scramble
                        </span>
                        <span className="sm:hidden">Nouveau</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Solve History - Responsive */}
          <div className="xl:col-span-1">
            <div className="sticky top-32 space-y-4">
              {/* Manual Time Input */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <ManualTimeInput
                    onSave={handleManualTimeSave}
                    defaultPuzzle={selectedPuzzle}
                    scramble={currentScramble}
                  />
                </CardContent>
              </Card>

              {/* Session Manager */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <SessionManager
                    selectedPuzzle={selectedPuzzle}
                    onSessionChange={setActiveSessionId}
                  />
                </CardContent>
              </Card>

              {/* Solve History */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold">
                      Historique
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{puzzleSolves.length}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log("🔄 Rafraîchissement manuel des données");
                          window.dispatchEvent(
                            new CustomEvent("solves-updated")
                          );
                          window.dispatchEvent(
                            new CustomEvent("sessions-updated")
                          );
                          window.dispatchEvent(
                            new CustomEvent("stats-updated")
                          );
                        }}
                        className="h-6 sm:h-7 px-2 sm:px-3"
                      >
                        🔄
                      </Button>
                      {solves.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExport}
                          className="h-6 sm:h-7 px-2 sm:px-3"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Exporter</span>
                          <span className="sm:hidden">Export</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {puzzleSolves.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-muted-foreground">
                      <Box className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                      <p className="text-sm sm:text-base">
                        Aucun solve pour ce puzzle
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                      {puzzleSolves
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime()
                        )
                        .map((solve) => (
                          <div
                            key={solve.id}
                            className="p-2 sm:p-3 rounded-lg border border-border bg-muted/30"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-base sm:text-lg font-bold">
                                {solve.penalty === "dnf"
                                  ? "DNF"
                                  : formatTime(solve.time)}
                              </span>
                              <div className="flex items-center gap-1 sm:gap-2">
                                {solve.penalty && solve.penalty !== "none" && (
                                  <Badge
                                    variant={
                                      solve.penalty === "dnf"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {solve.penalty === "dnf"
                                      ? "DNF"
                                      : solve.penalty === "plus2"
                                      ? "+2"
                                      : solve.penalty}
                                  </Badge>
                                )}
                                {availableSessions.length > 0 && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-muted-foreground hover:text-foreground"
                                      >
                                        <Move className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        disabled
                                        className="text-xs text-muted-foreground"
                                      >
                                        Déplacer vers...
                                      </DropdownMenuItem>
                                      {availableSessions.map((session) => (
                                        <DropdownMenuItem
                                          key={session.id}
                                          onClick={() =>
                                            handleMoveSolve(
                                              solve.id,
                                              session.id
                                            )
                                          }
                                        >
                                          {session.name}
                                          {session.is_active && (
                                            <Badge
                                              variant="secondary"
                                              className="ml-2 text-xs"
                                            >
                                              Active
                                            </Badge>
                                          )}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSolve(solve.id)}
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Actions pour pénalités - Responsive */}
                            <div className="flex items-center gap-1 mb-2">
                              <Button
                                variant={
                                  solve.penalty === "none"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handleUpdateSolve(solve.id, {
                                    penalty: "none",
                                  })
                                }
                                className="h-4 sm:h-5 px-1.5 sm:px-2 text-xs"
                              >
                                OK
                              </Button>
                              <Button
                                variant={
                                  solve.penalty === "plus2"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handleUpdateSolve(solve.id, {
                                    penalty: "plus2",
                                  })
                                }
                                className="h-4 sm:h-5 px-1.5 sm:px-2 text-xs text-warning hover:text-warning"
                              >
                                +2
                              </Button>
                              <Button
                                variant={
                                  solve.penalty === "dnf"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handleUpdateSolve(solve.id, {
                                    penalty: "dnf",
                                  })
                                }
                                className="h-4 sm:h-5 px-1.5 sm:px-2 text-xs text-destructive hover:text-destructive"
                              >
                                DNF
                              </Button>
                            </div>

                            {/* Scramble et Notes - Responsive */}
                            <div className="space-y-1 sm:space-y-2">
                              <div className="text-xs text-muted-foreground font-mono break-all leading-tight">
                                {solve.scramble}
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Notes..."
                                  value={solve.notes || ""}
                                  onChange={(e) =>
                                    handleUpdateSolve(solve.id, {
                                      notes: e.target.value,
                                    })
                                  }
                                  className="flex-1 text-xs bg-transparent border border-border rounded px-2 py-1 focus:outline-none focus:border-primary"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {puzzleSolves.length > 0 && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAll}
                        className="w-full text-destructive hover:text-destructive h-8 sm:h-9"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        <span className="hidden sm:inline">Effacer tout</span>
                        <span className="sm:hidden">Effacer</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
