"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Brain,
  Star,
  ArrowRight,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Eye,
  EyeOff,
} from "lucide-react";
import { useSupabaseSolves } from "@/hooks/use-supabase-solves";
import { usePersonalBests } from "@/hooks/use-personal-bests";
import { useLearningSystem } from "@/hooks/use-learning-system";
import { formatTime } from "@/lib/time";
import { PUZZLES } from "@/components/puzzle-selector";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

export default function Dashboard() {
  const [selectedPuzzle, setSelectedPuzzle] = useState("333");
  const [timeRange, setTimeRange] = useState("month"); // all, week, month, year
  const [showLearningStats, setShowLearningStats] = useState(true);
  const { solves, loading } = useSupabaseSolves();
  const { personalBests } = usePersonalBests();
  const { getLearningStats, getTodayReviewList } = useLearningSystem();

  // Données d'apprentissage
  const learningStats = getLearningStats();
  const todayReviewList = getTodayReviewList();

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

  // Objectifs par puzzle (en millisecondes)
  const getPuzzleGoals = (puzzleType: string) => {
    const goals = {
      "222": {
        sub5: 5000,
        sub4: 4000,
        sub3: 3000,
        ranges: [
          { min: 0, max: 3, label: "0-3s", color: "#22c55e" },
          { min: 3, max: 5, label: "3-5s", color: "#3b82f6" },
          { min: 5, max: 8, label: "5-8s", color: "#f59e0b" },
          { min: 8, max: 12, label: "8-12s", color: "#ef4444" },
          { min: 12, max: 999, label: "12s+", color: "#8b5cf6" },
        ],
      },
      "333": {
        sub20: 20000,
        sub15: 15000,
        sub12: 12000,
        ranges: [
          { min: 0, max: 12, label: "0-12s", color: "#22c55e" },
          { min: 12, max: 20, label: "12-20s", color: "#3b82f6" },
          { min: 20, max: 30, label: "20-30s", color: "#f59e0b" },
          { min: 30, max: 45, label: "30-45s", color: "#ef4444" },
          { min: 45, max: 999, label: "45s+", color: "#8b5cf6" },
        ],
      },
      "444": {
        sub60: 60000,
        sub45: 45000,
        sub35: 35000,
        ranges: [
          { min: 0, max: 35, label: "0-35s", color: "#22c55e" },
          { min: 35, max: 60, label: "35-60s", color: "#3b82f6" },
          { min: 60, max: 90, label: "60-90s", color: "#f59e0b" },
          { min: 90, max: 120, label: "90-120s", color: "#ef4444" },
          { min: 120, max: 999, label: "120s+", color: "#8b5cf6" },
        ],
      },
      "555": {
        sub120: 120000,
        sub90: 90000,
        sub70: 70000,
        ranges: [
          { min: 0, max: 70, label: "0-70s", color: "#22c55e" },
          { min: 70, max: 120, label: "70-120s", color: "#3b82f6" },
          { min: 120, max: 180, label: "120-180s", color: "#f59e0b" },
          { min: 180, max: 240, label: "180-240s", color: "#ef4444" },
          { min: 240, max: 999, label: "240s+", color: "#8b5cf6" },
        ],
      },
      "666": {
        sub180: 180000,
        sub150: 150000,
        sub120: 120000,
        ranges: [
          { min: 0, max: 120, label: "0-120s", color: "#22c55e" },
          { min: 120, max: 180, label: "120-180s", color: "#3b82f6" },
          { min: 180, max: 240, label: "180-240s", color: "#f59e0b" },
          { min: 240, max: 300, label: "240-300s", color: "#ef4444" },
          { min: 300, max: 999, label: "300s+", color: "#8b5cf6" },
        ],
      },
      "777": {
        sub240: 240000,
        sub200: 200000,
        sub160: 160000,
        ranges: [
          { min: 0, max: 160, label: "0-160s", color: "#22c55e" },
          { min: 160, max: 240, label: "160-240s", color: "#3b82f6" },
          { min: 240, max: 300, label: "240-300s", color: "#f59e0b" },
          { min: 300, max: 360, label: "300-360s", color: "#ef4444" },
          { min: 360, max: 999, label: "360s+", color: "#8b5cf6" },
        ],
      },
      skewb: {
        sub8: 8000,
        sub6: 6000,
        sub4: 4000,
        ranges: [
          { min: 0, max: 4, label: "0-4s", color: "#22c55e" },
          { min: 4, max: 8, label: "4-8s", color: "#3b82f6" },
          { min: 8, max: 12, label: "8-12s", color: "#f59e0b" },
          { min: 12, max: 18, label: "12-18s", color: "#ef4444" },
          { min: 18, max: 999, label: "18s+", color: "#8b5cf6" },
        ],
      },
      pyram: {
        sub8: 8000,
        sub6: 6000,
        sub4: 4000,
        ranges: [
          { min: 0, max: 4, label: "0-4s", color: "#22c55e" },
          { min: 4, max: 8, label: "4-8s", color: "#3b82f6" },
          { min: 8, max: 12, label: "8-12s", color: "#f59e0b" },
          { min: 12, max: 18, label: "12-18s", color: "#ef4444" },
          { min: 18, max: 999, label: "18s+", color: "#8b5cf6" },
        ],
      },
      sq1: {
        sub20: 20000,
        sub15: 15000,
        sub12: 12000,
        ranges: [
          { min: 0, max: 12, label: "0-12s", color: "#22c55e" },
          { min: 12, max: 20, label: "12-20s", color: "#3b82f6" },
          { min: 20, max: 30, label: "20-30s", color: "#f59e0b" },
          { min: 30, max: 45, label: "30-45s", color: "#ef4444" },
          { min: 45, max: 999, label: "45s+", color: "#8b5cf6" },
        ],
      },
      clock: {
        sub8: 8000,
        sub6: 6000,
        sub4: 4000,
        ranges: [
          { min: 0, max: 4, label: "0-4s", color: "#22c55e" },
          { min: 4, max: 8, label: "4-8s", color: "#3b82f6" },
          { min: 8, max: 12, label: "8-12s", color: "#f59e0b" },
          { min: 12, max: 18, label: "12-18s", color: "#ef4444" },
          { min: 18, max: 999, label: "18s+", color: "#8b5cf6" },
        ],
      },
      minx: {
        sub120: 120000,
        sub90: 90000,
        sub70: 70000,
        ranges: [
          { min: 0, max: 70, label: "0-70s", color: "#22c55e" },
          { min: 70, max: 120, label: "70-120s", color: "#3b82f6" },
          { min: 120, max: 180, label: "120-180s", color: "#f59e0b" },
          { min: 180, max: 240, label: "180-240s", color: "#ef4444" },
          { min: 240, max: 999, label: "240s+", color: "#8b5cf6" },
        ],
      },
    };

    return goals[puzzleType as keyof typeof goals] || goals["333"];
  };

  // Calculer les statistiques avancées
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
    let trendPercentage = 0;
    if (recentSolves.length >= 5 && olderSolves.length >= 5) {
      const recentAvg =
        recentSolves.reduce((a, b) => a + b, 0) / recentSolves.length;
      const olderAvg =
        olderSolves.reduce((a, b) => a + b, 0) / olderSolves.length;
      trendPercentage = ((olderAvg - recentAvg) / olderAvg) * 100;

      if (trendPercentage > 5) trend = "improving";
      else if (trendPercentage < -5) trend = "declining";
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
      trendPercentage,
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
      currentAvg:
        validTimes.slice(-12).reduce((a, b) => a + b, 0) /
        Math.min(12, validTimes.length),
    };
  };

  const stats = calculateStats();

  // Préparer les données pour les graphiques
  const chartData = useMemo((): {
    progressionData: Array<{
      solve: number;
      time: number | null;
      penalty: string;
      date: string;
    }>;
    histogramData: Array<{
      range: string;
      count: number;
      color: string;
    }>;
  } => {
    if (!stats || puzzleSolves.length === 0) {
      return {
        progressionData: [],
        histogramData: [],
      };
    }

    // Données pour le graphique de progression
    const progressionData = puzzleSolves
      .slice(-30) // Derniers 30 solves
      .map((solve, index) => ({
        solve: index + 1,
        time: solve.penalty === "dnf" ? null : solve.time / 1000,
        penalty: solve.penalty,
        date: new Date(solve.created_at).toLocaleDateString(),
      }));

    // Données pour l'histogramme
    const puzzleGoals = getPuzzleGoals(selectedPuzzle);
    const histogramData = puzzleGoals.ranges.map((range: any) => {
      const count = puzzleSolves.filter((solve) => {
        const timeInSeconds = solve.time / 1000;
        return (
          timeInSeconds >= range.min &&
          timeInSeconds < range.max &&
          solve.penalty !== "dnf"
        );
      }).length;
      return {
        range: range.label,
        count,
        color: range.color,
      };
    });

    return { progressionData, histogramData };
  }, [puzzleSolves, stats, selectedPuzzle]);



  const getPuzzleName = (type: string) => {
    return PUZZLES.find((p) => p.id === type)?.name || type;
  };

  // Calculer les objectifs
  const calculateGoals = () => {
    if (!stats) return null;

    const puzzleGoals = getPuzzleGoals(selectedPuzzle);
    const currentAvg = stats.currentAvg;

    // Calculer la progression pour chaque objectif
    const goalProgress = Object.entries(puzzleGoals).reduce(
      (acc, [key, value]) => {
        if (key === "ranges") return acc;

        const goalTime = value as number;
        const progress =
          currentAvg <= goalTime
            ? 100
            : Math.max(
                0,
                ((goalTime * 1.5 - currentAvg) / (goalTime * 0.5)) * 100
              );

        return { ...acc, [key]: { time: goalTime, progress } };
      },
      {} as Record<string, { time: number; progress: number }>
    );

    return { puzzleGoals, goalProgress };
  };

  const goals = calculateGoals();

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-500";
      case "declining":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
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
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Dashboard Avancé
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Analysez vos performances et suivez votre progression
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 items-start sm:items-center">
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLearningStats(!showLearningStats)}
              className="flex items-center gap-2"
            >
              {showLearningStats ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showLearningStats ? "Masquer" : "Afficher"} l'apprentissage
            </Button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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

              {/* Tendance */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Tendance
                  </CardTitle>
                  {stats.trend === "improving" ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  ) : stats.trend === "declining" ? (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                  ) : (
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-lg sm:text-xl lg:text-2xl font-bold ${getTrendColor(
                      stats.trend
                    )}`}
                  >
                    {stats.trendPercentage > 0 ? "+" : ""}
                    {stats.trendPercentage.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.trend === "improving"
                      ? "Amélioration"
                      : stats.trend === "declining"
                      ? "Déclin"
                      : "Stable"}
                  </p>
                </CardContent>
              </Card>

              {/* DNF Rate */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Taux DNF
                  </CardTitle>
                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-500">
                    {stats.dnfRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.dnfCount} DNF sur {stats.totalSolves}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Learning Stats Section */}
          {showLearningStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Algorithmes Maîtrisés
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {learningStats.mastered}
                  </div>
                  <Progress
                    value={learningStats.masteryPercentage}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {learningStats.masteryPercentage}% de maîtrise
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    En Apprentissage
                  </CardTitle>
                  <Brain className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">
                    {learningStats.learning}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Algorithmes en cours
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Révisions Aujourd'hui
                  </CardTitle>
                  <Target className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">
                    {todayReviewList.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Algorithmes à réviser
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    À Apprendre
                  </CardTitle>
                  <Plus className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-500">
                    {learningStats.toLearn}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nouveaux algorithmes
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progression Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progression des 30 derniers solves
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.progressionData &&
                chartData.progressionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.progressionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="solve" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) =>
                          value ? `${value}s` : "DNF"
                        }
                        labelFormatter={(label) => `Solve ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="time"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    Pas assez de données pour le graphique
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribution des temps
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.histogramData &&
                chartData.histogramData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.histogramData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    Pas assez de données pour l'histogramme
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Goals Section */}
          {stats && goals && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Objectifs {getPuzzleName(selectedPuzzle)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(goals.goalProgress).map(
                    ([goalKey, goalData]) => {
                      const goalName = goalKey.replace("sub", "Sub-");
                      const goalTime = formatTime(goalData.time);

                      return (
                        <div key={goalKey}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              {goalName}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {goalData.progress.toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={goalData.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Objectif: {goalTime} • Actuel:{" "}
                            {formatTime(stats.currentAvg)}
                          </p>
                        </div>
                      );
                    }
                  )}
                </CardContent>
              </Card>

              {/* Recent Solves */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Derniers solves
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {puzzleSolves.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
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
            </div>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Recommandations Personnalisées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats && stats.dnfRate > 10 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-700 dark:text-red-300">
                        Réduire les DNF
                      </h4>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Votre taux de DNF est élevé ({stats.dnfRate.toFixed(1)}
                        %). Concentrez-vous sur la précision plutôt que la
                        vitesse.
                      </p>
                    </div>
                  </div>
                )}

                {stats && stats.trend === "declining" && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                    <TrendingDown className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-700 dark:text-yellow-300">
                        Progression en baisse
                      </h4>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Vos temps récents sont plus lents. Revenez aux bases et
                        pratiquez lentement.
                      </p>
                    </div>
                  </div>
                )}

                {todayReviewList.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-700 dark:text-blue-300">
                        Révisions disponibles
                      </h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Vous avez {todayReviewList.length} algorithmes à réviser
                        aujourd'hui.
                      </p>
                      <Button size="sm" className="mt-2" asChild>
                        <a href="/learning/review">
                          Commencer les révisions
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {stats &&
                  (() => {
                    const puzzleGoals = getPuzzleGoals(selectedPuzzle);
                    const firstGoal = Object.keys(puzzleGoals).find(
                      (key) => key !== "ranges"
                    );
                    return (
                      firstGoal &&
                      stats.currentAvg > (puzzleGoals as any)[firstGoal]
                    );
                  })() && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <Target className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-700 dark:text-green-300">
                          Objectif{" "}
                          {Object.keys(
                            getPuzzleGoals(selectedPuzzle)
                          )[0]?.replace("sub", "Sub-")}
                        </h4>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Vous êtes proche de votre premier objectif !
                          Concentrez-vous sur l'efficacité des mouvements.
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
