import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Variables d'environnement Supabase manquantes !");
  console.error("Vérifiez votre fichier .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction pour créer un client Supabase avec l'ID utilisateur Clerk
export const createSupabaseClientWithUser = async (userId: string) => {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        "X-User-ID": userId,
      },
    },
  });

  // Configurer l'ID utilisateur dans la session PostgreSQL pour les politiques RLS
  try {
    await client.rpc("set_clerk_user_id", { user_id: userId });
  } catch (error) {
    console.warn("Impossible de configurer l'ID utilisateur pour RLS:", error);
  }

  return client;
};

// Fonction pour configurer l'ID utilisateur Clerk dans Supabase
export const configureSupabaseForUser = (userId: string) => {
  // Cette fonction n'est plus nécessaire car nous utilisons les headers HTTP
};

// Types pour les algorithmes avec système de modération
export interface Algorithm {
  id: string;
  name: string;
  notation: string;
  puzzle_type: string;
  method: string;
  set_name: string;
  difficulty: string;
  description: string;
  scramble: string;
  solution: string;
  fingertricks: string;
  notes: string;
  alternatives: string[];
  status: "pending" | "approved" | "rejected" | "modified";
  created_by: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  modification_count: number;
  last_modified_at?: string;
  last_modified_by?: string;
}

export interface AlgorithmModification {
  id: string;
  algorithm_id: string;
  modified_by: string;
  modified_at: string;
  previous_data: {
    name?: string;
    notation?: string;
    description?: string;
    scramble?: string;
    solution?: string;
    fingertricks?: string;
    notes?: string;
    alternatives?: string[];
    difficulty?: string;
  };
  new_data: {
    name?: string;
    notation?: string;
    description?: string;
    scramble?: string;
    solution?: string;
    fingertricks?: string;
    notes?: string;
    alternatives?: string[];
    difficulty?: string;
  };
  modification_reason?: string;
}

// Types pour les rôles utilisateur
export interface UserRole {
  id: string;
  user_id: string;
  role: "user" | "moderator" | "admin";
  created_at: string;
}

// Types pour les notifications de modération
export interface ModerationNotification {
  id: string;
  algorithm_id: string;
  type: "new_algorithm" | "algorithm_approved" | "algorithm_rejected";
  message: string;
  created_at: string;
}
