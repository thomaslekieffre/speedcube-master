"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertTriangle,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { useAlgorithms, Algorithm } from "@/hooks/use-algorithms";
import { toast } from "sonner";

export default function ModerateAlgorithmsPage() {
  const router = useRouter();
  const { isModerator, loading: roleLoading } = useUserRole();
  const { loadPendingAlgorithms, approveAlgorithm, rejectAlgorithm } =
    useAlgorithms();
  const [pendingAlgorithms, setPendingAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");

  // Charger les algorithmes en attente
  const loadPending = async () => {
    try {
      setLoading(true);
      const algorithms = await loadPendingAlgorithms();
      setPendingAlgorithms(algorithms);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast.error("Erreur lors du chargement des algorithmes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleLoading && isModerator()) {
      loadPending();
    }
  }, [roleLoading]);

  // Rediriger si pas modérateur
  useEffect(() => {
    if (!roleLoading && !isModerator()) {
      router.push("/algos");
    }
  }, [roleLoading, router]);

  const handleApprove = async (algorithm: Algorithm) => {
    try {
      await approveAlgorithm(algorithm.id);
      toast.success("Algorithme approuvé !");
      loadPending(); // Recharger la liste
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      toast.error("Erreur lors de l'approbation");
    }
  };

  const handleReject = async () => {
    if (!selectedAlgorithm || !rejectionReason.trim()) {
      toast.error("Veuillez fournir une raison de rejet");
      return;
    }

    try {
      await rejectAlgorithm(selectedAlgorithm.id, rejectionReason);
      toast.success("Algorithme rejeté");
      setRejectDialogOpen(false);
      setSelectedAlgorithm(null);
      setRejectionReason("");
      loadPending(); // Recharger la liste
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      toast.error("Erreur lors du rejet");
    }
  };

  const openRejectDialog = (algorithm: Algorithm) => {
    setSelectedAlgorithm(algorithm);
    setRejectDialogOpen(true);
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

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isModerator()) {
    return null; // Redirection en cours
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
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Modération</h1>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Gérez les algorithmes en attente d'approbation
          </p>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg font-semibold">
                    {pendingAlgorithms.length} algorithme
                    {pendingAlgorithms.length !== 1 ? "s" : ""} en attente
                  </span>
                </div>
                {pendingAlgorithms.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-500/10 text-yellow-600"
                  >
                    Nécessite votre attention
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Liste des algorithmes en attente */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingAlgorithms.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Aucun algorithme en attente
                </h3>
                <p className="text-muted-foreground">
                  Tous les algorithmes ont été traités !
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingAlgorithms.map((algorithm, index) => (
              <motion.div
                key={algorithm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-3 mb-2">
                          {algorithm.name}
                          <Badge
                            variant="outline"
                            className="text-yellow-600 border-yellow-600"
                          >
                            En attente
                          </Badge>
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{algorithm.puzzle_type}</span>
                          <span>•</span>
                          <span>{algorithm.method}</span>
                          <span>•</span>
                          <span>{algorithm.set_name}</span>
                          <span>•</span>
                          <Badge
                            variant="secondary"
                            className={`${getDifficultyColor(
                              algorithm.difficulty
                            )} text-white`}
                          >
                            {getDifficultyText(algorithm.difficulty)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Notation</h4>
                      <code className="bg-muted px-3 py-2 rounded text-sm font-mono">
                        {algorithm.notation}
                      </code>
                    </div>

                    {algorithm.description && (
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {algorithm.description}
                        </p>
                      </div>
                    )}

                    {algorithm.alternatives &&
                      algorithm.alternatives.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Alternatives</h4>
                          <div className="flex flex-wrap gap-2">
                            {algorithm.alternatives.map((alt, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                              >
                                {alt}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                    <div className="flex items-center gap-2 pt-4 border-t">
                      <Button
                        onClick={() => handleApprove(algorithm)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approuver
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => openRejectDialog(algorithm)}
                        className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Rejeter
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => router.push(`/algos/${algorithm.id}`)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Voir détails
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Dialog de rejet */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Rejeter l'algorithme
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Veuillez expliquer pourquoi cet algorithme est rejeté. Cette
                information sera visible par le créateur.
              </p>
              <Textarea
                placeholder="Raison du rejet..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectDialogOpen(false);
                    setSelectedAlgorithm(null);
                    setRejectionReason("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Rejeter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
