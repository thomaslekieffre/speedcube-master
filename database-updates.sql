-- Script de mise à jour de la base de données pour le système de modération
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter les colonnes de modération à la table algorithms
ALTER TABLE algorithms 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS created_by TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Créer la table user_roles si elle n'existe pas
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Créer la table moderation_notifications si elle n'existe pas
CREATE TABLE IF NOT EXISTS moderation_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  algorithm_id UUID REFERENCES algorithms(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_algorithm', 'algorithm_approved', 'algorithm_rejected')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_algorithms_status ON algorithms(status);
CREATE INDEX IF NOT EXISTS idx_algorithms_created_by ON algorithms(created_by);
CREATE INDEX IF NOT EXISTS idx_algorithms_reviewed_by ON algorithms(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- 5. Mettre à jour les algorithmes existants pour avoir le statut 'approved'
UPDATE algorithms SET status = 'approved' WHERE status IS NULL;

-- 6. Créer un utilisateur modérateur de test (remplacez 'your-user-id' par l'ID de votre utilisateur)
-- INSERT INTO user_roles (user_id, role) VALUES ('your-user-id', 'moderator') ON CONFLICT (user_id) DO UPDATE SET role = 'moderator';

-- 7. Désactiver RLS et donner les droits standards (approche simple)
-- Désactiver RLS sur toutes les tables
ALTER TABLE algorithms DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE algorithm_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_scrambles DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenge_tops DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Donner les droits standards aux rôles publics
GRANT SELECT, INSERT, UPDATE, DELETE ON algorithms TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON algorithm_favorites TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON moderation_notifications TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON challenge_attempts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON daily_scrambles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON daily_challenge_tops TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO anon, authenticated;

-- Donner les droits sur les séquences (si elles existent)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 8. Fonction pour créer automatiquement un rôle utilisateur lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger pour appeler la fonction lors de l'inscription (si vous utilisez auth.users)
-- DÉCOMMENTEZ LES LIGNES SUIVANTES SI VOUS UTILISEZ LA TABLE auth.users DE SUPABASE
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Fonction pour notifier les modérateurs d'un nouvel algorithme
CREATE OR REPLACE FUNCTION notify_moderators_new_algorithm()
RETURNS trigger AS $$
BEGIN
  INSERT INTO moderation_notifications (algorithm_id, type, message)
  VALUES (new.id, 'new_algorithm', 'Nouvel algorithme "' || new.name || '" en attente de modération');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Trigger pour notifier les modérateurs
CREATE TRIGGER on_algorithm_created
  AFTER INSERT ON algorithms
  FOR EACH ROW EXECUTE PROCEDURE notify_moderators_new_algorithm();

-- 12. Fonction pour notifier le créateur du statut de son algorithme
CREATE OR REPLACE FUNCTION notify_algorithm_status_change()
RETURNS trigger AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    IF NEW.status = 'approved' THEN
      INSERT INTO moderation_notifications (algorithm_id, type, message)
      VALUES (new.id, 'algorithm_approved', 'Votre algorithme "' || new.name || '" a été approuvé !');
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO moderation_notifications (algorithm_id, type, message)
      VALUES (new.id, 'algorithm_rejected', 'Votre algorithme "' || new.name || '" a été rejeté. Raison: ' || COALESCE(new.rejection_reason, 'Aucune raison fournie'));
    END IF;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Trigger pour notifier les changements de statut
CREATE TRIGGER on_algorithm_status_changed
  AFTER UPDATE ON algorithms
  FOR EACH ROW EXECUTE PROCEDURE notify_algorithm_status_change();
