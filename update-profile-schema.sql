-- Ajouter les nouveaux champs au profil
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS custom_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS wca_id TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Créer une table pour les PB par puzzle
CREATE TABLE IF NOT EXISTS personal_bests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  puzzle_type TEXT NOT NULL,
  time INTEGER NOT NULL, -- in milliseconds
  penalty TEXT DEFAULT 'none' CHECK (penalty IN ('none', 'plus2', 'dnf')),
  scramble TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, puzzle_type)
);

-- Index pour les PB
CREATE INDEX IF NOT EXISTS idx_pb_user_id ON personal_bests(user_id);
CREATE INDEX IF NOT EXISTS idx_pb_puzzle_type ON personal_bests(puzzle_type);

-- Désactiver RLS pour les nouvelles tables
ALTER TABLE personal_bests DISABLE ROW LEVEL SECURITY;

-- Donner les permissions
GRANT ALL ON TABLE personal_bests TO anon, authenticated;
