"use client";

import { useState } from "react";
import { Trash2, Edit, Copy, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Solve {
  id: string;
  time: number;
  penalty: "none" | "plus2" | "dnf";
  date: Date;
  scramble: string;
  notes?: string;
}

interface SolveListProps {
  solves: Solve[];
  onUpdateSolve: (id: string, updates: Partial<Solve>) => void;
  onDeleteSolve: (id: string) => void;
}

export function SolveList({
  solves,
  onUpdateSolve,
  onDeleteSolve,
}: SolveListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState("");

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${seconds}.${centiseconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getEffectiveTime = (solve: Solve) => {
    if (solve.penalty === "dnf") return "DNF";
    if (solve.penalty === "plus2")
      return `${formatTime(solve.time + 2000)} (+2)`;
    return formatTime(solve.time);
  };

  const getPenaltyBadge = (penalty: Solve["penalty"]) => {
    switch (penalty) {
      case "plus2":
        return (
          <Badge variant="secondary" className="bg-warning/20 text-warning">
            +2
          </Badge>
        );
      case "dnf":
        return (
          <Badge
            variant="secondary"
            className="bg-destructive/20 text-destructive"
          >
            DNF
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleEdit = (solve: Solve) => {
    setEditingId(solve.id);
    setEditingNotes(solve.notes || "");
  };

  const handleSave = (id: string) => {
    onUpdateSolve(id, { notes: editingNotes });
    setEditingId(null);
    setEditingNotes("");
  };

  const handleCopyScramble = (scramble: string) => {
    navigator.clipboard.writeText(scramble);
  };

  if (solves.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <p className="text-lg mb-2">Aucun solve pour l'instant</p>
            <p className="text-sm">Fais ton premier solve pour commencer !</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Historique des solves</span>
          <Badge variant="outline">{solves.length} solves</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Temps</TableHead>
              <TableHead>Scramble</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solves.map((solve, index) => (
              <TableRow key={solve.id}>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {solves.length - index}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">
                      {getEffectiveTime(solve)}
                    </span>
                    {getPenaltyBadge(solve.penalty)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm max-w-[120px] truncate">
                      {solve.scramble}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyScramble(solve.scramble)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(solve.date)}
                </TableCell>
                <TableCell>
                  {editingId === solve.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border rounded bg-background"
                        placeholder="Ajouter des notes..."
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSave(solve.id)}
                        className="h-6 px-2"
                      >
                        ✓
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {solve.notes || "—"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(solve)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onUpdateSolve(solve.id, { penalty: "plus2" })
                      }
                      className={`h-6 px-2 ${
                        solve.penalty === "plus2"
                          ? "bg-warning/20 text-warning"
                          : ""
                      }`}
                    >
                      +2
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onUpdateSolve(solve.id, { penalty: "dnf" })
                      }
                      className={`h-6 px-2 ${
                        solve.penalty === "dnf"
                          ? "bg-destructive/20 text-destructive"
                          : ""
                      }`}
                    >
                      DNF
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteSolve(solve.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
