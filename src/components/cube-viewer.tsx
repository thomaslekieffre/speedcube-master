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

        // Configuration simple du viewer avec gestion d'erreur WebGL
        const viewer = new TwistyPlayer({
          puzzle: puzzleName as any,
          alg: scramble || "",
          background: "none",
          controlPanel: "none",
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

          {/* Contrôles personnalisés */}
          {showControls && isReady && viewerRef.current && (
            <div className="flex items-center justify-center gap-2 p-4 bg-muted/30 rounded-lg mt-4">
              <button
                onClick={() => {
                  if (viewerRef.current) {
                    // Aller au début (cube résolu)
                    viewerRef.current.alg = "";
                    setCurrentMoveIndex(0);
                  }
                }}
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-foreground transition-colors"
                title="Début - Cube résolu"
              >
                ⏮️
              </button>
              <button
                onClick={() => {
                  if (viewerRef.current) {
                    // Animation manuelle avec délais plus longs pour voir les mouvements
                    const moves = (algorithm || scramble).split(" ");
                    let currentIndex = 0;
                    let isPlaying = true;

                    // Fonction pour arrêter l'animation
                    const stopAnimation = () => {
                      isPlaying = false;
                    };

                    // Stocker la fonction d'arrêt
                    (window as any).stopCubeAnimation = stopAnimation;

                    const animateMove = () => {
                      if (!isPlaying || currentIndex >= moves.length) {
                        return;
                      }

                      // Appliquer le mouvement actuel
                      const currentMoves = moves
                        .slice(0, currentIndex + 1)
                        .join(" ");

                      // Forcer le rendu avec un délai pour voir l'animation
                      viewerRef.current.alg = currentMoves;
                      setCurrentMoveIndex(currentIndex + 1);

                      currentIndex++;

                      // Délai plus long pour voir l'animation des pièces
                      setTimeout(animateMove, 800); // 800ms entre chaque mouvement
                    };

                    // Commencer par le cube résolu (sauf si on a déjà un scramble)
                    if (!scramble) {
                      viewerRef.current.alg = "";
                      setCurrentMoveIndex(0);
                    }

                    // Démarrer l'animation après un délai
                    setTimeout(animateMove, 800);
                  }
                }}
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-foreground transition-colors"
                title="Play - Voir l'algorithme en action"
              >
                ▶️
              </button>

              <button
                onClick={() => {
                  // Arrêter l'animation en cours
                  if ((window as any).stopCubeAnimation) {
                    (window as any).stopCubeAnimation();
                  }
                }}
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-foreground transition-colors"
                title="Stop - Arrêter l'animation"
              >
                ⏸️
              </button>

              <button
                onClick={() => {
                  if (viewerRef.current) {
                    // Aller à la fin (algorithme terminé)
                    viewerRef.current.alg = algorithm || scramble;
                    setCurrentMoveIndex(
                      (algorithm || scramble).split(" ").length
                    );
                  }
                }}
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-foreground transition-colors"
                title="Fin - Algorithme terminé"
              >
                ⏭️
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
