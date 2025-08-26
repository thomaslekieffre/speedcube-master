import { useState, useEffect } from "react";
import { createSupabaseClientWithUser } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import type { Database } from "@/types/database";

type PersonalBest = Database["public"]["Tables"]["personal_bests"]["Row"];
type InsertPersonalBest =
  Database["public"]["Tables"]["personal_bests"]["Insert"];
type UpdatePersonalBest =
  Database["public"]["Tables"]["personal_bests"]["Update"];

export function usePersonalBests(userId?: string) {
  const [personalBests, setPersonalBests] = useState<PersonalBest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const targetUserId = userId || user?.id;

  const loadPersonalBests = async () => {
    if (!targetUserId) {
      setPersonalBests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(targetUserId);

      const { data, error } = await supabase
        .from("personal_bests")
        .select("*")
        .eq("user_id", targetUserId)
        .order("puzzle_type");

      if (error) {
        console.error("Erreur lors du chargement des PB:", error);
        setError(error.message);
      } else {
        setPersonalBests(data || []);
      }
    } catch (err) {
      console.error("Erreur inattendue:", err);
      setError("Erreur inattendue lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonalBests();
  }, [targetUserId]);

  // Écouter les événements de mise à jour des solves pour rafraîchir les PB
  useEffect(() => {
    const handleSolvesUpdated = () => {
      console.log("📥 Événement solves-updated reçu dans usePersonalBests");
      loadPersonalBests();
    };

    window.addEventListener("solves-updated", handleSolvesUpdated);
    return () =>
      window.removeEventListener("solves-updated", handleSolvesUpdated);
  }, [targetUserId]);

  const updateOrCreatePersonalBest = async (
    puzzleType: string,
    time: number,
    penalty: "none" | "plus2" | "dnf",
    scramble: string
  ) => {
    if (!user) return;

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user.id);

      // Vérifier si un PB existe déjà pour ce puzzle
      const existingPB = personalBests.find(
        (pb) => pb.puzzle_type === puzzleType
      );

      if (existingPB) {
        // Mettre à jour seulement si le nouveau temps est meilleur
        const newTimeWithPenalty = penalty === "plus2" ? time + 2000 : time;
        const oldTimeWithPenalty =
          existingPB.penalty === "plus2"
            ? existingPB.time + 2000
            : existingPB.time;

        // Toujours mettre à jour pour synchroniser avec les solves actuels
        const { data, error } = await supabase
          .from("personal_bests")
          .update({
            time,
            penalty,
            scramble,
          })
          .eq("id", existingPB.id)
          .select()
          .single();

        if (error) throw error;

        setPersonalBests((prev) =>
          prev.map((pb) => (pb.id === existingPB.id ? data : pb))
        );
        return data;
      } else {
        // Créer un nouveau PB
        const { data, error } = await supabase
          .from("personal_bests")
          .insert({
            user_id: user.id,
            puzzle_type: puzzleType,
            time,
            penalty,
            scramble,
          })
          .select()
          .single();

        if (error) throw error;

        setPersonalBests((prev) => [...prev, data]);
        return data;
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour du PB:", err);
      throw new Error(`Erreur lors de la mise à jour du PB: ${err}`);
    }
  };

  const getPersonalBest = (puzzleType: string) => {
    return personalBests.find((pb) => pb.puzzle_type === puzzleType);
  };

  const deletePersonalBest = async (puzzleType: string) => {
    if (!user) return;

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user.id);

      const existingPB = personalBests.find(
        (pb) => pb.puzzle_type === puzzleType
      );

      if (existingPB) {
        const { error } = await supabase
          .from("personal_bests")
          .delete()
          .eq("id", existingPB.id);

        if (error) throw error;

        setPersonalBests((prev) =>
          prev.filter((pb) => pb.id !== existingPB.id)
        );
      }
    } catch (err) {
      console.error("Erreur lors de la suppression du PB:", err);
      throw err;
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${seconds}.${centiseconds.toString().padStart(2, "0")}`;
  };

  return {
    personalBests,
    loading,
    error,
    updateOrCreatePersonalBest,
    deletePersonalBest,
    getPersonalBest,
    formatTime,
    refresh: loadPersonalBests,
  };
}
