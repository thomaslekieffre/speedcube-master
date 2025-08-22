// Fonction pour obtenir la date du jour au format YYYY-MM-DD
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// Scrambles de fallback valides pour 3x3
const FALLBACK_SCRAMBLES = [
  "R U R' U' R' F R2 U' R' U' R U R' F'",
  "F R U R' U' F' R U R' U' R' F R F'",
  "R U R' U R U2 R' F R U R' U' F'",
  "R U R' U' R' F R F' R U R' U' R' F R F'",
  "F R U R' U' F' U F R U R' U' F'",
  "R U R' U' R' F R F' U2 R U R' U' R' F R F'",
  "F R U R' U' F' U2 F R U R' U' F'",
  "R U R' U' R' F R F' R U R' U' R' F R F'",
  "F R U R' U' F' R U R' U' R' F R F'",
  "R U R' U R U2 R' F R U R' U' F' U2",
  "R U R' U' R' F R F' U F R U R' U' F'",
  "F R U R' U' F' U R U R' U' R' F R F'",
  "R U R' U' R' F R F' R U R' U' R' F R F' U2",
  "F R U R' U' F' U2 R U R' U' R' F R F'",
  "R U R' U R U2 R' F R U R' U' F' U'",
  "R U R' U' R' F R F' U' F R U R' U' F'",
  "F R U R' U' F' U' R U R' U' R' F R F'",
  "R U R' U' R' F R F' U2 F R U R' U' F'",
  "F R U R' U' F' R U R' U' R' F R F' U2",
  "R U R' U R U2 R' F R U R' U' F' U",
];

// Fonction pour générer un scramble basé sur une date
export function generateDailyScramble(date: string): string {
  // Utiliser la date comme seed pour avoir le même scramble pour la même date
  const seed = date.replace(/-/g, "");
  const numericSeed = parseInt(seed, 10);

  // Créer un générateur de nombres pseudo-aléatoires basé sur la date
  const seededRandom = (min: number, max: number) => {
    const x = Math.sin(numericSeed) * 10000;
    const random = x - Math.floor(x);
    return Math.floor(random * (max - min + 1)) + min;
  };

  // Sélectionner un scramble de manière déterministe
  const index = seededRandom(0, FALLBACK_SCRAMBLES.length - 1);
  return FALLBACK_SCRAMBLES[index];
}

// Fonction pour obtenir le scramble du jour (synchrone)
export function getDailyScramble(): string {
  const today = getTodayDate();
  return generateDailyScramble(today);
}

// Fonction pour vérifier si un scramble est pour aujourd'hui
export function isScrambleForToday(scramble: string, date: string): boolean {
  const today = getTodayDate();
  return date === today;
}

// Fonction pour calculer le temps restant jusqu'à minuit
export function getTimeRemaining(): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}
