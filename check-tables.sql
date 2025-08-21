-- Vérifier si les tables existent
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('solves', 'profiles');

-- Vérifier les permissions sur les tables
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('solves', 'profiles');

-- Vérifier les rôles et permissions
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name IN ('solves', 'profiles');

-- Vérifier si RLS est activé
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('solves', 'profiles');
