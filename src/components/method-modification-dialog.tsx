"use client";

import { useState } from "react";
import { CustomMethod, AlgorithmReference } from "@/types/database";
import { useCustomMethods } from "@/hooks/use-custom-methods";
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
import {
  Edit,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";

interface MethodModificationDialogProps {
  method: CustomMethod;
  onSuccess?: () => void;
}

const PUZZLE_TYPES = [
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

export function MethodModificationDialog({
  method,
  onSuccess,
}: MethodModificationDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: method.name,
    puzzle_type: method.puzzle_type,
    description_markdown: method.description_markdown || "",
    cubing_notation_example: method.cubing_notation_example || "",
    is_public: method.is_public,
    algorithm_references: method.algorithm_references || [],
  });
  const [modificationReason, setModificationReason] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [newAlgorithmRef, setNewAlgorithmRef] = useState({
    algorithm_id: "",
    name: "",
    notation: "",
    description: "",
    order: 0,
  });

  const { updateMethod, loading, error } = useCustomMethods();

  const handleInputChange = (
    field: string,
    value: string | boolean | AlgorithmReference[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Vérifier s'il y a des changements
    const originalValue = method[field as keyof CustomMethod];
    setHasChanges(JSON.stringify(originalValue) !== JSON.stringify(value));
  };

  const addAlgorithmReference = () => {
    if (newAlgorithmRef.name && newAlgorithmRef.notation) {
      const newRef = {
        ...newAlgorithmRef,
        order: formData.algorithm_references.length,
      };

      handleInputChange("algorithm_references", [
        ...formData.algorithm_references,
        newRef,
      ]);
      setNewAlgorithmRef({
        algorithm_id: "",
        name: "",
        notation: "",
        description: "",
        order: 0,
      });
    } else {
      toast.error("Veuillez remplir le nom et la notation de l'algorithme");
    }
  };

  const removeAlgorithmReference = (index: number) => {
    const updatedRefs = formData.algorithm_references.filter(
      (_, i) => i !== index
    );
    handleInputChange("algorithm_references", updatedRefs);
  };

  const updateAlgorithmReference = (
    index: number,
    field: keyof AlgorithmReference,
    value: string
  ) => {
    const updatedRefs = [...formData.algorithm_references];
    updatedRefs[index] = { ...updatedRefs[index], [field]: value };
    handleInputChange("algorithm_references", updatedRefs);
  };

  const handleSubmit = async () => {
    if (!hasChanges) {
      toast.error("Aucune modification détectée");
      return;
    }

    const success = await updateMethod(
      method.id,
      {
        ...formData,
        status: "pending", // Remettre en attente de modération
      },
      modificationReason || undefined
    );

    if (success) {
      toast.success("Méthode modifiée avec succès ! Elle sera re-vérifiée.");
      setOpen(false);
      onSuccess?.();
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modifier la méthode
          </DialogTitle>
          <DialogDescription>
            Modifiez votre méthode. Elle sera automatiquement soumise à
            re-vérification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut actuel */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Statut actuel :</span>
            <Badge
              variant={method.status === "approved" ? "default" : "secondary"}
            >
              {method.status === "approved" ? "Approuvé" : method.status}
            </Badge>
          </div>

          {/* Raison de la modification */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Raison de la modification (optionnel)
            </Label>
            <Textarea
              id="reason"
              placeholder="Expliquez pourquoi vous modifiez cette méthode..."
              value={modificationReason}
              onChange={(e) => setModificationReason(e.target.value)}
              rows={2}
            />
          </div>

          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la méthode</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: CFOP, Roux, ZZ..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="puzzle_type">Type de puzzle</Label>
              <Select
                value={formData.puzzle_type}
                onValueChange={(value) =>
                  handleInputChange("puzzle_type", value)
                }
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

          {/* Description Markdown */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Markdown)</Label>
            <Textarea
              id="description"
              value={formData.description_markdown}
              onChange={(e) =>
                handleInputChange("description_markdown", e.target.value)
              }
              placeholder="Décrivez votre méthode en utilisant le format Markdown..."
              rows={8}
              className="font-mono text-sm"
            />
            <div className="text-xs text-muted-foreground">
              Supporte : **gras**, *italique*, # titres, - listes, `code`, etc.
            </div>
          </div>

          {/* Exemples de notation */}
          <div className="space-y-2">
            <Label htmlFor="notation">Exemples de notation</Label>
            <Textarea
              id="notation"
              value={formData.cubing_notation_example}
              onChange={(e) =>
                handleInputChange("cubing_notation_example", e.target.value)
              }
              placeholder="Ex: R U R' U' | F R U R' U' F'"
              rows={3}
              className="font-mono"
            />
            <div className="text-xs text-muted-foreground">
              Séparez plusieurs exemples avec " | "
            </div>
          </div>

          {/* Algorithmes de référence */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Algorithmes de référence</Label>
            </div>

            {/* Nouvel algorithme */}
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Nom de l'algorithme *</Label>
                  <Input
                    value={newAlgorithmRef.name}
                    onChange={(e) =>
                      setNewAlgorithmRef((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Ex: Sune, Anti-Sune..."
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Notation *</Label>
                  <Input
                    value={newAlgorithmRef.notation}
                    onChange={(e) =>
                      setNewAlgorithmRef((prev) => ({
                        ...prev,
                        notation: e.target.value,
                      }))
                    }
                    placeholder="Ex: R U R' U'"
                    className="h-8 text-sm font-mono"
                  />
                </div>
              </div>
              <div className="mt-3">
                <Label className="text-xs">Description (optionnel)</Label>
                <Input
                  value={newAlgorithmRef.description}
                  onChange={(e) =>
                    setNewAlgorithmRef((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Description courte..."
                  className="h-8 text-sm"
                />
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAlgorithmReference}
                  disabled={!newAlgorithmRef.name || !newAlgorithmRef.notation}
                  className="h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Ajouter l'algorithme
                </Button>
              </div>
            </div>

            {/* Liste des algorithmes existants */}
            {formData.algorithm_references.length > 0 && (
              <div className="space-y-3">
                {formData.algorithm_references.map((ref, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-card">
                    <div className="flex items-center gap-2 mb-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Algorithme {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAlgorithmReference(index)}
                        className="h-6 w-6 p-0 ml-auto"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Nom</Label>
                        <Input
                          value={ref.name}
                          onChange={(e) =>
                            updateAlgorithmReference(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Notation</Label>
                        <Input
                          value={ref.notation}
                          onChange={(e) =>
                            updateAlgorithmReference(
                              index,
                              "notation",
                              e.target.value
                            )
                          }
                          className="h-8 text-sm font-mono"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={ref.description || ""}
                        onChange={(e) =>
                          updateAlgorithmReference(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visibilité */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => handleInputChange("is_public", e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="is_public">Méthode publique</Label>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasChanges || loading}
            className="gap-2"
          >
            {loading ? "Modification..." : "Modifier la méthode"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
