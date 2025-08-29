import { useState, useCallback } from "react";
import { createSupabaseClientWithUser } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

export function useUsernameCheck() {
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const { user } = useUser();

  const checkUsername = useCallback(
    async (username: string) => {
      if (!username || username.length < 3) {
        setIsAvailable(null);
        return;
      }

      if (!user?.id) {
        setIsAvailable(false);
        return;
      }

      setChecking(true);
      try {
        const supabase = await createSupabaseClientWithUser(user.id);

        const { data, error } = await supabase
          .from("profiles")
          .select("id, username")
          .eq("username", username)
          .single();

        if (error && error.code === "PGRST116") {
          // Username disponible (aucun résultat)
          setIsAvailable(true);
        } else if (data) {
          // Username existe déjà
          if (data.id === user.id) {
            // C'est le même utilisateur, donc c'est "disponible" pour lui
            setIsAvailable(true);
          } else {
            // C'est un autre utilisateur
            setIsAvailable(false);
          }
        } else {
          setIsAvailable(false);
        }
      } catch (err) {
        console.error("Erreur lors de la vérification:", err);
        setIsAvailable(false);
      } finally {
        setChecking(false);
      }
    },
    [user?.id]
  );

  const resetCheck = useCallback(() => {
    setIsAvailable(null);
    setChecking(false);
  }, []);

  return {
    checking,
    isAvailable,
    checkUsername,
    resetCheck,
  };
}
