"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Square, RotateCcw, Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SolveList } from "./solve-list";

interface Solve {
  id: string;
  time: number;
  penalty: "none" | "plus2" | "dnf";
  date: Date;
  scramble: string;
  notes?: string;
}

export function TimerCard() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [inspection, setInspection] = useState(0);
  const [isInspection, setIsInspection] = useState(false);
  const [currentScramble, setCurrentScramble] = useState("R U R' U'");
  const [solves, setSolves] = useState<Solve[]>([]);

  // Générer un nouveau scramble (mock pour l'instant)
  const generateScramble = useCallback(() => {
    const moves = [
      "R",
      "R'",
      "U",
      "U'",
      "F",
      "F'",
      "L",
      "L'",
      "D",
      "D'",
      "B",
      "B'",
    ];
    const length = 20;
    let scramble = "";
    let lastMove = "";

    for (let i = 0; i < length; i++) {
      let move;
      do {
        move = moves[Math.floor(Math.random() * moves.length)];
      } while (move === lastMove);

      scramble += move + " ";
      lastMove = move;
    }

    setCurrentScramble(scramble.trim());
  }, []);

  // Timer principal
  useEffect(() => {
    let interval: NodeJS.Timeout;

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
    let interval: NodeJS.Timeout;

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

    const newSolve: Solve = {
      id: Date.now().toString(),
      time: currentTime,
      penalty: "none",
      date: new Date(),
      scramble: currentScramble,
    };

    setSolves((prev) => [newSolve, ...prev]);
    setTime(0);
    generateScramble();
  };

  const updateSolve = (id: string, updates: Partial<Solve>) => {
    setSolves((prev) =>
      prev.map((solve) => (solve.id === id ? { ...solve, ...updates } : solve))
    );
  };

  const deleteSolve = (id: string) => {
    setSolves((prev) => prev.filter((solve) => solve.id !== id));
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

          {/* Scramble */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Scramble
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={generateScramble}
                className="h-8"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Nouveau
              </Button>
            </div>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm">
              {currentScramble}
            </div>
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

      {/* SolveList */}
      <SolveList
        solves={solves}
        onUpdateSolve={updateSolve}
        onDeleteSolve={deleteSolve}
      />
    </div>
  );
}
