import { useState, useEffect } from "react";
import { createSupabaseClientWithUser } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import type { Database } from "@/types/database";

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
      console.log("🔄 Chargement du profil pour:", user.id);

      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = await createSupabaseClientWithUser(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("❌ Erreur lors du chargement du profil:", error);
        setError(error.message);
      } else if (error && error.code === "PGRST116") {
        // Profil n'existe pas, le créer
        console.log("📝 Profil non trouvé, création automatique...");
        await createProfile();
      } else {
        console.log("✅ Profil chargé:", data);
        setProfile(data);
      }
    } catch (err) {
      console.error("❌ Erreur inattendue:", err);
      setError("Erreur inattendue lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      console.log("🔄 Création automatique du profil pour:", user.id);

      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = await createSupabaseClientWithUser(user.id);

      const username =
        user.username ||
        user.emailAddresses[0]?.emailAddress?.split("@")[0] ||
        `user_${user.id.slice(0, 8)}`;

      console.log("📝 Création du profil avec username:", username);

      // Utiliser la fonction RPC pour créer le profil
      const { data, error } = await supabase.rpc("create_user_profile", {
        p_user_id: user.id,
        p_username: username,
        p_avatar_url: user.imageUrl,
        p_bio: "",
        p_is_public: true,
      });

      if (error) {
        console.error("❌ Erreur lors de la création du profil:", error);
        setError(`Erreur lors de la création: ${error.message}`);
        throw error;
      }

      console.log("✅ Profil créé avec succès:", data);
      setProfile(data);
      return data;
    } catch (err) {
      console.error("❌ Erreur lors de la création du profil:", err);
      setError("Erreur lors de la création du profil");
      throw err;
    }
  };

  const updateProfile = async (updates: UpdateProfile) => {
    if (!user) return;

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = await createSupabaseClientWithUser(user.id);

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
