"use client";

import { useEffect, useRef, useState } from "react";
import { PuzzleType } from "./puzzle-selector";

interface CubeViewerProps {
  puzzleType: PuzzleType;
  scramble: string;
  onReset: () => void;
  onViewerReady?: (viewer: any) => void;
  showControls?: boolean; // Par défaut false
  algorithm?: string; // Pour le reset, si différent du scramble
  fallbackOnly?: boolean; // Pour forcer l'utilisation du fallback
  showScrambleFirst?: boolean; // Afficher d'abord le scramble, puis l'algorithme
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

    // Fonction helper pour extraire la rotation
    const extractRotation = (move: string, prefix: string): number => {
      const match = move.match(new RegExp(`^${prefix}(\\d+)\\+$`));
      return match ? parseInt(match[1]) : 0;
    };

    // Calculer l'état final en une seule fois
    let frontHands = Array(9).fill(0);
    let backHands = Array(9).fill(0);

    moves.forEach((move) => {
      if (move.startsWith("UR")) {
        const rotation = extractRotation(move, "UR");
        // Appliquer la rotation aux 3 horloges du coin UR (face avant ET arrière)
        frontHands[0] = (frontHands[0] + rotation) % 12;
        frontHands[1] = (frontHands[1] + rotation) % 12;
        frontHands[3] = (frontHands[3] + rotation) % 12;
        backHands[0] = (backHands[0] + rotation) % 12;
        backHands[1] = (backHands[1] + rotation) % 12;
        backHands[3] = (backHands[3] + rotation) % 12;
      } else if (move.startsWith("DR")) {
        const rotation = extractRotation(move, "DR");
        // Appliquer la rotation aux 3 horloges du coin DR (face avant ET arrière)
        frontHands[6] = (frontHands[6] + rotation) % 12;
        frontHands[7] = (frontHands[7] + rotation) % 12;
        frontHands[3] = (frontHands[3] + rotation) % 12;
        backHands[6] = (backHands[6] + rotation) % 12;
        backHands[7] = (backHands[7] + rotation) % 12;
        backHands[3] = (backHands[3] + rotation) % 12;
      } else if (move.startsWith("DL")) {
        const rotation = extractRotation(move, "DL");
        // Appliquer la rotation aux 3 horloges du coin DL (face avant ET arrière)
        frontHands[6] = (frontHands[6] + rotation) % 12;
        frontHands[7] = (frontHands[7] + rotation) % 12;
        frontHands[8] = (frontHands[8] + rotation) % 12;
        backHands[6] = (backHands[6] + rotation) % 12;
        backHands[7] = (backHands[7] + rotation) % 12;
        backHands[8] = (backHands[8] + rotation) % 12;
      } else if (move.startsWith("UL")) {
        const rotation = extractRotation(move, "UL");
        // Appliquer la rotation aux 3 horloges du coin UL (face avant ET arrière)
        frontHands[0] = (frontHands[0] + rotation) % 12;
        frontHands[1] = (frontHands[1] + rotation) % 12;
        frontHands[2] = (frontHands[2] + rotation) % 12;
        backHands[0] = (backHands[0] + rotation) % 12;
        backHands[1] = (backHands[1] + rotation) % 12;
        backHands[2] = (backHands[2] + rotation) % 12;
      } else if (
        move.startsWith("U") &&
        !move.startsWith("UR") &&
        !move.startsWith("UL")
      ) {
        const rotation = extractRotation(move, "U");
        // Appliquer la rotation à la ligne du haut (face avant ET arrière)
        frontHands[0] = (frontHands[0] + rotation) % 12;
        frontHands[1] = (frontHands[1] + rotation) % 12;
        frontHands[2] = (frontHands[2] + rotation) % 12;
        backHands[0] = (backHands[0] + rotation) % 12;
        backHands[1] = (backHands[1] + rotation) % 12;
        backHands[2] = (backHands[2] + rotation) % 12;
      } else if (
        move.startsWith("R") &&
        !move.startsWith("UR") &&
        !move.startsWith("DR")
      ) {
        const rotation = extractRotation(move, "R");
        // Appliquer la rotation à la colonne de droite (face avant ET arrière)
        frontHands[2] = (frontHands[2] + rotation) % 12;
        frontHands[5] = (frontHands[5] + rotation) % 12;
        frontHands[8] = (frontHands[8] + rotation) % 12;
        backHands[2] = (backHands[2] + rotation) % 12;
        backHands[5] = (backHands[5] + rotation) % 12;
        backHands[8] = (backHands[8] + rotation) % 12;
      } else if (
        move.startsWith("D") &&
        !move.startsWith("DR") &&
        !move.startsWith("DL")
      ) {
        const rotation = extractRotation(move, "D");
        // Appliquer la rotation à la ligne du bas (face avant ET arrière)
        frontHands[6] = (frontHands[6] + rotation) % 12;
        frontHands[7] = (frontHands[7] + rotation) % 12;
        frontHands[8] = (frontHands[8] + rotation) % 12;
        backHands[6] = (backHands[6] + rotation) % 12;
        backHands[7] = (backHands[7] + rotation) % 12;
        backHands[8] = (backHands[8] + rotation) % 12;
      } else if (
        move.startsWith("L") &&
        !move.startsWith("UL") &&
        !move.startsWith("DL")
      ) {
        const rotation = extractRotation(move, "L");
        // Appliquer la rotation à la colonne de gauche (face avant ET arrière)
        frontHands[0] = (frontHands[0] + rotation) % 12;
        frontHands[1] = (frontHands[1] + rotation) % 12;
        frontHands[6] = (frontHands[6] + rotation) % 12;
        backHands[0] = (backHands[0] + rotation) % 12;
        backHands[1] = (backHands[1] + rotation) % 12;
        backHands[6] = (backHands[6] + rotation) % 12;
      }
    });

    // Mettre à jour l'état en une seule fois
    setFrontHands(frontHands);
    setBackHands(backHands);
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

export function CubeViewer({
  puzzleType,
  scramble,
  onReset,
  onViewerReady,
  showControls = false, // Par défaut, pas de contrôles
  algorithm,
  fallbackOnly = false, // Par défaut, utiliser le visualiseur 3D
  showScrambleFirst = false,
}: CubeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [currentSequence, setCurrentSequence] = useState<string>("");
  const [isShowingScramble, setIsShowingScramble] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    // Si on force le fallback, ne pas initialiser le viewer
    if (fallbackOnly) {
      setHasError(false);
      setIsReady(true);
      return;
    }

    // Nettoyer l'ancien viewer si nécessaire
    if (viewerRef.current && containerRef.current) {
      try {
        viewerRef.current.dispose?.();
        containerRef.current.removeChild(viewerRef.current);
      } catch {}
      viewerRef.current = null;
    }

    // Réinitialiser l'état
    initRef.current = false;
    setIsReady(false);
    setHasError(false);

    // Éviter les initialisations multiples
    if (initRef.current) return;
    initRef.current = true;

    if (!containerRef.current) return;

    const initViewer = async () => {
      try {
        const { TwistyPlayer } = await import("cubing/twisty");

        // Nettoyer l'ancien viewer proprement
        if (viewerRef.current) {
          try {
            viewerRef.current.dispose?.();
            containerRef.current?.removeChild(viewerRef.current);
          } catch {}
          viewerRef.current = null;
        }

        const puzzleName = puzzleNameMap[puzzleType] ?? "3x3x3";

        // Configuration du viewer avec contrôles natifs
        const viewer = new TwistyPlayer({
          puzzle: puzzleName as any,
          alg: scramble || "",
          background: "none",
          controlPanel: showControls ? "auto" : "none",
          viewerLink: "none",
        });

        // Gestion d'erreur WebGL
        viewer.addEventListener("error", (e: any) => {
          console.warn("Erreur WebGL dans CubeViewer:", e);
          setHasError(true);
          setIsReady(true);
        });

        containerRef.current?.appendChild(viewer);
        viewerRef.current = viewer;

        // Reset l'index des mouvements
        setCurrentMoveIndex(0);

        // Marquer comme prêt après insertion
        setIsReady(true);
        setHasError(false);

        // Notifier le parent que le viewer est prêt
        onViewerReady?.(viewer);
      } catch (error) {
        console.error("Erreur lors de l'initialisation du viewer:", error);
        setHasError(true);
        setIsReady(true);
      }
    };

    initViewer();

    return () => {
      if (viewerRef.current && containerRef.current) {
        try {
          viewerRef.current.dispose?.();
          containerRef.current.removeChild(viewerRef.current);
        } catch {}
        viewerRef.current = null;
      }
      initRef.current = false;
    };
  }, [puzzleType, fallbackOnly]); // Ajouter fallbackOnly aux dépendances

  // Mettre à jour le scramble quand il change (avec debounce)
  useEffect(() => {
    if (viewerRef.current && isReady) {
      // Utiliser un timeout pour éviter les mises à jour trop fréquentes
      const timeoutId = setTimeout(() => {
        try {
          if (showScrambleFirst && scramble) {
            // Afficher d'abord le scramble
            viewerRef.current.alg = scramble;
            setCurrentSequence(scramble);
            setIsShowingScramble(true);

            // Après 3 secondes, afficher l'algorithme
            setTimeout(() => {
              if (algorithm) {
                viewerRef.current.alg = algorithm;
                setCurrentSequence(algorithm);
                setIsShowingScramble(false);
              }
            }, 3000);
          } else {
            // Comportement normal
            viewerRef.current.alg = scramble;
            setCurrentSequence(scramble);
            setIsShowingScramble(false);
          }
        } catch (error) {
          console.warn("Erreur lors de la mise à jour du scramble:", error);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [scramble, algorithm, isReady, showScrambleFirst]);

  // Composant de fallback simple
  const FallbackViewer = () => (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center">
        <div className="text-2xl mb-2">🎲</div>
        <p className="text-sm font-medium">
          {showScrambleFirst && isShowingScramble ? "Scramble" : "Notation"}
        </p>
        <p className="text-xs mt-1 font-mono bg-muted px-2 py-1 rounded">
          {currentSequence || scramble || "Aucun scramble"}
        </p>
        {showScrambleFirst && algorithm && (
          <p className="text-xs mt-1 text-blue-500">
            {isShowingScramble
              ? "→ Algorithme dans 3s"
              : "→ Algorithme affiché"}
          </p>
        )}
        <p className="text-xs mt-2 text-muted-foreground">
          {puzzleNameMap[puzzleType] || puzzleType}
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Visualiseur spécifique pour le Clock */}
      {puzzleType === "clock" ? (
        <ClockViewer scramble={scramble} />
      ) : fallbackOnly || hasError ? (
        <FallbackViewer />
      ) : (
        <>
          <div
            ref={containerRef}
            className={`flex-1 flex items-center justify-center ${
              !showControls ? "twisty-no-controls" : ""
            }`}
          >
            {!isReady && (
              <div className="text-muted-foreground text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p>Chargement du visualiseur...</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
