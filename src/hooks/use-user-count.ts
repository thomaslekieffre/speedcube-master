"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useUserCount() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserCount() {
      try {
        setLoading(true);

        // Compter les utilisateurs dans la table profiles
        const { count, error } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Erreur lors du comptage des utilisateurs:", error);
          setError(error.message);
        } else {
          setUserCount(count || 0);
        }
      } catch (err) {
        console.error("Erreur inattendue:", err);
        setError("Erreur lors du chargement du nombre d'utilisateurs");
      } finally {
        setLoading(false);
      }
    }

    fetchUserCount();
  }, []);

  return { userCount, loading, error };
}
