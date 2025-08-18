"use client";

import { useEffect, useState } from "react";

export type Penalty = "OK" | "+2" | "DNF";

export interface Solve {
  id: string;
  timeMs: number;
  penalty: Penalty;
  scramble: string;
  notes?: string;
  createdAt: string; // ISO
}

const STORAGE_KEY = "scm:solves:session";

export function useSolves() {
  const [solves, setSolves] = useState<Solve[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Solve[] = JSON.parse(raw);
        if (Array.isArray(parsed)) setSolves(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(solves));
    } catch {}
  }, [solves]);

  function addSolve(s: Solve) {
    setSolves((cur) => [s, ...cur]);
  }

  function clearAll() {
    setSolves([]);
  }

  return { solves, addSolve, clearAll };
}
