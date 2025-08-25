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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Box,
} from "lucide-react";
import { useCustomMethods } from "@/hooks/use-custom-methods";
import { useUser } from "@clerk/nextjs";
import { PUZZLES } from "@/components/puzzle-selector";
import { toast } from "sonner";

const PUZZLE_TYPES = [
  { value: "all", label: "Tous les puzzles" },
  { value: "333", label: "3x3" },
  { value: "222", label: "2x2" },
  { value: "444", label: "4x4" },
  { value: "555", label: "5x5" },
  { value: "666", label: "6x6" },
  { value: "777", label: "7x7" },
  { value: "pyram", label: "Pyraminx" },
  { value: "skewb", label: "Skewb" },
  { value: "sq1", label: "Square-1" },
  { value: "clock", label: "Clock" },
  { value: "minx", label: "Megaminx" },
];

const STATUS_FILTERS = [
  { value: "approved", label: "Approuvées" },
  { value: "all", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "draft", label: "Brouillons" },
];

export default function MethodsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { methods, loading, filterMethods } = useCustomMethods();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPuzzle, setSelectedPuzzle] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("approved");

  // Filtrer les méthodes
  const filteredMethods = useMemo(() => {
    if (loading) return [];

    const filters: any = {};
    if (selectedPuzzle !== "all") filters.puzzle_type = selectedPuzzle;
    if (selectedStatus !== "all") filters.status = selectedStatus;
    if (searchQuery) filters.search = searchQuery;

    return filterMethods(methods, filters);
  }, [
    methods,
    loading,
    searchQuery,
    selectedPuzzle,
    selectedStatus,
    filterMethods,
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approuvée
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline">
            <Eye className="h-3 w-3 mr-1" />
            Brouillon
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejetée
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPuzzleName = (puzzleType: string) => {
    const puzzle = PUZZLES.find((p) => p.id === puzzleType);
    return puzzle ? puzzle.name : puzzleType;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                Méthodes
              </h1>
              <p className="text-muted-foreground text-lg">
                Découvrez et partagez des méthodes de résolution pour tous les
                puzzles
              </p>
            </div>
            {user && (
              <Button onClick={() => router.push("/methods/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une méthode
              </Button>
            )}
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
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une méthode..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Puzzle</label>
                  <Select
                    value={selectedPuzzle}
                    onValueChange={setSelectedPuzzle}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PUZZLE_TYPES.map((puzzle) => (
                        <SelectItem key={puzzle.value} value={puzzle.value}>
                          {puzzle.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_FILTERS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Résultats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {filteredMethods.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aucune méthode trouvée
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchQuery ||
                  selectedPuzzle !== "all" ||
                  selectedStatus !== "all"
                    ? "Essayez de modifier vos filtres pour voir plus de résultats."
                    : "Aucune méthode n'a encore été créée. Soyez le premier !"}
                </p>
                {user && (
                  <Button
                    onClick={() => router.push("/methods/create")}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer la première méthode
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMethods.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">
                            {method.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              <Box className="h-3 w-3 mr-1" />
                              {getPuzzleName(method.puzzle_type)}
                            </Badge>
                            {getStatusBadge(method.status)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {method.description_markdown && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {method.description_markdown
                              .replace(/[#*`]/g, "")
                              .substring(0, 150)}
                            {method.description_markdown.length > 150 && "..."}
                          </p>
                        )}

                        {method.cubing_notation_example && (
                          <div className="p-2 bg-muted/50 rounded text-xs font-mono">
                            {method.cubing_notation_example}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDate(method.created_at)}</span>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => router.push(`/methods/${method.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir la méthode
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
