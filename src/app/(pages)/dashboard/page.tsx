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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

    // Calculer les tendances
    const recentTimes = validTimes.slice(-10);
    const olderTimes = validTimes.slice(-20, -10);
    const recentAvg =
      recentTimes.length > 0
        ? recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length
        : 0;
    const olderAvg =
      olderTimes.length > 0
        ? olderTimes.reduce((a, b) => a + b, 0) / olderTimes.length
        : 0;
    const trend =
      recentAvg < olderAvg
        ? "improving"
        : recentAvg > olderAvg
        ? "declining"
        : "stable";

    // Calculer la consistance (écart-type)
    const mean = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
    const variance =
      validTimes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      validTimes.length;
    const stdDev = Math.sqrt(variance);

    return {
      pb,
      avg5,
      avg12,
      avg50,
      avg100,
      dnfRate,
      plus2Rate,
      totalSolves: puzzleSolves.length,
      validSolves: validTimes.length,
      trend,
      stdDev,
      mean,
      recentAvg,
      olderAvg,
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

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Suivez votre progression et analysez vos performances
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-4 items-center"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Période:</span>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
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
              <SelectTrigger className="w-48">
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

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Personal Best */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Personal Best
              </CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.pb ? formatTime(stats.pb) : "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalSolves || 0} solves au total
              </p>
            </CardContent>
          </Card>

          {/* Average of 5 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Moyenne de 5
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.avg5 ? formatTime(stats.avg5) : "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                {(stats?.validSolves || 0) >= 5
                  ? "Derniers 5 temps"
                  : "Pas assez de temps"}
              </p>
            </CardContent>
          </Card>

          {/* Average of 12 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Moyenne de 12
              </CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.avg12 ? formatTime(stats.avg12) : "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                {(stats?.validSolves || 0) >= 12
                  ? "Derniers 12 temps"
                  : "Pas assez de temps"}
              </p>
            </CardContent>
          </Card>

          {/* DNF Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de DNF</CardTitle>
              <Zap className="h-4 w-4 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.dnfRate ? `${stats.dnfRate.toFixed(1)}%` : "0%"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalSolves || 0} solves, {stats?.validSolves || 0}{" "}
                valides
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {/* Average Time */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps moyen</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.mean ? formatTime(stats.mean) : "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                Moyenne de tous les temps valides
              </p>
            </CardContent>
          </Card>

          {/* Consistency */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consistance</CardTitle>
              <Activity className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.stdDev ? formatTime(stats.stdDev) : "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                Écart-type (plus bas = plus consistant)
              </p>
            </CardContent>
          </Card>

          {/* +2 Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de +2</CardTitle>
              <Award className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.plus2Rate ? `${stats.plus2Rate.toFixed(1)}%` : "0%"}
              </div>
              <p className="text-xs text-muted-foreground">
                Pénalités +2 sur tous les solves
              </p>
            </CardContent>
          </Card>

          {/* Average of 50 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Moyenne de 50
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.avg50 ? formatTime(stats.avg50) : "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                {(stats?.validSolves || 0) >= 50
                  ? "Derniers 50 temps"
                  : "Pas assez de temps"}
              </p>
            </CardContent>
          </Card>

          {/* Average of 100 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Moyenne de 100
              </CardTitle>
              <Trophy className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.avg100 ? formatTime(stats.avg100) : "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                {(stats?.validSolves || 0) >= 100
                  ? "Derniers 100 temps"
                  : "Pas assez de temps"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Recent Solves Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progression récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {puzzleSolves.length > 0 ? (
                <div className="h-64 flex items-end justify-between gap-1">
                  {puzzleSolves.slice(-20).map((solve, index) => {
                    const height =
                      solve.penalty === "dnf"
                        ? 0
                        : Math.max(10, (solve.time / 60000) * 200); // Max 1 minute = 200px
                    return (
                      <div
                        key={solve.id}
                        className={`flex-1 rounded-t transition-all duration-300 ${
                          solve.penalty === "dnf"
                            ? "bg-red-500"
                            : solve.penalty === "plus2"
                            ? "bg-yellow-500"
                            : "bg-primary"
                        }`}
                        style={{ height: `${height}px` }}
                        title={`${formatTime(solve.time)} - ${new Date(
                          solve.created_at
                        ).toLocaleDateString()}`}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Aucun solve pour ce puzzle
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Distribution des temps
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats && stats.validSolves > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Plus rapide: {formatTime(stats.pb)}</span>
                    <span>
                      Plus lent:{" "}
                      {formatTime(Math.max(...puzzleSolves.map((s) => s.time)))}
                    </span>
                  </div>
                  <div className="h-48 bg-muted rounded-lg p-4">
                    {/* Histogramme simple */}
                    <div className="h-full flex items-end justify-between gap-1">
                      {Array.from({ length: 10 }, (_, i) => {
                        const min = stats.pb;
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
                        const height = (count / (stats.validSolves || 1)) * 100;

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
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Pas assez de données pour l'histogramme
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Solves List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Derniers solves
              </CardTitle>
            </CardHeader>
            <CardContent>
              {puzzleSolves.length > 0 ? (
                <div className="space-y-2">
                  {puzzleSolves
                    .slice(-10)
                    .reverse()
                    .map((solve) => (
                      <div
                        key={solve.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-lg">
                            {formatTime(solve.time)}
                          </span>
                          {solve.penalty && solve.penalty !== "none" && (
                            <Badge
                              variant={
                                solve.penalty === "dnf"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {solve.penalty === "dnf"
                                ? "DNF"
                                : solve.penalty === "plus2"
                                ? "+2"
                                : solve.penalty}
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
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
  );
}
