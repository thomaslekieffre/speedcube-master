"use client";

import { formatTime } from "@/lib/time";
import { Button } from "@/app/_components/ui/button";
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card";
import { useSupabaseSolves } from "@/hooks/use-supabase-solves";
import { useUser } from "@clerk/nextjs";
import type { Database } from "@/types/database";

type Solve = Database["public"]["Tables"]["solves"]["Row"];

function displayTime(s: Solve): string {
  if (s.penalty === "dnf") return "DNF";
  const base = s.time;
  const extra = s.penalty === "plus2" ? 2000 : 0;
  return formatTime(base + extra);
}

export function SolveList() {
  const { user } = useUser();
  const { solves, clearAllSolves, loading } = useSupabaseSolves(user?.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Session</h2>
          <Button
            variant="outline"
            className="h-8 px-3"
            onClick={clearAllSolves}
            disabled={loading}
          >
            Effacer la session
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : solves.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun solve pour l'instant.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="text-left font-medium py-2">Temps</th>
                  <th className="text-left font-medium py-2">Pénalité</th>
                  <th className="text-left font-medium py-2">Date</th>
                  <th className="text-left font-medium py-2">Scramble</th>
                  <th className="text-left font-medium py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {solves.map((s) => (
                  <tr key={s.id} className="border-t border-border/60">
                    <td className="py-2 font-mono">{displayTime(s)}</td>
                    <td className="py-2">
                      {s.penalty === "none"
                        ? "OK"
                        : s.penalty === "plus2"
                        ? "+2"
                        : "DNF"}
                    </td>
                    <td className="py-2">
                      {new Date(s.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 whitespace-pre-wrap break-words text-muted-foreground">
                      {s.scramble}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {s.notes ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
