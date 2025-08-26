"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  Box,
  Users,
  Calendar,
  User,
  FileText,
  Code,
  Eye,
} from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { useCustomMethods } from "@/hooks/use-custom-methods";
import { createSupabaseClientWithUser } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { PUZZLES } from "@/components/puzzle-selector";
import { toast } from "sonner";

export default function MethodDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { role: userRole } = useUserRole();
  const { approveMethod, rejectMethod } = useCustomMethods();

  const [method, setMethod] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Charger les détails de la méthode
  useEffect(() => {
    const loadMethod = async () => {
      if (!user?.id || !id) return;

      try {
        setLoading(true);
        const supabase = createSupabaseClientWithUser(user.id);

        const { data, error } = await supabase
          .from("custom_methods")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Erreur lors du chargement:", error);
          toast.error("Erreur lors du chargement de la méthode");
          return;
        }

        setMethod(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    loadMethod();
  }, [user?.id, id]);

  // Vérifier l'accès
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
              Vous n'avez pas les permissions nécessaires.
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
            <Calendar className="h-3 w-3 mr-1" />
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprove = async () => {
    try {
      const success = await approveMethod(method.id);
      if (success) {
        toast.success("Méthode approuvée !");
        router.push("/admin/moderation");
      }
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      toast.error("Erreur lors de l'approbation");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;

    try {
      const success = await rejectMethod(method.id, rejectionReason);
      if (success) {
        toast.success("Méthode rejetée");
        router.push("/admin/moderation");
      }
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      toast.error("Erreur lors du rejet");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="space-y-4">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!method) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <div className="text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Méthode non trouvée
            </h1>
            <p className="text-muted-foreground">
              Cette méthode n'existe pas ou a été supprimée.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/moderation")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">
                Détails de la méthode
              </h1>
              <p className="text-muted-foreground">
                Vérifiez tous les détails avant de prendre une décision
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">
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
              <CardContent className="space-y-4">
                {method.description_markdown && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Description
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      <div
                        className="text-sm text-muted-foreground whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: method.description_markdown
                            .replace(/\n/g, "<br>")
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\*(.*?)\*/g, "<em>$1</em>"),
                        }}
                      />
                    </div>
                  </div>
                )}

                {method.cubing_notation_example && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Exemple de notation
                    </h3>
                    <div className="p-3 bg-muted/50 rounded text-sm font-mono">
                      {method.cubing_notation_example}
                    </div>
                  </div>
                )}

                {method.algorithm_references && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Références d'algorithmes
                    </h3>
                    <div className="p-3 bg-muted/50 rounded text-sm">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(method.algorithm_references, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Métadonnées */}
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Créé par:</strong> {method.created_by}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Créé le:</strong> {formatDate(method.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Utilisations:</strong> {method.usage_count || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Visibilité:</strong>{" "}
                      {method.is_public ? "Publique" : "Privée"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleApprove}
                  className="w-full bg-green-500 hover:bg-green-600"
                  disabled={method.status !== "pending"}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  className="w-full"
                  disabled={method.status !== "pending"}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
              </CardContent>
            </Card>

            {/* Statut */}
            <Card>
              <CardHeader>
                <CardTitle>Statut</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Statut actuel:</span>
                    {getStatusBadge(method.status)}
                  </div>
                  {method.reviewed_by && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Revisé par:</span>
                      <span className="text-sm font-medium">
                        {method.reviewed_by}
                      </span>
                    </div>
                  )}
                  {method.reviewed_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Revisé le:</span>
                      <span className="text-sm">
                        {formatDate(method.reviewed_at)}
                      </span>
                    </div>
                  )}
                  {method.rejection_reason && (
                    <div>
                      <span className="text-sm font-medium">
                        Raison du rejet:
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {method.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog de rejet */}
        {showRejectDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Rejeter la méthode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Raison du rejet</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                    rows={3}
                    placeholder="Expliquez pourquoi cette méthode est rejetée..."
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectDialog(false);
                      setRejectionReason("");
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
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
