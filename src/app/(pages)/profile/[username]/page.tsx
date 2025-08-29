"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useProfile } from "@/hooks/use-profile";
import { usePersonalBests } from "@/hooks/use-personal-bests";
import { useSupabaseSolves } from "@/hooks/use-supabase-solves";
import { useUser } from "@clerk/nextjs";
import { PUZZLES } from "@/components/puzzle-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import {
  User,
  Trophy,
  Clock,
  BarChart3,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Edit,
} from "lucide-react";
import { createSupabaseClientWithUser } from "@/lib/supabase";
import { formatTime } from "@/lib/time";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user } = useUser();
  const [selectedPuzzle, setSelectedPuzzle] = useState("333");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger le profil public
  const loadPublicProfile = async () => {
    try {
      setLoading(true);
      const supabase = await createSupabaseClientWithUser(user?.id || "");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .eq("is_public", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setError("Profil non trouvé ou privé");
        } else {
          setError(error.message);
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      setError("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      loadPublicProfile();
    }
  }, [username, user?.id]);

  // Charger les PB et solves si le profil existe
  const { personalBests } = usePersonalBests(profile?.id);
  const { solves } = useSupabaseSolves(profile?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
          <span className="text-sm sm:text-base">Chargement du profil...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <User className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold mb-2">
            Profil non trouvé
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {error || "Ce profil n'existe pas ou est privé."}
          </p>
          <Button
            onClick={() => window.history.back()}
            className="text-sm sm:text-base"
          >
            Retour
          </Button>
        </div>
      </div>
    );
  }

  // Calculer les stats pour le puzzle sélectionné
  const getStats = () => {
    const puzzleSolves = solves.filter((s) => s.puzzle_type === selectedPuzzle);
    if (puzzleSolves.length === 0) return null;

    const validSolves = puzzleSolves.filter((s) => s.penalty !== "dnf");
    const dnfCount = puzzleSolves.filter((s) => s.penalty === "dnf").length;

    if (validSolves.length === 0) {
      return {
        total: puzzleSolves.length,
        dnfCount,
        pb: null,
        average: null,
        avg5: null,
        avg12: null,
      };
    }

    const times = validSolves.map((s) =>
      s.penalty === "plus2" ? s.time + 2000 : s.time
    );

    const pb = Math.min(...times);
    const average = Math.floor(times.reduce((a, b) => a + b, 0) / times.length);

    // Calculer avg5 et avg12
    const sortedTimes = [...times].sort((a, b) => a - b);
    const avg5 =
      times.length >= 5
        ? Math.floor(sortedTimes.slice(0, 5).reduce((a, b) => a + b, 0) / 5)
        : null;
    const avg12 =
      times.length >= 12
        ? Math.floor(sortedTimes.slice(0, 12).reduce((a, b) => a + b, 0) / 12)
        : null;

    return {
      total: puzzleSolves.length,
      dnfCount,
      pb,
      average,
      avg5,
      avg12,
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header du profil - Responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <img
              src={
                profile.custom_avatar_url ||
                profile.avatar_url ||
                "/default-avatar.png"
              }
              alt={profile.username || "Avatar"}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto sm:mx-0"
            />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {profile.username}
                </h1>
                {user && profile.id === user.id && (
                  <Link href="/profile/edit">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Modifier
                    </Button>
                  </Link>
                )}
              </div>
              {profile.wca_id && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 sm:mt-1">
                  <Badge variant="outline" className="text-xs">
                    WCA ID: {profile.wca_id}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `https://www.worldcubeassociation.org/persons/${profile.wca_id}`,
                        "_blank"
                      )
                    }
                    className="h-5 sm:h-6 px-1 sm:px-2"
                  >
                    <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Button>
                </div>
              )}
              {profile.bio && (
                <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sélecteur de puzzle et stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Statistiques{" "}
              {PUZZLES.find((p) => p.id === selectedPuzzle)?.name || "3x3"}
            </CardTitle>
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {PUZZLES.map((puzzle) => (
                <button
                  key={puzzle.id}
                  onClick={() => setSelectedPuzzle(puzzle.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedPuzzle === puzzle.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-muted/50 hover:border-primary/30 border border-border"
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${puzzle.color}`} />
                  {puzzle.shortName}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">
                    {stats.total}
                  </div>
                  <div className="text-xs text-muted-foreground">Solves</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">
                    {stats.pb ? formatTime(stats.pb) : "N/A"}
                  </div>
                  <div className="text-xs text-muted-foreground">PB</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-accent">
                    {stats.average ? formatTime(stats.average) : "N/A"}
                  </div>
                  <div className="text-xs text-muted-foreground">Moyenne</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-500">
                    {stats.avg5 ? formatTime(stats.avg5) : "N/A"}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg5</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-500">
                    {stats.avg12 ? formatTime(stats.avg12) : "N/A"}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg12</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-muted-foreground">
                    {stats.dnfCount}
                  </div>
                  <div className="text-xs text-muted-foreground">DNF</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun solve pour ce puzzle</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Records personnels */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Records personnels
            </CardTitle>
          </CardHeader>
          <CardContent>
            {personalBests.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Aucun record personnel pour l'instant.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {personalBests.map((pb) => (
                  <div
                    key={pb.id}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {PUZZLES.find((p) => p.id === pb.puzzle_type)?.shortName || pb.puzzle_type}
                      </Badge>
                      {pb.penalty === "plus2" && (
                        <Badge
                          variant="outline"
                          className="text-xs text-warning"
                        >
                          +2
                        </Badge>
                      )}
                      {pb.penalty === "dnf" && (
                        <Badge
                          variant="outline"
                          className="text-xs text-destructive"
                        >
                          DNF
                        </Badge>
                      )}
                    </div>
                    <div className="text-xl font-mono font-bold text-primary">
                      {formatTime(pb.time)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(pb.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Derniers solves */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Derniers solves
            </CardTitle>
          </CardHeader>
          <CardContent>
            {solves.filter((s) => s.puzzle_type === selectedPuzzle).length ===
            0 ? (
              <p className="text-muted-foreground text-center py-4">
                Aucun solve pour ce puzzle.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {solves
                  .filter((s) => s.puzzle_type === selectedPuzzle)
                  .slice(0, 20)
                  .map((solve, index) => (
                    <div
                      key={solve.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-mono text-muted-foreground w-8">
                          #
                          {solves.filter(
                            (s) => s.puzzle_type === selectedPuzzle
                          ).length - index}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {PUZZLES.find((p) => p.id === solve.puzzle_type)?.shortName || solve.puzzle_type}
                        </Badge>
                        <div className="text-sm font-mono font-semibold">
                          {formatTime(solve.time)}
                          {solve.penalty === "plus2" && (
                            <span className="text-warning ml-1">+2</span>
                          )}
                          {solve.penalty === "dnf" && (
                            <span className="text-destructive ml-1">DNF</span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(solve.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
