import { Timer, Zap, BarChart3, Play, Search, Trophy } from "lucide-react";
import Link from "next/link";
import { TypingEffect } from "@/components/typing-effect";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Responsive */}
      <section className="pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 px-3 sm:px-4 lg:px-6">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 sm:mb-6">
            <TypingEffect
              text="La référence du speedcubing"
              speed={150}
              highlightWords={["référence"]}
              highlightColor="text-primary"
            />
          </h1>
          <div className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            <TypingEffect
              text="Timer, algos, stats et défis pour tous les puzzles WCA. Améliore tes temps, maîtrise tes algorithmes."
              speed={50}
              delay={2000}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href="/timer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm sm:text-base"
            >
              <Play className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Lancer un solve</span>
              <span className="sm:hidden">Timer</span>
            </Link>
            <Link
              href="/algos"
              className="inline-flex items-center gap-2 border border-border bg-card text-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-muted transition-colors text-sm sm:text-base"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Explorer les algos</span>
              <span className="sm:hidden">Algos</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Responsive */}
      <section className="py-12 sm:py-16 px-3 sm:px-4 lg:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Timer Card */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Timer className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                Timer Pro
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                Timer précis avec inspection, pénalités et sessions multiples.
              </p>
              <Link
                href="/timer"
                className="text-primary hover:underline font-medium text-sm sm:text-base"
              >
                Commencer →
              </Link>
            </div>

            {/* Algorithms Card */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                Algorithmes
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                Bibliothèque complète avec révision intelligente et progression.
              </p>
              <Link
                href="/algos"
                className="text-accent hover:underline font-medium text-sm sm:text-base"
              >
                Explorer →
              </Link>
            </div>

            {/* Stats Card */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                Progression
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                Suis tes améliorations avec graphiques et analyses détaillées.
              </p>
              <Link
                href="/dashboard"
                className="text-warning hover:underline font-medium text-sm sm:text-base"
              >
                Voir →
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
