export interface Database {
  public: {
    Tables: {
      // Tables existantes
      solves: {
        Row: {
          id: string;
          user_id: string;
          puzzle_type: string;
          time: number;
          penalty: string;
          scramble: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          puzzle_type: string;
          time: number;
          penalty: string;
          scramble: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          puzzle_type?: string;
          time?: number;
          penalty?: string;
          scramble?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      personal_bests: {
        Row: {
          id: string;
          user_id: string;
          puzzle_type: string;
          time: number;
          penalty: string;
          scramble: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          puzzle_type: string;
          time: number;
          penalty: string;
          scramble: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          puzzle_type?: string;
          time?: number;
          penalty?: string;
          scramble?: string;
          created_at?: string;
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
      challenge_attempts: {
        Row: {
          id: string;
          user_id: string;
          time: number;
          penalty: string;
          challenge_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          time: number;
          penalty: string;
          challenge_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          time?: number;
          penalty?: string;
          challenge_date?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
          custom_avatar_url: string | null;
          wca_id: string | null;
          is_public: boolean;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
          custom_avatar_url?: string | null;
          wca_id?: string | null;
          is_public?: boolean;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
          custom_avatar_url?: string | null;
          wca_id?: string | null;
          is_public?: boolean;
        };
      };
      daily_scrambles: {
        Row: {
          id: string;
          challenge_date: string;
          scramble: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          challenge_date: string;
          scramble: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          challenge_date?: string;
          scramble?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_challenge_tops: {
        Row: {
          id: string;
          challenge_date: string;
          user_id: string;
          username: string;
          best_time: number;
          rank: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_date: string;
          user_id: string;
          username: string;
          best_time: number;
          rank: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          challenge_date?: string;
          user_id?: string;
          username?: string;
          best_time?: number;
          rank?: number;
          created_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
      };
      moderation_notifications: {
        Row: {
          id: string;
          algorithm_id: string;
          type: string;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          algorithm_id: string;
          type: string;
          message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          algorithm_id?: string;
          type?: string;
          message?: string | null;
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
          difficulty: string;
          description: string;
          scramble: string;
          solution: string;
          fingertricks: string;
          notes: string;
          alternatives: string[];
          created_at: string;
          updated_at: string;
          status: string;
          created_by: string;
          creator_username?: string;
          reviewed_by?: string;
          reviewed_at?: string;
          rejection_reason?: string;
        };
        Insert: {
          id?: string;
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
          alternatives?: string[];
          created_at?: string;
          updated_at?: string;
          status?: string;
          created_by: string;
          creator_username?: string;
          reviewed_by?: string;
          reviewed_at?: string;
          rejection_reason?: string;
        };
        Update: {
          id?: string;
          name?: string;
          notation?: string;
          puzzle_type?: string;
          method?: string;
          set_name?: string;
          difficulty?: string;
          description?: string;
          scramble?: string;
          solution?: string;
          fingertricks?: string;
          notes?: string;
          alternatives?: string[];
          created_at?: string;
          updated_at?: string;
          status?: string;
          created_by?: string;
          creator_username?: string;
          reviewed_by?: string;
          reviewed_at?: string;
          rejection_reason?: string;
        };
      };

      // Nouvelles tables pour les méthodes
      custom_methods: {
        Row: {
          id: string;
          name: string;
          puzzle_type: string;
          created_by: string;
          created_at: string;
          usage_count: number;
          description_markdown: string | null;
          cubing_notation_example: string | null;
          cube_visualization_data: any | null;
          algorithm_references: any | null;
          status: "draft" | "pending" | "approved" | "rejected";
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          is_public: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          puzzle_type: string;
          created_by: string;
          created_at?: string;
          usage_count?: number;
          description_markdown?: string | null;
          cubing_notation_example?: string | null;
          cube_visualization_data?: any | null;
          algorithm_references?: any | null;
          status?: "draft" | "pending" | "approved" | "rejected";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          is_public?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          puzzle_type?: string;
          created_by?: string;
          created_at?: string;
          usage_count?: number;
          description_markdown?: string | null;
          cubing_notation_example?: string | null;
          cube_visualization_data?: any | null;
          algorithm_references?: any | null;
          status?: "draft" | "pending" | "approved" | "rejected";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          is_public?: boolean;
          updated_at?: string;
        };
      };
      custom_sets: {
        Row: {
          id: string;
          name: string;
          method_id: string | null;
          created_by: string;
          created_at: string;
          usage_count: number;
          description_markdown: string | null;
          status: "draft" | "pending" | "approved" | "rejected";
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          is_public: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          method_id?: string | null;
          created_by: string;
          created_at?: string;
          usage_count?: number;
          description_markdown?: string | null;
          status?: "draft" | "pending" | "approved" | "rejected";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          is_public?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          method_id?: string | null;
          created_by?: string;
          created_at?: string;
          usage_count?: number;
          description_markdown?: string | null;
          status?: "draft" | "pending" | "approved" | "rejected";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          is_public?: boolean;
          updated_at?: string;
        };
      };
      method_moderation_notifications: {
        Row: {
          id: string;
          method_id: string;
          type: "report" | "review_needed" | "approval_request";
          message: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          method_id: string;
          type: "report" | "review_needed" | "approval_request";
          message?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          method_id?: string;
          type?: "report" | "review_needed" | "approval_request";
          message?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
    };
  };
}

// Types utilitaires pour les méthodes
export interface CustomMethod {
  id: string;
  name: string;
  puzzle_type: string;
  created_by: string;
  created_at: string;
  usage_count: number;
  description_markdown: string | null;
  cubing_notation_example: string | null;
  cube_visualization_data: CubeVisualizationData | null;
  algorithm_references: AlgorithmReference[] | null;
  status: "draft" | "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  is_public: boolean;
  updated_at: string;
}

export interface CustomSet {
  id: string;
  name: string;
  method_id: string | null;
  created_by: string;
  created_at: string;
  usage_count: number;
  description_markdown: string | null;
  status: "draft" | "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  is_public: boolean;
  updated_at: string;
}

export interface CubeVisualizationData {
  state?: string; // État du cube (notation cubing)
  moves?: string[]; // Séquence de mouvements
  puzzle_type: string;
  orientation?: string; // Orientation du cube
}

export interface AlgorithmReference {
  algorithm_id: string;
  name: string;
  notation: string;
  description?: string;
  order?: number; // Ordre d'affichage dans la méthode
}

export interface MethodModerationNotification {
  id: string;
  method_id: string;
  type: "report" | "review_needed" | "approval_request";
  message: string | null;
  created_by: string;
  created_at: string;
}
