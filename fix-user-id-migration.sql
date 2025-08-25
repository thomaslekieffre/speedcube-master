-- Script pour corriger le problème des IDs utilisateur (Clerk vs Supabase)

-- 1. Supprimer les vues et triggers qui dépendent des colonnes user_id
DROP VIEW IF EXISTS public.session_stats;
DROP TRIGGER IF EXISTS create_session_on_first_solve ON public.solves;
DROP FUNCTION IF EXISTS create_default_session();

-- 2. Supprimer les contraintes de clé étrangère qui lient user_id à auth.users
DO $$ 
BEGIN
    -- Supprimer la contrainte sur sessions si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sessions_user_id_fkey' 
        AND table_name = 'sessions'
    ) THEN
        ALTER TABLE public.sessions DROP CONSTRAINT sessions_user_id_fkey;
    END IF;
    
    -- Supprimer d'autres contraintes similaires si elles existent
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'solves_user_id_fkey' 
        AND table_name = 'solves'
    ) THEN
        ALTER TABLE public.solves DROP CONSTRAINT solves_user_id_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_user_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'personal_bests_user_id_fkey' 
        AND table_name = 'personal_bests'
    ) THEN
        ALTER TABLE public.personal_bests DROP CONSTRAINT personal_bests_user_id_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'challenge_attempts_user_id_fkey' 
        AND table_name = 'challenge_attempts'
    ) THEN
        ALTER TABLE public.challenge_attempts DROP CONSTRAINT challenge_attempts_user_id_fkey;
    END IF;
END $$;

-- 3. Modifier la table sessions pour accepter du texte au lieu d'UUID
ALTER TABLE public.sessions ALTER COLUMN user_id TYPE TEXT;

-- 4. Modifier la table solves pour accepter du texte au lieu d'UUID (si elle existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solves' AND column_name = 'user_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.solves ALTER COLUMN user_id TYPE TEXT;
    END IF;
END $$;

-- 5. Modifier toutes les autres tables qui utilisent user_id
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

-- 6. Modifier toutes les autres tables qui utilisent user_id
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

-- 7. Recréer les index si nécessaire
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_puzzle_type ON public.sessions(puzzle_type);
CREATE INDEX IF NOT EXISTS idx_sessions_user_puzzle_active ON public.sessions(user_id, puzzle_type, is_active);

-- 8. Recréer la fonction pour créer automatiquement une session
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

-- 9. Recréer le trigger pour la création automatique de session
CREATE TRIGGER create_session_on_first_solve
    BEFORE INSERT ON public.solves
    FOR EACH ROW
    WHEN (NEW.session_id IS NULL)
    EXECUTE FUNCTION create_default_session();

-- 10. Recréer la vue session_stats
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

-- 11. Donner les droits sur la vue
GRANT SELECT ON public.session_stats TO anon, authenticated;
