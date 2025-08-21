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

  const { updateOrCreatePersonalBest, deletePersonalBest, getPersonalBest } =
    usePersonalBests();

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
      // Arrêter le timer
      setIsRunning(false);
      const finalTime = Date.now() - (startTime || 0);

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
    (solveId: string) => {
      // Trouver le solve à supprimer
      const solveToDelete = solves.find((s) => s.id === solveId);

      if (solveToDelete) {
        // Vérifier si c'était le PB en comparant avec le PB de la base de données
        const currentPB = getPersonalBest(solveToDelete.puzzle_type);
        const wasPB =
          currentPB &&
          currentPB.time === solveToDelete.time &&
          solveToDelete.penalty !== "dnf";

        // Supprimer le solve
        deleteSolve(solveId);

        // Si c'était le PB, mettre à jour le PB avec le nouveau meilleur temps
        if (wasPB) {
          const remainingSolves = solves.filter(
            (s) =>
              s.puzzle_type === solveToDelete.puzzle_type && s.id !== solveId
          );
          const remainingValidSolves = remainingSolves.filter(
            (s) => s.penalty !== "dnf"
          );

          if (remainingValidSolves.length > 0) {
            const newPB = Math.min(...remainingValidSolves.map((s) => s.time));
            const newPBSolve = remainingValidSolves.find(
              (s) => s.time === newPB
            );

            if (newPBSolve) {
              updateOrCreatePersonalBest(
                solveToDelete.puzzle_type,
                newPB,
                newPBSolve.penalty as "none" | "plus2",
                newPBSolve.scramble
              );
            }
          } else {
            // Plus aucun solve valide, supprimer le PB
            deletePersonalBest(solveToDelete.puzzle_type);
          }
        }

        toast.success("Solve supprimé");
      }
    },
    [
      deleteSolve,
      solves,
      updateOrCreatePersonalBest,
      deletePersonalBest,
      getPersonalBest,
    ]
  );

  const handleUpdateSolve = useCallback(
    (solveId: string, updates: Partial<Solve>) => {
      updateSolve(solveId, updates);
      toast.success("Solve mis à jour");
    },
    [updateSolve]
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

  const stats = {
    total: puzzleSolves.length,
    pb: currentPB
      ? currentPB.time
      : validSolves.length > 0
      ? Math.min(...validSolves.map((s) => s.time))
      : null,
    average:
      validSolves.length > 0
        ? validSolves.slice(-12).reduce((sum, s) => sum + s.time, 0) /
          Math.min(12, validSolves.length)
        : null,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec puzzle selector */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Puzzle selector */}
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-foreground">Timer</h2>
              <div className="flex gap-2">
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
                      className={`h-9 px-3 transition-all duration-200 ${
                        selectedPuzzle === puzzle.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-muted/50 hover:border-primary/30"
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${puzzle.color} mr-2`}
                      />
                      <span className="text-sm font-medium">
                        {puzzle.shortName}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentScramble(generateMockScramble(selectedPuzzle))
                }
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Nouveau scramble
              </Button>
              {solves.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Timer and Cube integrated */}
          <div className="lg:col-span-2">
            <Card className="w-full">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Timer Section */}
                  <div className="space-y-6">
                    {/* Timer Display */}
                    <div className="text-center space-y-6">
                      {isInspection ? (
                        <div className="space-y-6">
                          <div
                            className={`text-8xl font-mono font-bold ${
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
                          <div className="w-full bg-muted rounded-full h-3 relative overflow-hidden">
                            <div
                              className={`h-3 rounded-full transition-all duration-200 ${
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
                                className={`h-3 rounded-full transition-all duration-200 ${
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

                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>0s</span>
                            <span>15s (WCA)</span>
                            <span>17s (DNF)</span>
                          </div>

                          <p
                            className={`text-sm ${
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
                        <div className="space-y-6">
                          <div className="text-9xl font-mono font-bold text-foreground">
                            {formatTime(time)}
                          </div>
                          <p className="text-muted-foreground">
                            Appuie sur espace pour commencer l'inspection
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Control Button */}
                    <div className="flex justify-center">
                      <Button
                        onClick={handleSpacePress}
                        disabled={isInspection}
                        className="h-16 px-8 text-xl font-semibold"
                        size="lg"
                      >
                        {isRunning ? (
                          <>
                            <Square className="h-6 w-6 mr-3" />
                            Arrêter
                          </>
                        ) : (
                          <>
                            <Play className="h-6 w-6 mr-3" />
                            {isInspection ? "Démarrer" : "Inspection"}
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Quick Stats */}
                    {stats && (
                      <div className="pt-6 border-t border-border">
                        <div className="grid grid-cols-3 gap-6 text-center">
                          <div className="space-y-2">
                            <div className="text-2xl font-bold text-foreground">
                              {stats.total}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Solves
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold text-primary">
                              {stats.pb ? formatTime(stats.pb) : "N/A"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              PB
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold text-accent">
                              {stats.average
                                ? formatTime(stats.average)
                                : "N/A"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Moyenne
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cube Viewer Section */}
                  <div className="space-y-4">
                    {/* Scramble Display */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Scramble actuel
                      </h3>
                      <div className="bg-muted/50 p-4 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            2x2x2
                          </span>
                        </div>
                        <code className="text-base font-mono break-all leading-relaxed text-foreground">
                          {currentScramble}
                        </code>
                      </div>
                    </div>

                    {/* Cube Viewer */}
                    {currentScramble && currentScramble.trim() !== "" && (
                      <div className="bg-muted/30 rounded-lg p-4 border border-border">
                        <CubeViewer
                          puzzleType={selectedPuzzle}
                          scramble={currentScramble}
                          onReset={handleResetCube}
                        />
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          Utilisez la souris pour faire tourner le cube
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Solve History */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Historique</h3>
                    <Badge variant="secondary">{puzzleSolves.length}</Badge>
                  </div>

                  {puzzleSolves.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Box className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun solve pour ce puzzle</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
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
                            className="p-3 rounded-lg border border-border bg-muted/30"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-lg font-bold">
                                {solve.penalty === "dnf"
                                  ? "DNF"
                                  : formatTime(solve.time)}
                              </span>
                              <div className="flex items-center gap-2">
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
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Actions pour pénalités */}
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
                                className="h-5 px-2 text-xs"
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
                                className="h-5 px-2 text-xs text-warning hover:text-warning"
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
                                className="h-5 px-2 text-xs text-destructive hover:text-destructive"
                              >
                                DNF
                              </Button>
                            </div>

                            {/* Scramble et Notes */}
                            <div className="space-y-2">
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
                    <div className="mt-4 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAll}
                        className="w-full text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Effacer tout
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
