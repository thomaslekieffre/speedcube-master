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
import { Search, Filter, Star, Eye, BookOpen, Zap, Heart } from "lucide-react";
import { CubeViewer } from "@/components/cube-viewer";
import { PUZZLES } from "@/components/puzzle-selector";
import { useFavorites } from "@/hooks/use-favorites";
import { useAlgorithms, Algorithm } from "@/hooks/use-algorithms";
import { toast } from "sonner";

const METHODS = [
  { id: "cfop", name: "CFOP" },
  { id: "roux", name: "Roux" },
  { id: "zz", name: "ZZ" },
  { id: "petrus", name: "Petrus" },
  { id: "ortega", name: "Ortega" },
  { id: "eg", name: "EG" },
];

const SETS = [
  { id: "oll", name: "OLL", method: "cfop" },
  { id: "pll", name: "PLL", method: "cfop" },
  { id: "f2l", name: "F2L", method: "cfop" },
  { id: "cll", name: "CLL", method: "ortega" },
  { id: "eg1", name: "EG-1", method: "eg" },
  { id: "eg2", name: "EG-2", method: "eg" },
];

export default function FavoritesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPuzzle, setSelectedPuzzle] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [selectedSet, setSelectedSet] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

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

  // Filtrer les algorithmes favoris
  const filteredFavorites = useMemo(() => {
    if (algorithmsLoading) return [];

    // D'abord, filtrer seulement les algorithmes qui sont en favoris
    const favoriteAlgorithms = algorithms.filter((algo) => isFavorite(algo.id));

    // Ensuite, appliquer les autres filtres
    const filtered = filterAlgorithms(favoriteAlgorithms, {
      puzzle_type: selectedPuzzle === "all" ? undefined : selectedPuzzle,
      method: selectedMethod === "all" ? undefined : selectedMethod,
      set_name: selectedSet === "all" ? undefined : selectedSet,
      difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
      search: searchQuery,
    });

    return filtered;
  }, [
    algorithms,
    algorithmsLoading,
    searchQuery,
    selectedPuzzle,
    selectedMethod,
    selectedSet,
    selectedDifficulty,
    favorites,
    isFavorite,
    filterAlgorithms,
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

  if (favoritesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement de vos favoris...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <Heart className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-foreground">Mes Favoris</h1>
          <Badge variant="outline" className="ml-2">
            {favorites.length} algorithme{favorites.length > 1 ? "s" : ""}
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Retrouvez tous vos algorithmes favoris en un seul endroit.
        </p>
      </motion.div>

      {/* Filtres */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un algorithme..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtres en grille */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Puzzle */}
              <div>
                <label className="text-sm font-medium mb-2 block">Puzzle</label>
                <Select
                  value={selectedPuzzle}
                  onValueChange={setSelectedPuzzle}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les puzzles" />
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
              </div>

              {/* Méthode */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Méthode
                </label>
                <Select
                  value={selectedMethod}
                  onValueChange={setSelectedMethod}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les méthodes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les méthodes</SelectItem>
                    {METHODS.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Set */}
              <div>
                <label className="text-sm font-medium mb-2 block">Set</label>
                <Select value={selectedSet} onValueChange={setSelectedSet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les sets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les sets</SelectItem>
                    {SETS.map((set) => (
                      <SelectItem key={set.id} value={set.id}>
                        {set.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulté */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Difficulté
                </label>
                <Select
                  value={selectedDifficulty}
                  onValueChange={setSelectedDifficulty}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les difficultés" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les difficultés</SelectItem>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Liste des favoris */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filteredFavorites.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {favorites.length === 0
                  ? "Aucun favori pour l'instant"
                  : "Aucun algorithme ne correspond aux filtres"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {favorites.length === 0
                  ? "Commencez par ajouter des algorithmes à vos favoris depuis la page Algorithmes."
                  : "Essayez de modifier vos critères de recherche."}
              </p>
              {favorites.length === 0 && (
                <Button onClick={() => router.push("/algos")}>
                  Explorer les algorithmes
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((algo, index) => (
              <motion.div
                key={algo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
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
                            className={`text-white text-xs ${getDifficultyColor(
                              algo.difficulty
                            )}`}
                          >
                            {getDifficultyText(algo.difficulty)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/algos/${algo.id}`)}
                          className="p-1"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(algo.id)}
                          disabled={favoritesLoading}
                          className="p-1 text-red-500"
                        >
                          <Star className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
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
                      <div className="h-48 bg-muted/30 rounded-lg border">
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
                      <h4 className="text-sm font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {algo.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
