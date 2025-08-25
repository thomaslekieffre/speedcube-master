import { useState, useEffect } from "react";
import { createSupabaseClientWithUser } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

export interface SessionStats {
  session_id: string;
  session_name: string;
  puzzle_type: string;
  user_id: string;
  total_solves: number;
  best_time: number | null;
  average_time: number | null;
  dnf_count: number;
  session_created_at: string;
  last_solve_at: string | null;
}

export function useSessionStats(puzzleType?: string) {
  const [sessionStats, setSessionStats] = useState<SessionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const loadSessionStats = async () => {
    if (!user?.id) {
      setSessionStats([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user.id);

      let query = supabase
        .from("session_stats")
        .select("*")
        .eq("user_id", user.id)
        .order("session_created_at", { ascending: false });

      if (puzzleType) {
        query = query.eq("puzzle_type", puzzleType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erreur lors du chargement des stats de session:", error);
        setError(error.message);
      } else {
        setSessionStats(data || []);
      }
    } catch (err) {
      console.error("Erreur inattendue:", err);
      setError("Erreur inattendue lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionStats();
  }, [user?.id, puzzleType]);

  // Écouter les mises à jour de solves et de sessions pour rafraîchir les stats
  useEffect(() => {
    const handleSolvesUpdated = () => {
      console.log(
        "🔄 Événement solves-updated reçu, rechargement des stats..."
      );
      loadSessionStats();
    };

    const handleSessionsUpdated = () => {
      console.log(
        "🔄 Événement sessions-updated reçu, rechargement des stats..."
      );
      loadSessionStats();
    };

    window.addEventListener("solves-updated", handleSolvesUpdated);
    window.addEventListener("sessions-updated", handleSessionsUpdated);

    return () => {
      window.removeEventListener("solves-updated", handleSolvesUpdated);
      window.removeEventListener("sessions-updated", handleSessionsUpdated);
    };
  }, []);

  const getSessionStats = (sessionId: string): SessionStats | null => {
    return sessionStats.find((stats) => stats.session_id === sessionId) || null;
  };

  const getActiveSessionStats = (): SessionStats | null => {
    return sessionStats.find((stats) => stats.total_solves > 0) || null;
  };

  return {
    sessionStats,
    loading,
    error,
    getSessionStats,
    getActiveSessionStats,
    refresh: loadSessionStats,
  };
}
