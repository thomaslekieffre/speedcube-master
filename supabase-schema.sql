-- Schéma Supabase simple pour Speedcube Master
-- Pas de triggers, pas de RLS pour l'instant

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY, -- Clerk user ID
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create solves table
CREATE TABLE IF NOT EXISTS solves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk user ID
  puzzle_type TEXT NOT NULL,
  time INTEGER NOT NULL, -- in milliseconds
  penalty TEXT DEFAULT 'none' CHECK (penalty IN ('none', 'plus2', 'dnf')),
  scramble TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_solves_user_id ON solves(user_id);
CREATE INDEX IF NOT EXISTS idx_solves_puzzle_type ON solves(puzzle_type);
CREATE INDEX IF NOT EXISTS idx_solves_created_at ON solves(created_at);
CREATE INDEX IF NOT EXISTS idx_solves_user_puzzle ON solves(user_id, puzzle_type);
