"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Brain, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRevisionBadge } from "@/hooks/use-revision-badge";
import { useLearningSystem } from "@/hooks/use-learning-system";

export function DailyProgressBanner() {
  const { revisionCount, hasRevisions } = useRevisionBadge();
  const { getLearningStats } = useLearningSystem();
  const stats = getLearningStats();

  if (!hasRevisions) {
    return null;
  }

  const progressPercentage = Math.min(
    (stats.mastered / Math.max(stats.total, 1)) * 100,
    100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-8"
    >
      <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-red-600" />
              </div>

              <div>
                <h3 className="font-semibold text-lg text-foreground mb-1">
                  Révisions quotidiennes disponibles !
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Vous avez <strong>{revisionCount}</strong> algorithme
                  {revisionCount > 1 ? "s" : ""} à réviser aujourd'hui.
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    <span>{stats.mastered} maîtrisés</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{progressPercentage.toFixed(0)}% de progression</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>~{Math.ceil(revisionCount * 0.5)} min</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">
                  {revisionCount}
                </div>
                <div className="text-xs text-muted-foreground">à réviser</div>
              </div>

              <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
                <Link href="/learning/review">
                  <Target className="h-4 w-4 mr-2" />
                  Commencer
                </Link>
              </Button>
            </div>
          </div>

          {/* Barre de progression globale */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progression globale</span>
              <span>
                {stats.mastered}/{stats.total} algorithmes
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
