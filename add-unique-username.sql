-- Ajouter une contrainte unique sur le username
-- D'abord, on supprime les doublons existants (garder le plus récent)
DELETE FROM profiles 
WHERE id NOT IN (
  SELECT DISTINCT ON (username) id 
  FROM profiles 
  WHERE username IS NOT NULL 
  ORDER BY username, updated_at DESC
);

-- Ensuite, on ajoute la contrainte unique
ALTER TABLE profiles 
ADD CONSTRAINT unique_username UNIQUE (username);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
