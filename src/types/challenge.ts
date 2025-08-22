export interface ChallengeAttempt {
  id: string;
  user_id: string;
  time: number;
  penalty: 'none' | 'plus2' | 'dnf';
  created_at: string;
  challenge_date: string; // Date du challenge (YYYY-MM-DD)
}

export interface ChallengeLeaderboardEntry {
  user_id: string;
  username: string;
  best_time: number;
  attempts_count: number;
  created_at: string;
}

export interface ChallengeStats {
  total_participants: number;
  average_time: number;
  best_time: number;
}
