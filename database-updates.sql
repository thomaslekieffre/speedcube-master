-- Table pour les méthodes personnalisées
CREATE TABLE IF NOT EXISTS custom_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  puzzle_type TEXT NOT NULL,
  created_by TEXT NOT NULL, -- Utilise Clerk user ID (TEXT)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0
);

-- Table pour les sets personnalisés
CREATE TABLE IF NOT EXISTS custom_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  method_id UUID REFERENCES custom_methods(id) ON DELETE CASCADE NULL,
  created_by TEXT NOT NULL, -- Utilise Clerk user ID (TEXT)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0
);

-- Désactiver RLS sur les nouvelles tables
ALTER TABLE public.custom_methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_sets DISABLE ROW LEVEL SECURITY;

-- Donner les droits standards
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_methods TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_sets TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Fonction pour incrémenter le compteur d'usage des méthodes
CREATE OR REPLACE FUNCTION increment_method_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si la méthode existe dans custom_methods et incrémenter
  UPDATE custom_methods 
  SET usage_count = usage_count + 1 
  WHERE name = NEW.method;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour incrémenter le compteur d'usage des sets
CREATE OR REPLACE FUNCTION increment_set_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si le set existe dans custom_sets et incrémenter
  UPDATE custom_sets 
  SET usage_count = usage_count + 1 
  WHERE name = NEW.set_name;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer les triggers existants s'ils existent
DROP TRIGGER IF EXISTS trigger_increment_method_usage ON algorithms;
DROP TRIGGER IF EXISTS trigger_increment_set_usage ON algorithms;

-- Triggers pour incrémenter automatiquement les compteurs
CREATE TRIGGER trigger_increment_method_usage
  AFTER INSERT ON algorithms
  FOR EACH ROW
  EXECUTE FUNCTION increment_method_usage();

CREATE TRIGGER trigger_increment_set_usage
  AFTER INSERT ON algorithms
  FOR EACH ROW
  EXECUTE FUNCTION increment_set_usage();
