-- Script de migration complet pour les sessions avec compatibilité Clerk

-- 1. Supprimer toutes les dépendances existantes
DROP VIEW IF EXISTS public.session_stats;
DROP TRIGGER IF EXISTS create_session_on_first_solve ON public.solves;
DROP FUNCTION IF EXISTS create_default_session();

-- 2. Supprimer toutes les contraintes de clé étrangère vers auth.users
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.table_name, tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
        AND tc.table_schema = 'public'
    ) LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.table_name) || 
                ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- 3. Modifier toutes les colonnes user_id de UUID vers TEXT
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND column_name = 'user_id'
        AND data_type = 'uuid'
    ) LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.table_name) || 
                ' ALTER COLUMN ' || quote_ident(r.column_name) || ' TYPE TEXT';
    END LOOP;
END $$;

-- 4. Créer la table sessions si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    puzzle_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Ajouter la colonne session_id à la table solves si elle n'existe pas
ALTER TABLE public.solves 
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL;

-- 6. Créer les index nécessaires
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_puzzle_type ON public.sessions(puzzle_type);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON public.sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_user_puzzle_active ON public.sessions(user_id, puzzle_type, is_active);
CREATE INDEX IF NOT EXISTS idx_solves_session_id ON public.solves(session_id);

-- 7. Créer une contrainte unique pour une seule session active par utilisateur et puzzle
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_user_puzzle_active_unique 
ON public.sessions(user_id, puzzle_type) 
WHERE is_active = true;

-- 8. Créer une fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Créer un trigger pour la table sessions
DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.sessions;
CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON public.sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Désactiver RLS sur toutes les tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    ) LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.table_name) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- 11. Donner les droits standards aux rôles publics
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    ) LOOP
        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.' || quote_ident(r.table_name) || ' TO anon, authenticated';
    END LOOP;
END $$;

-- 12. Créer la fonction pour créer automatiquement une session
CREATE OR REPLACE FUNCTION create_default_session()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si l'utilisateur a déjà une session active pour ce puzzle
    IF NOT EXISTS (
        SELECT 1 FROM public.sessions 
        WHERE user_id = NEW.user_id 
        AND puzzle_type = NEW.puzzle_type 
        AND is_active = true
    ) THEN
        -- Créer une session par défaut
        INSERT INTO public.sessions (user_id, name, puzzle_type, is_active)
        VALUES (NEW.user_id, 'Session par défaut', NEW.puzzle_type, true);
        
        -- Mettre à jour le solve avec la session créée
        NEW.session_id = (SELECT id FROM public.sessions 
                         WHERE user_id = NEW.user_id 
                         AND puzzle_type = NEW.puzzle_type 
                         AND is_active = true 
                         ORDER BY created_at DESC LIMIT 1);
    ELSE
        -- Utiliser la session active existante
        NEW.session_id = (SELECT id FROM public.sessions 
                         WHERE user_id = NEW.user_id 
                         AND puzzle_type = NEW.puzzle_type 
                         AND is_active = true);
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. Créer le trigger pour la création automatique de session
CREATE TRIGGER create_session_on_first_solve
    BEFORE INSERT ON public.solves
    FOR EACH ROW
    WHEN (NEW.session_id IS NULL)
    EXECUTE FUNCTION create_default_session();

-- 14. Créer la vue session_stats
CREATE OR REPLACE VIEW session_stats AS
SELECT
    s.id as session_id,
    s.name as session_name,
    s.puzzle_type,
    s.user_id,
    COUNT(sv.id) as total_solves,
    MIN(CASE WHEN sv.penalty != 'dnf' THEN sv.time END) as best_time,
    AVG(CASE WHEN sv.penalty != 'dnf' THEN sv.time END) as average_time,
    COUNT(CASE WHEN sv.penalty = 'dnf' THEN 1 END) as dnf_count,
    s.created_at as session_created_at,
    MAX(sv.created_at) as last_solve_at
FROM sessions s
LEFT JOIN solves sv ON s.id = sv.session_id
GROUP BY s.id, s.name, s.puzzle_type, s.user_id, s.created_at;

-- 15. Donner les droits sur la vue
GRANT SELECT ON public.session_stats TO anon, authenticated;

-- Commentaires pour documenter
COMMENT ON TABLE public.sessions IS 'Sessions de timer pour organiser les solves par utilisateur et puzzle';
COMMENT ON COLUMN public.sessions.name IS 'Nom de la session (ex: "Session matin", "Compétition")';
COMMENT ON COLUMN public.sessions.is_active IS 'Indique si c''est la session active pour ce puzzle';
COMMENT ON COLUMN public.solves.session_id IS 'Référence vers la session à laquelle appartient ce solve';
COMMENT ON FUNCTION create_default_session() IS 'Crée automatiquement une session par défaut lors du premier solve d''un utilisateur pour un puzzle';
