import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createSupabaseClientWithUser } from "@/lib/supabase";

export interface CustomMethod {
  id: string;
  name: string;
  puzzle_type: string;
  created_by: string;
  created_at: string;
  usage_count: number;
  creator_username?: string;
}

export interface CustomSet {
  id: string;
  name: string;
  method_id?: string;
  created_by: string;
  created_at: string;
  usage_count: number;
  creator_username?: string;
}

export function useCustomMethodsSets() {
  const { user } = useUser();
  const [customMethods, setCustomMethods] = useState<CustomMethod[]>([]);
  const [customSets, setCustomSets] = useState<CustomSet[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les méthodes personnalisées
  const loadCustomMethods = async (puzzleType?: string) => {
    if (!user?.id) {
      setCustomMethods([]);
      return;
    }

    try {
      const supabase = createSupabaseClientWithUser(user.id);

      let query = supabase
        .from("custom_methods")
        .select("*")
        .order("usage_count", { ascending: false });

      if (puzzleType) {
        query = query.eq("puzzle_type", puzzleType);
      }

      const { data, error } = await query;
      if (error) {
        // Si la table n'existe pas encore, on retourne un tableau vide
        if (
          error.code === "PGRST200" ||
          error.message.includes('relation "custom_methods" does not exist')
        ) {
          setCustomMethods([]);
          return;
        }
        throw error;
      }

      const methodsWithUsernames = (data || []).map((method) => ({
        ...method,
        creator_username: method.created_by?.substring(0, 8) || "Utilisateur",
      }));

      setCustomMethods(methodsWithUsernames);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des méthodes personnalisées:",
        error
      );
      setCustomMethods([]);
    }
  };

  // Charger les sets personnalisés
  const loadCustomSets = async (methodName?: string) => {
    if (!user?.id) {
      setCustomSets([]);
      return;
    }

    try {
      const supabase = createSupabaseClientWithUser(user.id);

      let query = supabase
        .from("custom_sets")
        .select("*")
        .order("usage_count", { ascending: false });

      if (methodName) {
        // Si c'est une méthode personnalisée, filtrer par method_id
        const method = customMethods.find((m) => m.name === methodName);
        if (method) {
          query = query.eq("method_id", method.id);
        }
      }

      const { data, error } = await query;
      if (error) {
        // Si la table n'existe pas encore, on retourne un tableau vide
        if (
          error.code === "PGRST200" ||
          error.message.includes('relation "custom_sets" does not exist')
        ) {
          setCustomSets([]);
          return;
        }
        throw error;
      }

      const setsWithUsernames = (data || []).map((set) => ({
        ...set,
        creator_username: set.created_by?.substring(0, 8) || "Utilisateur",
      }));

      setCustomSets(setsWithUsernames);
    } catch (error) {
      console.error("Erreur lors du chargement des sets personnalisés:", error);
      setCustomSets([]);
    }
  };

  // Créer une nouvelle méthode personnalisée
  const createCustomMethod = async (name: string, puzzleType: string) => {
    if (!user?.id) throw new Error("Utilisateur non connecté");

    try {
      console.log("Création méthode:", { name, puzzleType, userId: user.id });
      const supabase = createSupabaseClientWithUser(user.id);

      const { data, error } = await supabase
        .from("custom_methods")
        .insert({
          name: name.trim(),
          puzzle_type: puzzleType,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }

      console.log("Méthode créée:", data);
      await loadCustomMethods(puzzleType);
      return data;
    } catch (error) {
      console.error("Erreur lors de la création de la méthode:", error);
      throw error;
    }
  };

  // Créer un nouveau set personnalisé
  const createCustomSet = async (name: string, methodName?: string) => {
    if (!user?.id) throw new Error("Utilisateur non connecté");

    try {
      let methodId = null;
      if (methodName && methodName !== "custom") {
        // Chercher dans les méthodes existantes
        const method = customMethods.find((m) => m.name === methodName);
        methodId = method?.id;
      }

      const insertData: any = {
        name: name.trim(),
        created_by: user.id,
      };

      // Seulement ajouter method_id s'il existe
      if (methodId) {
        insertData.method_id = methodId;
      }

      console.log("Création set:", {
        name,
        methodName,
        methodId,
        userId: user.id,
        insertData,
      });

      const supabase = createSupabaseClientWithUser(user.id);

      const { data, error } = await supabase
        .from("custom_sets")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }

      console.log("Set créé:", data);
      await loadCustomSets(methodName);
      return data;
    } catch (error) {
      console.error("Erreur lors de la création du set:", error);
      throw error;
    }
  };

  // Charger au montage
  useEffect(() => {
    if (user?.id) {
      loadCustomMethods();
      loadCustomSets();
    }
    setLoading(false);
  }, [user?.id]);

  return {
    customMethods,
    customSets,
    loading,
    loadCustomMethods,
    loadCustomSets,
    createCustomMethod,
    createCustomSet,
  };
}
