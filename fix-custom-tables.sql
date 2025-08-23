-- Script pour corriger les tables custom_methods et custom_sets
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Supprimer les tables existantes si elles ont la mauvaise structure
DROP TABLE IF EXISTS custom_sets CASCADE;
DROP TABLE IF EXISTS custom_methods CASCADE;

-- 2. Recréer les tables avec la bonne structure
CREATE TABLE custom_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  puzzle_type TEXT NOT NULL,
  created_by TEXT NOT NULL, -- Utilise Clerk user ID (TEXT)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0
);

CREATE TABLE custom_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  method_id UUID REFERENCES custom_methods(id) ON DELETE CASCADE NULL,
  created_by TEXT NOT NULL, -- Utilise Clerk user ID (TEXT)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0
);

-- 3. Désactiver RLS
ALTER TABLE public.custom_methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_sets DISABLE ROW LEVEL SECURITY;

-- 4. Donner les droits standards
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_methods TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_sets TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 5. Recréer les fonctions et triggers
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

-- 6. Supprimer et recréer les triggers
DROP TRIGGER IF EXISTS trigger_increment_method_usage ON algorithms;
DROP TRIGGER IF EXISTS trigger_increment_set_usage ON algorithms;

CREATE TRIGGER trigger_increment_method_usage
  AFTER INSERT ON algorithms
  FOR EACH ROW
  EXECUTE FUNCTION increment_method_usage();

CREATE TRIGGER trigger_increment_set_usage
  AFTER INSERT ON algorithms
  FOR EACH ROW
  EXECUTE FUNCTION increment_set_usage();

-- 7. Vérifier la structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('custom_methods', 'custom_sets')
ORDER BY table_name, ordinal_position;
