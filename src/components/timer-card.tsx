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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SolveList } from "./solve-list";
import { useSupabaseSolves } from "@/hooks/use-supabase-solves";
import { usePersonalBests } from "@/hooks/use-personal-bests";
import type { Database } from "@/lib/supabase";

type Solve = Database["public"]["Tables"]["solves"]["Row"];
import { toast } from "sonner";
import {
  PuzzleSelector,
  type PuzzleType,
  type PuzzleSelectorRef,
  PUZZLES,
  generateMockScramble,
} from "./puzzle-selector";
import { CubeViewer } from "./cube-viewer";

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
  const isInitialized = useRef(false);

  const {
    solves,
    addSolve,
    updateSolve,
    deleteSolve,
    clearAllSolves,
    exportSolves,
    loading: solvesLoading,
    error: solvesError,
  } = useSupabaseSolves();

  const {
    updateOrCreatePersonalBest,
    deletePersonalBest,
    getPersonalBest,
    refresh: refreshPersonalBests,
  } = usePersonalBests();

  // Générer le premier scramble côté client seulement
  useEffect(() => {
    if (!isInitialized.current) {
      setCurrentScramble(generateMockScramble(selectedPuzzle));
      isInitialized.current = true;
    }
  }, []);

  // Générer un nouveau scramble quand le puzzle change
  useEffect(() => {
    if (isInitialized.current) {
      setCurrentScramble(generateMockScramble(selectedPuzzle));
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
        handleSpacePress();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRunning, isInspection, inspectionStartTime]);

  const handleSpacePress = useCallback(() => {
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

      // Mettre à jour le PB si nécessaire
      if (penalty !== "dnf") {
        updateOrCreatePersonalBest(
          selectedPuzzle,
          finalTime,
          penalty as "none" | "plus2",
          currentScramble
        );
      }

      // Générer un nouveau scramble
      setCurrentScramble(generateMockScramble(selectedPuzzle));
      setDnfAlreadySaved(false);

      toast.success("Solve sauvegardé !");
    } else if (isInspection) {
      // Démarrer le solve depuis l'inspection
      setIsInspection(false);
      setInspection(0);
      setInspectionStartTime(null);
      setIsRunning(true);
      setStartTime(Date.now());
    } else {
      // Commencer l'inspection
      setIsInspection(true);
      setInspectionStartTime(Date.now());
    }
  }, [
    isRunning,
    isInspection,
    inspectionStartTime,
    startTime,
    selectedPuzzle,
    currentScramble,
    addSolve,
    updateOrCreatePersonalBest,
  ]);

  const handlePuzzleChange = useCallback((puzzleType: PuzzleType) => {
    setSelectedPuzzle(puzzleType);
    setCurrentScramble(generateMockScramble(puzzleType));
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

        // Forcer une synchronisation immédiate du PB après mise à jour
        setTimeout(async () => {
          try {
            const updatedSolves = solves.map((s) =>
              s.id === solveId ? { ...s, ...updates } : s
            );
            const puzzleSolves = updatedSolves.filter(
              (s) => s.puzzle_type === selectedPuzzle
            );
            const validSolves = puzzleSolves.filter((s) => s.penalty !== "dnf");

            if (validSolves.length === 0) {
              await deletePersonalBest(selectedPuzzle);
            } else {
              // Calculer le meilleur temps en tenant compte des pénalités
              const timesWithPenalties = validSolves.map((s) => ({
                solve: s,
                effectiveTime: s.penalty === "plus2" ? s.time + 2000 : s.time,
              }));

              const bestTimeEntry = timesWithPenalties.reduce((min, current) =>
                current.effectiveTime < min.effectiveTime ? current : min
              );

              if (bestTimeEntry) {
                await updateOrCreatePersonalBest(
                  selectedPuzzle,
                  bestTimeEntry.solve.time,
                  bestTimeEntry.solve.penalty as "none" | "plus2",
                  bestTimeEntry.solve.scramble
                );
              }
            }
          } catch (error) {
            console.error(
              "Erreur lors de la synchronisation après mise à jour:",
              error
            );
          }
        }, 200);

        toast.success("Solve mis à jour");
      } catch (error) {
        console.error("Erreur lors de la mise à jour du solve:", error);
        toast.error("Erreur lors de la mise à jour du solve");
      }
    },
    [
      updateSolve,
      solves,
      selectedPuzzle,
      updateOrCreatePersonalBest,
      deletePersonalBest,
    ]
  );

  const handleClearAll = useCallback(() => {
    clearAllSolves();
    toast.success("Tous les solves supprimés");
  }, [clearAllSolves]);

  const formatTime = (ms: number) => {
    if (ms === 0) return "0.00";
    const seconds = ms / 1000;
    if (seconds < 60) {
      return seconds.toFixed(2);
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes}:${remainingSeconds.padStart(5, "0")}`;
  };

  const formatInspection = (ms: number) => {
    const seconds = ms / 1000;
    return seconds.toFixed(1);
  };

  // Calculer les statistiques
  const puzzleSolves = solves.filter((s) => s.puzzle_type === selectedPuzzle);
  const validSolves = puzzleSolves.filter((s) => s.penalty !== "dnf");
  const currentPB = getPersonalBest(selectedPuzzle);

  // Calculer le PB à partir des solves valides uniquement (avec pénalités)
  const calculatedPB =
    validSolves.length > 0
      ? Math.min(
          ...validSolves.map((s) =>
            s.penalty === "plus2" ? s.time + 2000 : s.time
          )
        )
      : null;



  // Synchroniser automatiquement le PB de la base de données avec les solves actuels
  useEffect(() => {
    const syncPB = async () => {
      try {
        if (validSolves.length === 0) {
          // Supprimer le PB s'il n'y a plus de solves
          await deletePersonalBest(selectedPuzzle);
          return;
        }

        // Calculer le meilleur temps en tenant compte des pénalités
        const timesWithPenalties = validSolves.map((s) => ({
          solve: s,
          effectiveTime: s.penalty === "plus2" ? s.time + 2000 : s.time,
        }));

        const bestTimeEntry = timesWithPenalties.reduce((min, current) =>
          current.effectiveTime < min.effectiveTime ? current : min
        );

        if (bestTimeEntry) {

          await updateOrCreatePersonalBest(
            selectedPuzzle,
            bestTimeEntry.solve.time,
            bestTimeEntry.solve.penalty as "none" | "plus2",
            bestTimeEntry.solve.scramble
          );
        }
      } catch (error) {
        console.error("Erreur lors de la synchronisation du PB:", error);
        // Ne pas afficher de toast d'erreur pour éviter le spam
      }
    };

    // Délai pour éviter les synchronisations trop fréquentes
    const timeoutId = setTimeout(syncPB, 100);
    return () => clearTimeout(timeoutId);
  }, [
    validSolves,
    puzzleSolves,
    selectedPuzzle,
    updateOrCreatePersonalBest,
    deletePersonalBest,
  ]);

  const stats = {
    total: puzzleSolves.length,
    // Utiliser le PB calculé, pas le temps du timer
    pb: calculatedPB,
    average:
      validSolves.length > 0
        ? validSolves.slice(-12).reduce((sum, s) => sum + s.time, 0) /
          Math.min(12, validSolves.length)
        : null,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec puzzle selector - Responsive */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Puzzle selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {/* Puzzle buttons - Responsive grid */}
              <div className="grid grid-cols-6 sm:flex sm:flex-wrap gap-1 sm:gap-2">
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
                    <div className="text-center space-y-3 sm:space-y-4">
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
                            {inspection > 17000
                              ? "DNF - Inspection > 17 secondes"
                              : inspection > 15000
                              ? "+2 - Inspection > 15 secondes"
                              : "Inspection en cours... Appuie sur espace pour démarrer"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="text-5xl sm:text-6xl lg:text-7xl font-mono font-bold text-foreground">
                            {formatTime(time)}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Appuie sur espace pour commencer l'inspection
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Control Button - Responsive */}
                    <div className="flex justify-center">
                      <Button
                        onClick={handleSpacePress}
                        disabled={isInspection}
                        className="h-10 sm:h-12 px-4 sm:px-6 text-base sm:text-lg font-semibold"
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
                            ) : (
                              <span className="hidden sm:inline">
                                Inspection
                              </span>
                            )}
                            <span className="sm:hidden">
                              {isInspection ? "Start" : "Insp"}
                            </span>
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Quick Stats - Responsive */}
                    {stats && (
                      <div className="pt-3 sm:pt-4 border-t border-border">
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                          <div className="space-y-1">
                            <div className="text-lg sm:text-xl font-bold text-foreground">
                              {stats.total}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Solves
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-lg sm:text-xl font-bold text-primary">
                              {stats.pb ? formatTime(stats.pb) : "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              PB
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-lg sm:text-xl font-bold text-accent">
                              {stats.average
                                ? formatTime(stats.average)
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
                  </div>

                  {/* Cube Viewer Section - Responsive */}
                  <div className="lg:col-span-2 flex flex-col">
                    {currentScramble && currentScramble.trim() !== "" && (
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
                    {/* Bouton Nouveau scramble dans la section visualisation */}
                    <div className="mt-4 flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentScramble(
                            generateMockScramble(selectedPuzzle)
                          )
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
            <div className="sticky top-32">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold">
                      Historique
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{puzzleSolves.length}</Badge>
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
