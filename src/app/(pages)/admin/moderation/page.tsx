"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  Zap,
  Box,
  Users,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useUserRole } from "@/hooks/use-user-role";
import { useCustomMethods } from "@/hooks/use-custom-methods";
import { useCustomAlgorithms } from "@/hooks/use-custom-algorithms";
import { createSupabaseClientWithUser } from "@/lib/supabase";
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

export default function ModerationPage() {
  const { user } = useUser();
  const { role: userRole } = useUserRole();
  const { approveMethod, rejectMethod } = useCustomMethods();
  const { approveAlgorithm, rejectAlgorithm } = useCustomAlgorithms();

  const [activeTab, setActiveTab] = useState("methods");
  const [methods, setMethods] = useState<any[]>([]);
  const [algorithms, setAlgorithms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPuzzle, setSelectedPuzzle] = useState("all");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [itemToReject, setItemToReject] = useState<any>(null);

  // Fonctions de chargement directes (pour éviter les conflits avec les hooks)
  const loadPendingMethodsDirect = async () => {
    if (!user?.id) return [];

    try {
      console.log("🔍 loadPendingMethodsDirect: Début de la requête...");

      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user.id);

      const { data, error } = await supabase
        .from("custom_methods")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erreur Supabase loadPendingMethodsDirect:", error);
        throw error;
      }

      console.log("✅ loadPendingMethodsDirect: Données récupérées:", data);
      return data || [];
    } catch (err) {
      console.error(
        "❌ Erreur lors du chargement des méthodes en attente:",
        err
      );
      return [];
    }
  };

  const loadPendingAlgorithmsDirect = async () => {
    if (!user?.id) return [];

    try {
      console.log("🔍 loadPendingAlgorithmsDirect: Début de la requête...");

      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user.id);

      const { data, error } = await supabase
        .from("algorithms")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erreur Supabase loadPendingAlgorithmsDirect:", error);
        throw error;
      }

      console.log("✅ loadPendingAlgorithmsDirect: Données récupérées:", data);
      return data || [];
    } catch (err) {
      console.error(
        "❌ Erreur lors du chargement des algorithmes en attente:",
        err
      );
      return [];
    }
  };

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        console.log("🔄 Début du chargement des données de modération...");

        // Charger les méthodes en attente
        console.log("📋 Chargement des méthodes en attente...");
        const methodsData = await loadPendingMethodsDirect();
        console.log("✅ Méthodes chargées:", methodsData);

        // Charger les algorithmes en attente
        console.log("⚡ Chargement des algorithmes en attente...");
        const algorithmsData = await loadPendingAlgorithmsDirect();
        console.log("✅ Algorithmes chargés:", algorithmsData);

        setMethods(methodsData);
        setAlgorithms(algorithmsData);

        console.log("🎉 Chargement terminé avec succès");
      } catch (error) {
        console.error("❌ Erreur lors du chargement:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.id]); // Dépendance sur user.id

  // Vérifier l'accès après tous les hooks
  if (userRole !== "admin" && userRole !== "moderator") {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <div className="text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Accès refusé
            </h1>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à cette
              page.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Rôle actuel: {userRole}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getPuzzleName = (puzzleType: string) => {
    const puzzle = PUZZLES.find((p) => p.id === puzzleType);
    return puzzle ? puzzle.name : puzzleType;
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprove = async (item: any, type: "method" | "algorithm") => {
    try {
      let success = false;
      if (type === "method") {
        success = await approveMethod(item.id);
      } else {
        success = await approveAlgorithm(item.id);
      }

      if (success) {
        toast.success(
          `${type === "method" ? "Méthode" : "Algorithme"} approuvé !`
        );
        // Recharger les données
        const [methodsData, algorithmsData] = await Promise.all([
          loadPendingMethodsDirect(),
          loadPendingAlgorithmsDirect(),
        ]);
        setMethods(methodsData);
        setAlgorithms(algorithmsData);
      }
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      toast.error("Erreur lors de l'approbation");
    }
  };

  const handleReject = async (item: any, type: "method" | "algorithm") => {
    if (!rejectionReason.trim()) return;

    try {
      let success = false;
      if (type === "method") {
        success = await rejectMethod(item.id, rejectionReason);
      } else {
        success = await rejectAlgorithm(item.id, rejectionReason);
      }

      if (success) {
        toast.success(`${type === "method" ? "Méthode" : "Algorithme"} rejeté`);
        setShowRejectDialog(false);
        setRejectionReason("");
        setItemToReject(null);

        // Recharger les données
        const [methodsData, algorithmsData] = await Promise.all([
          loadPendingMethodsDirect(),
          loadPendingAlgorithmsDirect(),
        ]);
        setMethods(methodsData);
        setAlgorithms(algorithmsData);
      }
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      toast.error("Erreur lors du rejet");
    }
  };

  const openRejectDialog = (item: any, type: "method" | "algorithm") => {
    setItemToReject({ ...item, type });
    setShowRejectDialog(true);
  };

  // Filtrer les éléments
  const filteredMethods = methods.filter((method: any) => {
    if (selectedPuzzle !== "all" && method.puzzle_type !== selectedPuzzle)
      return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        method.name.toLowerCase().includes(searchLower) ||
        (method.description_markdown &&
          method.description_markdown.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const filteredAlgorithms = algorithms.filter((algo: any) => {
    if (selectedPuzzle !== "all" && algo.puzzle_type !== selectedPuzzle)
      return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        algo.name.toLowerCase().includes(searchLower) ||
        algo.notation.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Modération</h1>
              <p className="text-muted-foreground">
                Gérez les contenus en attente d'approbation
              </p>
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Méthodes en attente
                    </p>
                    <p className="text-2xl font-bold">{methods.length}</p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Algorithmes en attente
                    </p>
                    <p className="text-2xl font-bold">{algorithms.length}</p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total en attente
                    </p>
                    <p className="text-2xl font-bold">
                      {methods.length + algorithms.length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Actions aujourd'hui
                    </p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
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
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="methods" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Méthodes ({filteredMethods.length})
              </TabsTrigger>
              <TabsTrigger
                value="algorithms"
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Algorithmes ({filteredAlgorithms.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="methods" className="space-y-6">
              {filteredMethods.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Aucune méthode en attente
                    </h3>
                    <p className="text-muted-foreground text-center">
                      Toutes les méthodes ont été traitées !
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMethods.map((method: any, index: number) => (
                    <motion.div
                      key={method.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card className="h-full">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg">
                                  {method.name}
                                </CardTitle>
                                <Link
                                  href={`/admin/moderation/method/${method.id}`}
                                  className="text-primary hover:text-primary/80 transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </div>
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
                                  .substring(0, 100)}
                                {method.description_markdown.length > 100 &&
                                  "..."}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {method.usage_count} utilisations
                              </div>
                              <span>{formatDate(method.created_at)}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(method, "method")}
                                className="flex-1 bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approuver
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  openRejectDialog(method, "method")
                                }
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Rejeter
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="algorithms" className="space-y-6">
              {filteredAlgorithms.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Aucun algorithme en attente
                    </h3>
                    <p className="text-muted-foreground text-center">
                      Tous les algorithmes ont été traités !
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAlgorithms.map((algo: any, index: number) => (
                    <motion.div
                      key={algo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card className="h-full">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg">
                                  {algo.name}
                                </CardTitle>
                                <Link
                                  href={`/admin/moderation/algorithm/${algo.id}`}
                                  className="text-primary hover:text-primary/80 transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">
                                  <Box className="h-3 w-3 mr-1" />
                                  {getPuzzleName(algo.puzzle_type)}
                                </Badge>
                                {getStatusBadge(algo.status)}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="p-2 bg-muted/50 rounded text-sm font-mono">
                              {algo.notation}
                            </div>

                            {algo.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {algo.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {algo.usage_count} utilisations
                              </div>
                              <span>{formatDate(algo.created_at)}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(algo, "algorithm")}
                                className="flex-1 bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approuver
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  openRejectDialog(algo, "algorithm")
                                }
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Rejeter
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Dialog de rejet */}
        {showRejectDialog && itemToReject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>
                  Rejeter{" "}
                  {itemToReject.type === "method"
                    ? "la méthode"
                    : "l'algorithme"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Raison du rejet</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                    rows={3}
                    placeholder="Expliquez pourquoi ce contenu est rejeté..."
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectDialog(false);
                      setRejectionReason("");
                      setItemToReject(null);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleReject(itemToReject, itemToReject.type)
                    }
                    disabled={!rejectionReason.trim()}
                  >
                    Rejeter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
