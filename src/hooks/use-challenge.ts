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

  // Récupérer la date du challenge (aujourd'hui en heure locale française)
  const getChallengeDate = () => {
    // Utiliser l'heure locale française (UTC+1/+2 selon l'heure d'été)
    const now = new Date();
    const frenchTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Europe/Paris" })
    );
    return frenchTime.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  // Charger les tentatives de l'utilisateur pour aujourd'hui
  const loadUserAttempts = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const supabase = await createSupabaseClientWithUser(user.id);

      const challengeDate = getChallengeDate();
      const { data, error } = await supabase
        .from("challenge_attempts")
        .select("*")
        .eq("user_id", user.id)
        .eq("challenge_date", challengeDate)
        .order("created_at", { ascending: true });

      if (error) throw error;
      console.log("📊 Tentatives chargées:", data);
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
      const supabase = await createSupabaseClientWithUser(user.id);

      const challengeDate = getChallengeDate();

      // Récupérer le username de l'utilisateur
      const username = getUserDisplayName(user);

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
      console.log("💾 Tentative sauvegardée:", data);

      // Recharger les tentatives depuis la base de données
      await loadUserAttempts();

      // Mettre à jour manuellement le classement
      await updateLeaderboard(challengeDate, username);

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
      const supabase = await createSupabaseClientWithUser(user.id);

      const { error } = await supabase
        .from("challenge_attempts")
        .update({ penalty })
        .eq("id", attemptId);

      if (error) throw error;

      // Recharger les tentatives depuis la base de données
      await loadUserAttempts();

      // Mettre à jour manuellement le classement
      const challengeDate = getChallengeDate();
      const username = getUserDisplayName(user);
      await updateLeaderboard(challengeDate, username);
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
      const supabase = await createSupabaseClientWithUser(user?.id || "");

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
      const supabase = await createSupabaseClientWithUser(user.id);

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
      const supabase = await createSupabaseClientWithUser(user.id);

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

  // Fonction pour mettre à jour le classement
  const updateLeaderboard = async (challengeDate: string, username: string) => {
    if (!user?.id) return;

    try {
      const supabase = await createSupabaseClientWithUser(user.id);

      // Récupérer toutes les tentatives de l'utilisateur pour aujourd'hui
      const { data: allAttempts } = await supabase
        .from("challenge_attempts")
        .select("time, penalty")
        .eq("user_id", user.id)
        .eq("challenge_date", challengeDate)
        .order("time", { ascending: true });

      if (!allAttempts || allAttempts.length === 0) return;

      // Trouver le meilleur temps valide (pas DNF)
      const validAttempts = allAttempts.filter(
        (attempt) => attempt.penalty !== "dnf"
      );

      let finalTime: number;
      if (validAttempts.length === 0) {
        // Toutes les tentatives sont DNF
        finalTime = -1;
      } else {
        // Prendre le meilleur temps valide
        const bestAttempt = validAttempts[0];
        finalTime =
          bestAttempt.penalty === "plus2"
            ? bestAttempt.time + 2000
            : bestAttempt.time;
      }

      // Vérifier si l'utilisateur est déjà dans le classement
      const { data: existingEntry } = await supabase
        .from("daily_challenge_tops")
        .select("id, best_time")
        .eq("challenge_date", challengeDate)
        .eq("user_id", user.id)
        .single();

      if (existingEntry) {
        // Mettre à jour l'entrée existante
        await supabase
          .from("daily_challenge_tops")
          .update({
            best_time: finalTime,
            username: username,
          })
          .eq("id", existingEntry.id);
      } else {
        // Insérer une nouvelle entrée
        await supabase.from("daily_challenge_tops").insert({
          challenge_date: challengeDate,
          user_id: user.id,
          username: username,
          best_time: finalTime,
          rank: 1, // Sera mis à jour par un trigger ou une fonction
        });
      }

      // Recharger le classement
      await loadLeaderboard();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du classement:", error);
      // Fallback: recharger simplement le classement
      await loadLeaderboard();
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
