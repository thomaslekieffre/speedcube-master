"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Box } from "lucide-react";
import { generateScramble } from "@/app/(pages)/timer/_utils/cstimer-scramble";

export type PuzzleType =
  | "333"
  | "222"
  | "444"
  | "555"
  | "666"
  | "777"
  | "pyram"
  | "skewb"
  | "sq1"
  | "clock"
  | "minx"
  | "333bf"
  | "444bf"
  | "555bf"
  | "333mbf";

interface PuzzleInfo {
  id: PuzzleType;
  name: string;
  shortName: string;
  description: string;
  color: string;
}

export const PUZZLES: PuzzleInfo[] = [
  {
    id: "333",
    name: "3x3x3",
    shortName: "3x3",
    description: "Rubik's Cube classique",
    color: "bg-blue-500",
  },
  {
    id: "222",
    name: "2x2x2",
    shortName: "2x2",
    description: "Pocket Cube",
    color: "bg-green-500",
  },
  {
    id: "444",
    name: "4x4x4",
    shortName: "4x4",
    description: "Rubik's Revenge",
    color: "bg-purple-500",
  },
  {
    id: "555",
    name: "5x5x5",
    shortName: "5x5",
    description: "Professor's Cube",
    color: "bg-yellow-500",
  },
  {
    id: "666",
    name: "6x6x6",
    shortName: "6x6",
    description: "V-Cube 6",
    color: "bg-pink-500",
  },
  {
    id: "777",
    name: "7x7x7",
    shortName: "7x7",
    description: "V-Cube 7",
    color: "bg-indigo-500",
  },
  {
    id: "pyram",
    name: "Pyraminx",
    shortName: "Pyra",
    description: "Pyramide à 4 faces",
    color: "bg-orange-500",
  },
  {
    id: "skewb",
    name: "Skewb",
    shortName: "Skewb",
    description: "Cube à rotation oblique",
    color: "bg-teal-500",
  },
  {
    id: "sq1",
    name: "Square-1",
    shortName: "Sq1",
    description: "Cube à forme variable",
    color: "bg-cyan-500",
  },
  {
    id: "clock",
    name: "Clock",
    shortName: "Clock",
    description: "Horloge à 4 faces",
    color: "bg-amber-500",
  },
  {
    id: "minx",
    name: "Megaminx",
    shortName: "Mega",
    description: "Dodécaèdre à 12 faces",
    color: "bg-red-500",
  },
  {
    id: "333bf",
    name: "3x3x3 Blindfolded",
    shortName: "3BLD",
    description: "3x3x3 les yeux bandés",
    color: "bg-blue-600",
  },
  {
    id: "444bf",
    name: "4x4x4 Blindfolded",
    shortName: "4BLD",
    description: "4x4x4 les yeux bandés",
    color: "bg-purple-600",
  },
  {
    id: "555bf",
    name: "5x5x5 Blindfolded",
    shortName: "5BLD",
    description: "5x5x5 les yeux bandés",
    color: "bg-yellow-600",
  },
  {
    id: "333mbf",
    name: "3x3x3 Multi-Blind",
    shortName: "MBLD",
    description: "3x3x3 multi-blindfolded",
    color: "bg-blue-700",
  },
];

// Fonction de génération de scramble mock
export const generateMockScramble = (puzzleType: PuzzleType): string => {
  // Longueurs officielles WCA pour chaque puzzle
  const wcaLengths = {
    "333": 20, // 20 mouvements
    "222": 9, // 9 mouvements
    "444": 40, // 40 mouvements (avec wide moves)
    "555": 60, // 60 mouvements (avec wide moves)
    "666": 80, // 80 mouvements (avec wide moves)
    "777": 100, // 100 mouvements (avec wide moves)
    pyram: 11, // 11 mouvements
    skewb: 8, // 8 mouvements
    sq1: 13, // 13 mouvements (formes + rotations)
    clock: 9, // 9 mouvements (pins + rotations)
    minx: 77, // 77 mouvements
    "333bf": 20, // 20 mouvements (même que 3x3)
    "444bf": 40, // 40 mouvements (même que 4x4)
    "555bf": 60, // 60 mouvements (même que 5x5)
    "333mbf": 20, // 20 mouvements (même que 3x3)
  };

  const length = wcaLengths[puzzleType] || 20;

  // Mouvements officiels WCA pour chaque puzzle
  const wcaMoves = {
    "333": [
      "R",
      "R'",
      "R2",
      "U",
      "U'",
      "U2",
      "F",
      "F'",
      "F2",
      "L",
      "L'",
      "L2",
      "D",
      "D'",
      "D2",
      "B",
      "B'",
      "B2",
    ],
    "222": ["R", "R'", "R2", "U", "U'", "U2", "F", "F'", "F2"],
    "444": [
      "R",
      "R'",
      "R2",
      "Rw",
      "Rw'",
      "Rw2",
      "U",
      "U'",
      "U2",
      "Uw",
      "Uw'",
      "Uw2",
      "F",
      "F'",
      "F2",
      "Fw",
      "Fw'",
      "Fw2",
      "L",
      "L'",
      "L2",
      "Lw",
      "Lw'",
      "Lw2",
      "D",
      "D'",
      "D2",
      "Dw",
      "Dw'",
      "Dw2",
      "B",
      "B'",
      "B2",
      "Bw",
      "Bw'",
      "Bw2",
    ],
    "555": [
      "R",
      "R'",
      "R2",
      "Rw",
      "Rw'",
      "Rw2",
      "3Rw",
      "3Rw'",
      "3Rw2",
      "U",
      "U'",
      "U2",
      "Uw",
      "Uw'",
      "Uw2",
      "3Uw",
      "3Uw'",
      "3Uw2",
      "F",
      "F'",
      "F2",
      "Fw",
      "Fw'",
      "Fw2",
      "3Fw",
      "3Fw'",
      "3Fw2",
      "L",
      "L'",
      "L2",
      "Lw",
      "Lw'",
      "Lw2",
      "3Lw",
      "3Lw'",
      "3Lw2",
      "D",
      "D'",
      "D2",
      "Dw",
      "Dw'",
      "Dw2",
      "3Dw",
      "3Dw'",
      "3Dw2",
      "B",
      "B'",
      "B2",
      "Bw",
      "Bw'",
      "Bw2",
      "3Bw",
      "3Bw'",
      "3Bw2",
    ],
    "666": [
      "R",
      "R'",
      "R2",
      "Rw",
      "Rw'",
      "Rw2",
      "3Rw",
      "3Rw'",
      "3Rw2",
      "U",
      "U'",
      "U2",
      "Uw",
      "Uw'",
      "Uw2",
      "3Uw",
      "3Uw'",
      "3Uw2",
      "F",
      "F'",
      "F2",
      "Fw",
      "Fw'",
      "Fw2",
      "3Fw",
      "3Fw'",
      "3Fw2",
      "L",
      "L'",
      "L2",
      "Lw",
      "Lw'",
      "Lw2",
      "3Lw",
      "3Lw'",
      "3Lw2",
      "D",
      "D'",
      "D2",
      "Dw",
      "Dw'",
      "Dw2",
      "3Dw",
      "3Dw'",
      "3Dw2",
      "B",
      "B'",
      "B2",
      "Bw",
      "Bw'",
      "Bw2",
      "3Bw",
      "3Bw'",
      "3Bw2",
    ],
    "777": [
      "R",
      "R'",
      "R2",
      "Rw",
      "Rw'",
      "Rw2",
      "3Rw",
      "3Rw'",
      "3Rw2",
      "U",
      "U'",
      "U2",
      "Uw",
      "Uw'",
      "Uw2",
      "3Uw",
      "3Uw'",
      "3Uw2",
      "F",
      "F'",
      "F2",
      "Fw",
      "Fw'",
      "Fw2",
      "3Fw",
      "3Fw'",
      "3Fw2",
      "L",
      "L'",
      "L2",
      "Lw",
      "Lw'",
      "Lw2",
      "3Lw",
      "3Lw'",
      "3Lw2",
      "D",
      "D'",
      "D2",
      "Dw",
      "Dw'",
      "Dw2",
      "3Dw",
      "3Dw'",
      "3Dw2",
      "B",
      "B'",
      "B2",
      "Bw",
      "Bw'",
      "Bw2",
      "3Bw",
      "3Bw'",
      "3Bw2",
    ],
    pyram: ["R", "R'", "U", "U'", "L", "L'", "B", "B'"],
    skewb: ["R", "R'", "U", "U'", "L", "L'", "B", "B'"],
    sq1: [
      "(0,0)",
      "(1,0)",
      "(-1,0)",
      "(0,1)",
      "(0,-1)",
      "(1,1)",
      "(-1,-1)",
      "(2,0)",
      "(-2,0)",
      "(0,2)",
      "(0,-2)",
      "(1,2)",
      "(-1,2)",
      "(2,1)",
      "(-2,1)",
      "(3,0)",
      "(-3,0)",
      "(0,3)",
      "(0,-3)",
      "(1,3)",
      "(-1,3)",
      "(3,1)",
      "(-3,1)",
      "(4,0)",
      "(-4,0)",
      "(0,4)",
      "(0,-4)",
      "(1,4)",
      "(-1,4)",
      "(4,1)",
      "(-4,1)",
      "(5,0)",
      "(-5,0)",
      "(0,5)",
      "(0,-5)",
      "(1,5)",
      "(-1,5)",
      "(5,1)",
      "(-5,1)",
    ],
    clock: [
      "UR0+",
      "DR0+",
      "DL0+",
      "UL0+",
      "U0+",
      "R0+",
      "D0+",
      "L0+",
      "UR1+",
      "DR1+",
      "DL1+",
      "UL1+",
      "U1+",
      "R1+",
      "D1+",
      "L1+",
      "UR2+",
      "DR2+",
      "DL2+",
      "UL2+",
      "U2+",
      "R2+",
      "D2+",
      "L2+",
      "UR3+",
      "DR3+",
      "DL3+",
      "UL3+",
      "U3+",
      "R3+",
      "D3+",
      "L3+",
      "UR4+",
      "DR4+",
      "DL4+",
      "UL4+",
      "U4+",
      "R4+",
      "D4+",
      "L4+",
      "UR5+",
      "DR5+",
      "DL5+",
      "UL5+",
      "U5+",
      "R5+",
      "D5+",
      "L5+",
      "UR6+",
      "DR6+",
      "DL6+",
      "UL6+",
      "U6+",
      "R6+",
      "D6+",
      "L6+",
      "UR7+",
      "DR7+",
      "DL7+",
      "UL7+",
      "U7+",
      "R7+",
      "D7+",
      "L7+",
      "UR8+",
      "DR8+",
      "DL8+",
      "UL8+",
      "U8+",
      "R8+",
      "D8+",
      "L8+",
      "UR9+",
      "DR9+",
      "DL9+",
      "UL9+",
      "U9+",
      "R9+",
      "D9+",
      "L9+",
      "UR10+",
      "DR10+",
      "DL10+",
      "UL10+",
      "U10+",
      "R10+",
      "D10+",
      "L10+",
      "UR11+",
      "DR11+",
      "DL11+",
      "UL11+",
      "U11+",
      "R11+",
      "D11+",
      "L11+",
    ],
    minx: [
      "R",
      "R'",
      "U",
      "U'",
      "F",
      "F'",
      "L",
      "L'",
      "D",
      "D'",
      "B",
      "B'",
      "R++",
      "R--",
      "U++",
      "U--",
      "F++",
      "F--",
      "L++",
      "L--",
      "D++",
      "D--",
      "B++",
      "B--",
    ],
    "333bf": [
      "R",
      "R'",
      "R2",
      "U",
      "U'",
      "U2",
      "F",
      "F'",
      "F2",
      "L",
      "L'",
      "L2",
      "D",
      "D'",
      "D2",
      "B",
      "B'",
      "B2",
    ],
    "444bf": [
      "R",
      "R'",
      "R2",
      "Rw",
      "Rw'",
      "Rw2",
      "U",
      "U'",
      "U2",
      "Uw",
      "Uw'",
      "Uw2",
      "F",
      "F'",
      "F2",
      "Fw",
      "Fw'",
      "Fw2",
      "L",
      "L'",
      "L2",
      "Lw",
      "Lw'",
      "Lw2",
      "D",
      "D'",
      "D2",
      "Dw",
      "Dw'",
      "Dw2",
      "B",
      "B'",
      "B2",
      "Bw",
      "Bw'",
      "Bw2",
    ],
    "555bf": [
      "R",
      "R'",
      "R2",
      "Rw",
      "Rw'",
      "Rw2",
      "3Rw",
      "3Rw'",
      "3Rw2",
      "U",
      "U'",
      "U2",
      "Uw",
      "Uw'",
      "Uw2",
      "3Uw",
      "3Uw'",
      "3Uw2",
      "F",
      "F'",
      "F2",
      "Fw",
      "Fw'",
      "Fw2",
      "3Fw",
      "3Fw'",
      "3Fw2",
      "L",
      "L'",
      "L2",
      "Lw",
      "Lw'",
      "Lw2",
      "3Lw",
      "3Lw'",
      "3Lw2",
      "D",
      "D'",
      "D2",
      "Dw",
      "Dw'",
      "Dw2",
      "3Dw",
      "3Dw'",
      "3Dw2",
      "B",
      "B'",
      "B2",
      "Bw",
      "Bw'",
      "Bw2",
      "3Bw",
      "3Bw'",
      "3Bw2",
    ],
    "333mbf": [
      "R",
      "R'",
      "R2",
      "U",
      "U'",
      "U2",
      "F",
      "F'",
      "F2",
      "L",
      "L'",
      "L2",
      "D",
      "D'",
      "D2",
      "B",
      "B'",
      "B2",
    ],
  };

  const puzzleMoves = wcaMoves[puzzleType] || wcaMoves["333"];
  let scramble = "";
  let lastMove = "";
  let lastLastMove = "";

  // Logique spéciale pour Square-1
  if (puzzleType === "sq1") {
    // Scrambles Square-1 WCA : alterner formes et rotations
    const shapes = [
      "(0,0)",
      "(1,0)",
      "(-1,0)",
      "(0,1)",
      "(0,-1)",
      "(1,1)",
      "(-1,-1)",
    ];
    const rotations = ["U", "U'", "U2", "D", "D'", "D2"];

    for (let i = 0; i < length; i++) {
      if (i % 2 === 0) {
        // Mouvement de forme
        let move;
        do {
          move = shapes[Math.floor(Math.random() * shapes.length)];
        } while (move === lastMove);
        scramble += move + " ";
        lastMove = move;
      } else {
        // Mouvement de rotation
        let move;
        do {
          move = rotations[Math.floor(Math.random() * rotations.length)];
        } while (move === lastMove);
        scramble += move + " ";
        lastMove = move;
      }
    }
  }
  // Logique spéciale pour Clock
  else if (puzzleType === "clock") {
    // Scrambles Clock WCA : pins + rotations
    const pins = ["UR", "DR", "DL", "UL"];
    const rotations = [
      "0+",
      "1+",
      "2+",
      "3+",
      "4+",
      "5+",
      "6+",
      "7+",
      "8+",
      "9+",
      "10+",
      "11+",
    ];

    for (let i = 0; i < length; i++) {
      const pin = pins[Math.floor(Math.random() * pins.length)];
      const rotation = rotations[Math.floor(Math.random() * rotations.length)];
      scramble += pin + rotation + " ";
    }
  }
  // Logique standard pour les autres puzzles
  else {
    // Fonction helper pour vérifier si deux mouvements s'annulent
    const movesCancel = (move1: string, move2: string): boolean => {
      // Extraire la face et la direction
      const getFace = (move: string) =>
        move.replace(/['2]/, "").replace(/w|3/, "");
      const getDirection = (move: string) =>
        move.includes("'") ? "'" : move.includes("2") ? "2" : "";

      const face1 = getFace(move1);
      const face2 = getFace(move2);
      const dir1 = getDirection(move1);
      const dir2 = getDirection(move2);

      // Même face
      if (face1 !== face2) return false;

      // Annulation directe : R R', Rw Rw', 3Rw 3Rw', etc.
      if ((dir1 === "" && dir2 === "'") || (dir1 === "'" && dir2 === ""))
        return true;

      // Même mouvement : R R, R2 R2, etc.
      if (move1 === move2) return true;

      // Même face avec des directions différentes : R R2, F F', etc.
      // Ceci est autorisé par la WCA, donc on ne l'interdit pas

      return false;
    };

    for (let i = 0; i < length; i++) {
      let move;
      let attempts = 0;
      const maxAttempts = 100; // Éviter les boucles infinies

      do {
        move = puzzleMoves[Math.floor(Math.random() * puzzleMoves.length)];
        attempts++;

        // Éviter les boucles infinies
        if (attempts > maxAttempts) {
          // Si on ne trouve pas de mouvement valide, on prend le premier disponible
          move = puzzleMoves[0];
          break;
        }
      } while (
        // Règle WCA : aucun mouvement ne doit annuler ou partiellement annuler le mouvement précédent
        movesCancel(move, lastMove) ||
        // Éviter TOUTE répétition de face consécutive (règle WCA stricte)
        (move.startsWith("R") && lastMove.startsWith("R")) ||
        (move.startsWith("U") && lastMove.startsWith("U")) ||
        (move.startsWith("F") && lastMove.startsWith("F")) ||
        (move.startsWith("L") && lastMove.startsWith("L")) ||
        (move.startsWith("D") && lastMove.startsWith("D")) ||
        (move.startsWith("B") && lastMove.startsWith("B"))
      );

      scramble += move + " ";
      lastLastMove = lastMove;
      lastMove = move;
    }
  }

  return scramble.trim();
};

// Mapping vers les codes d'event WCA utilisés par cubing.js
// TODO: Réintégrer quand on aura résolu les problèmes de compilation
// const eventMap: Record<PuzzleType, string> = {
//   "333": "333",
//   "222": "222",
//   "444": "444",
//   "555": "555",
//   "666": "666",
//   "777": "777",
//   pyram: "pyram",
//   skewb: "skewb",
//   sq1: "sq1",
//   clock: "clock",
//   minx: "minx",
// };

interface PuzzleSelectorProps {
  selectedPuzzle: PuzzleType;
  onPuzzleChange: (puzzle: PuzzleType) => void;
  onScrambleChange: (scramble: string) => void;
}

export interface PuzzleSelectorRef {
  regenerateScramble: () => void;
}

export const PuzzleSelector = forwardRef<
  PuzzleSelectorRef,
  PuzzleSelectorProps
>(({ selectedPuzzle, onPuzzleChange, onScrambleChange }, ref) => {
  const [currentScramble, setCurrentScramble] = useState<string>("");

  const generateNewScramble = (puzzleType: PuzzleType) => {
    try {
      const scramble = generateScramble(puzzleType);
      setCurrentScramble(scramble);
      onScrambleChange(scramble);
    } catch (error) {
      console.error("Erreur lors de la génération du scramble:", error);
      // Fallback vers un scramble simple
      const fallback = "R U R' U'";
      setCurrentScramble(fallback);
      onScrambleChange(fallback);
    }
  };

  // Fonction publique pour forcer la régénération (appelée depuis TimerCard)
  const regenerateScramble = () => {
    generateNewScramble(selectedPuzzle);
  };

  // Exposer la fonction au composant parent
  useImperativeHandle(ref, () => ({
    regenerateScramble,
  }));

  useEffect(() => {
    generateNewScramble(selectedPuzzle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPuzzle]);

  // Régénérer un scramble quand currentScramble devient vide (après un solve)
  useEffect(() => {
    if (!currentScramble) {
      generateNewScramble(selectedPuzzle);
    }
  }, [currentScramble, selectedPuzzle]);

  const selectedPuzzleInfo = PUZZLES.find((p) => p.id === selectedPuzzle);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Sélectionner un puzzle</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {PUZZLES.map((puzzle) => (
              <Button
                key={puzzle.id}
                variant={selectedPuzzle === puzzle.id ? "default" : "outline"}
                onClick={() => onPuzzleChange(puzzle.id)}
                className="h-auto p-3 flex flex-col items-center gap-2"
              >
                <div className={`w-4 h-4 rounded-full ${puzzle.color}`} />
                <div className="text-center">
                  <div className="font-medium text-sm">{puzzle.shortName}</div>
                  <div className="text-xs text-muted-foreground">
                    {puzzle.name}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Scramble actuel :{" "}
              <span className="font-mono">{currentScramble}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={regenerateScramble}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Nouveau scramble
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PuzzleSelector.displayName = "PuzzleSelector";
