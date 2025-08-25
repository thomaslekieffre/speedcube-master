"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Box,
  Zap,
  Edit,
  Trash2,
  Flag,
  Share,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useCustomMethods } from "@/hooks/use-custom-methods";
import { useUserRole } from "@/hooks/use-user-role";
import { CubeViewer } from "@/components/cube-viewer";
import { PUZZLES, PuzzleType } from "@/components/puzzle-selector";
import type { CustomMethod } from "@/types/database";

export default function MethodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { isModerator } = useUserRole();
  const {
    getMethodById,
    approveMethod,
    rejectMethod,
    deleteMethod,
    createModerationNotification,
  } = useCustomMethods();

  const [method, setMethod] = useState<CustomMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Charger la méthode
  useEffect(() => {
    const loadMethod = async () => {
      if (params.id) {
        try {
          setLoading(true);
          const methodData = await getMethodById(params.id as string);
          setMethod(methodData);
        } catch (error) {
          console.error("Erreur lors du chargement de la méthode:", error);
          toast.error("Erreur lors du chargement de la méthode");
        } finally {
          setLoading(false);
        }
      }
    };
    loadMethod();
  }, [params.id, getMethodById]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = async () => {
    if (method) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Lien copié dans le presse-papiers");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error("Erreur lors de la copie");
      }
    }
  };

  const handleApprove = async () => {
    if (!method) return;

    try {
      const success = await approveMethod(method.id);
      if (success) {
        setMethod((prev) => (prev ? { ...prev, status: "approved" } : null));
      }
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
    }
  };

  const handleReject = async () => {
    if (!method || !rejectionReason.trim()) return;

    try {
      const success = await rejectMethod(method.id, rejectionReason);
      if (success) {
        setMethod((prev) =>
          prev
            ? { ...prev, status: "rejected", rejection_reason: rejectionReason }
            : null
        );
        setShowRejectDialog(false);
        setRejectionReason("");
      }
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
    }
  };

  const handleDelete = async () => {
    if (!method) return;

    if (confirm("Êtes-vous sûr de vouloir supprimer cette méthode ?")) {
      try {
        const success = await deleteMethod(method.id);
        if (success) {
          toast.success("Méthode supprimée");
          router.push("/methods");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleReport = async () => {
    if (!method) return;

    try {
      await createModerationNotification(
        method.id,
        "report",
        "Signalement par un utilisateur"
      );
      toast.success("Signalement envoyé aux modérateurs");
    } catch (error) {
      console.error("Erreur lors du signalement:", error);
    }
  };

  // Rendu du Markdown
  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mb-2">$1</h3>')
      .replace(/^---$/gm, '<hr class="my-4 border-border" />')
      .replace(
        /<span style='font-size: 1\.2em;'>(.*?)<\/span>/g,
        '<span class="text-lg">$1</span>'
      )
      .replace(
        /<span style='font-size: 0\.9em;'>(.*?)<\/span>/g,
        '<span class="text-sm">$1</span>'
      )
      .replace(/\n/g, "<br />");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
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
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Méthode non trouvée
            </h1>
            <p className="text-muted-foreground mb-6">
              La méthode que vous recherchez n'existe pas ou a été supprimée.
            </p>
            <Button onClick={() => router.push("/methods")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux méthodes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canEdit =
    user &&
    (method.created_by === user.id || isModerator()) &&
    method.status !== "approved";
  const canModerate = isModerator();

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {method.name}
                </h1>
                {getStatusBadge(method.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Box className="h-4 w-4" />
                  {getPuzzleName(method.puzzle_type)}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {method.usage_count} utilisations
                </div>
                <div>Créée le {formatDate(method.created_at)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-8 w-8 p-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Share className="h-4 w-4" />
                )}
              </Button>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/methods/${method.id}/edit`)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              {!canEdit && method.status === "approved" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReport}
                  className="h-8 w-8 p-0"
                >
                  <Flag className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Contenu principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Actions de modération */}
          {canModerate && method.status === "pending" && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">
                      Actions de modération
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Cette méthode est en attente d'approbation
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleApprove}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowRejectDialog(true)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raison du rejet */}
          {method.status === "rejected" && method.rejection_reason && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-destructive mb-1">
                      Méthode rejetée
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {method.rejection_reason}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="description" className="space-y-4">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              {method.cubing_notation_example && (
                <TabsTrigger value="visualization">Visualisation</TabsTrigger>
              )}
              {method.algorithm_references &&
                method.algorithm_references.length > 0 && (
                  <TabsTrigger value="algorithms">Algorithmes</TabsTrigger>
                )}
            </TabsList>

            <TabsContent value="description" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Description de la méthode</CardTitle>
                </CardHeader>
                <CardContent>
                  {method.description_markdown ? (
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(method.description_markdown),
                      }}
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      Aucune description disponible.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {method.cubing_notation_example && (
              <TabsContent value="visualization" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Visualisations du cube</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Exemples de notation pour illustrer la méthode
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {method.cubing_notation_example
                        .split(" | ")
                        .map((notation, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">
                                Exemple {index + 1}
                              </h4>
                              <div className="text-sm text-muted-foreground font-mono">
                                {notation}
                              </div>
                            </div>
                            <div className="flex justify-center">
                              <CubeViewer
                                scramble={notation}
                                puzzleType={method.puzzle_type as PuzzleType}
                                onReset={() => {}}
                                showControls={true}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {method.algorithm_references &&
              method.algorithm_references.length > 0 && (
                <TabsContent value="algorithms" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Algorithmes de référence</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Algorithmes associés à cette méthode
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {method.algorithm_references
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((ref, index) => (
                            <div
                              key={index}
                              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-1">
                                    {ref.name}
                                  </h4>
                                  <div className="text-sm font-mono text-muted-foreground mb-2">
                                    {ref.notation}
                                  </div>
                                  {ref.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {ref.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex justify-center">
                                  <CubeViewer
                                    scramble={ref.notation}
                                    puzzleType={
                                      method.puzzle_type as PuzzleType
                                    }
                                    onReset={() => {}}
                                    showControls={true}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
          </Tabs>
        </motion.div>

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
