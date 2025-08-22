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

// Types pour Supabase
export interface Database {
  public: {
    Tables: {
      solves: {
        Row: {
          id: string;
          user_id: string; // Clerk user ID
          puzzle_type: string;
          time: number;
          penalty: "none" | "plus2" | "dnf";
          scramble: string;
          notes?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          puzzle_type: string;
          time: number;
          penalty?: "none" | "plus2" | "dnf";
          scramble: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          puzzle_type?: string;
          time?: number;
          penalty?: "none" | "plus2" | "dnf";
          scramble?: string;
          notes?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string; // Clerk user ID
          username?: string;
          avatar_url?: string;
          custom_avatar_url?: string;
          bio?: string;
          wca_id?: string;
          is_public?: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string;
          avatar_url?: string;
          custom_avatar_url?: string;
          bio?: string;
          wca_id?: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string;
          custom_avatar_url?: string;
          bio?: string;
          wca_id?: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      personal_bests: {
        Row: {
          id: string;
          user_id: string;
          puzzle_type: string;
          time: number;
          penalty: "none" | "plus2" | "dnf";
          scramble: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          puzzle_type: string;
          time: number;
          penalty?: "none" | "plus2" | "dnf";
          scramble: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          puzzle_type?: string;
          time?: number;
          penalty?: "none" | "plus2" | "dnf";
          scramble?: string;
          created_at?: string;
        };
      };
      algorithms: {
        Row: {
          id: string;
          name: string;
          notation: string;
          puzzle_type: string;
          method: string;
          set_name: string;
          difficulty: "beginner" | "intermediate" | "advanced" | "expert";
          description: string;
          scramble: string;
          solution: string;
          fingertricks?: string;
          notes?: string;
          alternatives?: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          notation: string;
          puzzle_type: string;
          method: string;
          set_name: string;
          difficulty: "beginner" | "intermediate" | "advanced" | "expert";
          description: string;
          scramble: string;
          solution: string;
          fingertricks?: string;
          notes?: string;
          alternatives?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          notation?: string;
          puzzle_type?: string;
          method?: string;
          set_name?: string;
          difficulty?: "beginner" | "intermediate" | "advanced" | "expert";
          description?: string;
          scramble?: string;
          solution?: string;
          fingertricks?: string;
          notes?: string;
          alternatives?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      algorithm_favorites: {
        Row: {
          id: string;
          user_id: string;
          algorithm_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          algorithm_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          algorithm_id?: string;
          created_at?: string;
        };
      };
    };
  };
}
