-- Supprimer les tables existantes si elles existent
DROP TABLE IF EXISTS solves CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Recréer la table profiles
CREATE TABLE profiles (
  id TEXT PRIMARY KEY, -- Clerk user ID
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recréer la table solves
CREATE TABLE solves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk user ID
  puzzle_type TEXT NOT NULL,
  time INTEGER NOT NULL, -- in milliseconds
  penalty TEXT DEFAULT 'none' CHECK (penalty IN ('none', 'plus2', 'dnf')),
  scramble TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);git 

-- Créer les index
CREATE INDEX idx_solves_user_id ON solves(user_id);
CREATE INDEX idx_solves_puzzle_type ON solves(puzzle_type);
CREATE INDEX idx_solves_created_at ON solves(created_at);
CREATE INDEX idx_solves_user_puzzle ON solves(user_id, puzzle_type);

-- Désactiver RLS
ALTER TABLE solves DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Donner toutes les permissions à anon et authenticated
GRANT ALL ON TABLE solves TO anon, authenticated;
GRANT ALL ON TABLE profiles TO anon, authenticated;

-- Vérifier que tout est créé
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('solves', 'profiles');
