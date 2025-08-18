import { useState, useEffect } from "react";

export interface Solve {
  id: string;
  time: number;
  penalty: "none" | "plus2" | "dnf";
  date: Date;
  scramble: string;
  notes?: string;
}

const STORAGE_KEY = "speedcube-solves";

export function useSolves() {
  const [solves, setSolves] = useState<Solve[]>([]);

  // Charger les solves depuis localStorage au montage
  useEffect(() => {
    const savedSolves = localStorage.getItem(STORAGE_KEY);
    if (savedSolves) {
      try {
        const parsed = JSON.parse(savedSolves);
        // Convertir les dates string en objets Date
        const solvesWithDates = parsed.map((solve: any) => ({
          ...solve,
          date: new Date(solve.date),
        }));
        setSolves(solvesWithDates);
      } catch (error) {
        console.error("Erreur lors du chargement des solves:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Sauvegarder automatiquement dans localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solves));
  }, [solves]);

  const addSolve = (solve: Omit<Solve, "id">) => {
    const newSolve: Solve = {
      ...solve,
      id: Date.now().toString(),
    };
    setSolves((prev) => [newSolve, ...prev]);
    return newSolve;
  };

  const updateSolve = (id: string, updates: Partial<Solve>) => {
    setSolves((prev) =>
      prev.map((solve) => (solve.id === id ? { ...solve, ...updates } : solve))
    );
  };

  const deleteSolve = (id: string) => {
    setSolves((prev) => prev.filter((solve) => solve.id !== id));
  };

  const clearAllSolves = () => {
    setSolves([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportSolves = () => {
    // Formater les solves pour l'export avec temps lisible
    const formattedSolves = solves.map((solve) => ({
      ...solve,
      time: `${(solve.time / 1000).toFixed(2)}s`, // Convertir ms en secondes
      date: solve.date.toISOString(), // Formater la date
    }));

    const dataStr = JSON.stringify(formattedSolves, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `speedcube-solves-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    solves,
    addSolve,
    updateSolve,
    deleteSolve,
    clearAllSolves,
    exportSolves,
  };
}
