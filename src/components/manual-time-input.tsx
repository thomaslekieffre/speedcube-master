"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { PUZZLES, type PuzzleType } from "./puzzle-selector";
import { formatTime } from "@/lib/time";

interface ManualTimeInputProps {
  onSave: (
    time: number,
    penalty: "none" | "plus2" | "dnf",
    puzzleType: PuzzleType,
    scramble?: string
  ) => void;
  scramble?: string;
  disabled?: boolean;
  className?: string;
  defaultPuzzle?: PuzzleType;
  puzzleLocked?: boolean;
}

export function ManualTimeInput({
  onSave,
  scramble,
  disabled = false,
  className = "",
  defaultPuzzle = "333",
  puzzleLocked = false,
}: ManualTimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeInput, setTimeInput] = useState("");
  const [penalty, setPenalty] = useState<"none" | "plus2" | "dnf">("none");
  const [selectedPuzzle, setSelectedPuzzle] =
    useState<PuzzleType>(defaultPuzzle);
  const [customScramble, setCustomScramble] = useState(scramble || "");
  const [isValid, setIsValid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mettre à jour le puzzle sélectionné quand defaultPuzzle change
  useEffect(() => {
    setSelectedPuzzle(defaultPuzzle);
  }, [defaultPuzzle]);

  // Mettre à jour le scramble quand il change
  useEffect(() => {
    setCustomScramble(scramble || "");
  }, [scramble]);

  // Validation du temps
  useEffect(() => {
    const validateTime = (input: string) => {
      // Formats acceptés: "12.34", "1:23.45", "1:23", "12"
      const timeRegex = /^(\d{1,2}:)?(\d{1,2})(\.\d{1,2})?$/;
      if (!timeRegex.test(input)) return false;

      const parts = input.split(":");
      const secondsPart = parts.length > 1 ? parts[1] : parts[0];
      const [seconds, milliseconds = "0"] = secondsPart.split(".");

      const minutes = parts.length > 1 ? parseInt(parts[0]) : 0;
      const secs = parseInt(seconds);
      const ms = parseInt(milliseconds.padEnd(2, "0"));

      // Validation des valeurs
      if (minutes > 59 || secs > 59 || ms > 99) return false;
      if (minutes === 0 && secs === 0 && ms === 0) return false;

      // Limite à 10 minutes pour éviter les erreurs
      if (minutes > 10) return false;

      return true;
    };

    setIsValid(validateTime(timeInput));
  }, [timeInput]);

  // Focus sur l'input quand ouvert
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const parseTimeToMs = (input: string): number => {
    const parts = input.split(":");
    const secondsPart = parts.length > 1 ? parts[1] : parts[0];
    const [seconds, milliseconds = "0"] = secondsPart.split(".");

    const minutes = parts.length > 1 ? parseInt(parts[0]) : 0;
    const secs = parseInt(seconds);
    const ms = parseInt(milliseconds.padEnd(2, "0"));

    return (minutes * 60 + secs) * 1000 + ms * 10;
  };

  const handleSave = () => {
    if (!isValid) return;

    const timeMs = parseTimeToMs(timeInput);
    const finalScramble = customScramble.trim() || scramble || "";

    onSave(timeMs, penalty, selectedPuzzle, finalScramble);

    // Reset form
    setTimeInput("");
    setPenalty("none");
    setSelectedPuzzle(defaultPuzzle);
    setCustomScramble(scramble || "");
    setIsOpen(false);

    toast.success("Temps ajouté manuellement");
  };

  const handleCancel = () => {
    setTimeInput("");
    setPenalty("none");
    setSelectedPuzzle(defaultPuzzle);
    setCustomScramble(scramble || "");
    setIsOpen(false);
  };



  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className={`w-full ${className}`}
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter un temps manuellement
      </Button>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Entrée manuelle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Puzzle Type */}
        {!puzzleLocked && (
          <div className="space-y-2">
            <Label htmlFor="puzzle-select">Puzzle</Label>
            <Select
              value={selectedPuzzle}
              onValueChange={(value: PuzzleType) => setSelectedPuzzle(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PUZZLES.map((puzzle) => (
                  <SelectItem key={puzzle.id} value={puzzle.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${puzzle.color}`} />
                      {puzzle.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {puzzleLocked && (
          <div className="space-y-2">
            <Label>Puzzle</Label>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
              <div
                className={`w-3 h-3 rounded-full ${
                  PUZZLES.find((p) => p.id === selectedPuzzle)?.color
                }`}
              />
              <span className="font-medium">
                {PUZZLES.find((p) => p.id === selectedPuzzle)?.name}
              </span>
              <Badge variant="secondary" className="ml-auto">
                Fixé
              </Badge>
            </div>
          </div>
        )}

        {/* Temps */}
        <div className="space-y-2">
          <Label htmlFor="time-input">Temps</Label>
          <Input
            ref={inputRef}
            id="time-input"
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            placeholder="12.34 ou 1:23.45"
            className="font-mono"
          />
          <div className="text-xs text-muted-foreground">
            Formats acceptés: 12.34, 1:23.45, 1:23 (max 10 minutes)
          </div>
        </div>

        {/* Scramble (optionnel) */}
        <div className="space-y-2">
          <Label htmlFor="scramble-input">Scramble (optionnel)</Label>
          <Input
            id="scramble-input"
            value={customScramble}
            onChange={(e) => setCustomScramble(e.target.value)}
            placeholder="R U R' U'"
            className="font-mono text-sm"
          />
        </div>

        {/* Pénalités */}
        <div className="space-y-2">
          <Label>Pénalité</Label>
          <div className="flex gap-2">
            <Button
              variant={penalty === "none" ? "default" : "outline"}
              size="sm"
              onClick={() => setPenalty("none")}
              className="flex-1"
            >
              Aucune
            </Button>
            <Button
              variant={penalty === "plus2" ? "default" : "outline"}
              size="sm"
              onClick={() => setPenalty("plus2")}
              className="flex-1 text-warning hover:text-warning"
            >
              +2
            </Button>
            <Button
              variant={penalty === "dnf" ? "default" : "outline"}
              size="sm"
              onClick={() => setPenalty("dnf")}
              className="flex-1 text-destructive hover:text-destructive"
            >
              DNF
            </Button>
          </div>
        </div>

        {/* Prévisualisation */}
        {isValid && (
          <div className="p-3 bg-muted/50 rounded-lg border">
            <div className="text-sm text-muted-foreground mb-1">
              Temps final:
            </div>
            <div className="font-mono text-lg font-bold">
              {penalty === "dnf"
                ? "DNF"
                : penalty === "plus2"
                ? `${formatTime(parseTimeToMs(timeInput) + 2000)} (+2)`
                : formatTime(parseTimeToMs(timeInput))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Puzzle: {PUZZLES.find((p) => p.id === selectedPuzzle)?.name}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} disabled={!isValid} className="flex-1">
            Ajouter
          </Button>
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
