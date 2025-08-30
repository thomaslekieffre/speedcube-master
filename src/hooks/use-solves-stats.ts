"use client";

import { useEffect, useMemo } from "react";
import { useSupabaseSolves } from "./use-supabase-solves";
import { usePersonalBests } from "./use-personal-bests";
import type { Database } from "@/types/database";

type Solve = Database["public"]["Tables"]["solves"]["Row"];

interface SolveStats {
  total: number;
  pb: number | null;
  average5: number | null;
  average12: number | null;
  average50: number | null;
  average100: number | null;
  dnfCount: number;
  dnfRate: number;
  plus2Count: number;
  plus2Rate: number;
}

export function useSolvesStats(puzzleType: string, sessionId?: string | null) {
  const { solves, refresh } = useSupabaseSolves(undefined, sessionId);
  const { getPersonalBest } = usePersonalBests();

  // Écouter les événements de mise à jour des solves
  useEffect(() => {
    const handleSolvesUpdated = () => {
      console.log("📥 Événement solves-updated reçu dans useSolvesStats");
      // Délai court pour éviter les recalculs multiples
      setTimeout(() => refresh(), 100);
    };

    window.addEventListener("solves-updated", handleSolvesUpdated);
    return () =>
      window.removeEventListener("solves-updated", handleSolvesUpdated);
  }, [refresh]);

  // Filtrer les solves par puzzle type et les trier par date (plus récent en premier)
  const puzzleSolves = useMemo(() => {
    return solves
      .filter((solve) => solve.puzzle_type === puzzleType)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [solves, puzzleType]);

  // Calculer les stats en temps réel
  const stats = useMemo((): SolveStats => {
    console.log(
      `📊 Calcul des stats pour ${
        puzzleSolves.length
      } solves (puzzle: ${puzzleType}, sessionId: ${sessionId || "toutes"})`
    );

    const validSolves = puzzleSolves.filter((solve) => solve.penalty !== "dnf");
    const dnfSolves = puzzleSolves.filter((solve) => solve.penalty === "dnf");
    const plus2Solves = puzzleSolves.filter(
      (solve) => solve.penalty === "plus2"
    );

    // Calculer les temps effectifs (avec pénalités)
    const effectiveTimes = validSolves.map((solve) => ({
      solve,
      effectiveTime: solve.penalty === "plus2" ? solve.time + 2000 : solve.time,
    }));

    // PB
    const pb =
      effectiveTimes.length > 0
        ? Math.min(...effectiveTimes.map((t) => t.effectiveTime))
        : null;

    // Moyennes WCA (exclure le meilleur et le pire temps)
    const calculateAverage = (count: number) => {
      if (validSolves.length < count) return null;
      // Prendre les N derniers temps (les plus récents)
      const recentSolves = validSolves.slice(0, count);

      // Calculer les temps effectifs avec pénalités
      const timesWithPenalties = recentSolves.map((solve) => ({
        solve,
        effectiveTime:
          solve.penalty === "plus2" ? solve.time + 2000 : solve.time,
      }));

      // Trier par temps effectif
      timesWithPenalties.sort((a, b) => a.effectiveTime - b.effectiveTime);

      // Exclure le meilleur et le pire temps
      const timesForAverage = timesWithPenalties.slice(1, -1);

      // Calculer la moyenne des temps restants
      const totalTime = timesForAverage.reduce(
        (sum, item) => sum + item.effectiveTime,
        0
      );
      return totalTime / timesForAverage.length;
    };

    return {
      total: puzzleSolves.length,
      pb,
      average5: calculateAverage(5),
      average12: calculateAverage(12),
      average50: calculateAverage(50),
      average100: calculateAverage(100),
      dnfCount: dnfSolves.length,
      dnfRate:
        puzzleSolves.length > 0
          ? (dnfSolves.length / puzzleSolves.length) * 100
          : 0,
      plus2Count: plus2Solves.length,
      plus2Rate:
        puzzleSolves.length > 0
          ? (plus2Solves.length / puzzleSolves.length) * 100
          : 0,
    };
  }, [puzzleSolves]);

  return {
    stats,
    solves: puzzleSolves,
    loading: false, // Les stats sont calculées en temps réel
  };
}
