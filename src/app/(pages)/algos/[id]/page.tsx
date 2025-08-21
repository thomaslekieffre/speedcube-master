"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Star,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  BookOpen,
  Eye,
  Zap,
  Clock,
  Target,
} from "lucide-react";
import { CubeViewer } from "@/components/cube-viewer";
import { toast } from "sonner";

// Types pour les algorithmes
interface Algorithm {
  id: string;
  name: string;
  notation: string;
  puzzle_type: string;
  method: string;
  set: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  description: string;
  scramble: string;
  solution: string;
  fingertricks?: string;
  notes?: string;
  alternatives?: string[];
  isFavorite?: boolean;
}

// Données mock pour commencer
const MOCK_ALGORITHMS: Algorithm[] = [
  {
    id: "1",
    name: "Sune",
    notation: "R U R' U R U2 R'",
    puzzle_type: "333",
    method: "CFOP",
    set: "OLL",
    difficulty: "beginner",
    description:
      "Un des algorithmes OLL les plus importants à connaître. Il résout le cas où les coins de la face supérieure forment un motif en 'S'.",
    scramble: "R U R' U R U2 R'",
    solution: "R U R' U R U2 R'",
    fingertricks:
      "Commencez avec votre main droite en position de départ. Utilisez votre index droit pour le R' et votre pouce pour le U. L'algorithme est très fluide et peut être exécuté rapidement.",
    notes:
      "Très utile pour de nombreuses situations OLL. C'est souvent le premier algorithme OLL que les speedcubeurs apprennent.",
    alternatives: [
      "R U R' U R U2 R' (standard)",
      "R U2 R' U' R U' R' (inverse)",
      "R U R' U R U2 R' (avec rotations)",
    ],
  },
  {
    id: "2",
    name: "T Permutation",
    notation: "R U R' U' R' F R2 U' R' U' R U R' F'",
    puzzle_type: "333",
    method: "CFOP",
    set: "PLL",
    difficulty: "intermediate",
    description:
      "Permutation PLL en forme de T, très courante. Elle permute les coins et les arêtes de manière spécifique.",
    scramble: "R U R' U' R' F R2 U' R' U' R U R' F'",
    solution: "R U R' U' R' F R2 U' R' U' R U R' F'",
    fingertricks:
      "Commencez avec le pouce sur F. L'algorithme utilise beaucoup de mouvements R et U, ce qui le rend très rapide à exécuter.",
    notes:
      "Un des PLL les plus rapides à exécuter. Très utile pour les compétitions.",
    alternatives: [
      "R U R' U' R' F R2 U' R' U' R U R' F' (standard)",
      "F R U' R' U' R U R' F' R U R' U' R' F R F' (alternative)",
    ],
  },
  {
    id: "3",
    name: "Ortega T",
    notation: "R U R' U' R' F R F'",
    puzzle_type: "222",
    method: "Ortega",
    set: "CLL",
    difficulty: "beginner",
    description:
      "Algorithme CLL pour 2x2, forme en T. Base de la méthode Ortega.",
    scramble: "R U R' U' R' F R F'",
    solution: "R U R' U' R' F R F'",
    notes: "Base de la méthode Ortega",
    alternatives: [
      "R U R' U' R' F R F' (standard)",
      "F R U' R' U' R U R' F' (inverse)",
    ],
  },
];

export default function AlgorithmDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [algorithm, setAlgorithm] = useState<Algorithm | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  // Trouver l'algorithme par ID
  useEffect(() => {
    const algo = MOCK_ALGORITHMS.find((a) => a.id === params.id);
    if (algo) {
      setAlgorithm(algo);
      setIsFavorite(algo.isFavorite || false);
    }
  }, [params.id]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Sauvegarder en base de données
    toast.success(isFavorite ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  const copyNotation = async () => {
    if (algorithm) {
      await navigator.clipboard.writeText(algorithm.notation);
      setCopied(true);
      toast.success("Notation copiée !");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500";
      case "intermediate":
        return "bg-yellow-500";
      case "advanced":
        return "bg-orange-500";
      case "expert":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "Débutant";
      case "intermediate":
        return "Intermédiaire";
      case "advanced":
        return "Avancé";
      case "expert":
        return "Expert";
      default:
        return difficulty;
    }
  };

  if (!algorithm) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <div className="text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              Algorithme non trouvé
            </h2>
            <p className="text-muted-foreground mb-4">
              L'algorithme que vous recherchez n'existe pas.
            </p>
            <Button onClick={() => router.push("/algos")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux algorithmes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Header avec navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/algos")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux algorithmes
            </Button>
            <Button
              variant="ghost"
              onClick={toggleFavorite}
              className={`flex items-center gap-2 ${
                isFavorite ? "text-yellow-500" : "text-muted-foreground"
              }`}
            >
              <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
              {isFavorite ? "Favori" : "Ajouter aux favoris"}
            </Button>
          </div>

          {/* Titre et badges */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {algorithm.name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">{algorithm.method.toUpperCase()}</Badge>
              <Badge variant="outline">{algorithm.set.toUpperCase()}</Badge>
              <Badge
                className={`text-white ${getDifficultyColor(
                  algorithm.difficulty
                )}`}
              >
                {getDifficultyText(algorithm.difficulty)}
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">
              {algorithm.description}
            </p>
          </div>
        </motion.div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Visualiseur 3D */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Visualisation 3D</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-muted/30 rounded-lg border">
                  <CubeViewer
                    puzzleType={algorithm.puzzle_type as any}
                    scramble={algorithm.notation}
                    onReset={() => {}}
                    showControls={true}
                    algorithm={algorithm.notation}
                  />
                </div>

                <p className="text-xs text-muted-foreground text-center mt-2">
                  Utilisez la souris pour faire tourner le cube
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Informations détaillées */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Notation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Notation</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyNotation}
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copié" : "Copier"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-lg bg-muted px-4 py-3 rounded-lg block font-mono">
                  {algorithm.notation}
                </code>
              </CardContent>
            </Card>

            {/* Tabs pour informations détaillées */}
            <Card>
              <CardHeader>
                <CardTitle>Détails</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="fingertricks" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                      value="fingertricks"
                      className="flex items-center gap-2"
                    >
                      <Target className="h-4 w-4" />
                      Fingertricks
                    </TabsTrigger>
                    <TabsTrigger
                      value="notes"
                      className="flex items-center gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      Notes
                    </TabsTrigger>
                    <TabsTrigger
                      value="alternatives"
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Alternatives
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="fingertricks" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-2">
                            Technique recommandée
                          </h4>
                          <p className="text-muted-foreground">
                            {algorithm.fingertricks ||
                              "Aucune information sur les fingertricks disponible."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-2">
                            Informations complémentaires
                          </h4>
                          <p className="text-muted-foreground">
                            {algorithm.notes ||
                              "Aucune note disponible pour cet algorithme."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="alternatives" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Eye className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">
                            Variantes et alternatives
                          </h4>
                          {algorithm.alternatives &&
                          algorithm.alternatives.length > 0 ? (
                            <div className="space-y-2">
                              {algorithm.alternatives.map((alt, index) => (
                                <div
                                  key={index}
                                  className="bg-muted/50 p-3 rounded-lg"
                                >
                                  <code className="text-sm font-mono">
                                    {alt}
                                  </code>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">
                              Aucune alternative disponible pour cet algorithme.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Ajouter à ma révision
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Chronométrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
