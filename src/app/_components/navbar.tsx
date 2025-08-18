import Link from "next/link";
import { Timer, Zap, BarChart3, Trophy } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-primary"
        >
          <Zap className="h-6 w-6" />
          Speedcube Master
        </Link>

        <nav className="ml-auto flex items-center gap-1 text-sm">
          <Link
            href="/timer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Timer className="h-4 w-4" />
            Timer
          </Link>
          <Link
            href="/algos"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Zap className="h-4 w-4" />
            Algorithmes
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/challenge"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Trophy className="h-4 w-4" />
            Défi
          </Link>

          <div className="mx-2 h-6 w-px bg-border" />

          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-lg border border-border px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            Connexion
          </Link>
        </nav>
      </div>
    </header>
  );
}
