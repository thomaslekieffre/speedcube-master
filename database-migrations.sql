-- Migration pour ajouter le support des sessions

-- 1. Créer la table sessions
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    puzzle_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Ajouter la colonne session_id à la table solves
ALTER TABLE public.solves 
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL;

-- 3. Modifier la colonne user_id de la table solves pour accepter du texte (si elle existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solves' AND column_name = 'user_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.solves ALTER COLUMN user_id TYPE TEXT;
    END IF;
END $$;

-- 4. Modifier toutes les autres tables qui utilisent user_id
DO $$ 
BEGIN
    -- challenge_attempts
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenge_attempts' AND column_name = 'user_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.challenge_attempts ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    -- favorites
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'favorites' AND column_name = 'user_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.favorites ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    -- personal_bests
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_bests' AND column_name = 'user_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.personal_bests ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    -- profiles
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.profiles ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    -- revision_items
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'revision_items' AND column_name = 'user_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.revision_items ALTER COLUMN user_id TYPE TEXT;
    END IF;
END $$;

-- 5. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_puzzle_type ON public.sessions(puzzle_type);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON public.sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_solves_session_id ON public.solves(session_id);

-- 6. Créer une contrainte unique pour une seule session active par utilisateur et puzzle
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_user_puzzle_active 
ON public.sessions(user_id, puzzle_type) 
WHERE is_active = true;

-- 7. Créer une fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Créer un trigger pour la table sessions
CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON public.sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Désactiver RLS sur toutes les tables
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.solves DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_bests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.algorithm_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_scrambles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenge_tops DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.algorithms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_sets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.method_moderation_notifications DISABLE ROW LEVEL SECURITY;

-- 10. Donner les droits standards aux rôles publics
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.solves TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_bests TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.algorithm_favorites TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenge_attempts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_scrambles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_challenge_tops TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.moderation_notifications TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.algorithms TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_methods TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_sets TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.method_moderation_notifications TO anon, authenticated;

-- 11. Créer une vue pour les statistiques de session
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
FROM public.sessions s
LEFT JOIN public.solves sv ON s.id = sv.session_id
GROUP BY s.id, s.name, s.puzzle_type, s.user_id, s.created_at;

-- 12. Donner les droits sur la vue
GRANT SELECT ON public.session_stats TO anon, authenticated;

-- 13. Fonction pour créer automatiquement une session lors du premier solve
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

-- 14. Créer le trigger pour la création automatique de session
CREATE TRIGGER create_session_on_first_solve
    BEFORE INSERT ON public.solves
    FOR EACH ROW
    WHEN (NEW.session_id IS NULL)
    EXECUTE FUNCTION create_default_session();

-- Commentaires pour documenter
COMMENT ON TABLE public.sessions IS 'Sessions de timer pour organiser les solves par utilisateur et puzzle';
COMMENT ON COLUMN public.sessions.name IS 'Nom de la session (ex: "Session matin", "Compétition")';
COMMENT ON COLUMN public.sessions.is_active IS 'Indique si c''est la session active pour ce puzzle';
COMMENT ON COLUMN public.solves.session_id IS 'Référence vers la session à laquelle appartient ce solve';
COMMENT ON FUNCTION create_default_session() IS 'Crée automatiquement une session par défaut lors du premier solve d''un utilisateur pour un puzzle';
