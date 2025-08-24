# Configuration du système de mélanges quotidiens

## Vue d'ensemble

Le système de mélanges quotidiens génère automatiquement un mélange officiel 3x3 à la demande et le sauvegarde en base de données. Tous les utilisateurs voient le même mélange pour le même jour.

## Architecture

### Composants principaux

1. **API Route** (`/api/daily-scramble`) - Récupère ou génère le mélange du jour
2. **Hook** (`useDailyScramble`) - Gère l'état du mélange côté client
3. **Lib** (`daily-scramble.ts`) - Logique de génération et sauvegarde
4. **Bibliothèque scrambled** - Génération de mélanges officiels 3x3

### Base de données

Table `daily_scrambles` :

- `challenge_date` (date) - Date du challenge
- `scramble` (text) - Mélange officiel (20 mouvements)
- `created_at` (timestamptz) - Date de création
- `updated_at` (timestamptz) - Date de mise à jour

## Fonctionnement

### Génération à la demande

1. Le premier utilisateur du jour visite la page de défi
2. L'API vérifie s'il existe un mélange pour aujourd'hui
3. Si aucun mélange n'existe, un nouveau est généré via la bibliothèque scrambled
4. Le mélange est sauvegardé en base de données

### Récupération côté client

1. L'utilisateur visite la page de défi
2. Le hook `useDailyScramble` appelle `/api/daily-scramble`
3. Si aucun mélange n'existe pour aujourd'hui, un nouveau est généré
4. Le mélange est affiché à l'utilisateur

### Cohérence

- Tous les utilisateurs voient le même mélange pour le même jour
- Le mélange change automatiquement à minuit
- Les tentatives se réinitialisent automatiquement

### Fallback

Si la bibliothèque scrambled n'est pas disponible :

- Utilisation de mélanges de fallback prédéfinis (25 mélanges officiels)
- Logs d'erreur pour debugging
- Continuité de service garantie

## Tests

### Test manuel

```bash
# Tester la récupération
curl -X GET https://your-domain.com/api/daily-scramble

# Forcer la régénération
curl -X POST https://your-domain.com/api/daily-scramble \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

### Test de récupération

```bash
# Vérifier qu'un mélange existe pour aujourd'hui
curl -X GET https://your-domain.com/api/daily-scramble | jq '.scramble'
```

## Dépannage

### Problèmes courants

1. **Mélange non généré** :

   - Vérifier les logs de l'API
   - Tester manuellement l'endpoint
   - Vérifier que la bibliothèque scrambled est installée

2. **Erreur scrambled** :

   - Vérifier l'installation de la bibliothèque : `pnpm add scrambled`
   - Vérifier les logs d'erreur
   - Les fallbacks devraient prendre le relais

3. **Erreur base de données** :
   - Vérifier la connexion Supabase
   - Vérifier les permissions de la table
   - Vérifier la structure de la table

### Commandes de debug

```bash
# Vérifier l'état de la table
psql -h your-supabase-host -U postgres -d postgres -c "SELECT * FROM daily_scrambles ORDER BY challenge_date DESC LIMIT 5;"

# Tester la bibliothèque scrambled directement
node -e "const { generateScrambleSync } = require('scrambled'); console.log(generateScrambleSync(20, 3));"

# Tester l'API de génération
curl -X POST http://localhost:3000/api/daily-scramble \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```
