"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer, Trophy, Users, Clock, Target, Zap } from "lucide-react";
import { generate333Scramble } from "@/app/(pages)/timer/_utils/scramble";
import { formatTime } from "@/lib/time";

interface ChallengeAttempt {
  id: string;
  time: number;
  penalty: "none" | "plus2" | "dnf";
  timestamp: Date;
}

interface LeaderboardEntry {
  username: string;
  bestTime: number;
  attempts: number;
  rank: number;
}

export default function ChallengePage() {
  const [scramble, setScramble] = useState("");
  const [attempts, setAttempts] = useState<ChallengeAttempt[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isInspection, setIsInspection] = useState(false);
  const [inspectionTime, setInspectionTime] = useState(15);
  const [challengeEndTime] = useState(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999); // Fin de la journée
    return now;
  });

  // Mock leaderboard data
  const [leaderboard] = useState<LeaderboardEntry[]>([
    { username: "thomas", bestTime: 12500, attempts: 3, rank: 1 },
    { username: "alice", bestTime: 13400, attempts: 3, rank: 2 },
    { username: "bob", bestTime: 14200, attempts: 3, rank: 3 },
    { username: "charlie", bestTime: 15800, attempts: 2, rank: 4 },
    { username: "diana", bestTime: 16700, attempts: 3, rank: 5 },
  ]);

  // Générer le scramble du jour (même pour tous les utilisateurs)
  useEffect(() => {
    const today = new Date().toDateString();
    const seed = today.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    setScramble(generate333Scramble(25));
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev + 10);
      }, 10);
    }

    if (isInspection) {
      interval = setInterval(() => {
        setInspectionTime((prev) => {
          if (prev <= 1) {
            setIsInspection(false);
            setIsRunning(true);
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isInspection]);

  const startTimer = () => {
    if (attempts.length >= 3) return;
    setIsInspection(true);
    setInspectionTime(15);
  };

  const stopTimer = () => {
    if (!isRunning) return;
    setIsRunning(false);

    const newAttempt: ChallengeAttempt = {
      id: Date.now().toString(),
      time: currentTime,
      penalty: "none",
      timestamp: new Date(),
    };

    setAttempts([...attempts, newAttempt]);
    setCurrentTime(0);
  };

  const getBestTime = () => {
    if (attempts.length === 0) return null;
    const validAttempts = attempts.filter((a) => a.penalty !== "dnf");
    if (validAttempts.length === 0) return null;
    return Math.min(...validAttempts.map((a) => a.time));
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const diff = challengeEndTime.getTime() - now.getTime();
    if (diff <= 0) return "Terminé";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const canAttempt = attempts.length < 3 && new Date() < challengeEndTime;

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-foreground">Défi du jour</h1>
          </div>
          <p className="text-muted-foreground text-lg mb-4">
            3 tentatives. 24h. Montre ce que tu vaux.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getTimeRemaining()}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {attempts.length}/3 tentatives
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timer Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Scramble */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Scramble du jour</h3>
                  <div className="bg-muted p-4 rounded-lg font-mono text-lg text-center">
                    {scramble}
                  </div>
                </div>

                {/* Timer Display */}
                <div className="text-center">
                  {isInspection ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-mono text-orange-500">
                        {inspectionTime}s
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Inspection en cours...
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-4xl font-mono font-bold">
                        {formatTime(currentTime)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isRunning ? "En cours..." : "Prêt"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                  {!isRunning && !isInspection && canAttempt ? (
                    <Button onClick={startTimer} className="flex-1" size="lg">
                      <Zap className="h-4 w-4 mr-2" />
                      Commencer
                    </Button>
                  ) : isRunning ? (
                    <Button
                      onClick={stopTimer}
                      variant="destructive"
                      className="flex-1"
                      size="lg"
                    >
                      Arrêter
                    </Button>
                  ) : (
                    <Button disabled className="flex-1" size="lg">
                      {attempts.length >= 3
                        ? "Tentatives épuisées"
                        : "Défi terminé"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Attempts */}
            <Card>
              <CardHeader>
                <CardTitle>Mes tentatives</CardTitle>
              </CardHeader>
              <CardContent>
                {attempts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Aucune tentative pour l'instant
                  </p>
                ) : (
                  <div className="space-y-2">
                    {attempts.map((attempt, index) => (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between p-2 bg-muted/30 rounded"
                      >
                        <span className="font-mono">
                          {formatTime(attempt.time)}
                        </span>
                        <Badge variant="outline">Tentative {index + 1}</Badge>
                      </div>
                    ))}
                  </div>
                )}
                {getBestTime() && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded">
                    <div className="text-sm text-green-600 font-medium">
                      Meilleur temps
                    </div>
                    <div className="text-xl font-mono font-bold text-green-600">
                      {formatTime(getBestTime()!)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Classement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.username}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0
                          ? "bg-yellow-500/10 border border-yellow-500/20"
                          : index === 1
                          ? "bg-gray-400/10 border border-gray-400/20"
                          : index === 2
                          ? "bg-orange-500/10 border border-orange-500/20"
                          : "bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0
                              ? "bg-yellow-500 text-white"
                              : index === 1
                              ? "bg-gray-400 text-white"
                              : index === 2
                              ? "bg-orange-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {entry.rank}
                        </div>
                        <div>
                          <div className="font-medium">{entry.username}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.attempts} tentatives
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">
                          {formatTime(entry.bestTime)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
