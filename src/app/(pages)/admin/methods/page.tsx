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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Users,
  Zap,
  Box,
  AlertTriangle,
} from "lucide-react";
import { useCustomMethods } from "@/hooks/use-custom-methods";
import { useUserRole } from "@/hooks/use-user-role";
import { PUZZLES } from "@/components/puzzle-selector";
import { toast } from "sonner";

const STATUS_FILTERS = [
  { value: "all", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "approved", label: "Approuvées" },
  { value: "rejected", label: "Rejetées" },
  { value: "draft", label: "Brouillons" },
];

export default function AdminMethodsPage() {
  const { role: userRole } = useUserRole();
  const { methods, loading, approveMethod, rejectMethod, loadMethods } =
    useCustomMethods();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [selectedPuzzle, setSelectedPuzzle] = useState("all");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<any>(null);

  // Vérifier les permissions
  if (userRole !== "admin" && userRole !== "moderator") {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Accès refusé
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Vous n'avez pas les permissions nécessaires pour accéder à cette
                page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Filtrer les méthodes
  const filteredMethods = methods.filter((method) => {
    const matchesStatus =
      selectedStatus === "all" || method.status === selectedStatus;
    const matchesPuzzle =
      selectedPuzzle === "all" || method.puzzle_type === selectedPuzzle;
    const matchesSearch =
      !searchQuery ||
      method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.description_markdown
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPuzzle && matchesSearch;
  });

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprove = async (methodId: string) => {
    try {
      await approveMethod(methodId);
      toast.success("Méthode approuvée avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'approbation");
    }
  };

  const handleReject = async (methodId: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Veuillez fournir une raison de rejet");
      return;
    }

    try {
      await rejectMethod(methodId, rejectionReason);
      toast.success("Méthode rejetée avec succès");
      setRejectionReason("");
      setSelectedMethod(null);
    } catch (error) {
      toast.error("Erreur lors du rejet");
    }
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
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Modération des méthodes
            </h1>
            <p className="text-muted-foreground text-lg">
              Gérez et modérez les méthodes soumises par la communauté
            </p>
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
                      <SelectItem value="all">Tous les puzzles</SelectItem>
                      {PUZZLES.map((puzzle) => (
                        <SelectItem key={puzzle.id} value={puzzle.id}>
                          {puzzle.name}
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
                  Aucune méthode ne correspond à vos critères de recherche.
                </p>
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
                  <Card className="h-full">
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

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {method.usage_count} utilisations
                          </div>
                          <span>{formatDate(method.created_at)}</span>
                        </div>

                        {/* Actions de modération */}
                        {method.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(method.id)}
                              className="flex-1"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setSelectedMethod(method)}
                              className="flex-1"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() =>
                            window.open(`/methods/${method.id}`, "_blank")
                          }
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

        {/* Statistiques */}
        {filteredMethods.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {filteredMethods.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Méthodes
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-500">
                      {
                        filteredMethods.filter((m) => m.status === "approved")
                          .length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Approuvées
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-500">
                      {
                        filteredMethods.filter((m) => m.status === "pending")
                          .length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      En attente
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-500">
                      {
                        filteredMethods.filter((m) => m.status === "rejected")
                          .length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Rejetées
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Modal de rejet */}
      {selectedMethod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Rejeter la méthode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Veuillez fournir une raison pour le rejet de la méthode "
                {selectedMethod.name}".
              </p>
              <Input
                placeholder="Raison du rejet..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedMethod(null);
                    setRejectionReason("");
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedMethod.id)}
                  className="flex-1"
                >
                  Rejeter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
