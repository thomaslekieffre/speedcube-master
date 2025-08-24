import { useState, useEffect } from "react";
import { getTodayDate } from "@/lib/daily-scramble";

interface DailyScrambleData {
  date: string;
  scramble: string;
  generated: boolean;
}

export function useDailyScramble() {
  const [scramble, setScramble] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger le scramble du jour
  const loadDailyScramble = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/daily-scramble");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du scramble");
      }

      const data: DailyScrambleData = await response.json();

      setScramble(data.scramble);
      setDate(data.date);
    } catch (err) {
      console.error("Erreur lors du chargement du scramble:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si la date a changé
  const checkDateChange = () => {
    const today = getTodayDate();
    if (date && date !== today) {
      // La date a changé, recharger le scramble
      loadDailyScramble();
    }
  };

  // Charger le scramble au montage et vérifier les changements de date
  useEffect(() => {
    loadDailyScramble();
  }, []);

  // Vérifier les changements de date périodiquement
  useEffect(() => {
    const interval = setInterval(checkDateChange, 60000); // Vérifier toutes les minutes
    return () => clearInterval(interval);
  }, [date]);

  return {
    scramble,
    date,
    loading,
    error,
    loadDailyScramble,
  };
}
