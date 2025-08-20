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
  const puzzleSelectorRef = useRef<{ regenerateScramble: () => void }>(null);

  const {
    solves,
    addSolve,
    updateSolve,
    deleteSolve,
    clearAllSolves,
    exportSolves,
  } = useSolves();

  // Générer un nouveau scramble (maintenant géré par PuzzleSelector)
  const generateScramble = useCallback(() => {
    // Cette fonction est maintenant gérée par PuzzleSelector
    // On peut la garder pour la compatibilité
  }, []);

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
    if (puzzleSelectorRef.current) {
      puzzleSelectorRef.current.regenerateScramble();
    }
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
    <div className="space-y-6">
      {/* Sélecteur de puzzle */}
      <PuzzleSelector
        ref={puzzleSelectorRef}
        selectedPuzzle={selectedPuzzle}
        onPuzzleChange={handlePuzzleChange}
        onScrambleChange={handleScrambleChange}
      />

      {/* Visualiseur 3D */}
      <CubeViewer
        puzzleType={selectedPuzzle}
        scramble={currentScramble}
        onReset={handleResetCube}
      />

      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          {/* Timer Display */}
          <div className="text-center mb-8">
            {isInspection ? (
              <div className="text-6xl font-mono font-bold text-warning">
                {formatInspection(inspection)}
              </div>
            ) : (
              <div className="text-8xl font-mono font-bold text-foreground">
                {formatTime(time)}
              </div>
            )}

            <p className="text-muted-foreground mt-2 text-sm">
              {isInspection
                ? "Inspection en cours..."
                : "Appuie sur espace pour démarrer/arrêter"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleSpacePress}
              disabled={isInspection}
              className="flex-1 h-12"
            >
              {isRunning ? (
                <>
                  <Square className="h-5 w-5 mr-2" />
                  Arrêter
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  {isInspection ? "Démarrer" : "Inspection"}
                </>
              )}
            </Button>
          </div>

          {/* Stats rapides */}
          {stats && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.total}
                  </div>
                  <div className="text-xs text-muted-foreground">Solves</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {formatTime(stats.pb)}
                  </div>
                  <div className="text-xs text-muted-foreground">PB</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">
                    {formatTime(stats.average)}
                  </div>
                  <div className="text-xs text-muted-foreground">Moyenne</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions supplémentaires */}
      {solves.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exporter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Tout effacer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SolveList */}
      <SolveList
        solves={solves}
        onUpdateSolve={handleUpdateSolve}
        onDeleteSolve={handleDeleteSolve}
      />
    </div>
  );
}
