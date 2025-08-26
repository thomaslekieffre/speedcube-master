"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { formatTime } from "@/lib/time";
import { Button } from "@/app/_components/ui/button";
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card";
import { generateScramble } from "../_utils/cstimer-scramble";
import { Penalty, Solve, useSolves } from "../_hooks/use-solves";
import { CubeViewer } from "@/components/cube-viewer";
import { PuzzleSelector, type PuzzleType } from "@/components/puzzle-selector";

function useRafTimer() {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const tick = useCallback((t: number) => {
    if (startRef.current == null) return;
    setElapsedMs(t - startRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (running) return;
    setRunning(true);
    const now = performance.now();
    startRef.current = now - elapsedMs;
    rafRef.current = requestAnimationFrame(tick);
  }, [elapsedMs, running, tick]);

  const stop = useCallback(() => {
    if (!running) return;
    setRunning(false);
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, [running]);

  const reset = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    setRunning(false);
    setElapsedMs(0);
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  return { running, elapsedMs, start, stop, reset };
}

export function TimerCard() {
  const { solves, addSolve } = useSolves();
  const { running, elapsedMs, start, stop, reset } = useRafTimer();
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleType>("333");
  const [scramble, setScramble] = useState("");
  const [penalty, setPenalty] = useState<Penalty>("OK");
  const [notes, setNotes] = useState("");
  const [viewerKey, setViewerKey] = useState(0);

  // Fonction pour générer un scramble avec cstimer
  const generateNewScramble = () => {
    try {
      return generateScramble(selectedPuzzle);
    } catch (error) {
      console.error("Erreur lors de la génération du scramble:", error);
      return "R U R' U'"; // Fallback
    }
  };

  // Générer le premier scramble au chargement et quand le puzzle change
  useEffect(() => {
    const initialScramble = generateNewScramble();
    setScramble(initialScramble);
    setViewerKey((prev) => prev + 1);
  }, [selectedPuzzle]);

  const effectiveMs = useMemo(() => {
    if (penalty === "DNF") return NaN;
    return penalty === "+2" ? elapsedMs + 2000 : elapsedMs;
  }, [elapsedMs, penalty]);

  const onSpace = useCallback(
    (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      if (running) stop();
      else start();
    },
    [running, start, stop]
  );

  useEffect(() => {
    window.addEventListener("keydown", onSpace);
    return () => window.removeEventListener("keydown", onSpace);
  }, [onSpace]);

  function saveSolve() {
    const s: Solve = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timeMs: Math.max(0, Math.round(elapsedMs)),
      penalty,
      scramble,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };
    addSolve(s);
    // reset for next
    setPenalty("OK");
    setNotes("");
    const nextScramble = generateNewScramble();
    setScramble(nextScramble);
    setViewerKey((prev) => prev + 1); // Forcer le re-render du viewer
    reset();
  }

  return (
    <div className="space-y-6">
      {/* Sélecteur de puzzle */}
      <PuzzleSelector
        selectedPuzzle={selectedPuzzle}
        onPuzzleChange={setSelectedPuzzle}
        onScrambleChange={setScramble}
      />
      
      <Card className="p-6">
        <CardHeader className="pt-0 px-0">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Scramble actuel</span>
            <code className="rounded-md bg-muted px-2 py-1 text-foreground/90 whitespace-pre-wrap break-words">
              {scramble}
            </code>
            <Button
              variant="outline"
              className="h-8 px-3"
              onClick={() => {
                const newScramble = generateNewScramble();
                setScramble(newScramble);
                setViewerKey((prev) => prev + 1); // Forcer le re-render du viewer
              }}
            >
              Nouveau scramble
            </Button>
          </div>
        </CardHeader>
      <CardContent className="px-0">
        <div className="flex flex-col items-center gap-6">
          <motion.div
            key={running ? "running" : "stopped"}
            initial={{ scale: 0.98, backgroundColor: "transparent" }}
            animate={{
              scale: 1,
              backgroundColor: running
                ? "color-mix(in oklab, var(--color-primary) 10%, transparent)"
                : "transparent",
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full rounded-xl"
          >
            <div
              className="select-none text-center font-mono text-6xl sm:text-7xl md:text-8xl py-6"
              onClick={() => (running ? stop() : start())}
            >
              {Number.isNaN(effectiveMs) ? "DNF" : formatTime(effectiveMs)}
            </div>
          </motion.div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => (running ? stop() : start())}>
              {running ? "Stop" : "Start"} (Espace)
            </Button>
            <Button
              variant="outline"
              onClick={() => setPenalty(penalty === "+2" ? "OK" : "+2")}
            >
              +2
            </Button>
            <Button
              variant="outline"
              onClick={() => setPenalty(penalty === "DNF" ? "OK" : "DNF")}
            >
              DNF
            </Button>
            <Button variant="ghost" onClick={reset}>
              Reset
            </Button>
            <Button
              variant="primary"
              onClick={saveSolve}
              disabled={elapsedMs <= 0 && penalty === "OK"}
            >
              Enregistrer
            </Button>
          </div>

          {/* Visualisation du cube mélangé */}
          <div className="w-full">
            <label className="text-sm text-muted-foreground mb-2 block">
              Visualisation
            </label>
            <div className="h-64 bg-muted/30 rounded-lg border">
              <CubeViewer
                key={`${scramble}-${viewerKey}`} // Forcer le re-render avec la key
                puzzleType={selectedPuzzle}
                scramble={scramble}
                onReset={() => {}}
                showControls={false}
              />
            </div>
          </div>

          <div className="w-full">
            <label className="text-sm text-muted-foreground">Notes</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optionnel"
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>

          {solves.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun solve pour l'instant.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
