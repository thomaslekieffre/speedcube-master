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
          bio?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string;
          avatar_url?: string;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
