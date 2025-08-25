import { useState, useEffect } from "react";
import { useLearningSystem } from "./use-learning-system";

export function useRevisionBadge() {
  const [revisionCount, setRevisionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { getTodayReviewList, learningData } = useLearningSystem();

  useEffect(() => {
    const updateRevisionCount = () => {
      try {
        const todayReviewList = getTodayReviewList();
        setRevisionCount(todayReviewList.length);
      } catch (error) {
        console.warn("Erreur lors du calcul des révisions:", error);
        setRevisionCount(0);
      } finally {
        setLoading(false);
      }
    };

    // Mettre à jour immédiatement
    updateRevisionCount();

    // Mettre à jour quand les données d'apprentissage changent
    if (learningData.length > 0) {
      updateRevisionCount();
    }
  }, [getTodayReviewList, learningData]);

  return {
    revisionCount,
    loading,
    hasRevisions: revisionCount > 0,
  };
}
