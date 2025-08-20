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

const puzzleNameMap: Record<PuzzleType, string> = {
  "333": "3x3x3",
  "222": "2x2x2",
  "444": "4x4x4",
  "555": "5x5x5",
  "666": "6x6x6",
  "777": "7x7x7",
  pyram: "pyraminx",
  skewb: "skewb",
  sq1: "square-1",
  clock: "clock",
  minx: "megaminx",
};

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
          puzzle: puzzleName,
          alg: scramble,
          background: "none",
          controlPanel: "none",
          view: "3D",
          width: "100%",
          height: 300,
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

          <div className="text-xs text-muted-foreground text-center">
            Utilisez la souris pour faire tourner le cube
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
