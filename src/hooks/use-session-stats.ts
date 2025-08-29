"use client";

import { useState, useEffect } from "react";
import { createSupabaseClientWithUser } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import type { Database } from "@/types/database";

interface SessionStats {
  session_id: string;
  puzzle_type: string;
  total_solves: number;
  best_time: number | null;
  average_time: number | null;
}

export function useSessionStats(puzzleType: string) {
  const [sessionStats, setSessionStats] = useState<SessionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const fetchSessionStats = async () => {
    if (!user?.id) {
      setSessionStats([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const supabase = await createSupabaseClientWithUser(user.id);
      const { data, error } = await supabase
        .from("session_stats")
        .select("*")
        .eq("puzzle_type", puzzleType);

      if (error) {
        console.error("Erreur lors du chargement des stats de session:", error);
        setError(error.message);
        return;
      }

      setSessionStats(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des stats de session:", err);
      setError("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchSessionStats();
  };

  useEffect(() => {
    fetchSessionStats();
  }, [user?.id, puzzleType]);

  return {
    sessionStats,
    loading,
    error,
    refresh,
  };
}
