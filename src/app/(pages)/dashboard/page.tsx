"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Timer,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Clock,
  Zap,
  Calendar,
  Award,
  Activity,
  Users,
  Trophy,
} from "lucide-react";
import { useSupabaseSolves } from "@/hooks/use-supabase-solves";
import { usePersonalBests } from "@/hooks/use-personal-bests";
import { PUZZLES } from "@/components/puzzle-selector";

export default function Dashboard() {
  const [selectedPuzzle, setSelectedPuzzle] = useState("333");
  const [timeRange, setTimeRange] = useState("all"); // all, week, month, year
  const { solves, loading } = useSupabaseSolves();
  const { personalBests } = usePersonalBests();

  // Filtrer les solves par puzzle et période
  const filteredSolves = useMemo(() => {
    let filtered = solves.filter(
      (solve) => solve.puzzle_type === selectedPuzzle
    );

    if (timeRange !== "all") {
      const now = new Date();
      const cutoff = new Date();

      switch (timeRange) {
        case "week":
          cutoff.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case "year":
          cutoff.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(
        (solve) => new Date(solve.created_at) >= cutoff
      );
    }

    return filtered;
  }, [solves, selectedPuzzle, timeRange]);

  const puzzleSolves = filteredSolves;
  const puzzlePB = personalBests.find(
    (pb) => pb.puzzle_type === selectedPuzzle
  );

  // Calculer les statistiques
  const calculateStats = () => {
    if (puzzleSolves.length === 0) return null;

    const times = puzzleSolves.map((s) => s.time);
    const validTimes = times.filter((t) => t > 0);

    if (validTimes.length === 0) return null;

    const sorted = validTimes.sort((a, b) => a - b);
    const pb = sorted[0];
    const avg5 =
      validTimes.length >= 5
        ? validTimes.slice(-5).reduce((a, b) => a + b, 0) / 5
        : null;
    const avg12 =
      validTimes.length >= 12
        ? validTimes.slice(-12).reduce((a, b) => a + b, 0) / 12
        : null;
    const avg50 =
      validTimes.length >= 50
        ? validTimes.slice(-50).reduce((a, b) => a + b, 0) / 50
        : null;
    const avg100 =
      validTimes.length >= 100
        ? validTimes.slice(-100).reduce((a, b) => a + b, 0) / 100
        : null;

    const dnfCount = puzzleSolves.filter((s) => s.penalty === "dnf").length;
    const plus2Count = puzzleSolves.filter((s) => s.penalty === "plus2").length;
    const dnfRate = (dnfCount / puzzleSolves.length) * 100;
    const plus2Rate = (plus2Count / puzzleSolves.length) * 100;

    // Calculer la tendance (amélioration/déclin)
    const recentSolves = validTimes.slice(-10);
    const olderSolves = validTimes.slice(-20, -10);

    let trend = "stable";
    if (recentSolves.length >= 5 && olderSolves.length >= 5) {
      const recentAvg =
        recentSolves.reduce((a, b) => a + b, 0) / recentSolves.length;
      const olderAvg =
        olderSolves.reduce((a, b) => a + b, 0) / olderSolves.length;
      const improvement = ((olderAvg - recentAvg) / olderAvg) * 100;

      if (improvement > 5) trend = "improving";
      else if (improvement < -5) trend = "declining";
    }

    // Calculer la cohérence (écart-type)
    const mean = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
    const variance =
      validTimes.reduce((acc, time) => acc + Math.pow(time - mean, 2), 0) /
      validTimes.length;
    const stdDev = Math.sqrt(variance);

    return {
      pb,
      avg5,
      avg12,
      avg50,
      avg100,
      dnfCount,
      plus2Count,
      dnfRate,
      plus2Rate,
      trend,
      stdDev,
      mean,
      recentAvg:
        recentSolves.length > 0
          ? recentSolves.reduce((a, b) => a + b, 0) / recentSolves.length
          : null,
      olderAvg:
        olderSolves.length > 0
          ? olderSolves.reduce((a, b) => a + b, 0) / olderSolves.length
          : null,
      totalSolves: puzzleSolves.length,
      validSolves: validTimes.length,
    };
  };

  const stats = calculateStats();

  const formatTime = (ms: number) => {
    if (ms === 0) return "DNF";
    const seconds = ms / 1000;
    if (seconds < 60) {
      return seconds.toFixed(2);
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes}:${remainingSeconds.padStart(5, "0")}`;
  };

  const getPuzzleName = (type: string) => {
    return PUZZLES.find((p) => p.id === type)?.name || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Header - Responsive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Suivez votre progression et analysez vos performances
            </p>
          </motion.div>

          {/* Filters - Responsive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 items-start sm:items-center"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Période:</span>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-28 sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tout</SelectItem>
                  <SelectItem value="week">7 jours</SelectItem>
                  <SelectItem value="month">30 jours</SelectItem>
                  <SelectItem value="year">1 an</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Puzzle:</span>
              <Select value={selectedPuzzle} onValueChange={setSelectedPuzzle}>
                <SelectTrigger className="w-40 sm:w-48">
                  <SelectValue placeholder="Sélectionner un puzzle" />
                </SelectTrigger>
                <SelectContent>
                  {PUZZLES.map((puzzle) => (
                    <SelectItem key={puzzle.id} value={puzzle.id}>
                      {puzzle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {stats && (
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tendance:</span>
                <Badge
                  variant={
                    stats.trend === "improving"
                      ? "default"
                      : stats.trend === "declining"
                      ? "destructive"
                      : "secondary"
                  }
                  className="flex items-center gap-1"
                >
                  {stats.trend === "improving" ? (
                    <>
                      <TrendingUp className="h-3 w-3" />
                      Amélioration
                    </>
                  ) : stats.trend === "declining" ? (
                    <>
                      <TrendingDown className="h-3 w-3" />
                      Déclin
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-3 w-3" />
                      Stable
                    </>
                  )}
                </Badge>
              </div>
            )}
          </motion.div>

          {/* Stats Cards - Responsive */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
            >
              {/* Personal Best */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Personal Best
                  </CardTitle>
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {stats.pb ? formatTime(stats.pb) : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalSolves} solves au total
                  </p>
                </CardContent>
              </Card>

              {/* Average of 5 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Moyenne de 5
                  </CardTitle>
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {stats.avg5 ? formatTime(stats.avg5) : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.validSolves >= 5
                      ? "Derniers 5 temps"
                      : "Pas assez de temps"}
                  </p>
                </CardContent>
              </Card>

              {/* Average of 12 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Moyenne de 12
                  </CardTitle>
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {stats.avg12 ? formatTime(stats.avg12) : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.validSolves >= 12
                      ? "Derniers 12 temps"
                      : "Pas assez de temps"}
                  </p>
                </CardContent>
              </Card>

              {/* Average of 50 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Moyenne de 50
                  </CardTitle>
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {stats.avg50 ? formatTime(stats.avg50) : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.validSolves >= 50
                      ? "Derniers 50 temps"
                      : "Pas assez de temps"}
                  </p>
                </CardContent>
              </Card>

              {/* Average of 100 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Moyenne de 100
                  </CardTitle>
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {stats.avg100 ? formatTime(stats.avg100) : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.validSolves >= 100
                      ? "Derniers 100 temps"
                      : "Pas assez de temps"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Charts Section - Responsive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          >
            {/* Time Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Distribution des temps
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats && stats.validSolves > 0 ? (
                  <div className="space-y-4">
                    <div className="h-48 flex items-end gap-1">
                      {Array.from({ length: 10 }, (_, i) => {
                        const min = Math.min(
                          ...puzzleSolves.map((s) => s.time)
                        );
                        const max = Math.max(
                          ...puzzleSolves.map((s) => s.time)
                        );
                        const range = max - min;
                        const bucketMin = min + (range / 10) * i;
                        const bucketMax = min + (range / 10) * (i + 1);
                        const count = puzzleSolves.filter(
                          (s) =>
                            s.time >= bucketMin &&
                            s.time < bucketMax &&
                            s.penalty !== "dnf"
                        ).length;
                        const height = (count / stats.validSolves) * 100;

                        return (
                          <div
                            key={i}
                            className="flex-1 bg-primary rounded-t"
                            style={{ height: `${height}%` }}
                            title={`${count} temps entre ${formatTime(
                              bucketMin
                            )} et ${formatTime(bucketMax)}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    Pas assez de données pour l'histogramme
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Solves List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Timer className="h-4 w-4 sm:h-5 sm:w-5" />
                  Derniers solves
                </CardTitle>
              </CardHeader>
              <CardContent>
                {puzzleSolves.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {puzzleSolves
                      .slice(-10)
                      .reverse()
                      .map((solve) => (
                        <div
                          key={solve.id}
                          className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="font-mono text-sm sm:text-lg">
                              {formatTime(solve.time)}
                            </span>
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
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(solve.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun solve pour ce puzzle
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
