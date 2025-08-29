import { useState, useEffect, useRef } from "react";

export interface Solve {
  id: string;
  time: number;
  penalty: "none" | "plus2" | "dnf";
  date: Date;
  scramble: string;
  notes?: string;
  puzzle: string; // Ajout de la propriété puzzle
}

const STORAGE_KEY = "speedcube-solves";

export function useSolves() {
  const [solves, setSolves] = useState<Solve[]>([]);
  const idCounter = useRef(0);

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
        
        // Nettoyer les doublons basés sur l'ID
        const uniqueSolves = solvesWithDates.filter((solve: any, index: number, self: any[]) => 
          index === self.findIndex((s: any) => s.id === solve.id)
        );
        
        setSolves(uniqueSolves);
        
        // Mettre à jour le compteur d'ID pour éviter les doublons
        if (uniqueSolves.length > 0) {
          const maxId = Math.max(
            ...uniqueSolves.map((s: any) => {
              const parts = s.id.split("-");
              return parts.length > 1 ? parseInt(parts[1]) : 0;
            })
          );
          idCounter.current = maxId + 1;
        }
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
      id: `${Date.now()}-${idCounter.current++}`,
    };
    setSolves((prev) => [newSolve, ...prev]);
    return newSolve;
  };

  const addSolves = (solvesToAdd: Omit<Solve, "id">[]) => {
    const newSolves: Solve[] = solvesToAdd.map((solve) => ({
      ...solve,
      id: `${Date.now()}-${idCounter.current++}`,
    }));
    setSolves((prev) => [...newSolves, ...prev]);
    return newSolves;
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

  const cleanDuplicates = () => {
    setSolves((prev) => {
      const uniqueSolves = prev.filter((solve: Solve, index: number, self: Solve[]) => 
        index === self.findIndex((s: Solve) => s.id === solve.id)
      );
      return uniqueSolves;
    });
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
    addSolves,
    updateSolve,
    deleteSolve,
    clearAllSolves,
    cleanDuplicates,
    exportSolves,
  };
}
