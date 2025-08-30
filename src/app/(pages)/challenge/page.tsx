"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timer, Trophy, Users, Zap } from "lucide-react";
import { CubeViewer } from "@/components/cube-viewer";
import { ManualTimeInput } from "@/components/manual-time-input";
import { formatTime } from "@/lib/time";
import { useChallenge } from "@/hooks/use-challenge";
import { useDailyScramble } from "@/hooks/use-daily-scramble";
import { getTodayDate, getTimeRemaining } from "@/lib/daily-scramble";
import { toast } from "sonner";

export default function ChallengePage() {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isInspection, setIsInspection] = useState(false);
  const [inspectionTime, setInspectionTime] = useState(15);

  // Utiliser le hook pour les mélanges quotidiens
  const {
    scramble,
    date: challengeDate,
    loading: scrambleLoading,
    error: scrambleError,
    loadDailyScramble,
  } = useDailyScramble();

  // Utiliser le hook pour la gestion des challenges
  const {
    attempts,
    leaderboard,
    stats,
    loading,
    saveAttempt,
    applyPenalty,
    resetAttempts,
    loadLeaderboard,
  } = useChallenge();

  // Timer logic avec performance.now() pour plus de précision
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let startTime: number;

    if (isRunning) {
      startTime = performance.now();
      interval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        setCurrentTime(elapsed);

        // Log chaque seconde pour debug
        if (Math.floor(elapsed / 1000) !== Math.floor((elapsed - 10) / 1000)) {
          console.log("Timer en cours:", Math.floor(elapsed / 1000), "s");
        }
      }, 10);
    }

    if (isInspection) {
      startTime = performance.now();
      interval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const remaining = Math.max(0, 15000 - elapsed);
        const remainingSeconds = Math.ceil(remaining / 1000);

        setInspectionTime(remainingSeconds);

        if (remaining <= 0) {
          setIsInspection(false);
          setCurrentTime(0);
          setIsRunning(true);
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isInspection]);

  // Réinitialiser les tentatives quand la date change
  useEffect(() => {
    const today = getTodayDate();
    if (challengeDate && today !== challengeDate && attempts.length > 0) {
      resetAttempts();
    }
  }, [challengeDate, attempts.length, resetAttempts]);

  // Mettre à jour le temps restant chaque seconde (côté client uniquement)
  useEffect(() => {
    // Initialiser le temps restant côté client
    setTimeRemaining(getTimeRemaining());

    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const startTimer = useCallback(() => {
    if (attempts.length >= 3) return;
    setCurrentTime(0); // Reset le timer avant de commencer
    setIsInspection(true);
    setInspectionTime(15);
  }, [attempts.length]);

  const stopTimer = useCallback(async () => {
    if (!isRunning) return;
    console.log("Arrêt du timer - currentTime:", currentTime); // Debug
    setIsRunning(false);

    // Sauvegarder le temps AVANT de le réinitialiser
    const timeToSave = Math.round(currentTime); // Arrondir à l'entier le plus proche
    console.log("Temps à sauvegarder:", timeToSave); // Debug

    try {
      await saveAttempt(timeToSave, "none");
      // Le classement est automatiquement mis à jour dans saveAttempt

      // Réinitialiser le timer après la sauvegarde
      setCurrentTime(0);

      // Confirmer la sauvegarde
      toast.success(`Temps sauvegardé : ${formatTime(timeToSave)}`);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde du temps");
    }
  }, [isRunning, currentTime, saveAttempt]);

  const handleApplyPenalty = async (
    attemptId: string,
    penalty: "plus2" | "dnf"
  ) => {
    try {
      await applyPenalty(attemptId, penalty);
      // Le classement est automatiquement mis à jour dans applyPenalty
    } catch (error) {
      console.error("Erreur lors de l'application de la pénalité:", error);
    }
  };

  const handleManualTimeSave = async (
    time: number,
    penalty: "none" | "plus2" | "dnf",
    puzzleType: string,
    scramble?: string
  ) => {
    if (attempts.length >= 3) {
      toast.error("Vous avez déjà utilisé vos 3 tentatives pour aujourd'hui");
      return;
    }

    try {
      await saveAttempt(Math.round(time), penalty); // Arrondir à l'entier
      // Le classement est automatiquement mis à jour dans saveAttempt
    } catch (error) {
      console.error("Erreur lors de l'ajout du temps manuel:", error);
    }
  };

  const getBestTime = () => {
    if (attempts.length === 0) return null;
    const validAttempts = attempts.filter((a) => a.penalty !== "dnf");
    if (validAttempts.length === 0) return null;

    const timesWithPenalties = validAttempts.map((a) =>
      a.penalty === "plus2" ? a.time + 2000 : a.time
    );
    return Math.min(...timesWithPenalties);
  };

  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();

        // Empêcher la répétition de touches
        if (event.repeat) return;

        if (!isRunning && !isInspection && attempts.length < 3) {
          startTimer();
        } else if (isInspection) {
          // Lancer le timer directement pendant l'inspection
          setIsInspection(false);
          setCurrentTime(0); // Reset le timer
          setIsRunning(true);
        } else if (isRunning) {
          stopTimer();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRunning, isInspection, attempts.length, startTimer, stopTimer]);

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-foreground">Défi du jour</h1>
          </div>
          <p className="text-muted-foreground text-lg mb-4">
            3 tentatives. 24h. Montre ce que tu vaux.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Badge variant="outline">
              Challenge du{" "}
              {challengeDate
                ? new Date(challengeDate).toLocaleDateString("fr-FR")
                : new Date().toLocaleDateString("fr-FR")}
            </Badge>
            <Badge
              variant="outline"
              className={attempts.length >= 3 ? "text-red-500" : ""}
            >
              {attempts.length}/3 tentatives
            </Badge>
            <Badge variant="outline" className="text-orange-500">
              {timeRemaining.hours}h {timeRemaining.minutes}m{" "}
              {timeRemaining.seconds}s
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Timer Section */}
          <Card className="mb-6 xl:col-span-2">
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
                <div className="bg-muted p-4 rounded-lg font-mono text-lg text-center mb-4">
                  {scrambleLoading ? (
                    <div className="text-muted-foreground">
                      Chargement du scramble...
                    </div>
                  ) : scrambleError ? (
                    <div className="text-red-500">Erreur: {scrambleError}</div>
                  ) : (
                    scramble
                  )}
                </div>

                {/* Visualisation du cube */}
                <div className="h-48 sm:h-56 lg:h-64 bg-muted/30 rounded-lg border overflow-hidden">
                  {scramble && !scrambleLoading && !scrambleError ? (
                    <CubeViewer
                      key={`${challengeDate}-${scramble}`} // Force le re-render quand la date ou le scramble change
                      puzzleType="333"
                      scramble={scramble}
                      onReset={() => {}}
                      showControls={false}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      {scrambleLoading
                        ? "Chargement..."
                        : "Scramble non disponible"}
                    </div>
                  )}
                </div>
              </div>

              {/* Timer Display */}
              <div
                className="text-center cursor-pointer touch-manipulation relative group"
                onClick={() => {
                  if (!isRunning && !isInspection && attempts.length < 3) {
                    startTimer();
                  } else if (isInspection) {
                    setIsInspection(false);
                    setCurrentTime(0);
                    setIsRunning(true);
                  } else if (isRunning) {
                    stopTimer();
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!isRunning && !isInspection && attempts.length < 3) {
                      startTimer();
                    } else if (isInspection) {
                      setIsInspection(false);
                      setCurrentTime(0);
                      setIsRunning(true);
                    } else if (isRunning) {
                      stopTimer();
                    }
                  }
                }}
              >
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
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold">
                      {formatTime(currentTime)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isRunning ? "En cours..." : "Prêt"}
                    </div>
                  </div>
                )}

                {/* Indicateur mobile */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium text-white">
                    {!isRunning && !isInspection && attempts.length < 3
                      ? "Appuie pour commencer"
                      : isInspection
                      ? "Appuie pour lancer maintenant"
                      : isRunning
                      ? "Appuie pour arrêter"
                      : "Prêt"}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  {!isRunning && !isInspection && attempts.length < 3 ? (
                    <Button
                      onClick={startTimer}
                      className="flex-1 min-h-[48px]"
                      size="lg"
                      disabled={loading || scrambleLoading || !scramble}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {loading ? "..." : "Commencer"}
                      <span className="hidden sm:inline ml-2 text-xs opacity-70">
                        (Espace)
                      </span>
                    </Button>
                  ) : isRunning ? (
                    <Button
                      onClick={stopTimer}
                      variant="destructive"
                      className="flex-1 min-h-[48px]"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? "..." : "Arrêter"}
                      <span className="hidden sm:inline ml-2 text-xs opacity-70">
                        (Espace)
                      </span>
                    </Button>
                  ) : (
                    <Button disabled className="flex-1 min-h-[48px]" size="lg">
                      {attempts.length >= 3 ? "Tentatives épuisées" : "Prêt"}
                    </Button>
                  )}
                </div>

                {/* Indication touche espace */}
                {!isRunning &&
                  !isInspection &&
                  attempts.length < 3 &&
                  !scrambleLoading &&
                  scramble && (
                    <div className="text-center text-xs text-muted-foreground">
                      <span className="hidden sm:inline">
                        Appuie sur{" "}
                        <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                          Espace
                        </kbd>{" "}
                        pour commencer
                      </span>
                      <span className="sm:hidden">
                        Appuie sur le timer ou le bouton pour commencer
                      </span>
                    </div>
                  )}
                {isInspection && (
                  <div className="text-center text-xs text-orange-500">
                    <span className="hidden sm:inline">
                      Appuie sur{" "}
                      <kbd className="px-1 py-0.5 bg-orange-500/20 rounded text-xs">
                        Espace
                      </kbd>{" "}
                      pour lancer maintenant
                    </span>
                    <span className="sm:hidden">
                      Appuie sur le timer pour lancer maintenant
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attempts */}
          <Card className="mb-6 xl:col-span-1">
            <CardHeader>
              <CardTitle>Mes tentatives</CardTitle>
            </CardHeader>
            <CardContent>
              {attempts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">
                    Aucune tentative pour l'instant
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vous avez 3 tentatives pour aujourd'hui
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attempts.map((attempt, index) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-mono text-lg font-bold">
                            {attempt.penalty === "dnf"
                              ? "DNF"
                              : attempt.penalty === "plus2"
                              ? `${formatTime(attempt.time + 2000)}`
                              : formatTime(attempt.time)}
                          </span>
                          {attempt.penalty === "plus2" && (
                            <span className="text-xs text-orange-500 font-medium">
                              +2 secondes
                            </span>
                          )}
                          {attempt.penalty === "dnf" && (
                            <span className="text-xs text-red-500 font-medium">
                              Did Not Finish
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {attempt.penalty === "dnf" ? (
                          <Badge variant="destructive" className="text-xs">
                            DNF
                          </Badge>
                        ) : attempt.penalty === "plus2" ? (
                          <Badge variant="secondary" className="text-xs">
                            +2
                          </Badge>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() =>
                                handleApplyPenalty(attempt.id, "plus2")
                              }
                              disabled={loading}
                            >
                              +2
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() =>
                                handleApplyPenalty(attempt.id, "dnf")
                              }
                              disabled={loading}
                            >
                              DNF
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {attempts.length >= 3 && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="text-sm text-red-600 font-medium text-center">
                        Toutes vos tentatives sont épuisées pour aujourd'hui
                      </div>
                    </div>
                  )}
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

          {/* Manual Time Input */}
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Entrée manuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ManualTimeInput
                onSave={handleManualTimeSave}
                scramble={scramble}
                defaultPuzzle="333"
                disabled={attempts.length >= 3 || loading || scrambleLoading}
                puzzleLocked={true}
              />
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Classement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="text-muted-foreground">Chargement...</div>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-muted-foreground">
                    Aucun participant pour l'instant
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        index === 0
                          ? "bg-yellow-500/10 border-yellow-500/20"
                          : index === 1
                          ? "bg-gray-500/10 border-gray-500/20"
                          : index === 2
                          ? "bg-orange-500/10 border-orange-500/20"
                          : "bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                              ? "bg-gray-500"
                              : index === 2
                              ? "bg-orange-500"
                              : "bg-muted"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{entry.username}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.attempts_count} tentative
                            {entry.attempts_count > 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">
                          {entry.best_time === -1
                            ? "DNF"
                            : formatTime(entry.best_time)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Aujourd'hui
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
