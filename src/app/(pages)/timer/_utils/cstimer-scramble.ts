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
  "333bf": "333ni", // 3x3x3 Blindfolded - mélanges avec rotations
  "444bf": "444bld", // 4x4x4 Blindfolded - mélanges optimisés pour le blind
  "555bf": "555bld", // 5x5x5 Blindfolded - mélanges optimisés pour le blind
  "333mbf": "r3ni", // 3x3x3 Multiple Blindfolded - 5 mélanges avec rotations
};

// Longueurs de mélanges par défaut pour chaque puzzle
const DEFAULT_SCRAMBLE_LENGTHS: Record<string, number> = {
  "333": 0, // 20 mouvements par défaut
  "222": 0, // 9 mouvements par défaut
  "444": 0, // 40 mouvements par défaut
  "555": 60, // 60 mouvements par défaut
  "666": 80, // 80 mouvements par défaut
  "777": 100, // 100 mouvements par défaut
  clock: 0, // 9 mouvements par défaut
  minx: 77, // 77 mouvements (nécessaire pour mgmp)
  pyram: 10, // 11 mouvements par défaut
  skewb: 0, // 8 mouvements par défaut
  sq1: 0, // 13 mouvements par défaut
  "333bf": 0, // Mélanges avec rotations (longueur automatique)
  "444bf": 40, // Mélanges optimisés pour le blind (40 mouvements)
  "555bf": 60, // Mélanges optimisés pour le blind (60 mouvements)
  "333mbf": 5, // 5 mélanges avec rotations
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

    // Cas spécial pour le multi-blind : génère 5 mélanges
    if (puzzleType === "333mbf") {
      return cstimer.getScramble(scrambleType, scrambleLength);
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
