// Fonction pour obtenir la date du jour au format YYYY-MM-DD
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

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

  // Utiliser directement le fallback pour l'instant
  return generateFallbackScramble(seededRandom);
}

// Fallback scramble si cubing.js ne fonctionne pas
function generateFallbackScramble(
  random: (min: number, max: number) => number
): string {
  const moves = ["R", "L", "U", "D", "F", "B"];
  const modifiers = ["", "'", "2"];
  const scrambleLength = 20;

  let scramble = "";
  let lastMove = "";

  for (let i = 0; i < scrambleLength; i++) {
    let move;
    do {
      move = moves[random(0, moves.length - 1)];
    } while (move === lastMove); // Éviter les répétitions

    const modifier = modifiers[random(0, modifiers.length - 1)];
    scramble += move + modifier + " ";
    lastMove = move;
  }

  return scramble.trim();
}

// Fonction pour obtenir le scramble du jour
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
