# 🎯 Fonctionnalité Sessions - Speedcube Master

## 📋 Vue d'ensemble

La fonctionnalité **Sessions** permet aux utilisateurs d'organiser leurs solves par sessions nommées. Chaque session peut contenir des solves pour un puzzle spécifique, facilitant l'organisation et l'analyse des performances.

## ✨ Fonctionnalités

### 🆕 Création de sessions

- **Nommage personnalisé** : Donnez un nom à vos sessions (ex: "Session matin", "Compétition", "Entraînement F2L")
- **Puzzle spécifique** : Chaque session est liée à un type de puzzle (3x3, 2x2, etc.)
- **Session active** : Une seule session active par puzzle à la fois

### 📊 Statistiques par session

- **Nombre de solves** : Compteur total des solves dans la session
- **Meilleur temps (PB)** : Le meilleur temps de la session
- **Moyenne** : Moyenne des temps de la session
- **Taux de DNF** : Nombre de DNF dans la session

### 🔄 Gestion des sessions

- **Activation** : Basculer entre les sessions existantes
- **Renommage** : Modifier le nom d'une session
- **Suppression** : Supprimer une session (les solves restent)
- **Export** : Exporter les solves d'une session spécifique

## 🎮 Utilisation

### Créer une nouvelle session

1. Allez sur la page **Timer**
2. Dans le panneau de droite, cliquez sur **"Nouvelle session"**
3. Entrez un nom pour votre session
4. Cliquez sur **"Créer"**

### Changer de session active

1. Dans la liste des sessions, cliquez sur l'icône ✓ à côté d'une session
2. Ou utilisez le menu déroulant (⚙️) et sélectionnez **"Activer"**

### Gérer les sessions

- **Renommer** : Menu ⚙️ → "Renommer"
- **Supprimer** : Menu ⚙️ → "Supprimer" (les solves ne sont pas supprimés)

## 🗄️ Structure de la base de données

### Table `sessions`

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    puzzle_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### Table `solves` (modifiée)

```sql
ALTER TABLE solves ADD COLUMN session_id UUID REFERENCES sessions(id);
```

### Vue `session_stats`

```sql
CREATE VIEW session_stats AS
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
```

### Fonction de création automatique de session

```sql
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

-- Trigger pour la création automatique
CREATE TRIGGER create_session_on_first_solve
    BEFORE INSERT ON public.solves
    FOR EACH ROW
    WHEN (NEW.session_id IS NULL)
    EXECUTE FUNCTION create_default_session();
```

## 🔧 Migration

Pour activer cette fonctionnalité, exécutez le script SQL dans `database-migrations.sql` :

```bash
# Dans votre base de données Supabase
psql -h your-project.supabase.co -U postgres -d postgres -f database-migrations.sql
```

## 🎨 Interface utilisateur

### Composants principaux

- **`SessionManager`** : Gestion des sessions avec création, activation, modification
- **`useSessions`** : Hook pour la gestion des sessions
- **`useSessionStats`** : Hook pour les statistiques des sessions

### Intégration dans le Timer

- Le gestionnaire de sessions est affiché dans le panneau de droite
- Les solves sont automatiquement associés à la session active
- Changement de session = changement de contexte des solves affichés

## 🚀 Cas d'usage

### 🏆 Compétition

- Créez une session "Compétition 2024"
- Tous vos solves de compétition seront dans cette session
- Analysez vos performances spécifiquement

### 📚 Entraînement

- Session "F2L lent" pour travailler la fluidité
- Session "OLL" pour pratiquer les algorithmes
- Session "PLL" pour les permutations

### 📊 Analyse

- Comparez vos sessions entre elles
- Identifiez vos forces et faiblesses
- Suivez votre progression par type d'entraînement

## 🔒 Sécurité

- **Aucune restriction RLS** : Toutes les tables sont accessibles sans politiques de sécurité
- **Droits publics** : Les rôles `anon` et `authenticated` ont tous les droits (SELECT, INSERT, UPDATE, DELETE)
- **Création automatique** : Une session par défaut est créée automatiquement lors du premier solve
- **Compatibilité Clerk** : Les IDs utilisateur sont stockés en tant que texte pour être compatibles avec Clerk

## 🎯 Prochaines améliorations

- [ ] **Filtres avancés** : Filtrer les solves par date, temps, etc.
- [ ] **Comparaison de sessions** : Graphiques comparatifs
- [ ] **Templates de sessions** : Sessions prédéfinies
- [ ] **Partage de sessions** : Partager des sessions avec d'autres utilisateurs
- [ ] **Tags** : Ajouter des tags aux sessions pour une meilleure organisation
