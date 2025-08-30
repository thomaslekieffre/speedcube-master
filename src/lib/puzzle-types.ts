// Puzzles WCA officiels supportés (codes WCA)
export const SUPPORTED_PUZZLES = [
  "222",
  "333",
  "444",
  "555",
  "666",
  "777",
  "minx",
  "pyraminx",
  "skewb",
  "sq1",
  "clock",
  "333bf",
  "444bf",
  "555bf",
  "333mbf",
] as const;

export type SupportedPuzzle = (typeof SUPPORTED_PUZZLES)[number];

// Mapping des puzzles cstimer vers Speedcube Master (codes WCA)
export const CSTIMER_PUZZLE_MAPPING: Record<string, SupportedPuzzle | null> = {
  // Puzzles WCA officiels
  "333": "333",
  "222": "222",
  "444": "444",
  "555": "555",
  "666": "666",
  "777": "777",
  skewb: "skewb",
  pyram: "pyraminx",
  sq1: "sq1",
  clock: "clock",
  minx: "minx",
  // Events blind supportés
  "333bf": "333bf", // 3x3-blindfolded
  "444bf": "444bf", // 4x4-blindfolded
  "555bf": "555bf", // 5x5-blindfolded
  "333mbf": "333mbf", // 3x3-multiple-blindfolded
  // Puzzles non supportés (feet, etc.)
  "333fm": null, // 3x3-fewest-moves
  "333oh": null, // 3x3-one-handed
  "333ft": null, // 3x3-feet

  // Variantes et alias courants (non supportés)
  "3x3 OH": null, // 3x3-one-handed
  "3x3oh": null, // 3x3-one-handed
  "3x3-oh": null, // 3x3-one-handed
  "3x3 BLD": "333bf", // 3x3-blindfolded
  "3x3bld": "333bf", // 3x3-blindfolded
  "3x3-bld": "333bf", // 3x3-blindfolded
  "4x4 BLD": "444bf", // 4x4-blindfolded
  "4x4bld": "444bf", // 4x4-blindfolded
  "4x4-bld": "444bf", // 4x4-blindfolded
  "5x5 BLD": "555bf", // 5x5-blindfolded
  "5x5bld": "555bf", // 5x5-blindfolded
  "5x5-bld": "555bf", // 5x5-blindfolded
  Pyraminx: "pyraminx",

  // Puzzles non supportés (exercices, méthodes, etc.)
  "333mts": null, // Multi-solving
  "333fmc": null, // Fewest moves challenge
  magic: null, // Magic (discontinued)
  mmagic: null, // Master magic (discontinued)
  "333bld": "333bf", // Alias pour 333bf
  "444bld": "444bf", // Alias pour 444bf
  "555bld": "555bf", // Alias pour 555bf
  Challenge: null, // Exercice
  PLL: null, // Méthode
  Oll: null, // Méthode
  LL: null, // Méthode
  other: null, // Non spécifié
  "2-3-4 relay": null, // Relay non WCA
  "1 scramble": null, // Exercice
  "Coins Blind": null, // Exercice
  "Blind with memo on paper": null, // Exercice
  "Arretes Blind": null, // Exercice
  "Train F2L/Look ahead": null, // Exercice
  "2x2 Megaminx": null, // Non WCA
  "calculateur bpa/wpa": null, // Outil
  Cross: null, // Exercice
  "Look Aheadhd S2": null, // Exercice
  "Belt sous plâtre": null, // Exercice
};

export function isValidPuzzle(puzzle: string): puzzle is SupportedPuzzle {
  return SUPPORTED_PUZZLES.includes(puzzle as SupportedPuzzle);
}

// Mapping des scrType cstimer vers Speedcube Master (codes WCA)
export const CSTIMER_SCRTYPE_MAPPING: Record<string, SupportedPuzzle | null> = {
  // Puzzles WCA officiels
  "333": "333",
  "222so": "222",
  "444wca": "444",
  "555wca": "555",
  "666wca": "666",
  "777wca": "777",
  skbso: "skewb",
  pyrso: "pyraminx",
  sq1so: "sq1",
  clkwca: "clock",
  klmso: "minx",
  // Events blind supportés
  "333ni": "333bf", // 3x3-blindfolded
  "444ni": "444bf", // 4x4-blindfolded
  "555ni": "555bf", // 5x5-blindfolded
  "333mbf": "333mbf", // 3x3-multiple-blindfolded
  // Puzzles non supportés (feet, etc.)
  "333fm": null, // 3x3-fewest-moves
  "333oh": null, // 3x3-one-handed
  "333ft": null, // 3x3-feet

  // Exercices et méthodes (non supportés)
  pll: null,
  oll: null,
  ll: null,
  f2l: null,
  corners: null,
  edges: null,
  input: null,
  r234w: null,
};

export function mapCSTimerPuzzle(
  cstimerPuzzle: string
): SupportedPuzzle | null {
  return CSTIMER_PUZZLE_MAPPING[cstimerPuzzle] || null;
}

export function mapCSTimerScrType(scrType: string): SupportedPuzzle | null {
  return CSTIMER_SCRTYPE_MAPPING[scrType] || null;
}
