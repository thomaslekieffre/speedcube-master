"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

// User ID par défaut pour les tests (quand pas connecté)
const DEFAULT_USER_ID = "test-user-123";
import type {
  AlgorithmLearning,
  AlgorithmLearningWithDetails,
  LearningSession,
  LearningProgress,
  LearningBadge,
  AlgorithmRecommendation,
} from "@/types/database";

export function useLearningSystem() {
  const { user } = useUser();
  const [learningData, setLearningData] = useState<
    AlgorithmLearningWithDetails[]
  >([]);
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [badges, setBadges] = useState<LearningBadge[]>([]);
  const [recommendations, setRecommendations] = useState<
    AlgorithmRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fonction utilitaire pour obtenir l'ID utilisateur
  const getUserId = useCallback((): string => {
    // Utiliser l'ID utilisateur connecté ou l'ID par défaut pour les tests
    return user?.id || DEFAULT_USER_ID;
  }, [user]);

  // Charger les données d'apprentissage de l'utilisateur
  const loadLearningData = useCallback(async () => {
    // Charger les données même si l'utilisateur n'est pas connecté (mode test)

    try {
      setLoading(true);
      const userId = getUserId();

      // Charger les algorithmes en cours d'apprentissage avec les détails des algorithmes
      const { data: learningData, error: learningError } = await supabase
        .from("algorithm_learning")
        .select(
          `
          *,
          algorithm:algorithms(
            id,
            name,
            notation,
            difficulty,
            puzzle_type,
            method,
            set_name
          )
        `
        )
        .eq("user_id", userId);

      if (learningError) throw learningError;

      // Charger les progrès
      const { data: progressData, error: progressError } = await supabase
        .from("learning_progress")
        .select("*")
        .eq("user_id", userId);

      if (progressError) throw progressError;

      // Charger les badges
      const { data: badgesData, error: badgesError } = await supabase
        .from("learning_badges")
        .select("*")
        .eq("user_id", userId);

      if (badgesError) throw badgesError;

      setLearningData(learningData || []);
      setProgress(progressData || []);
      setBadges(badgesData || []);

      // Générer les recommandations
      await generateRecommendations(userId, learningData || []);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des données d'apprentissage:",
        error
      );
      toast.error("Erreur lors du chargement des données d'apprentissage");
    } finally {
      setLoading(false);
    }
  }, [user, getUserId]);

  // Générer les recommandations d'algorithmes
  const generateRecommendations = useCallback(
    async (userId: string, currentLearning: AlgorithmLearningWithDetails[]) => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const recommendations: AlgorithmRecommendation[] = [];

        // 1. Algorithmes à réviser aujourd'hui
        const dueForReview = currentLearning.filter(
          (item) => item.next_review_date <= today && item.status !== "mastered"
        );

        for (const item of dueForReview) {
          // Récupérer les détails de l'algorithme
          const { data: algo } = await supabase
            .from("algorithms")
            .select("name, notation, difficulty")
            .eq("id", item.algorithm_id)
            .single();

          if (algo) {
            recommendations.push({
              algorithm_id: item.algorithm_id,
              algorithm_name: algo.name,
              notation: algo.notation,
              difficulty: algo.difficulty,
              reason: "due_for_review",
              priority: 5,
              estimated_time: 2,
            });
          }
        }

        // 2. Nouveaux algorithmes à apprendre (basé sur les préférences utilisateur)
        // TODO: Implémenter la logique de recommandation basée sur les préférences

        setRecommendations(recommendations);
      } catch (error) {
        console.error(
          "Erreur lors de la génération des recommandations:",
          error
        );
      }
    },
    []
  );

  // Ajouter un algorithme à la liste d'apprentissage
  const addToLearning = useCallback(
    async (algorithmId: string) => {
      // Permettre l'ajout même si l'utilisateur n'est pas connecté (mode test)

      try {
        const userId = getUserId();
        const today = new Date().toISOString();

        // Insérer l'algorithme dans la liste d'apprentissage
        const { data: insertedData, error: insertError } = await supabase
          .from("algorithm_learning")
          .insert({
            user_id: userId,
            algorithm_id: algorithmId,
            status: "to_learn",
            current_level: 0,
            next_review_date: today,
            last_reviewed: today,
            review_count: 0,
            success_count: 0,
            failure_count: 0,
            streak_days: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Récupérer les détails de l'algorithme
        const { data: algorithmDetails, error: detailsError } = await supabase
          .from("algorithms")
          .select(
            "id, name, notation, difficulty, puzzle_type, method, set_name"
          )
          .eq("id", algorithmId)
          .single();

        if (detailsError) throw detailsError;

        // Combiner les données
        const data = {
          ...insertedData,
          algorithm: algorithmDetails,
        };

        setLearningData((prev) => [...prev, data]);
        toast.success("Algorithme ajouté à votre liste d'apprentissage");
      } catch (error) {
        console.error("Erreur lors de l'ajout à l'apprentissage:", error);
        toast.error("Erreur lors de l'ajout à l'apprentissage");
      }
    },
    [user, getUserId]
  );

  // Marquer un algorithme comme révisé
  const markAsReviewed = useCallback(
    async (algorithmId: string, success: boolean) => {
      // Permettre la révision même si l'utilisateur n'est pas connecté (mode test)

      try {
        const userId = getUserId();
        const today = new Date().toISOString();

        // Trouver l'entrée d'apprentissage
        const learningEntry = learningData.find(
          (item) => item.algorithm_id === algorithmId && item.user_id === userId
        );

        if (!learningEntry) {
          toast.error("Algorithme non trouvé dans votre liste d'apprentissage");
          return;
        }

        // Calculer la nouvelle date de révision (spaced repetition)
        const nextReviewDate = calculateNextReviewDate(
          learningEntry.current_level,
          success
        );

        // Mettre à jour les statistiques
        const newSuccessCount = learningEntry.success_count + (success ? 1 : 0);
        const newFailureCount = learningEntry.failure_count + (success ? 0 : 1);
        const newLevel = success
          ? Math.min(learningEntry.current_level + 1, 5)
          : 0;
        const newStatus = newLevel >= 5 ? "mastered" : "learning";

        const { error } = await supabase
          .from("algorithm_learning")
          .update({
            status: newStatus,
            current_level: newLevel,
            next_review_date: nextReviewDate,
            last_reviewed: today,
            review_count: learningEntry.review_count + 1,
            success_count: newSuccessCount,
            failure_count: newFailureCount,
            updated_at: today,
          })
          .eq("id", learningEntry.id);

        if (error) throw error;

        // Mettre à jour l'état local
        setLearningData((prev) =>
          prev.map((item) =>
            item.id === learningEntry.id
              ? {
                  ...item,
                  status: newStatus,
                  current_level: newLevel,
                  next_review_date: nextReviewDate,
                  last_reviewed: today,
                  review_count: item.review_count + 1,
                  success_count: newSuccessCount,
                  failure_count: newFailureCount,
                  updated_at: today,
                }
              : item
          )
        );

        // Vérifier les badges
        await checkAndAwardBadges(userId);

        toast.success(
          success
            ? "Excellent ! Algorithme maîtrisé"
            : "Pas de problème, vous y arriverez la prochaine fois"
        );
      } catch (error) {
        console.error("Erreur lors de la révision:", error);
        toast.error("Erreur lors de la révision");
      }
    },
    [user, getUserId, learningData]
  );

  // Calculer la prochaine date de révision (spaced repetition)
  const calculateNextReviewDate = useCallback(
    (currentLevel: number, success: boolean): string => {
      const today = new Date();

      if (!success) {
        // Si échec, réviser demain
        today.setDate(today.getDate() + 1);
      } else {
        // Si succès, augmenter l'intervalle selon le niveau
        const intervals = [1, 3, 7, 14, 30]; // jours
        const interval =
          intervals[Math.min(currentLevel, intervals.length - 1)];
        today.setDate(today.getDate() + interval);
      }

      return today.toISOString();
    },
    []
  );

  // Vérifier et attribuer les badges
  const checkAndAwardBadges = useCallback(
    async (userId: string) => {
      try {
        // Logique pour vérifier les badges
        // Exemple: Full PLL (21 algorithmes maîtrisés)
        const masteredAlgorithms = learningData.filter(
          (item) => item.status === "mastered" && item.user_id === userId
        );

        // TODO: Implémenter la logique complète des badges
        // Vérifier les sets complets, les streaks, etc.
      } catch (error) {
        console.error("Erreur lors de la vérification des badges:", error);
      }
    },
    [learningData]
  );

  // Obtenir les algorithmes à réviser aujourd'hui
  const getTodayReviewList = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    console.log("🔍 Debug getTodayReviewList:");
    console.log("Today:", today);
    console.log("Learning data:", learningData);

    const filtered = learningData.filter((item) => {
      const itemDate = new Date(item.next_review_date)
        .toISOString()
        .split("T")[0];
      const shouldInclude = itemDate <= today && item.status !== "mastered";
      console.log(
        `Algo ${item.algorithm_id}: date=${itemDate}, status=${item.status}, include=${shouldInclude}`
      );
      return shouldInclude;
    });

    console.log("Filtered result:", filtered);
    return filtered;
  }, [learningData]);

  // Obtenir les statistiques d'apprentissage
  const getLearningStats = useCallback(() => {
    const total = learningData.length;
    const mastered = learningData.filter(
      (item) => item.status === "mastered"
    ).length;
    const learning = learningData.filter(
      (item) => item.status === "learning"
    ).length;
    const toLearn = learningData.filter(
      (item) => item.status === "to_learn"
    ).length;

    return {
      total,
      mastered,
      learning,
      toLearn,
      masteryPercentage: total > 0 ? Math.round((mastered / total) * 100) : 0,
    };
  }, [learningData]);

  // Charger les données au montage
  useEffect(() => {
    loadLearningData();
  }, [loadLearningData]);

  return {
    learningData,
    progress,
    badges,
    recommendations,
    loading,
    addToLearning,
    markAsReviewed,
    getTodayReviewList,
    getLearningStats,
    refresh: loadLearningData,
  };
}
