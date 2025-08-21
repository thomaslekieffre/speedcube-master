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

  const { updateOrCreatePersonalBest } = usePersonalBests();

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

        // Règles WCA pour l'inspection :
        // - 15 secondes maximum
        // - +2 si > 15s
        // - DNF si > 17s
        if (currentInspection >= 17000) {
          // DNF - arrêter l'inspection et sauvegarder le DNF
          setIsInspection(false);
          setIsRunning(false);
          setInspection(0);
          setInspectionStartTime(null);
          setDnfAlreadySaved(true); // Marquer que le DNF est déjà sauvegardé

          // Sauvegarder le DNF dans les solves
          const dnfSolve = {
            time: 0,
            penalty: "dnf" as const,
            scramble: currentScramble,
            puzzle_type: selectedPuzzle,
          };

          // Utiliser setTimeout pour éviter la boucle infinie
          setTimeout(() => {
            addSolve(dnfSolve);
          }, 0);

          toast.error("DNF - Inspection > 17 secondes", {
            description: "Règles WCA : DNF si inspection > 17s",
          });

          // Régénérer un nouveau scramble
          const newScramble = generateMockScramble(selectedPuzzle);
          setCurrentScramble(newScramble);
        } else if (currentInspection >= 15000 && currentInspection < 15016) {
          // +2 - afficher le warning une seule fois
          toast.warning("+2 - Inspection > 15 secondes", {
            description: "Règles WCA : +2 si inspection > 15s",
          });
        }
      }, 10); // Même fréquence que le timer principal
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInspection, inspectionStartTime, selectedPuzzle]);

  const saveSolve = useCallback(() => {
    const currentTime = startTime ? Date.now() - startTime : 0;

    // Déterminer la pénalité selon les règles WCA
    let penalty: "none" | "plus2" | "dnf" = "none";

    if (inspection > 17000) {
      penalty = "dnf";
    } else if (inspection > 15000) {
      penalty = "plus2";
    }

    // Ne pas sauvegarder si c'est déjà un DNF d'inspection (déjà sauvegardé)
    if (dnfAlreadySaved) {
      setDnfAlreadySaved(false); // Reset le flag
      setTime(0);
      setInspection(0);
      setInspectionStartTime(null);
      setIsInspection(false);
      // Appeler generateNewScramble directement
      const newScramble = generateMockScramble(selectedPuzzle);
      setCurrentScramble(newScramble);
      return;
    }

    const newSolve = addSolve({
      time: currentTime,
      penalty: penalty,
      scramble: currentScramble,
      puzzle_type: selectedPuzzle,
    });

    // Mettre à jour le PB si nécessaire
    if (penalty !== "dnf") {
      updateOrCreatePersonalBest(
        selectedPuzzle,
        currentTime,
        penalty,
        currentScramble
      );
    }

    // Message selon la pénalité
    if (penalty === "dnf") {
      toast.error("DNF - Inspection > 17 secondes", {
        description: `Temps: ${formatTime(currentTime)} (DNF)`,
      });
    } else if (penalty === "plus2") {
      toast.warning("Solve sauvegardé avec +2", {
        description: `Temps: ${formatTime(currentTime)} + 2 secondes`,
      });
    } else {
      toast.success("Solve sauvegardé !", {
        description: `Temps: ${formatTime(currentTime)}`,
      });
    }

    setTime(0);
    setInspection(0);
    setInspectionStartTime(null);
    setIsInspection(false);
    // Appeler generateNewScramble directement
    const newScramble = generateMockScramble(selectedPuzzle);
    setCurrentScramble(newScramble);
  }, [
    startTime,
    inspection,
    dnfAlreadySaved,
    addSolve,
    currentScramble,
    selectedPuzzle,
  ]);

  const handleSpacePress = useCallback(() => {
    if (!isRunning && !isInspection) {
      // Commencer l'inspection
      setIsInspection(true);
      setInspectionStartTime(Date.now());
    } else if (isInspection) {
      // Démarrer le timer
      setIsInspection(false);
      setInspectionStartTime(null);
      setIsRunning(true);
      setStartTime(Date.now());
      setTime(0); // Remettre à 0 au début du timer
    } else if (isRunning) {
      // Arrêter le timer
      setIsRunning(false);
      setStartTime(null);
      saveSolve();
    }
  }, [isRunning, isInspection, saveSolve]);

  // Gestion des touches
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleSpacePress();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSpacePress]);

  const handleUpdateSolve = (id: string, updates: Partial<Solve>) => {
    updateSolve(id, updates);
    toast.success("Solve mis à jour");
  };

  const handleDeleteSolve = (id: string) => {
    deleteSolve(id);
    toast.success("Solve supprimé");
  };

  const handleClearAll = () => {
    if (confirm("Êtes-vous sûr de vouloir effacer tous les solves ?")) {
      clearAllSolves();
      toast.success("Tous les solves ont été supprimés");
    }
  };

  const handleExport = () => {
    exportSolves();
    toast.success("Solves exportés !");
  };

  const handlePuzzleChange = (puzzle: PuzzleType) => {
    setSelectedPuzzle(puzzle);
  };

  const handleScrambleChange = (scramble: string) => {
    setCurrentScramble(scramble);
  };

  const handleResetCube = () => {
    // Reset le cube au solveur
    // Cette fonction sera gérée par le CubeViewer lui-même
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${seconds}.${centiseconds.toString().padStart(2, "0")}`;
  };

  const formatInspection = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  // Calculer les stats avec pénalités
  const getStats = () => {
    // Filtrer les solves par puzzle sélectionné
    const puzzleSolves = solves.filter((s) => s.puzzle_type === selectedPuzzle);

    if (puzzleSolves.length === 0) return null;

    const validSolves = puzzleSolves.filter((s) => s.penalty !== "dnf");
    const dnfCount = puzzleSolves.filter((s) => s.penalty === "dnf").length;

    // Si tous les solves sont DNF, pas de moyenne
    if (validSolves.length === 0) {
      return {
        pb: null,
        average: null,
        total: puzzleSolves.length,
        dnfCount: dnfCount,
      };
    }

    const times = validSolves.map((s) =>
      s.penalty === "plus2" ? s.time + 2000 : s.time
    );

    const pb = Math.min(...times);
    const average =
      times.length > 0
        ? Math.floor(times.reduce((a, b) => a + b, 0) / times.length)
        : 0;

    return {
      pb,
      average,
      total: puzzleSolves.length,
      dnfCount: dnfCount,
    };
  };

  const stats = getStats();

  // Filtrer les solves par puzzle sélectionné pour l'affichage
  const puzzleSolves = solves.filter((s) => s.puzzle_type === selectedPuzzle);

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
          {/* Left column - Timer and Cube */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer Card */}
            <Card className="w-full">
              <CardContent className="p-8">
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
                      <div className="w-full bg-muted rounded-full h-2 relative overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-200 ${
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
                            className={`h-2 rounded-full transition-all duration-200 ${
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
                    <div className="space-y-4">
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
                <div className="mt-8 flex justify-center">
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
                  <div className="mt-8 pt-6 border-t border-border">
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
                        <div className="text-sm text-muted-foreground">PB</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-accent">
                          {stats.average ? formatTime(stats.average) : "N/A"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Moyenne
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cube Viewer */}
            {currentScramble && currentScramble.trim() !== "" && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Scramble</h3>
                    <Badge variant="secondary" className="font-mono text-sm">
                      {currentScramble}
                    </Badge>
                  </div>
                  <CubeViewer
                    puzzleType={selectedPuzzle}
                    scramble={currentScramble}
                    onReset={handleResetCube}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column - Solve History */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Historique</h3>
                    <Badge variant="outline">
                      {puzzleSolves.length} solves
                    </Badge>
                  </div>

                  {puzzleSolves.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Aucun solve pour ce puzzle</p>
                      <p className="text-sm">Commence à résoudre !</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {puzzleSolves.slice(0, 10).map((solve, index) => (
                        <div
                          key={solve.id}
                          className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          {/* Header avec numéro et temps */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-mono text-muted-foreground w-8">
                                #{puzzleSolves.length - index}
                              </div>
                              <div className="text-sm font-mono font-semibold">
                                {formatTime(solve.time)}
                                {solve.penalty === "plus2" && (
                                  <span className="text-warning ml-1">+2</span>
                                )}
                                {solve.penalty === "dnf" && (
                                  <span className="text-destructive ml-1">
                                    DNF
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSolve(solve.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Actions pour pénalités */}
                          <div className="flex items-center gap-1 mb-2">
                            <Button
                              variant={
                                solve.penalty === "none" ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                handleUpdateSolve(solve.id, { penalty: "none" })
                              }
                              className="h-6 px-2 text-xs"
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
                              className="h-6 px-2 text-xs text-warning hover:text-warning"
                            >
                              +2
                            </Button>
                            <Button
                              variant={
                                solve.penalty === "dnf" ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                handleUpdateSolve(solve.id, { penalty: "dnf" })
                              }
                              className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                            >
                              DNF
                            </Button>
                          </div>

                          {/* Notes */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Ajouter des notes..."
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
