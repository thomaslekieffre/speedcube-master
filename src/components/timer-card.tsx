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
  const [inspectionStartTime, setInspectionStartTime] = useState<number | null>(
    null
  );
  const [isInspection, setIsInspection] = useState(false);
  const [currentScramble, setCurrentScramble] = useState("R U R' U'");
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleType>("333");
  const [dnfAlreadySaved, setDnfAlreadySaved] = useState(false);

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
          addSolve({
            time: 0,
            penalty: "dnf",
            date: new Date(),
            scramble: currentScramble,
          });

          toast.error("DNF - Inspection > 17 secondes", {
            description: "Règles WCA : DNF si inspection > 17s",
          });

          // Régénérer un nouveau scramble
          generateNewScramble();
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
  }, [
    isInspection,
    inspectionStartTime,
    currentScramble,
    addSolve,
    generateNewScramble,
  ]);

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
  };

  const saveSolve = () => {
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
      generateNewScramble();
      return;
    }

    const newSolve = addSolve({
      time: currentTime,
      penalty: penalty,
      date: new Date(),
      scramble: currentScramble,
    });

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
    const dnfCount = solves.filter((s) => s.penalty === "dnf").length;

    // Si tous les solves sont DNF, pas de moyenne
    if (validSolves.length === 0) {
      return {
        pb: null,
        average: null,
        total: solves.length,
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
      total: solves.length,
      dnfCount: dnfCount,
    };
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
                      className={`h-8 px-2 flex items-center gap-1 transition-all duration-300 ease-out ${
                        selectedPuzzle === puzzle.id
                          ? "bg-primary text-primary-foreground shadow-lg scale-105"
                          : "hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:shadow-lg hover:scale-105 hover:border-primary/30"
                      }`}
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
                      <div
                        className={`text-7xl font-mono font-bold ${
                          inspection > 17000
                            ? "text-destructive"
                            : inspection > 15000
                            ? "text-warning"
                            : "text-primary"
                        }`}
                      >
                        {formatInspection(inspection)}
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 relative overflow-hidden">
                        {/* Barre de progression principale */}
                        <div
                          className={`h-3 rounded-full transition-all duration-200 ease-out ${
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

                        {/* Barre de progression étendue pour montrer jusqu'à 17s */}
                        {inspection > 15000 && (
                          <div
                            className={`h-3 rounded-full transition-all duration-200 ease-out ${
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

                        {/* Indicateur de position */}
                        <div
                          className={`absolute top-0 w-1 h-3 rounded-full transition-all duration-200 ease-out ${
                            inspection > 17000
                              ? "bg-white"
                              : inspection > 15000
                              ? "bg-white"
                              : "bg-white/50"
                          }`}
                          style={{
                            left: `${Math.min(
                              (inspection / 17000) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
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
                          {stats.pb ? formatTime(stats.pb) : "N/A"}
                        </div>
                        <div className="text-sm text-muted-foreground">PB</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-accent">
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
