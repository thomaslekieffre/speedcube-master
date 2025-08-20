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
import { useSolves, type Solve } from "@/hooks/use-solves";
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
  const [isInspection, setIsInspection] = useState(false);
  const [currentScramble, setCurrentScramble] = useState("R U R' U'");
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleType>("333");

  const {
    solves,
    addSolve,
    updateSolve,
    deleteSolve,
    clearAllSolves,
    exportSolves,
  } = useSolves();

  // Générer un nouveau scramble
  const generateNewScramble = () => {
    const newScramble = generateMockScramble(selectedPuzzle);
    setCurrentScramble(newScramble);
  };

  // Générer le premier scramble au montage
  useEffect(() => {
    generateNewScramble();
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

  // Inspection timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isInspection) {
      interval = setInterval(() => {
        setInspection((prev) => {
          if (prev >= 15000) {
            setIsInspection(false);
            return 0;
          }
          return prev + 100;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isInspection]);

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
  }, [isRunning, isInspection]);

  const handleSpacePress = () => {
    if (!isRunning && !isInspection) {
      // Commencer l'inspection
      setIsInspection(true);
      setInspection(0);
    } else if (isInspection) {
      // Démarrer le timer
      setIsInspection(false);
      setIsRunning(true);
      setStartTime(Date.now());
      setTime(0); // Remettre à 0 au début du timer
    } else if (isRunning) {
      // Arrêter le timer
      setIsRunning(false);
      setStartTime(null);
      saveSolve();
    }
  };

  const saveSolve = () => {
    // Calculer le temps directement depuis startTime
    const currentTime = startTime ? Date.now() - startTime : 0;

    const newSolve = addSolve({
      time: currentTime,
      penalty: "none",
      date: new Date(),
      scramble: currentScramble,
    });

    toast.success("Solve sauvegardé !", {
      description: `Temps: ${formatTime(currentTime)}`,
    });

    setTime(0);
    // Régénérer un nouveau scramble après avoir sauvegardé
    generateNewScramble();
  };

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
    if (solves.length === 0) return null;

    const validSolves = solves.filter((s) => s.penalty !== "dnf");
    const times = validSolves.map((s) =>
      s.penalty === "plus2" ? s.time + 2000 : s.time
    );

    const pb = Math.min(...times);
    const average =
      times.length > 0
        ? Math.floor(times.reduce((a, b) => a + b, 0) / times.length)
        : 0;

    return { pb, average, total: solves.length };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header compact avec puzzle et scramble */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Sélecteur de puzzle compact */}
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Box className="h-5 w-5" />
                Puzzle
              </h3>
              <div className="flex gap-1">
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
                      className="h-8 px-2 flex items-center gap-1"
                    >
                      <div className={`w-3 h-3 rounded-full ${puzzle.color}`} />
                      <span className="text-xs font-medium">
                        {puzzle.shortName}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Bouton nouveau scramble */}
            <Button
              variant="outline"
              size="sm"
              onClick={generateNewScramble}
              className="h-8"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Nouveau scramble
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Colonne gauche - Timer et Visualiseur */}
          <div className="xl:col-span-3 space-y-6">
            {/* Timer principal */}
            <Card className="w-full">
              <CardContent className="p-8">
                {/* Timer Display */}
                <div className="text-center mb-8">
                  {isInspection ? (
                    <div className="space-y-4">
                      <div className="text-7xl font-mono font-bold text-warning">
                        {formatInspection(inspection)}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-warning h-2 rounded-full transition-all duration-100"
                          style={{ width: `${(inspection / 15000) * 100}%` }}
                        />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Inspection en cours... Appuie sur espace pour démarrer
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-8xl font-mono font-bold text-foreground">
                        {formatTime(time)}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Appuie sur espace pour commencer l'inspection
                      </p>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleSpacePress}
                    disabled={isInspection}
                    className="flex-1 h-14 text-lg font-semibold"
                    size="lg"
                  >
                    {isRunning ? (
                      <>
                        <Square className="h-6 w-6 mr-2" />
                        Arrêter
                      </>
                    ) : (
                      <>
                        <Play className="h-6 w-6 mr-2" />
                        {isInspection ? "Démarrer" : "Inspection"}
                      </>
                    )}
                  </Button>
                </div>

                {/* Stats rapides */}
                {stats && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-foreground">
                          {stats.total}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Solves
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-primary">
                          {formatTime(stats.pb)}
                        </div>
                        <div className="text-sm text-muted-foreground">PB</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-accent">
                          {formatTime(stats.average)}
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

            {/* Visualiseur 3D */}
            {currentScramble && currentScramble.trim() !== "" && (
              <CubeViewer
                puzzleType={selectedPuzzle}
                scramble={currentScramble}
                onReset={handleResetCube}
              />
            )}

            {/* Actions supplémentaires */}
            {solves.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleExport}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-5 w-5" />
                      Exporter
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleClearAll}
                      className="flex items-center gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                      Tout effacer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne droite - Historique des solves */}
          <div className="xl:col-span-1">
            <div className="sticky top-32">
              <SolveList
                solves={solves}
                onUpdateSolve={handleUpdateSolve}
                onDeleteSolve={handleDeleteSolve}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
