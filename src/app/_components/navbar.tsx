import Link from "next/link";
import { ThemeToggle } from "../_components/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-bg/60 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link href="/" className="font-semibold">
          SCM
        </Link>
        <nav className="ml-auto flex items-center gap-3 text-sm">
          <Link href="/timer" className="hover:underline underline-offset-4">
            Timer
          </Link>
          <Link href="/algos" className="hover:underline underline-offset-4">
            Algorithmes
          </Link>
          <Link
            href="/dashboard"
            className="hover:underline underline-offset-4"
          >
            Dashboard
          </Link>
          <Link
            href="/challenge"
            className="hover:underline underline-offset-4"
          >
            Défi
          </Link>
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-lg border border-border px-3 py-1.5 bg-card"
          >
            Connexion
          </Link>
        </nav>
      </div>
    </header>
  );
}
