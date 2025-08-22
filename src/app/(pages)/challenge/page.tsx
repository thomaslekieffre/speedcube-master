"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timer, Trophy, Users } from "lucide-react";

export default function ChallengePage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-foreground">Défi du jour</h1>
          </div>
          <p className="text-muted-foreground text-lg mb-4">
            3 tentatives. 24h. Montre ce que tu vaux.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Badge variant="outline">Temps restant: 12h 30m</Badge>
            <Badge variant="outline">0/3 tentatives</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timer Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Timer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scramble */}
              <div>
                <h3 className="text-sm font-medium mb-2">Scramble du jour</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-lg text-center mb-4">
                  R U R' U' R' F R2 U' R' U' R U R' F'
                </div>
              </div>

              {/* Timer Display */}
              <div className="text-center">
                <div className="space-y-2">
                  <div className="text-4xl font-mono font-bold">00.00</div>
                  <div className="text-sm text-muted-foreground">Prêt</div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <Button className="flex-1" size="lg">
                  Commencer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Classement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-yellow-500 text-white">
                      1
                    </div>
                    <div>
                      <div className="font-medium">thomas</div>
                      <div className="text-sm text-muted-foreground">
                        3 tentatives
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold">12.50</div>
                    <div className="text-xs text-muted-foreground">
                      Aujourd'hui
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
