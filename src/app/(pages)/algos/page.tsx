"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Star, Eye, BookOpen, Zap, Plus } from "lucide-react";
import { CubeViewer } from "@/components/cube-viewer";
import { PUZZLES } from "@/components/puzzle-selector";
import { useFavorites } from "@/hooks/use-favorites";
import { useAlgorithms, Algorithm } from "@/hooks/use-algorithms";

// Méthodes disponibles
const METHODS = [
  { id: "cfop", name: "CFOP", puzzle: "333" },
  { id: "roux", name: "Roux", puzzle: "333" },
  { id: "zz", name: "ZZ", puzzle: "333" },
  { id: "ortega", name: "Ortega", puzzle: "222" },
  { id: "cll", name: "CLL", puzzle: "222" },
  { id: "eg", name: "EG", puzzle: "222" },
];

// Sets d'algorithmes
const SETS = [
  { id: "oll", name: "OLL", method: "cfop" },
  { id: "pll", name: "PLL", method: "cfop" },
  { id: "f2l", name: "F2L", method: "cfop" },
  { id: "cll", name: "CLL", method: "ortega" },
  { id: "eg1", name: "EG-1", method: "eg" },
  { id: "eg2", name: "EG-2", method: "eg" },
];

export default function AlgorithmsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPuzzle, setSelectedPuzzle] = useState("333");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [selectedSet, setSelectedSet] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const {
    favorites,
    loading: favoritesLoading,
    toggleFavorite,
    isFavorite,
  } = useFavorites();

  const {
    algorithms,
    loading: algorithmsLoading,
    filterAlgorithms,
  } = useAlgorithms();

  // Filtrer les algorithmes
  const filteredAlgorithms = useMemo(() => {
    if (algorithmsLoading) return [];

    const filtered = filterAlgorithms(algorithms, {
      puzzle_type: selectedPuzzle === "all" ? undefined : selectedPuzzle,
      method: selectedMethod === "all" ? undefined : selectedMethod,
      set_name: selectedSet === "all" ? undefined : selectedSet,
      difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
      search: searchQuery,
    });

    // Filtrer par favoris si nécessaire
    if (favoritesOnly) {
      return filtered.filter((algo) => isFavorite(algo.id));
    }

    return filtered;
  }, [
    algorithms,
    algorithmsLoading,
    searchQuery,
    selectedPuzzle,
    selectedMethod,
    selectedSet,
    selectedDifficulty,
    favoritesOnly,
    favorites,
    filterAlgorithms,
    isFavorite,
  ]);

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

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Algorithmes
              </h1>
              <p className="text-muted-foreground text-lg">
                Explorez et maîtrisez les algorithmes pour tous les puzzles WCA
              </p>
            </div>
            <Button
              onClick={() => router.push("/algos/create")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Créer un algorithme
            </Button>
          </div>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un algorithme..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtres en grille */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Puzzle */}
                <Select
                  value={selectedPuzzle}
                  onValueChange={setSelectedPuzzle}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Puzzle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les puzzles</SelectItem>
                    {PUZZLES.map((puzzle) => (
                      <SelectItem key={puzzle.id} value={puzzle.id}>
                        {puzzle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Méthode */}
                <Select
                  value={selectedMethod}
                  onValueChange={setSelectedMethod}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les méthodes</SelectItem>
                    {METHODS.filter(
                      (m) =>
                        selectedPuzzle === "all" || m.puzzle === selectedPuzzle
                    ).map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Set */}
                <Select value={selectedSet} onValueChange={setSelectedSet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Set" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les sets</SelectItem>
                    {SETS.filter(
                      (s) =>
                        selectedMethod === "all" || s.method === selectedMethod
                    ).map((set) => (
                      <SelectItem key={set.id} value={set.id}>
                        {set.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Difficulté */}
                <Select
                  value={selectedDifficulty}
                  onValueChange={setSelectedDifficulty}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulté" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les difficultés</SelectItem>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>

                {/* Favoris */}
                <Button
                  variant={favoritesOnly ? "default" : "outline"}
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                  className="flex items-center gap-2"
                >
                  <Star
                    className={`h-4 w-4 ${favoritesOnly ? "fill-current" : ""}`}
                  />
                  Favoris
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Résultats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {filteredAlgorithms.length} algorithme
              {filteredAlgorithms.length !== 1 ? "s" : ""} trouvé
              {filteredAlgorithms.length !== 1 ? "s" : ""}
            </h2>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => router.push("/algos/create")}
            >
              <BookOpen className="h-4 w-4" />
              Créer un algorithme
            </Button>
          </div>

          {/* Grille d'algorithmes */}
          {filteredAlgorithms.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  Aucun algorithme trouvé
                </h3>
                <p className="text-muted-foreground">
                  Essayez de modifier vos filtres ou ajoutez de nouveaux
                  algorithmes.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlgorithms.map((algo, index) => (
                <motion.div
                  key={algo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">
                            {algo.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {algo.method.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {algo.set_name.toUpperCase()}
                            </Badge>
                            <Badge
                              className={`text-xs text-white ${getDifficultyColor(
                                algo.difficulty
                              )}`}
                            >
                              {getDifficultyText(algo.difficulty)}
                            </Badge>
                            {algo.status === "pending" && (
                              <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                                En attente
                              </Badge>
                            )}
                            {algo.status === "rejected" && (
                              <Badge variant="outline" className="text-xs text-red-600 border-red-600">
                                Rejeté
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(algo.id)}
                          disabled={favoritesLoading}
                          className={`p-1 ${
                            isFavorite(algo.id)
                              ? "text-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              isFavorite(algo.id) ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Notation */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Notation</h4>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {algo.notation}
                        </code>
                      </div>

                      {/* Visualiseur 3D */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Visualisation
                        </h4>
                        <div className="h-64 bg-muted/30 rounded-lg border">
                          <CubeViewer
                            puzzleType={algo.puzzle_type as any}
                            scramble={algo.notation}
                            onReset={() => {}}
                            showControls={false}
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Description
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {algo.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/algos/${algo.id}`)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                        <Button size="sm" variant="outline">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Apprendre
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
