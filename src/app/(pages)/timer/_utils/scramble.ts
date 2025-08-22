const faces = ["U", "D", "L", "R", "F", "B"] as const;
const modifiers = ["", "'", "2"] as const;

function opposite(face: string): string {
  switch (face) {
    case "U":
      return "D";
    case "D":
      return "U";
    case "L":
      return "R";
    case "R":
      return "L";
    case "F":
      return "B";
    case "B":
      return "F";
    default:
      return face;
  }
}

export function generate333Scramble(length = 25): string {
  const moves: string[] = [];
  let prev = "";
  let prev2 = "";
  while (moves.length < length) {
    const face = faces[Math.floor(Math.random() * faces.length)];
    if (
      face === prev ||
      face === opposite(prev) ||
      (prev2 && face === prev2 && prev === opposite(prev2))
    ) {
      continue;
    }
    const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
    moves.push(face + mod);
    prev2 = prev;
    prev = face;
  }
  return moves.join(" ");
}

// Fonction de test pour vérifier l'orientation WCA
export function generateTestScramble(): string {
  // Scramble simple pour tester l'orientation : R U R' U'
  return "R U R' U'";
}

// Scramble encore plus simple pour tester l'orientation
export function generateSimpleTestScramble(): string {
  // Juste un R pour voir l'orientation
  return "R";
}

// Fonction pour convertir un scramble en setup WCA
export function scrambleToWCASetup(scramble: string): string {
  // Pour forcer l'orientation WCA : blanc en haut, vert devant
  // On utilise un setup explicite
  return scramble;
}
