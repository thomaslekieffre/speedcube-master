"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Eye, EyeOff } from "lucide-react";
import { PuzzleType } from "./puzzle-selector";

interface CubeViewerProps {
  puzzleType: PuzzleType;
  scramble: string;
  onReset: () => void;
}

// Mapping our puzzle IDs to cubing.js puzzle names
const puzzleNameMap: Record<PuzzleType, string> = {
  "333": "3x3x3",
  "222": "2x2x2",
  "444": "4x4x4",
  "555": "5x5x5",
  "666": "6x6x6",
  "777": "7x7x7",
  pyram: "pyraminx",
  skewb: "skewb",
  sq1: "square1",
  clock: "clock",
  minx: "megaminx",
};

// Composant custom pour le Clock
function ClockViewer({ scramble }: { scramble: string }) {
  const [frontHands, setFrontHands] = useState<number[]>(Array(9).fill(0));
  const [backHands, setBackHands] = useState<number[]>(Array(9).fill(0));
  const [pins, setPins] = useState<boolean[]>([true, true, true, true]); // UR, DR, DL, UL

  // Parser le scramble pour appliquer les mouvements
  useEffect(() => {
    if (!scramble) return;

    // Reset à l'état résolu
    setFrontHands(Array(9).fill(0));
    setBackHands(Array(9).fill(0));
    setPins([true, true, true, true]);

    // Parser le scramble et appliquer les mouvements
    const moves = scramble.split(" ");
    moves.forEach((move) => {
      if (move.includes("UR")) {
        const rotation = parseInt(move.replace("UR", "").replace("+", "")) || 0;
        // Appliquer la rotation aux 3 horloges du coin UR (face avant ET arrière)
        setFrontHands((prev) => {
          const newHands = [...prev];
          newHands[0] = (newHands[0] + rotation) % 12;
          newHands[1] = (newHands[1] + rotation) % 12;
          newHands[3] = (newHands[3] + rotation) % 12;
          return newHands;
        });
        setBackHands((prev) => {
          const newHands = [...prev];
          newHands[0] = (newHands[0] + rotation) % 12;
          newHands[1] = (newHands[1] + rotation) % 12;
          newHands[3] = (newHands[3] + rotation) % 12;
          return newHands;
        });
      } else if (move.includes("DR")) {
        const rotation = parseInt(move.replace("DR", "").replace("+", "")) || 0;
        // Appliquer la rotation aux 3 horloges du coin DR (face avant ET arrière)
        setFrontHands((prev) => {
          const newHands = [...prev];
          newHands[6] = (newHands[6] + rotation) % 12;
          newHands[7] = (newHands[7] + rotation) % 12;
          newHands[3] = (newHands[3] + rotation) % 12;
          return newHands;
        });
        setBackHands((prev) => {
          const newHands = [...prev];
          newHands[6] = (newHands[6] + rotation) % 12;
          newHands[7] = (newHands[7] + rotation) % 12;
          newHands[3] = (newHands[3] + rotation) % 12;
          return newHands;
        });
      } else if (move.includes("DL")) {
        const rotation = parseInt(move.replace("DL", "").replace("+", "")) || 0;
        // Appliquer la rotation aux 3 horloges du coin DL (face avant ET arrière)
        setFrontHands((prev) => {
          const newHands = [...prev];
          newHands[6] = (newHands[6] + rotation) % 12;
          newHands[7] = (newHands[7] + rotation) % 12;
          newHands[8] = (newHands[8] + rotation) % 12;
          return newHands;
        });
        setBackHands((prev) => {
          const newHands = [...prev];
          newHands[6] = (newHands[6] + rotation) % 12;
          newHands[7] = (newHands[7] + rotation) % 12;
          newHands[8] = (newHands[8] + rotation) % 12;
          return newHands;
        });
      } else if (move.includes("UL")) {
        const rotation = parseInt(move.replace("UL", "").replace("+", "")) || 0;
        // Appliquer la rotation aux 3 horloges du coin UL (face avant ET arrière)
        setFrontHands((prev) => {
          const newHands = [...prev];
          newHands[0] = (newHands[0] + rotation) % 12;
          newHands[1] = (newHands[1] + rotation) % 12;
          newHands[2] = (newHands[2] + rotation) % 12;
          return newHands;
        });
        setBackHands((prev) => {
          const newHands = [...prev];
          newHands[0] = (newHands[0] + rotation) % 12;
          newHands[1] = (newHands[1] + rotation) % 12;
          newHands[2] = (newHands[2] + rotation) % 12;
          return newHands;
        });
      } else if (move.includes("U")) {
        const rotation = parseInt(move.replace("U", "").replace("+", "")) || 0;
        // Appliquer la rotation à la ligne du haut (face avant ET arrière)
        setFrontHands((prev) => {
          const newHands = [...prev];
          newHands[0] = (newHands[0] + rotation) % 12;
          newHands[1] = (newHands[1] + rotation) % 12;
          newHands[2] = (newHands[2] + rotation) % 12;
          return newHands;
        });
        setBackHands((prev) => {
          const newHands = [...prev];
          newHands[0] = (newHands[0] + rotation) % 12;
          newHands[1] = (newHands[1] + rotation) % 12;
          newHands[2] = (newHands[2] + rotation) % 12;
          return newHands;
        });
      } else if (move.includes("R")) {
        const rotation = parseInt(move.replace("R", "").replace("+", "")) || 0;
        // Appliquer la rotation à la colonne de droite (face avant ET arrière)
        setFrontHands((prev) => {
          const newHands = [...prev];
          newHands[2] = (newHands[2] + rotation) % 12;
          newHands[5] = (newHands[5] + rotation) % 12;
          newHands[8] = (newHands[8] + rotation) % 12;
          return newHands;
        });
        setBackHands((prev) => {
          const newHands = [...prev];
          newHands[2] = (newHands[2] + rotation) % 12;
          newHands[5] = (newHands[5] + rotation) % 12;
          newHands[8] = (newHands[8] + rotation) % 12;
          return newHands;
        });
      } else if (move.includes("D")) {
        const rotation = parseInt(move.replace("D", "").replace("+", "")) || 0;
        // Appliquer la rotation à la ligne du bas (face avant ET arrière)
        setFrontHands((prev) => {
          const newHands = [...prev];
          newHands[6] = (newHands[6] + rotation) % 12;
          newHands[7] = (newHands[7] + rotation) % 12;
          newHands[8] = (newHands[8] + rotation) % 12;
          return newHands;
        });
        setBackHands((prev) => {
          const newHands = [...prev];
          newHands[6] = (newHands[6] + rotation) % 12;
          newHands[7] = (newHands[7] + rotation) % 12;
          newHands[8] = (newHands[8] + rotation) % 12;
          return newHands;
        });
      } else if (move.includes("L")) {
        const rotation = parseInt(move.replace("L", "").replace("+", "")) || 0;
        // Appliquer la rotation à la colonne de gauche (face avant ET arrière)
        setFrontHands((prev) => {
          const newHands = [...prev];
          newHands[0] = (newHands[0] + rotation) % 12;
          newHands[1] = (newHands[1] + rotation) % 12;
          newHands[6] = (newHands[6] + rotation) % 12;
          return newHands;
        });
        setBackHands((prev) => {
          const newHands = [...prev];
          newHands[0] = (newHands[0] + rotation) % 12;
          newHands[1] = (newHands[1] + rotation) % 12;
          newHands[6] = (newHands[6] + rotation) % 12;
          return newHands;
        });
      }
    });
  }, [scramble]);

  const renderClockFace = (time: number, index: number) => {
    const angle = (time * 30) % 360; // 30° par heure
    const handStyle = {
      transform: `rotate(${angle}deg)`,
      transformOrigin: "center",
    };

    return (
      <div
        key={index}
        className="relative w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"
      >
        <div className="w-1 h-3 bg-red-500 absolute" style={handStyle} />
        <div
          className="w-0.5 h-2 bg-yellow-400 absolute"
          style={{ ...handStyle, transform: `rotate(${(time * 6) % 360}deg)` }}
        />
        <div className="w-1 h-1 bg-white rounded-full" />
      </div>
    );
  };

  return (
    <div className="flex gap-8 justify-center">
      {/* Face avant */}
      <div className="space-y-2">
        <div className="text-center text-sm font-medium text-muted-foreground">
          Face avant
        </div>
        <div className="grid grid-cols-3 gap-2 bg-blue-800 p-4 rounded-lg">
          {frontHands.map((time, index) => renderClockFace(time, index))}
        </div>
      </div>

      {/* Face arrière */}
      <div className="space-y-2">
        <div className="text-center text-sm font-medium text-muted-foreground">
          Face arrière
        </div>
        <div className="grid grid-cols-3 gap-2 bg-blue-400 p-4 rounded-lg">
          {backHands.map((time, index) => renderClockFace(time, index))}
        </div>
      </div>
    </div>
  );
}

export function CubeViewer({ puzzleType, scramble, onReset }: CubeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // reset le ready state à chaque changement
    setIsReady(false);

    if (!containerRef.current || !scramble) return;

    const initViewer = async () => {
      try {
        const { TwistyPlayer } = await import("cubing/twisty");

        // Nettoyer l'ancien viewer
        if (viewerRef.current) {
          try {
            containerRef.current?.removeChild(viewerRef.current);
          } catch {}
          viewerRef.current = null;
        }

        const puzzleName = puzzleNameMap[puzzleType] ?? "3x3x3";

        const viewer = new TwistyPlayer({
          puzzle: puzzleName as any, // Type assertion pour éviter l'erreur
          alg: scramble,
          background: "none",
          controlPanel: "none",
        });

        containerRef.current?.appendChild(viewer);
        viewerRef.current = viewer;
        viewer.alg = scramble;

        // Marquer comme prêt après insertion
        setIsReady(true);
      } catch (error) {
        console.error("Erreur lors de l'initialisation du viewer:", error);
      }
    };

    initViewer();

    return () => {
      if (viewerRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(viewerRef.current);
        } catch {}
        viewerRef.current = null;
      }
    };
  }, [puzzleType, scramble]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleLocalReset = () => {
    if (viewerRef.current) {
      try {
        viewerRef.current.alg = "";
      } catch {}
    }
    onReset?.();
  };

  if (!isVisible) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              <EyeOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Visualiseur masqué</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={toggleVisibility}>
                <Eye className="h-4 w-4 mr-1" />
                Afficher le cube
              </Button>
              <Button variant="outline" size="sm" onClick={handleLocalReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Visualiseur 3D</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={toggleVisibility}>
                <EyeOff className="h-4 w-4 mr-1" />
                Masquer
              </Button>
              <Button variant="outline" size="sm" onClick={handleLocalReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Affichage du scramble */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Scramble actuel
              </span>
              <span className="text-xs text-muted-foreground">
                {puzzleType === "333"
                  ? "3x3x3"
                  : puzzleType === "222"
                  ? "2x2x2"
                  : puzzleType === "444"
                  ? "4x4x4"
                  : puzzleType === "555"
                  ? "5x5x5"
                  : puzzleType === "666"
                  ? "6x6x6"
                  : puzzleType === "777"
                  ? "7x7x7"
                  : puzzleType === "pyram"
                  ? "Pyraminx"
                  : puzzleType === "skewb"
                  ? "Skewb"
                  : puzzleType === "sq1"
                  ? "Square-1"
                  : puzzleType === "clock"
                  ? "Clock"
                  : puzzleType === "minx"
                  ? "Megaminx"
                  : "3x3x3"}
              </span>
            </div>
            <div className="font-mono text-sm break-all">{scramble}</div>
          </div>

          {/* Visualiseur spécifique pour le Clock */}
          {puzzleType === "clock" ? (
            <ClockViewer scramble={scramble} />
          ) : (
            <div
              ref={containerRef}
              className="w-full h-[300px] bg-muted rounded-lg flex items-center justify-center"
            >
              {!isReady && (
                <div className="text-muted-foreground text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p>Chargement du visualiseur...</p>
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center">
            Utilisez la souris pour faire tourner le cube
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
