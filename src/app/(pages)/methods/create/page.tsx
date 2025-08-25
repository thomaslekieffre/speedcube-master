"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Eye,
  Box,
  Zap,
  Plus,
  X,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useCustomMethods } from "@/hooks/use-custom-methods";
import { MarkdownEditor } from "@/components/markdown-editor";
import { CubeViewer } from "@/components/cube-viewer";
import { PUZZLES, PuzzleType } from "@/components/puzzle-selector";
import { toast } from "sonner";
import type {
  CubeVisualizationData,
  AlgorithmReference,
} from "@/types/database";

interface MethodForm {
  name: string;
  puzzle_type: string;
  description_markdown: string;
  cubing_notation_examples: string[];
  cube_visualization_data: CubeVisualizationData | null;
  algorithm_references: AlgorithmReference[];
  is_public: boolean;
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

export default function CreateMethodPage() {
  const router = useRouter();
  const { user } = useUser();
  const { createMethod } = useCustomMethods();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<MethodForm>({
    name: "",
    puzzle_type: "333",
    description_markdown: "",
    cubing_notation_examples: [""],
    cube_visualization_data: null,
    algorithm_references: [],
    is_public: true,
  });

  const [newAlgorithmRef, setNewAlgorithmRef] = useState({
    algorithm_id: "",
    name: "",
    notation: "",
    description: "",
    order: 0,
  });

  const handleInputChange = (field: keyof MethodForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addAlgorithmReference = () => {
    if (
      newAlgorithmRef.algorithm_id &&
      newAlgorithmRef.name &&
      newAlgorithmRef.notation
    ) {
      setForm((prev) => ({
        ...prev,
        algorithm_references: [
          ...prev.algorithm_references,
          {
            ...newAlgorithmRef,
            order: prev.algorithm_references.length,
          },
        ],
      }));
      setNewAlgorithmRef({
        algorithm_id: "",
        name: "",
        notation: "",
        description: "",
        order: 0,
      });
    }
  };

  const removeAlgorithmReference = (index: number) => {
    setForm((prev) => ({
      ...prev,
      algorithm_references: prev.algorithm_references.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const addCubingNotationExample = () => {
    setForm((prev) => ({
      ...prev,
      cubing_notation_examples: [...prev.cubing_notation_examples, ""],
    }));
  };

  const removeCubingNotationExample = (index: number) => {
    setForm((prev) => ({
      ...prev,
      cubing_notation_examples: prev.cubing_notation_examples.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const updateCubingNotationExample = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      cubing_notation_examples: prev.cubing_notation_examples.map(
        (example, i) => (i === index ? value : example)
      ),
    }));
  };

  const updateCubeVisualization = (
    index: number,
    data: CubeVisualizationData
  ) => {
    setForm((prev) => ({
      ...prev,
      cube_visualization_data: data,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Vous devez être connecté pour créer une méthode");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Le nom de la méthode est requis");
      return;
    }

    if (!form.description_markdown.trim()) {
      toast.error("La description de la méthode est requise");
      return;
    }

    setLoading(true);

    try {
      const method = await createMethod({
        name: form.name.trim(),
        puzzle_type: form.puzzle_type,
        description_markdown: form.description_markdown,
        cubing_notation_example:
          form.cubing_notation_examples.filter((ex) => ex.trim()).join(" | ") ||
          undefined,
        cube_visualization_data: form.cube_visualization_data || undefined,
        algorithm_references:
          form.algorithm_references.length > 0
            ? form.algorithm_references
            : undefined,
        is_public: form.is_public,
      });

      if (method) {
        toast.success(
          "Méthode créée avec succès ! Elle sera modérée avant publication."
        );
        router.push(`/methods/${method.id}`);
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error("Erreur lors de la création de la méthode");
    } finally {
      setLoading(false);
    }
  };

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
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Créer une méthode
              </h1>
              <p className="text-muted-foreground">
                Partagez votre méthode de résolution avec la communauté
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Informations de base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la méthode *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Ex: CFOP Avancé, Roux Intuitive..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="puzzle_type">Type de puzzle *</Label>
                    <Select
                      value={form.puzzle_type}
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_public"
                    checked={form.is_public}
                    onCheckedChange={(checked) =>
                      handleInputChange("is_public", checked)
                    }
                  />
                  <Label htmlFor="is_public">Méthode publique</Label>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Description Markdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Description de la méthode *
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Décrivez votre méthode en détail. Utilisez l'éditeur Markdown
                  pour formater votre texte.
                </p>
              </CardHeader>
              <CardContent>
                <MarkdownEditor
                  value={form.description_markdown}
                  onChange={(value) =>
                    handleInputChange("description_markdown", value)
                  }
                  placeholder="Décrivez votre méthode, ses étapes, ses avantages..."
                  showPreview={true}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Notation Cubing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  Notation Cubing (optionnel)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ajoutez un exemple de notation pour illustrer votre méthode.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {form.cubing_notation_examples.map((example, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`cubing_notation_${index}`}>
                          Notation d'exemple {index + 1}
                        </Label>
                        {form.cubing_notation_examples.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCubingNotationExample(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <Input
                        id={`cubing_notation_${index}`}
                        value={example}
                        onChange={(e) =>
                          updateCubingNotationExample(index, e.target.value)
                        }
                        placeholder="Ex: R U R' U' F' U F"
                        className="font-mono"
                      />
                      {example && (
                        <div className="p-4 border rounded-lg bg-muted/50">
                          <h4 className="text-sm font-medium mb-2">
                            Visualisation
                          </h4>
                          <CubeViewer
                            scramble={example}
                            puzzleType={form.puzzle_type as PuzzleType}
                            onReset={() => {}}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCubingNotationExample}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un autre exemple
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Références d'algorithmes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Algorithmes de référence (optionnel)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ajoutez des liens vers des algorithmes existants pour
                  illustrer votre méthode.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Liste des algorithmes existants */}
                {form.algorithm_references.length > 0 && (
                  <div className="space-y-2">
                    <Label>Algorithmes ajoutés</Label>
                    <div className="space-y-2">
                      {form.algorithm_references.map((ref, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{ref.name}</div>
                            <div className="text-sm text-muted-foreground font-mono">
                              {ref.notation}
                            </div>
                            {ref.description && (
                              <div className="text-sm text-muted-foreground">
                                {ref.description}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAlgorithmReference(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Ajouter un nouvel algorithme */}
                <div className="space-y-3">
                  <Label>Ajouter un algorithme</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="ID de l'algorithme"
                      value={newAlgorithmRef.algorithm_id}
                      onChange={(e) =>
                        setNewAlgorithmRef((prev) => ({
                          ...prev,
                          algorithm_id: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Nom de l'algorithme"
                      value={newAlgorithmRef.name}
                      onChange={(e) =>
                        setNewAlgorithmRef((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Notation (ex: R U R' U')"
                      value={newAlgorithmRef.notation}
                      onChange={(e) =>
                        setNewAlgorithmRef((prev) => ({
                          ...prev,
                          notation: e.target.value,
                        }))
                      }
                      className="font-mono"
                    />
                    <Input
                      placeholder="Description (optionnel)"
                      value={newAlgorithmRef.description}
                      onChange={(e) =>
                        setNewAlgorithmRef((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addAlgorithmReference}
                    disabled={
                      !newAlgorithmRef.algorithm_id ||
                      !newAlgorithmRef.name ||
                      !newAlgorithmRef.notation
                    }
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter l'algorithme
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between pt-6"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Votre méthode sera modérée avant publication
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Créer la méthode
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
