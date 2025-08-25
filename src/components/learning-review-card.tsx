"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CubeViewer } from "@/components/cube-viewer";
import { PUZZLES, PuzzleType } from "@/components/puzzle-selector";
import {
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Trophy,
  Clock,
  Target,
} from "lucide-react";
import { useLearningSystem } from "@/hooks/use-learning-system";
import { toast } from "sonner";

interface LearningReviewCardProps {
  algorithmId: string;
  algorithmName: string;
  notation: string;
  puzzleType: string;
  difficulty?: string;
  currentLevel: number;
  onReviewComplete: (success: boolean) => void;
}

export function LearningReviewCard({
  algorithmId,
  algorithmName,
  notation,
  puzzleType,
  difficulty,
  currentLevel,
  onReviewComplete,
}: LearningReviewCardProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const { markAsReviewed } = useLearningSystem();

  const handleReview = async (success: boolean) => {
    setIsReviewing(true);
    setHasAnswered(true);

    try {
      await markAsReviewed(algorithmId, success);
      onReviewComplete(success);

      // Animation de feedback
      toast.success(
        success
          ? `Excellent ! ${algorithmName} maîtrisé`
          : `Pas de problème, vous y arriverez la prochaine fois`
      );
    } catch (error) {
      toast.error("Erreur lors de la révision");
      setHasAnswered(false); // Réactiver si erreur
    } finally {
      setIsReviewing(false);
    }
  };

  const getDifficultyColor = (difficulty: string | undefined | null) => {
    if (!difficulty) return "bg-gray-500";

    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-500";
      case "intermediate":
        return "bg-yellow-500";
      case "advanced":
        return "bg-orange-500";
      case "expert":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLevelProgress = () => {
    return (currentLevel / 5) * 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle className="text-lg font-semibold">
                  {algorithmName}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="font-mono text-sm">
                    {notation}
                  </Badge>
                  <Badge className={getDifficultyColor(difficulty)}>
                    {difficulty}
                  </Badge>
                  <Badge variant="secondary">
                    <Target className="h-3 w-3 mr-1" />
                    Niveau {currentLevel}/5
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSolution(!showSolution)}
              className="h-8 w-8 p-0"
            >
              {showSolution ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Barre de progression du niveau */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
              <span>Progression vers la maîtrise</span>
              <span>{Math.round(getLevelProgress())}%</span>
            </div>
            <Progress value={getLevelProgress()} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Visualisation du cube */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Visualisation</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="h-6 px-2"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
            <div className="h-64 bg-muted/30 rounded-lg border">
              <CubeViewer
                scramble={notation}
                puzzleType={puzzleType as PuzzleType}
                onReset={() => {}}
                showControls={true}
              />
            </div>
          </div>

          {/* Solution (cachée par défaut) */}
          {showSolution && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <h4 className="text-sm font-medium">Solution</h4>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-mono">{notation}</p>
              </div>
            </motion.div>
          )}

          {/* Actions de révision */}
          {hasAnswered ? (
            <div className="flex items-center justify-center pt-4 border-t">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Révision terminée !</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleReview(false)}
                disabled={isReviewing}
                className="flex-1 h-12"
              >
                <XCircle className="h-5 w-5 mr-2 text-red-500" />
                Je ne me souviens pas
              </Button>

              <Button
                size="lg"
                onClick={() => handleReview(true)}
                disabled={isReviewing}
                className="flex-1 h-12"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Je me souviens
              </Button>
            </div>
          )}

          {/* Conseils */}
          <div className="text-xs text-muted-foreground text-center">
            <p>
              💡 <strong>Conseil :</strong>{" "}
              {showSolution
                ? "Essayez de visualiser l'algorithme sans regarder la solution"
                : "Visualisez l'algorithme avant de révéler la solution"}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
