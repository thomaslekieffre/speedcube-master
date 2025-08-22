import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import type { Database } from "@/lib/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type InsertProfile = Database["public"]["Tables"]["profiles"]["Insert"];
type UpdateProfile = Database["public"]["Tables"]["profiles"]["Update"];

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const loadProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Erreur lors du chargement du profil:", error);
        setError(error.message);
      } else if (error && error.code === "PGRST116") {
        // Profil n'existe pas, le créer

        await createProfile();
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Erreur inattendue:", err);
      setError("Erreur inattendue lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      const newProfile: InsertProfile = {
        id: user.id,
        username:
          user.username ||
          user.emailAddresses[0]?.emailAddress?.split("@")[0] ||
          `user_${user.id.slice(0, 8)}`,
        avatar_url: user.imageUrl,
        bio: "",
      };

      const { data, error } = await supabase
        .from("profiles")
        .insert(newProfile)
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la création du profil:", error);
        throw error;
      }

      setProfile(data);
      return data;
    } catch (err) {
      console.error("Erreur lors de la création du profil:", err);
      throw err;
    }
  };

  const updateProfile = async (updates: UpdateProfile) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la mise à jour:", error);
        throw error;
      }

      setProfile(data);
      return data;
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      throw err;
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refresh: loadProfile,
  };
}
