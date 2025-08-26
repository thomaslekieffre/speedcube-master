"use client";

import { useState } from "react";
import { Algorithm } from "@/lib/supabase";
import { useAlgorithmModifications } from "@/hooks/use-algorithm-modifications";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface AlgorithmModificationDialogProps {
  algorithm: Algorithm;
  onSuccess?: () => void;
}

export function AlgorithmModificationDialog({
  algorithm,
  onSuccess,
}: AlgorithmModificationDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: algorithm.name,
    notation: algorithm.notation,
    description: algorithm.description,
    scramble: algorithm.scramble,
    solution: algorithm.solution,
    fingertricks: algorithm.fingertricks,
    notes: algorithm.notes,
    difficulty: algorithm.difficulty,
    alternatives: algorithm.alternatives.join(", "),
  });
  const [modificationReason, setModificationReason] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const { modifyAlgorithm, loading, error } = useAlgorithmModifications();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Vérifier s'il y a des changements
    const originalValue = algorithm[field as keyof Algorithm];
    const newValue =
      field === "alternatives" ? value.split(", ").filter(Boolean) : value;
    setHasChanges(JSON.stringify(originalValue) !== JSON.stringify(newValue));
  };

  const handleSubmit = async () => {
    if (!hasChanges) {
      toast.error("Aucune modification détectée");
      return;
    }

    const modifications = {
      name: formData.name,
      notation: formData.notation,
      description: formData.description,
      scramble: formData.scramble,
      solution: formData.solution,
      fingertricks: formData.fingertricks,
      notes: formData.notes,
      difficulty: formData.difficulty,
      alternatives: formData.alternatives.split(", ").filter(Boolean),
    };

    const success = await modifyAlgorithm(
      algorithm.id,
      modifications,
      modificationReason
    );

    if (success) {
      toast.success(
        "Algorithme modifié avec succès. Il sera re-vérifié par les modérateurs."
      );
      setOpen(false);
      onSuccess?.();
    } else {
      toast.error(error || "Erreur lors de la modification");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-4 w-4" />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modifier l'algorithme
          </DialogTitle>
          <DialogDescription>
            Modifiez votre algorithme. Il sera automatiquement soumis à
            re-vérification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Statut actuel */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Statut actuel :</span>
            <Badge
              variant={
                algorithm.status === "approved" ? "default" : "secondary"
              }
            >
              {algorithm.status === "approved" ? "Approuvé" : algorithm.status}
            </Badge>
            {algorithm.modification_count > 0 && (
              <Badge variant="outline">
                {algorithm.modification_count} modification(s)
              </Badge>
            )}
          </div>

          {/* Raison de la modification */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Raison de la modification (optionnel)
            </Label>
            <Textarea
              id="reason"
              placeholder="Expliquez pourquoi vous modifiez cet algorithme..."
              value={modificationReason}
              onChange={(e) => setModificationReason(e.target.value)}
              rows={2}
            />
          </div>

          {/* Formulaire */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notation">Notation</Label>
              <Input
                id="notation"
                value={formData.notation}
                onChange={(e) => handleInputChange("notation", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulté</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  handleInputChange("difficulty", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scramble">Scramble</Label>
              <Input
                id="scramble"
                value={formData.scramble}
                onChange={(e) => handleInputChange("scramble", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solution">Solution</Label>
            <Textarea
              id="solution"
              value={formData.solution}
              onChange={(e) => handleInputChange("solution", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fingertricks">Fingertricks</Label>
            <Textarea
              id="fingertricks"
              value={formData.fingertricks}
              onChange={(e) =>
                handleInputChange("fingertricks", e.target.value)
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alternatives">
              Alternatives (séparées par des virgules)
            </Label>
            <Input
              id="alternatives"
              value={formData.alternatives}
              onChange={(e) =>
                handleInputChange("alternatives", e.target.value)
              }
              placeholder="R U R' U', R' F R F'"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={2}
            />
          </div>

          {/* Avertissement */}
          {hasChanges && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium">Attention</p>
                <p>
                  Votre algorithme sera soumis à re-vérification après
                  modification.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !hasChanges}
            className="gap-2"
          >
            {loading ? "Modification..." : "Modifier l'algorithme"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
