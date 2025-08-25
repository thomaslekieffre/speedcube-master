"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LearningReviewCard } from "@/components/learning-review-card";
import { LearningHelpPopup } from "@/components/learning-help-popup";
import { useLearningSystem } from "@/hooks/use-learning-system";
import { useUser } from "@clerk/nextjs";
import {
  GraduationCap,
  Trophy,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Calendar,
  TrendingUp,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function LearningReviewPage() {
  const { user } = useUser();
  const {
    learningData,
    recommendations,
    loading,
    getTodayReviewList,
    getLearningStats,
    refresh,
  } = useLearningSystem();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    successful: 0,
    failed: 0,
  });
  const [showHelp, setShowHelp] = useState(false);

  const todayReviewList = getTodayReviewList();
  const learningStats = getLearningStats();

  useEffect(() => {
    if (!user) {
      toast.error("Vous devez être connecté pour accéder à la révision");
      return;
    }
  }, [user]);

  const handleReviewComplete = (success: boolean) => {
    setSessionStats((prev) => ({
      reviewed: prev.reviewed + 1,
      successful: prev.successful + (success ? 1 : 0),
      failed: prev.failed + (success ? 0 : 1),
    }));

    // Passer à l'algorithme suivant
    if (currentIndex < todayReviewList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Session terminée
      toast.success("Session de révision terminée !");
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Connexion requise
            </h1>
            <p className="text-muted-foreground">
              Vous devez être connecté pour accéder à la révision d'algorithmes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (todayReviewList.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          {/* Header avec bouton d'aide */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => window.history.back()}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Révision quotidienne
                  </h1>
                  <p className="text-muted-foreground">
                    Révisons vos algorithmes avec la répétition espacée
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(true)}
                className="h-8 w-8 p-0"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                <Trophy className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Aucune révision aujourd'hui !
              </h2>
              <p className="text-muted-foreground mb-6">
                Tous vos algorithmes sont à jour. Continuez comme ça !
              </p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Algorithmes maîtrisés
                    </span>
                    <Badge variant="secondary">{learningStats.mastered}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      En cours d'apprentissage
                    </span>
                    <Badge variant="outline">{learningStats.learning}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      À apprendre
                    </span>
                    <Badge variant="outline">{learningStats.toLearn}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Popup d'aide */}
        <LearningHelpPopup
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />
      </div>
    );
  }

  const currentAlgorithm = todayReviewList[currentIndex];

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Révision quotidienne
              </h1>
              <p className="text-muted-foreground">
                Révisons vos algorithmes avec la répétition espacée
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(true)}
              className="h-8 w-8 p-0"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Statistiques de session */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {sessionStats.reviewed}/{todayReviewList.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Révisés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {sessionStats.successful}
                  </div>
                  <div className="text-sm text-muted-foreground">Réussis</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {sessionStats.failed}
                  </div>
                  <div className="text-sm text-muted-foreground">Échoués</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {sessionStats.reviewed > 0
                      ? Math.round(
                          (sessionStats.successful / sessionStats.reviewed) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Taux de réussite
                  </div>
                </div>
              </div>

              {/* Barre de progression de la session */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                  <span>Progression de la session</span>
                  <span>
                    {Math.round(
                      (sessionStats.reviewed / todayReviewList.length) * 100
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={(sessionStats.reviewed / todayReviewList.length) * 100}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Carte de révision actuelle */}
        <AnimatePresence mode="wait">
          {currentAlgorithm && (
            <motion.div
              key={currentAlgorithm.algorithm_id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <LearningReviewCard
                algorithmId={currentAlgorithm.algorithm_id}
                algorithmName={currentAlgorithm.algorithm?.name || "Algorithme"}
                notation={currentAlgorithm.algorithm?.notation || ""}
                puzzleType={currentAlgorithm.algorithm?.puzzle_type || "3x3"}
                difficulty={currentAlgorithm.algorithm?.difficulty}
                currentLevel={currentAlgorithm.current_level}
                onReviewComplete={handleReviewComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>



        {/* Statistiques globales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Statistiques d'apprentissage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {learningStats.mastered}
                  </div>
                  <div className="text-sm text-muted-foreground">Maîtrisés</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-3xl font-bold text-blue-500 mb-1">
                    {learningStats.learning}
                  </div>
                  <div className="text-sm text-muted-foreground">En cours</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-3xl font-bold text-green-500 mb-1">
                    {learningStats.masteryPercentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Taux de maîtrise
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Popup d'aide */}
      <LearningHelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
