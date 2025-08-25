"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  HelpCircle,
  X,
  Brain,
  Target,
  Calendar,
  CheckCircle,
  XCircle,
  Lightbulb,
  Zap,
} from "lucide-react";

interface LearningHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LearningHelpPopup({ isOpen, onClose }: LearningHelpPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    Comment fonctionne la révision intelligente ?
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Introduction rapide */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Répétition espacée :</strong> Plus vous maîtrisez un algorithme, 
                    moins vous le réviserez souvent. L'objectif : mémoriser efficacement sans perdre de temps !
                  </p>
                </div>

                {/* Comment ça marche */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Comment ça marche ?
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <div>
                        <p className="text-sm font-medium">Ajoutez un algorithme</p>
                        <p className="text-xs text-muted-foreground">
                          Depuis une page d'algorithme, cliquez sur "Ajouter à l'apprentissage"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <div>
                        <p className="text-sm font-medium">Répondez honnêtement</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            "Je me souviens"
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            "Je ne me souviens pas"
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <div>
                        <p className="text-sm font-medium">Progression automatique</p>
                        <p className="text-xs text-muted-foreground">
                          Le système adapte les intervalles selon vos réponses
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Niveaux de maîtrise */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Les 5 niveaux de maîtrise
                  </h3>
                  <div className="space-y-2">
                    {[
                      { level: 0, name: "Nouveau", interval: "1 jour", color: "bg-gray-500" },
                      { level: 1, name: "Débutant", interval: "1 jour", color: "bg-blue-500" },
                      { level: 2, name: "Intermédiaire", interval: "3 jours", color: "bg-yellow-500" },
                      { level: 3, name: "Avancé", interval: "7 jours", color: "bg-orange-500" },
                      { level: 4, name: "Expert", interval: "14 jours", color: "bg-red-500" },
                      { level: 5, name: "Maîtrisé", interval: "30 jours", color: "bg-green-500" },
                    ].map((item) => (
                      <div key={item.level} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">Niveau {item.level} - {item.name}</span>
                            <Badge variant="outline" className="text-xs">{item.interval}</Badge>
                          </div>
                          <Progress 
                            value={item.level === 5 ? 100 : (item.level / 5) * 100} 
                            className="h-1 mt-1" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exemple rapide */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Exemple : T-Perm
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <h4 className="font-medium text-green-600">✅ Si vous réussissez :</h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Jour 1 : Ajout → Niveau 0</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Jour 2 : "Je me souviens" → Niveau 1</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Jour 3 : "Je me souviens" → Niveau 2</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Jour 6 : "Je me souviens" → Niveau 3</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Jour 13 : "Je me souviens" → Niveau 4</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Jour 27 : "Je me souviens" → <strong>MAÎTRISE !</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600">❌ Si vous échouez :</h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Jour 1 : Ajout → Niveau 0</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Jour 2 : "Je me souviens" → Niveau 1</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Jour 3 : "Je ne me souviens pas" → <strong>Niveau 0</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Jour 4 : "Je me souviens" → Niveau 1</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Jour 5 : "Je me souviens" → Niveau 2</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Jour 8 : "Je me souviens" → Niveau 3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conseils rapides */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Conseils rapides
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <h4 className="font-medium text-green-600">✅ À faire</h4>
                      <ul className="space-y-1">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Répondez honnêtement</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Visualisez avant de révéler</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Révisons quotidiennement</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600">❌ À éviter</h4>
                      <ul className="space-y-1">
                        <li className="flex items-start gap-2">
                          <XCircle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>Mentir sur votre niveau</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <XCircle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>Trop d'algos d'un coup</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <XCircle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>Se précipiter</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-3">
                    Prêt à maîtriser vos algorithmes efficacement ?
                  </p>
                  <Button onClick={onClose} size="sm">
                    Commencer la révision
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
