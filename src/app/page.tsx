import {
  Timer,
  Zap,
  BarChart3,
  Play,
  Search,
  Trophy,
  Brain,
  Target,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Box,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react";
import Link from "next/link";
import { TypingEffect } from "@/components/typing-effect";
// import { DailyProgressBanner } from "@/components/daily-progress-banner";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Enhanced */}
      <section className="relative pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 px-3 sm:px-4 lg:px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Box className="h-4 w-4" />
              La plateforme de référence pour tous les speedcubeurs
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 sm:mb-8">
            <TypingEffect
              text="Maîtrisez le speedcubing"
              speed={100}
              highlightWords={["Maîtrisez"]}
              highlightColor="text-primary"
            />
          </h1>

          <div className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-4xl mx-auto px-4">
            <TypingEffect
              text="Timer professionnel, algorithmes intelligents, révision espacée et défis quotidiens. Tout ce dont vous avez besoin pour devenir un expert."
              speed={40}
              delay={1500}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 mb-8">
            <Link
              href="/timer"
              className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 text-lg shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Lancer un solve</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/algos"
              className="group inline-flex items-center gap-3 border-2 border-border bg-card text-foreground px-8 py-4 rounded-xl font-semibold hover:bg-muted transition-all duration-300 text-lg hover:scale-105"
            >
              <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Explorer les algos</span>
            </Link>
          </div>

          {/* Stats preview */}
          <div className="flex justify-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                1000+ utilisateurs
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Box className="h-5 w-5 text-accent" />
              <span className="text-sm text-muted-foreground">
                Tous les puzzles WCA
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-warning" />
              <span className="text-sm text-muted-foreground">
                Gratuit à 100%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-20 px-3 sm:px-4 lg:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une suite complète d'outils pour progresser en speedcubing, de
              débutant à expert.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Timer Card - Enhanced */}
            <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/20">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Timer className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Timer Pro
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Timer de compétition avec inspection, pénalités, sessions
                multiples et statistiques avancées.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Inspection 15 secondes
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Pénalités +2/DNF
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Sessions multiples
                </li>
              </ul>
              <Link
                href="/timer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold group-hover:gap-3 transition-all"
              >
                Commencer maintenant
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Algorithms Card - Enhanced */}
            <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-accent/20">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Révision Intelligente
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Système de révision espacée pour mémoriser efficacement tous vos
                algorithmes.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Répétition espacée
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Progression automatique
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Visualisation 3D
                </li>
              </ul>
              <Link
                href="/algos"
                className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-semibold group-hover:gap-3 transition-all"
              >
                Explorer les algos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Stats Card - Enhanced */}
            <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-warning/20">
              <div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-warning/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Progression Avancée
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Suivez votre progression avec des graphiques détaillés et des
                analyses personnalisées.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Graphiques interactifs
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Moyennes et records
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Historique complet
                </li>
              </ul>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-warning hover:text-warning/80 font-semibold group-hover:gap-3 transition-all"
              >
                Voir mes stats
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Challenge Section - Enhanced */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-warning/5 via-transparent to-primary/5">
        <div className="mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-warning/10 to-primary/10 border border-warning/20 rounded-3xl p-12 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full translate-y-12 -translate-x-12" />

            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-warning to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Défi du jour
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Rejoignez la communauté et affrontez le scramble quotidien. 3
                tentatives, 24h, un classement.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-lg">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">
                    24h pour participer
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-lg">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">3 tentatives max</span>
                </div>
                <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-lg">
                  <Award className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">
                    Classement en temps réel
                  </span>
                </div>
              </div>

              <Link
                href="/challenge"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-warning to-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 text-lg hover:scale-105"
              >
                <Trophy className="h-5 w-5" />
                <span>Essayer le défi</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Prêt à devenir un expert ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de speedcubeurs qui utilisent Speedcube
              Master pour progresser.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/timer"
                className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 text-lg shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Play className="h-5 w-5" />
                <span>Commencer maintenant</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/algos"
                className="group inline-flex items-center gap-3 border-2 border-border bg-card text-foreground px-8 py-4 rounded-xl font-semibold hover:bg-muted transition-all duration-300 text-lg hover:scale-105"
              >
                <Search className="h-5 w-5" />
                <span>Découvrir les algos</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
