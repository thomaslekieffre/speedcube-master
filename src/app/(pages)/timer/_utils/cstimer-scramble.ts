import cstimer from "cstimer_module";

// Mapping des types de puzzles vers les types de mélanges cstimer
const PUZZLE_SCRAMBLE_TYPES: Record<string, string> = {
  "333": "333", // 3x3x3
  "222": "222so", // 2x2x2
  "444": "444wca", // 4x4x4
  "555": "555wca", // 5x5x5
  "666": "666wca", // 6x6x6
  "777": "777wca", // 7x7x7
  clock: "clkwca", // Clock (type correct cstimer)
  minx: "mgmp", // Megaminx (type correct cstimer)
  pyram: "pyrso", // Pyraminx WCA format avec tips
  skewb: "skbso", // Skewb (type correct cstimer)
  sq1: "sqrs", // Square-1 (type correct cstimer)
};

// Longueurs de mélanges par défaut pour chaque puzzle
const DEFAULT_SCRAMBLE_LENGTHS: Record<string, number> = {
  "333": 0, // 20 mouvements par défaut
  "222": 0, // 9 mouvements par défaut
  "444": 0, // 40 mouvements par défaut
  "555": 0, // 60 mouvements par défaut
  "666": 0, // 80 mouvements par défaut
  "777": 0, // 100 mouvements par défaut
  clock: 0, // 9 mouvements par défaut
  minx: 77, // 77 mouvements (nécessaire pour mgmp)
  pyram: 0, // 11 mouvements par défaut
  skewb: 0, // 8 mouvements par défaut
  sq1: 0, // 13 mouvements par défaut
};

export function generateScramble(puzzleType: string): string {
  try {
    const scrambleType = PUZZLE_SCRAMBLE_TYPES[puzzleType];
    const scrambleLength = DEFAULT_SCRAMBLE_LENGTHS[puzzleType];

    if (!scrambleType) {
      console.warn(
        `Type de puzzle non supporté: ${puzzleType}, utilisation du 3x3x3`
      );
      return cstimer.getScramble("333", 0);
    }

    return cstimer.getScramble(scrambleType, scrambleLength);
  } catch (error) {
    console.error("Erreur lors de la génération du mélange:", error);
    // Fallback vers un mélange 3x3x3 simple
    return cstimer.getScramble("333", 0);
  }
}

export function generateScrambleImage(
  scramble: string,
  puzzleType: string
): string {
  try {
    const scrambleType = PUZZLE_SCRAMBLE_TYPES[puzzleType];

    if (!scrambleType) {
      console.warn(`Type de puzzle non supporté pour l'image: ${puzzleType}`);
      return "";
    }

    return cstimer.getImage(scramble, scrambleType);
  } catch (error) {
    console.error("Erreur lors de la génération de l'image du mélange:", error);
    return "";
  }
}

export function setScrambleSeed(seed: string): void {
  try {
    cstimer.setSeed(seed);
  } catch (error) {
    console.error("Erreur lors de la définition du seed:", error);
  }
}

export function getSupportedPuzzleTypes(): string[] {
  return Object.keys(PUZZLE_SCRAMBLE_TYPES);
}

// Fonction utilitaire pour obtenir le type de mélange cstimer
export function getCstimerScrambleType(puzzleType: string): string {
  return PUZZLE_SCRAMBLE_TYPES[puzzleType] || "333";
}
