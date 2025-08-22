import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import {
  ChallengeAttempt,
  ChallengeLeaderboardEntry,
  ChallengeStats,
} from "@/types/challenge";

export function useChallenge() {
  const { user } = useUser();
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
    try {
      setLoading(true);
      if (!user) return;

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
    try {
      setLoading(true);
      if (!user) throw new Error("Utilisateur non connecté");

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
    try {
      setLoading(true);
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
      const challengeDate = getChallengeDate();

      // Requête directe sans fonction RPC pour l'instant
      const { data, error } = await supabase
        .from("challenge_attempts")
        .select("*")
        .eq("challenge_date", challengeDate)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Traiter les données côté client pour le classement
      const attemptsByUser = new Map();

      data?.forEach((attempt) => {
        if (!attemptsByUser.has(attempt.user_id)) {
          attemptsByUser.set(attempt.user_id, []);
        }
        attemptsByUser.get(attempt.user_id).push(attempt);
      });

      const leaderboardData = Array.from(attemptsByUser.entries())
        .map(([user_id, attempts]) => {
          const validAttempts = attempts.filter(
            (a: any) => a.penalty !== "dnf"
          );
          if (validAttempts.length === 0) return null;

          const bestTime = Math.min(
            ...validAttempts.map((a: any) =>
              a.penalty === "plus2" ? a.time + 2000 : a.time
            )
          );

          return {
            user_id,
            username: `User ${user_id.slice(0, 8)}`, // Username temporaire
            best_time: bestTime,
            attempts_count: attempts.length,
            created_at: attempts[0].created_at,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a!.best_time - b!.best_time);

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Erreur lors du chargement du classement:", error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques du challenge
  const loadStats = async () => {
    try {
      setLoading(true);
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
    try {
      setLoading(true);
      if (!user) return;

      const challengeDate = getChallengeDate();
      const { error } = await supabase
        .from("challenge_attempts")
        .delete()
        .eq("user_id", user.id)
        .eq("challenge_date", challengeDate);

      if (error) throw error;
      setAttempts([]);
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadUserAttempts();
    loadLeaderboard();
    // loadStats(); // Désactivé pour l'instant
  }, []);

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
