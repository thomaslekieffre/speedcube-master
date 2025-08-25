# 🎯 Speedcube Master

> **La plateforme de référence pour tous les speedcubeurs**  
> Timer professionnel, algorithmes intelligents, révision espacée et défis quotidiens pour tous les puzzles WCA.

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)

---

## ✨ Fonctionnalités

### 🕐 **Timer Professionnel**

- Timer de compétition avec inspection 15 secondes
- Gestion des pénalités (+2, DNF)
- Sessions multiples et organisées
- Statistiques avancées (PB, moyennes, tendances)
- Scrambles officiels pour tous les puzzles WCA

### 🧠 **Révision Intelligente**

- Système de révision espacée pour les algorithmes
- Progression automatique basée sur la performance
- Visualisation 3D des algorithmes
- Favoris et notes personnalisées
- Suivi de l'apprentissage par puzzle et méthode

### 📊 **Dashboard Avancé**

- Graphiques interactifs de progression
- Analyse des moyennes et records
- Historique complet des solves
- Statistiques par session et par puzzle
- Tendances et objectifs personnalisés

### 🏆 **Défis Quotidiens**

- Scramble unique quotidien pour tous les utilisateurs
- 3 tentatives maximum par jour
- Classement en temps réel
- Badges et récompenses
- Fenêtre de 24h pour participer

### 👥 **Communauté**

- Profils publics avec statistiques
- Partage de profils avec images OG
- Système de badges et achievements
- Classements par puzzle et méthode

---

## 🛠️ Stack Technique

### **Frontend**

- **Next.js 15** - Framework React avec App Router
- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS 4** - Framework CSS utilitaire
- **shadcn/ui** - Composants UI réutilisables
- **Framer Motion** - Animations fluides
- **Lucide React** - Icônes modernes

### **Backend & Base de Données**

- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Base de données relationnelle
- **Row Level Security (RLS)** - Sécurité des données
- **Real-time** - Mises à jour en temps réel

### **Authentification & Autorisation**

- **Clerk** - Authentification moderne
- **Rôles utilisateur** - Admin, modérateur, utilisateur
- **Profils publics/privés** - Contrôle de la visibilité

### **Outils & Bibliothèques**

- **cubing** - Bibliothèque de puzzles WCA
- **scrambled** - Génération de scrambles officiels
- **Recharts** - Graphiques et visualisations
- **Sonner** - Notifications toast
- **next-themes** - Gestion des thèmes

---

## 🚀 Installation

### Prérequis

- **Node.js** 18+
- **pnpm** (recommandé) ou npm
- **Compte Supabase** pour la base de données
- **Compte Clerk** pour l'authentification

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/speedcube-master.git
cd speedcube-master
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configuration de l'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_supabase

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=votre_clé_publique_clerk
CLERK_SECRET_KEY=votre_clé_secrète_clerk
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 4. Configuration de la base de données

Exécutez les migrations Supabase pour créer les tables nécessaires :

```sql
-- Tables principales
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE solves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  puzzle_type TEXT NOT NULL,
  time INTEGER NOT NULL,
  penalty TEXT DEFAULT 'none',
  scramble TEXT,
  notes TEXT,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Et bien d'autres tables...
```

### 5. Lancer le serveur de développement

```bash
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📁 Structure du Projet

```
speedcube-master/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── (pages)/           # Pages de l'application
│   │   │   ├── timer/         # Timer et solves
│   │   │   ├── algos/         # Algorithmes et révision
│   │   │   ├── dashboard/     # Statistiques et progression
│   │   │   ├── challenge/     # Défis quotidiens
│   │   │   ├── profile/       # Profils utilisateurs
│   │   │   └── admin/         # Administration
│   │   ├── api/               # Routes API
│   │   └── _components/       # Composants partagés
│   ├── components/            # Composants réutilisables
│   ├── hooks/                 # Hooks personnalisés
│   ├── lib/                   # Utilitaires et configurations
│   └── types/                 # Types TypeScript
├── docs/                      # Documentation
├── public/                    # Assets statiques
└── package.json
```

---

## 🎮 Utilisation

### **Première visite**

1. Créez un compte ou connectez-vous
2. Choisissez vos puzzles principaux
3. Définissez vos objectifs de progression
4. Commencez par faire quelques solves !

### **Timer**

- Appuyez sur **Espace** pour démarrer/arrêter
- **Inspection** : 15 secondes automatiques
- **Pénalités** : +2 et DNF disponibles
- **Sessions** : Organisez vos solves par session

### **Algorithmes**

- **Recherche** : Trouvez rapidement vos algos
- **Filtres** : Par puzzle, méthode, difficulté
- **Révision** : Système de répétition espacée
- **Visualisation** : Voir les algos en 3D

### **Dashboard**

- **Statistiques** : PB, moyennes, tendances
- **Graphiques** : Progression sur 30 jours
- **Objectifs** : Suivez vos améliorations
- **Révision** : Algos à réviser aujourd'hui

---

## 🔧 Scripts Disponibles

```bash
# Développement
pnpm dev              # Serveur de développement avec Turbopack
pnpm build            # Build de production
pnpm start            # Serveur de production
pnpm lint             # Vérification du code

# Base de données
pnpm db:generate      # Générer les types TypeScript
pnpm db:push          # Pousser les migrations
pnpm db:reset         # Reset de la base de données
```

---

## 🎨 Design System

### **Couleurs**

- **Background** : `#0B0F1A` (Dark par défaut)
- **Primary** : `#2563EB` (Bleu)
- **Accent** : `#22C55E` (Vert)
- **Warning** : `#F59E0B` (Orange)
- **Danger** : `#EF4444` (Rouge)

### **Typographie**

- **Inter** : Police principale (400/600/800)
- **JetBrains Mono** : Timer et chiffres

### **Animations**

- **Framer Motion** : Transitions fluides
- **Micro-animations** : Feedback utilisateur
- **Hover effects** : Interactions enrichies

---

## 🌐 Internationalisation

Le projet supporte le **français** et l'**anglais** avec :

- Traduction complète de l'interface
- Micro-copy optimisée pour l'UX
- Support des formats de temps locaux

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. Créez une **branche** pour votre fonctionnalité
3. **Commit** vos changements
4. **Push** vers la branche
5. Ouvrez une **Pull Request**

### **Guidelines**

- Respectez les conventions de code
- Ajoutez des tests si nécessaire
- Documentez les nouvelles fonctionnalités
- Suivez le design system existant

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- **WCA** pour les standards de compétition
- **Cubing.js** pour la bibliothèque de puzzles
- **Supabase** pour l'infrastructure backend
- **Clerk** pour l'authentification
- **shadcn/ui** pour les composants

---

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/votre-username/speedcube-master/issues)
- **Discussions** : [GitHub Discussions](https://github.com/votre-username/speedcube-master/discussions)
- **Email** : contact@speedcube-master.com

---

<div align="center">

**🎯 Prêt à maîtriser le speedcubing ?**

[Commencer maintenant](https://speedcube-master.com) | [Documentation](https://docs.speedcube-master.com)

</div>
