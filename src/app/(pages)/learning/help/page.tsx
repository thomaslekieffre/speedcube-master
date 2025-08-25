"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Brain,
  Target,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Lightbulb,
  BookOpen,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function LearningHelpPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Comment fonctionne la révision intelligente ?
              </h1>
              <p className="text-muted-foreground">
                Apprenez à maîtriser vos algorithmes efficacement
              </p>
            </div>
          </div>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    La répétition espacée, c'est quoi ?
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    C'est une technique d'apprentissage qui optimise vos
                    révisions en vous interrogeant au bon moment. Plus vous
                    maîtrisez un algorithme, moins vous le réviserez souvent.
                    L'objectif : mémoriser efficacement sans perdre de temps !
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Comment ça marche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Comment ça marche ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Étape 1 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Ajoutez un algorithme</h3>
                  <p className="text-muted-foreground mb-3">
                    Depuis n'importe quelle page d'algorithme, cliquez sur
                    <Badge className="mx-2">"Ajouter à l'apprentissage"</Badge>
                  </p>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-mono">
                      Exemple : T-Perm (R U R' U' R' F R2 U' R' U' R U R' F')
                    </p>
                  </div>
                </div>
              </div>

              {/* Étape 2 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Révision quotidienne</h3>
                  <p className="text-muted-foreground mb-3">
                    Allez sur{" "}
                    <Link
                      href="/learning/review"
                      className="text-primary hover:underline"
                    >
                      Révision quotidienne
                    </Link>
                    et répondez honnêtement :
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">"Je me souviens"</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">"Je ne me souviens pas"</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Étape 3 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    Progression automatique
                  </h3>
                  <p className="text-muted-foreground">
                    Le système adapte automatiquement les intervalles de
                    révision selon vos réponses.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Système de niveaux */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Les 5 niveaux de maîtrise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    level: 0,
                    name: "Nouveau",
                    interval: "1 jour",
                    color: "bg-gray-500",
                  },
                  {
                    level: 1,
                    name: "Débutant",
                    interval: "1 jour",
                    color: "bg-blue-500",
                  },
                  {
                    level: 2,
                    name: "Intermédiaire",
                    interval: "3 jours",
                    color: "bg-yellow-500",
                  },
                  {
                    level: 3,
                    name: "Avancé",
                    interval: "7 jours",
                    color: "bg-orange-500",
                  },
                  {
                    level: 4,
                    name: "Expert",
                    interval: "14 jours",
                    color: "bg-red-500",
                  },
                  {
                    level: 5,
                    name: "Maîtrisé",
                    interval: "30 jours",
                    color: "bg-green-500",
                  },
                ].map((item) => (
                  <div
                    key={item.level}
                    className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          Niveau {item.level} - {item.name}
                        </span>
                        <Badge variant="outline">{item.interval}</Badge>
                      </div>
                      <Progress
                        value={item.level === 5 ? 100 : (item.level / 5) * 100}
                        className="h-2 mt-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Exemple concret */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Exemple concret : T-Perm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-600">
                      Si vous réussissez :
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Jour 1 : Ajout → Niveau 0</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Jour 2 : "Je me souviens" → Niveau 1</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Jour 3 : "Je me souviens" → Niveau 2</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Jour 6 : "Je me souviens" → Niveau 3</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Jour 13 : "Je me souviens" → Niveau 4</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Jour 27 : "Je me souviens" →{" "}
                          <strong>MAÎTRISE !</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-red-600">
                      Si vous échouez :
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Jour 1 : Ajout → Niveau 0</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Jour 2 : "Je me souviens" → Niveau 1</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Jour 3 : "Je ne me souviens pas" →{" "}
                          <strong>Niveau 0</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Jour 4 : "Je me souviens" → Niveau 1</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Jour 5 : "Je me souviens" → Niveau 2</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Jour 8 : "Je me souviens" → Niveau 3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Conseils */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Conseils pour réussir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-600">✅ À faire</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>
                        Répondez honnêtement, même si c'est "Je ne me souviens
                        pas"
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>
                        Visualisez l'algorithme avant de révéler la solution
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Révisons quotidiennement, même 5 minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>
                        Concentrez-vous sur la qualité plutôt que la quantité
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-red-600">❌ À éviter</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Mentir sur votre niveau de maîtrise</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Ajouter trop d'algorithmes d'un coup</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>
                        Réviser plusieurs jours d'affilée puis abandonner
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Se précipiter sans visualiser l'algorithme</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-4">
                <Trophy className="h-12 w-12 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Prêt à maîtriser vos algorithmes ?
              </h3>
              <p className="text-muted-foreground mb-6">
                Commencez dès maintenant avec votre première session de révision
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/learning/review">
                    <Target className="h-4 w-4 mr-2" />
                    Commencer la révision
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link href="/algos">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Explorer les algorithmes
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
