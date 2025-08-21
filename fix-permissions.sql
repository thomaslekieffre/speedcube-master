-- Désactiver RLS temporairement pour tester
ALTER TABLE solves DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Vérifier que les tables existent
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('solves', 'profiles');

-- Vérifier la structure de la table solves
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'solves' AND table_schema = 'public';
