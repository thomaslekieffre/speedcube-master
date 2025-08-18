import { Timer, Zap, BarChart3, Play, Search, Trophy } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
            La <span className="text-primary">référence</span> du speedcubing
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Timer, algos, stats et défis pour tous les puzzles WCA. Améliore tes
            temps, maîtrise tes algorithmes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/timer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <Play className="h-5 w-5" />
              Lancer un solve
            </Link>
            <Link
              href="/algos"
              className="inline-flex items-center gap-2 border border-border bg-card text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
            >
              <Search className="h-5 w-5" />
              Explorer les algos
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Timer Card */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Timer className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Timer Pro
              </h3>
              <p className="text-muted-foreground mb-4">
                Timer précis avec inspection, pénalités et sessions multiples.
              </p>
              <Link
                href="/timer"
                className="text-primary hover:underline font-medium"
              >
                Commencer →
              </Link>
            </div>

            {/* Algorithms Card */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Algorithmes
              </h3>
              <p className="text-muted-foreground mb-4">
                Bibliothèque complète avec révision intelligente et progression.
              </p>
              <Link
                href="/algos"
                className="text-accent hover:underline font-medium"
              >
                Explorer →
              </Link>
            </div>

            {/* Stats Card */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Progression
              </h3>
              <p className="text-muted-foreground mb-4">
                Suis tes améliorations avec graphiques et analyses détaillées.
              </p>
              <Link
                href="/dashboard"
                className="text-warning hover:underline font-medium"
              >
                Voir les stats →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Challenge Banner */}
      <section className="py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-border rounded-2xl p-8 text-center">
            <Trophy className="h-12 w-12 text-warning mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Défi du jour
            </h2>
            <p className="text-muted-foreground mb-6">
              3 tentatives. 24h. Montre ce que tu vaux.
            </p>
            <Link
              href="/challenge"
              className="inline-flex items-center gap-2 bg-warning text-warning-foreground px-6 py-3 rounded-lg font-semibold hover:bg-warning/90 transition-colors"
            >
              <Trophy className="h-5 w-5" />
              Essayer le scramble du jour
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
