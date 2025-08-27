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
      // Attendre un peu pour laisser le trigger SQL s'exécuter
      setTimeout(() => {
        loadPersonalBests();
      }, 100);
    };

    window.addEventListener("solves-updated", handleSolvesUpdated);
    return () =>
      window.removeEventListener("solves-updated", handleSolvesUpdated);
  }, [targetUserId]);

  // Fonction pour forcer la mise à jour des PB (utile pour la synchronisation)
  const refreshPersonalBests = async () => {
    await loadPersonalBests();
  };

  // Fonction pour obtenir un PB spécifique
  const getPersonalBest = (puzzleType: string) => {
    return personalBests.find((pb) => pb.puzzle_type === puzzleType) || null;
  };

  // Fonction pour obtenir le temps effectif d'un PB (avec pénalités)
  const getEffectiveTime = (puzzleType: string) => {
    const pb = getPersonalBest(puzzleType);
    if (!pb) return null;

    return pb.penalty === "plus2" ? pb.time + 2000 : pb.time;
  };

  // Fonction pour vérifier si un temps est un nouveau PB
  const isNewPersonalBest = (
    puzzleType: string,
    time: number,
    penalty: "none" | "plus2" | "dnf"
  ) => {
    if (penalty === "dnf") return false;

    const currentPB = getEffectiveTime(puzzleType);
    if (!currentPB) return true; // Premier solve valide

    const newEffectiveTime = penalty === "plus2" ? time + 2000 : time;
    return newEffectiveTime < currentPB;
  };

  return {
    personalBests,
    loading,
    error,
    getPersonalBest,
    getEffectiveTime,
    isNewPersonalBest,
    refreshPersonalBests,
  };
}
