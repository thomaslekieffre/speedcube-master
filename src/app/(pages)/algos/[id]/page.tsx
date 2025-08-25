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
  Copy,
  Check,
  BookOpen,
  Eye,
  Zap,
  Clock,
  Target,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { useFavorites } from "@/hooks/use-favorites";
import { useAlgorithms, Algorithm } from "@/hooks/use-algorithms";
import { useLearningSystem } from "@/hooks/use-learning-system";

export default function AlgorithmDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [algorithm, setAlgorithm] = useState<Algorithm | null>(null);
  const [copied, setCopied] = useState(false);
  const cubeContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const currentAlgoIdRef = useRef<string | null>(null);

  const {
    isFavorite,
    toggleFavorite,
    loading: favoritesLoading,
  } = useFavorites();
  const { getAlgorithmById } = useAlgorithms();
  const { addToLearning, learningData } = useLearningSystem();

  // Charger l'algorithme par ID et initialiser le cube
  useEffect(() => {
    const loadAlgorithm = async () => {
      if (params.id) {
        const algo = await getAlgorithmById(params.id as string);
        setAlgorithm(algo);
      }
    };
    loadAlgorithm();
  }, [params.id, getAlgorithmById]);

  // Fonction pour obtenir le nom du puzzle
  const getPuzzleName = (puzzleType: string) => {
    const puzzleNames: { [key: string]: any } = {
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
    return puzzleNames[puzzleType] || "3x3x3";
  };

  // Initialiser le TwistyPlayer quand l'algorithme est chargé
  useEffect(() => {
    if (
      algorithm &&
      cubeContainerRef.current &&
      currentAlgoIdRef.current !== algorithm.id
    ) {
      currentAlgoIdRef.current = algorithm.id;

      // Nettoyer le conteneur
      cubeContainerRef.current.innerHTML = "";

      // Importer et créer le TwistyPlayer dynamiquement
      import("cubing/twisty").then(({ TwistyPlayer }) => {
        const viewer = new TwistyPlayer({
          puzzle: getPuzzleName(algorithm.puzzle_type),
          alg: algorithm.notation,
          background: "none",
          controlPanel: "auto", // Contrôles automatiques
          viewerLink: "none",
        });

        cubeContainerRef.current?.appendChild(viewer);
        viewerRef.current = viewer;
      });
    }
  }, [algorithm]);

  const handleToggleFavorite = async () => {
    if (algorithm) {
      await toggleFavorite(algorithm.id);
    }
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
              onClick={handleToggleFavorite}
              disabled={favoritesLoading}
              className={`flex items-center gap-2 ${
                algorithm && isFavorite(algorithm.id)
                  ? "text-yellow-500"
                  : "text-muted-foreground"
              }`}
            >
              <Star
                className={`h-4 w-4 ${
                  algorithm && isFavorite(algorithm.id) ? "fill-current" : ""
                }`}
              />
              {algorithm && isFavorite(algorithm.id)
                ? "Favori"
                : "Ajouter aux favoris"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => algorithm && addToLearning(algorithm.id)}
              className={`flex items-center gap-2 ${
                algorithm && learningData.some(item => item.algorithm_id === algorithm.id)
                  ? "text-green-500"
                  : "text-muted-foreground"
              }`}
            >
              <GraduationCap
                className={`h-4 w-4 ${
                  algorithm && learningData.some(item => item.algorithm_id === algorithm.id) ? "fill-current" : ""
                }`}
              />
              {algorithm && learningData.some(item => item.algorithm_id === algorithm.id)
                ? "En apprentissage"
                : "Ajouter à l'apprentissage"}
            </Button>
          </div>

          {/* Titre et badges */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {algorithm.name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">{algorithm.method.toUpperCase()}</Badge>
              <Badge variant="outline">
                {algorithm.set_name.toUpperCase()}
              </Badge>
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
            <div className="text-sm text-muted-foreground mt-2">
              Créé par {algorithm.creator_username}
            </div>
          </div>
        </motion.div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Visualisation du cube avec contrôles */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Visualisation de l'algorithme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={cubeContainerRef}
                  className="h-96 bg-muted/30 rounded-lg border flex items-center justify-center"
                >
                  {!algorithm && (
                    <div className="text-muted-foreground">
                      Chargement de la visualisation...
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground text-center mt-2">
                  Utilisez les contrôles pour voir l'algorithme en action
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
