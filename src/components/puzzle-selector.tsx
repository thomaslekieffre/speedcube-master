"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Box } from "lucide-react";

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
  | "minx";

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
];

// Fonction de génération de scramble mock
export const generateMockScramble = (puzzleType: PuzzleType): string => {
  const moves = {
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
    ],
    "555": [
      // Added 5x5 moves
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
    "666": [
      // Added 6x6 moves
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
    "777": [
      // Added 7x7 moves
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
    pyram: ["R", "R'", "U", "U'", "L", "L'", "B", "B'"],
    skewb: ["R", "R'", "U", "U'", "L", "L'", "B", "B'"],
    sq1: ["(0,0)", "(1,0)", "(-1,0)", "(0,1)", "(0,-1)", "(1,1)", "(-1,-1)"],
    clock: [
      "UR0+ DR0+ DL0+ UL0+ U0+ R0+ D0+ L0+ UR0+ DR0+ DL0+ UL0+",
      "UR1+ DR1+ DL1+ UL1+ U1+ R1+ D1+ L1+ UR1+ DR1+ DL1+ UL1+",
      "UR2+ DR2+ DL2+ UL2+ U2+ R2+ D2+ L2+ UR2+ DR2+ DL2+ UL2+",
      "UR3+ DR3+ DL3+ UL3+ U3+ R3+ D3+ L3+ UR3+ DR3+ DL3+ UL3+",
      "UR4+ DR4+ DL4+ UL4+ U4+ R4+ D4+ L4+ UR4+ DR4+ DL4+ UL4+",
      "UR5+ DR5+ DL5+ UL5+ U5+ R5+ D5+ L5+ UR5+ DR5+ DL5+ UL5+",
      "UR6+ DR6+ DL6+ UL6+ U6+ R6+ D6+ L6+ UR6+ DR6+ DL6+ UL6+",
      "UR7+ DR7+ DL7+ UL7+ U7+ R7+ D7+ L7+ UR7+ DR7+ DL7+ UL7+",
      "UR8+ DR8+ DL8+ UL8+ U8+ R8+ D8+ L8+ UR8+ DR8+ DL8+ UL8+",
      "UR9+ DR9+ DL9+ UL9+ U9+ R9+ D9+ L9+ UR9+ DR9+ DL9+ UL9+",
      "UR10+ DR10+ DL10+ UL10+ U10+ R10+ D10+ L10+ UR10+ DR10+ DL10+ UL10+",
      "UR11+ DR11+ DL11+ UL11+ U11+ R11+ D11+ L11+ UR11+ DR11+ DL11+ UL11+",
    ],
    minx: ["R", "R'", "U", "U'", "F", "F'"],
  } as const;

  const puzzleMoves = moves[puzzleType] || moves["333"];

  // Longueurs spécifiques par puzzle
  let length: number;
  if (puzzleType === "sq1") {
    length = 8;
  } else if (puzzleType === "clock") {
    length = 12;
  } else if (puzzleType === "pyram" || puzzleType === "skewb") {
    length = 8;
  } else if (puzzleType === "minx") {
    length = 10;
  } else {
    length = 20; // 3x3, 4x4, 5x5, 6x6, 7x7
  }

  let scramble = "";
  let lastMove = "";

  // Logique spéciale pour Square-1
  if (puzzleType === "sq1") {
    // Scrambles Square-1 plus réalistes avec des mouvements de forme
    const square1Moves = [
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
    ];

    for (let i = 0; i < length; i++) {
      let move;
      do {
        move = square1Moves[Math.floor(Math.random() * square1Moves.length)];
      } while (move === lastMove);
      scramble += move + " ";
      lastMove = move;
    }
  }
  // Logique spéciale pour Clock
  else if (puzzleType === "clock") {
    // Scrambles pré-générés qui fonctionnent avec cubing.js
    const clockScrambles = [
      "UR0+ DR0+ DL0+ UL0+ U0+ R0+ D0+ L0+ UR0+ DR0+ DL0+ UL0+",
      "UR1+ DR1+ DL1+ UL1+ U1+ R1+ D1+ L1+ UR1+ DR1+ DL1+ UL1+",
      "UR2+ DR2+ DL2+ UL2+ U2+ R2+ D2+ L2+ UR2+ DR2+ DL2+ UL2+",
      "UR3+ DR3+ DL3+ UL3+ U3+ R3+ D3+ L3+ UR3+ DR3+ DL3+ UL3+",
      "UR4+ DR4+ DL4+ UL4+ U4+ R4+ D4+ L4+ UR4+ DR4+ DL4+ UL4+",
      "UR5+ DR5+ DL5+ UL5+ U5+ R5+ D5+ L5+ UR5+ DR5+ DL5+ UL5+",
      "UR6+ DR6+ DL6+ UL6+ U6+ R6+ D6+ L6+ UR6+ DR6+ DL6+ UL6+",
      "UR7+ DR7+ DL7+ UL7+ U7+ R7+ D7+ L7+ UR7+ DR7+ DL7+ UL7+",
      "UR8+ DR8+ DL8+ UL8+ U8+ R8+ D8+ L8+ UR8+ DR8+ DL8+ UL8+",
      "UR9+ DR9+ DL9+ UL9+ U9+ R9+ D9+ L9+ UR9+ DR9+ DL9+ UL9+",
      "UR10+ DR10+ DL10+ UL10+ U10+ R10+ D10+ L10+ UR10+ DR10+ DL10+ UL10+",
      "UR11+ DR11+ DL11+ UL11+ U11+ R11+ D11+ L11+ UR11+ DR11+ DL11+ UL11+",
    ];

    // Choisir un scramble aléatoire
    const randomIndex = Math.floor(Math.random() * clockScrambles.length);
    scramble = clockScrambles[randomIndex];
  }
  // Logique standard pour les autres puzzles
  else {
    for (let i = 0; i < length; i++) {
      let move;
      do {
        move = puzzleMoves[Math.floor(Math.random() * puzzleMoves.length)];
      } while (move === lastMove);
      scramble += move + " ";
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

  const generateScramble = (puzzleType: PuzzleType) => {
    // Pour l'instant, on utilise le fallback local pour éviter les blocages
    // TODO: Réintégrer cubing.js scramble plus tard
    const fallback = generateMockScramble(puzzleType);
    setCurrentScramble(fallback);
    onScrambleChange(fallback);
  };

  // Fonction publique pour forcer la régénération (appelée depuis TimerCard)
  const regenerateScramble = () => {
    generateScramble(selectedPuzzle);
  };

  // Exposer la fonction au composant parent
  useImperativeHandle(ref, () => ({
    regenerateScramble,
  }));

  useEffect(() => {
    generateScramble(selectedPuzzle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPuzzle]);

  // Régénérer un scramble quand currentScramble devient vide (après un solve)
  useEffect(() => {
    if (!currentScramble) {
      generateScramble(selectedPuzzle);
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
