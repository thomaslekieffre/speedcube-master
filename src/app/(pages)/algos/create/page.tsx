"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Plus, X, Save, ArrowLeft } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useAlgorithms } from "@/hooks/use-algorithms";
import { toast } from "sonner";

interface AlgorithmForm {
  name: string;
  notation: string;
  puzzle_type: string;
  method: string;
  set_name: string;
  difficulty: string;
  description: string;
  scramble: string;
  solution: string;
  fingertricks: string;
  notes: string;
  alternatives: string[];
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

const METHODS = [
  { value: "cfop", label: "CFOP" },
  { value: "roux", label: "Roux" },
  { value: "zz", label: "ZZ" },
  { value: "petrus", label: "Petrus" },
  { value: "ortega", label: "Ortega" },
  { value: "cll", label: "CLL" },
  { value: "eg", label: "EG" },
  { value: "l4e", label: "L4E" },
  { value: "sarah", label: "Sarah's Intermediate" },
  { value: "yau", label: "Yau" },
  { value: "hoya", label: "Hoya" },
  { value: "reduction", label: "Réduction" },
];

const SETS = [
  { value: "oll", label: "OLL" },
  { value: "pll", label: "PLL" },
  { value: "f2l", label: "F2L" },
  { value: "cross", label: "Cross" },
  { value: "cll", label: "CLL" },
  { value: "eg", label: "EG" },
  { value: "l4e", label: "L4E" },
  { value: "centers", label: "Centers" },
  { value: "edges", label: "Edges" },
  { value: "parity", label: "Parity" },
  { value: "other", label: "Autre" },
];

const DIFFICULTIES = [
  { value: "beginner", label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced", label: "Avancé" },
  { value: "expert", label: "Expert" },
];

export default function CreateAlgorithmPage() {
  const router = useRouter();
  const { user } = useUser();
  const { createAlgorithm } = useAlgorithms();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<AlgorithmForm>({
    name: "",
    notation: "",
    puzzle_type: "333",
    method: "cfop",
    set_name: "other",
    difficulty: "intermediate",
    description: "",
    scramble: "",
    solution: "",
    fingertricks: "",
    notes: "",
    alternatives: [],
  });

  const [newAlternative, setNewAlternative] = useState("");

  const handleInputChange = (
    field: keyof AlgorithmForm,
    value: string | string[]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addAlternative = () => {
    if (newAlternative.trim()) {
      setForm((prev) => ({
        ...prev,
        alternatives: [...prev.alternatives, newAlternative.trim()],
      }));
      setNewAlternative("");
    }
  };

  const removeAlternative = (index: number) => {
    setForm((prev) => ({
      ...prev,
      alternatives: prev.alternatives.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const data = await createAlgorithm({
        name: form.name,
        notation: form.notation,
        puzzle_type: form.puzzle_type,
        method: form.method,
        set_name: form.set_name,
        difficulty: form.difficulty,
        description: form.description,
        scramble: form.scramble,
        solution: form.solution,
        fingertricks: form.fingertricks,
        notes: form.notes,
        alternatives: form.alternatives,
      });

      toast.success(
        "Algorithme créé ! Il sera visible après approbation par un modérateur."
      );
      router.push(`/algos/${data.id}`);
    } catch (error) {
      console.error("Erreur lors de la création de l'algorithme:", error);
      toast.error("Erreur lors de la création de l'algorithme");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Créer un algorithme
            </h1>
            <p className="text-muted-foreground">
              Ajoutez un nouvel algorithme à votre collection
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'algorithme *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ex: Sune, T-Perm, J-Perm..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notation">Notation *</Label>
                  <Input
                    id="notation"
                    value={form.notation}
                    onChange={(e) =>
                      handleInputChange("notation", e.target.value)
                    }
                    placeholder="Ex: R U R' U' R' F R F'"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="puzzle_type">Type de puzzle</Label>
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
                      {PUZZLE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">Méthode</Label>
                  <Select
                    value={form.method}
                    onValueChange={(value) =>
                      handleInputChange("method", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="set_name">Set</Label>
                  <Select
                    value={form.set_name}
                    onValueChange={(value) =>
                      handleInputChange("set_name", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SETS.map((set) => (
                        <SelectItem key={set.value} value={set.value}>
                          {set.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulté</Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(value) =>
                    handleInputChange("difficulty", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((difficulty) => (
                      <SelectItem
                        key={difficulty.value}
                        value={difficulty.value}
                      >
                        {difficulty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Description et détails */}
          <Card>
            <CardHeader>
              <CardTitle>Description et détails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Décrivez l'algorithme, son cas d'usage..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scramble">Scramble</Label>
                  <Input
                    id="scramble"
                    value={form.scramble}
                    onChange={(e) =>
                      handleInputChange("scramble", e.target.value)
                    }
                    placeholder="Scramble qui mène à ce cas"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solution">Solution</Label>
                  <Input
                    id="solution"
                    value={form.solution}
                    onChange={(e) =>
                      handleInputChange("solution", e.target.value)
                    }
                    placeholder="Solution alternative ou étapes"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fingertricks">Fingertricks</Label>
                <Textarea
                  id="fingertricks"
                  value={form.fingertricks}
                  onChange={(e) =>
                    handleInputChange("fingertricks", e.target.value)
                  }
                  placeholder="Notes sur l'exécution, les doigts à utiliser..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Notes supplémentaires, conseils..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Alternatives */}
          <Card>
            <CardHeader>
              <CardTitle>Alternatives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newAlternative}
                  onChange={(e) => setNewAlternative(e.target.value)}
                  placeholder="Ajouter une notation alternative"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addAlternative())
                  }
                />
                <Button type="button" onClick={addAlternative} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {form.alternatives.length > 0 && (
                <div className="space-y-2">
                  <Label>Alternatives ajoutées</Label>
                  <div className="flex flex-wrap gap-2">
                    {form.alternatives.map((alt, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {alt}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAlternative(index)}
                          className="h-4 w-4 p-0 hover:bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Création..." : "Créer l'algorithme"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
