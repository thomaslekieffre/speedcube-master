import { useState, useEffect } from "react";
import { createSupabaseClientWithUser } from "@/lib/supabase";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  ChallengeAttempt,
  ChallengeLeaderboardEntry,
  ChallengeStats,
} from "@/types/challenge";

// Fonction pour récupérer le username depuis Clerk
const getUserDisplayName = (user: any) => {
  return (
    user?.username ||
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "User"
  );
};

export function useChallenge() {
  const { user } = useUser();
  const { client } = useClerk();
  const [attempts, setAttempts] = useState<ChallengeAttempt[]>([]);
  const [leaderboard, setLeaderboard] = useState<ChallengeLeaderboardEntry[]>(
    []
  );
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Récupérer la date du challenge (aujourd'hui)
  const getChallengeDate = () => {
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  };

  // Charger les tentatives de l'utilisateur pour aujourd'hui
  const loadUserAttempts = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const supabase = createSupabaseClientWithUser(user.id);

      const challengeDate = getChallengeDate();
      const { data, error } = await supabase
        .from("challenge_attempts")
        .select("*")
        .eq("user_id", user.id)
        .eq("challenge_date", challengeDate)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setAttempts(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des tentatives:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder une nouvelle tentative
  const saveAttempt = async (
    time: number,
    penalty: "none" | "plus2" | "dnf" = "none"
  ) => {
    if (!user?.id) throw new Error("Utilisateur non connecté");

    try {
      setLoading(true);
      const supabase = createSupabaseClientWithUser(user.id);

      const challengeDate = getChallengeDate();

      const { data, error } = await supabase
        .from("challenge_attempts")
        .insert({
          user_id: user.id,
          time,
          penalty,
          challenge_date: challengeDate,
        })
        .select()
        .single();

      if (error) throw error;

      setAttempts((prev) => [...prev, data]);

      // Le classement se met à jour automatiquement via le trigger SQL
      await loadLeaderboard();

      return data;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Appliquer une pénalité à une tentative
  const applyPenalty = async (attemptId: string, penalty: "plus2" | "dnf") => {
    if (!user?.id) throw new Error("Utilisateur non connecté");

    try {
      setLoading(true);
      const supabase = createSupabaseClientWithUser(user.id);

      const { error } = await supabase
        .from("challenge_attempts")
        .update({ penalty })
        .eq("id", attemptId);

      if (error) throw error;

      setAttempts((prev) =>
        prev.map((attempt) =>
          attempt.id === attemptId ? { ...attempt, penalty } : attempt
        )
      );

      // Le classement se met à jour automatiquement via le trigger SQL
      await loadLeaderboard();
    } catch (error) {
      console.error("Erreur lors de l'application de la pénalité:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Charger le classement pour aujourd'hui
  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const supabase = createSupabaseClientWithUser(user?.id || "");

      const challengeDate = getChallengeDate();

      // Utiliser la table daily_challenge_tops pour le classement (top 10)
      const { data, error } = await supabase
        .from("daily_challenge_tops")
        .select("*")
        .eq("challenge_date", challengeDate)
        .order("rank", { ascending: true })
        .limit(10);

      if (error) throw error;

      setLeaderboard(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement du classement:", error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques du challenge
  const loadStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const supabase = createSupabaseClientWithUser(user.id);

      const challengeDate = getChallengeDate();

      const { data, error } = await supabase.rpc("get_challenge_stats", {
        challenge_date: challengeDate,
      });

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error("Erreur lors du chargement des stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser les tentatives (supprimer de la DB)
  const resetAttempts = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const supabase = createSupabaseClientWithUser(user.id);

      const challengeDate = getChallengeDate();
      const { error } = await supabase
        .from("challenge_attempts")
        .delete()
        .eq("user_id", user.id)
        .eq("challenge_date", challengeDate);

      if (error) throw error;
      setAttempts([]);

      // Le classement se met à jour automatiquement via le trigger SQL
      await loadLeaderboard();
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant et quand l'utilisateur change
  useEffect(() => {
    if (user?.id) {
      loadUserAttempts();
      loadLeaderboard();
      // loadStats(); // Désactivé pour l'instant
    }
  }, [user?.id]);

  return {
    attempts,
    leaderboard,
    stats,
    loading,
    saveAttempt,
    applyPenalty,
    resetAttempts,
    loadLeaderboard,
    loadStats,
  };
}
