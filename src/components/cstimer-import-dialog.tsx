"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import {
  parseCSTimerFile,
  convertToSpeedcubeFormat,
  validateCSTimerFile,
  type ImportResult,
} from "@/lib/cstimer-import";
import {
  useSupabaseImport,
  type ImportStats,
} from "@/hooks/use-supabase-import";
import { useUser } from "@clerk/nextjs";

interface CSTimerImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CSTimerImportDialog({
  open,
  onOpenChange,
}: CSTimerImportDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [importProgress, setImportProgress] = useState<{
    currentSession: number;
    totalSessions: number;
    currentSessionName: string;
    currentBatch: number;
    totalBatches: number;
    importedSolves: number;
    totalSolves: number;
  } | null>(null);
  const { user } = useUser();
  const { importSolves, isImporting: isSupabaseImporting } =
    useSupabaseImport();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".txt")) {
      alert("Veuillez sélectionner un fichier .txt");
      return;
    }

    setFile(selectedFile);
    setImportResult(null);

    try {
      const content = await selectedFile.text();

      if (!validateCSTimerFile(content)) {
        setImportResult({
          success: false,
          message:
            "Fichier invalide. Veuillez sélectionner un fichier cstimer valide.",
          errors: ["Format de fichier non reconnu"],
        });
        return;
      }

      const result = parseCSTimerFile(content);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        message: "Erreur lors de la lecture du fichier",
        errors: [error instanceof Error ? error.message : "Erreur inconnue"],
      });
    }
  };

  const handleImport = async () => {
    if (!file || !importResult?.success || !importResult.data) return;

    // Vérifier si l'utilisateur est connecté
    if (!user) {
      setImportStats({
        totalSolves: 0,
        importedSolves: 0,
        skippedSolves: 0,
        unsupportedPuzzles: new Set(),
        errors: ["Vous devez être connecté pour importer des données"],
      });
      return;
    }

    try {
      const content = await file.text();
      const result = parseCSTimerFile(content);

      if (result.success && result.data) {
        const convertedSolves = convertToSpeedcubeFormat(result.data.sessions);

        // Importer les solves dans Supabase avec callback de progression
        const stats = await importSolves(convertedSolves, (progress) => {
          setImportProgress(progress);
        });
        setImportStats(stats);
        setImportProgress(null); // Réinitialiser la progression

        // Si succès, fermer le dialog après un délai
        if (stats.importedSolves > 0) {
          // Déclencher l'événement de mise à jour des sessions
          console.log(
            "📤 Déclenchement de l'événement sessions-updated (import cstimer)"
          );
          window.dispatchEvent(new CustomEvent("sessions-updated"));

          setTimeout(() => {
            onOpenChange(false);
            setFile(null);
            setImportResult(null);
            setImportStats(null);
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'import:", error);
      setImportStats({
        totalSolves: 0,
        importedSolves: 0,
        skippedSolves: 0,
        unsupportedPuzzles: new Set(),
        errors: [error instanceof Error ? error.message : "Erreur inconnue"],
      });
    }
  };

  const resetDialog = () => {
    setFile(null);
    setImportResult(null);
    setIsImporting(false);
    setDragActive(false);
    setImportProgress(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          resetDialog();
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Importer depuis cstimer
          </DialogTitle>
          <DialogDescription>
            Glissez-déposez votre fichier cstimer ou cliquez pour sélectionner
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Zone de drop */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {file ? file.name : "Glissez votre fichier cstimer ici"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              ou cliquez pour sélectionner un fichier .txt
            </p>
            <input
              type="file"
              accept=".txt"
              onChange={(e) =>
                e.target.files?.[0] && handleFileSelect(e.target.files[0])
              }
              className="hidden"
              id="file-input"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("file-input")?.click()}
              disabled={isImporting}
            >
              Sélectionner un fichier
            </Button>
          </div>

          {/* Prévisualisation */}
          {importResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {importResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  Prévisualisation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Statut:</span>
                  <Badge
                    variant={importResult.success ? "default" : "destructive"}
                  >
                    {importResult.success ? "Valide" : "Erreur"}
                  </Badge>
                </div>

                {importResult.success && importResult.data && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Sessions:
                      </span>
                      <Badge variant="secondary">
                        {importResult.data.sessions.length}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Solves totaux:
                      </span>
                      <Badge variant="secondary">
                        {importResult.data.totalSolves}
                      </Badge>
                    </div>

                    <div>
                      <span className="text-sm text-muted-foreground">
                        Puzzles détectés:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {importResult.data.puzzles.map((puzzle) => (
                          <Badge
                            key={puzzle}
                            variant="outline"
                            className="text-xs"
                          >
                            {puzzle}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">
                        Sessions:
                      </span>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {importResult.data.sessions.map((session, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                          >
                            <span>{session.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {session.solves.length} solves
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Progression de l'import */}
                {importProgress && (
                  <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                        Import en cours...
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {/* Progression générale */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>
                              Session {importProgress.currentSession}/
                              {importProgress.totalSessions}
                            </span>
                            <span>
                              {importProgress.importedSolves}/
                              {importProgress.totalSolves} solves
                            </span>
                          </div>
                          <Progress
                            value={
                              (importProgress.importedSolves /
                                importProgress.totalSolves) *
                              100
                            }
                            className="h-2"
                          />
                        </div>

                        {/* Progression du batch actuel */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>
                              Batch {importProgress.currentBatch}/
                              {importProgress.totalBatches}
                            </span>
                            <span>{importProgress.currentSessionName}</span>
                          </div>
                          <Progress
                            value={
                              (importProgress.currentBatch /
                                importProgress.totalBatches) *
                              100
                            }
                            className="h-2"
                          />
                        </div>

                        {/* Détails */}
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>
                            Session actuelle:{" "}
                            {importProgress.currentSessionName}
                          </div>
                          <div>
                            Batch: {importProgress.currentBatch}/
                            {importProgress.totalBatches}
                          </div>
                          <div>
                            Solves traités: {importProgress.importedSolves}/
                            {importProgress.totalSolves}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Statistiques d'import */}
                {importStats && (
                  <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle className="h-5 w-5" />
                        Import terminé
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {importStats.importedSolves}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Solves importés
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {importStats.skippedSolves}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Solves ignorés
                          </div>
                        </div>
                      </div>

                      {importStats.unsupportedPuzzles.size > 0 && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-2">
                            Puzzles non supportés:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {Array.from(importStats.unsupportedPuzzles).map(
                              (puzzle) => (
                                <Badge
                                  key={puzzle}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {puzzle}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {importStats.errors.length > 0 && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-1">
                              {importStats.errors.map((error, index) => (
                                <div key={index} className="text-xs">
                                  {error}
                                </div>
                              ))}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}

                {importResult.errors && importResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        {importResult.errors.map((error, index) => (
                          <div key={index} className="text-xs">
                            {error}
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {importResult.success && !importStats && !importProgress && (
                  <Button
                    onClick={handleImport}
                    disabled={isSupabaseImporting}
                    className="w-full"
                  >
                    {isSupabaseImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Import en cours...
                      </>
                    ) : (
                      "Importer les solves"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
