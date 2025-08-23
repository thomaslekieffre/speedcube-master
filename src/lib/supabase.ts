import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Debug: vérifier les variables d'environnement
console.log("Supabase URL:", supabaseUrl ? "✅ Configuré" : "❌ Manquant");
console.log("Supabase Key:", supabaseAnonKey ? "✅ Configuré" : "❌ Manquant");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Variables d'environnement Supabase manquantes !");
  console.error("Vérifiez votre fichier .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  status: "pending" | "approved" | "rejected";
  created_by: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
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
