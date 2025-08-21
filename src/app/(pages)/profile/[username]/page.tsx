"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useProfile } from "@/hooks/use-profile";
import { usePersonalBests } from "@/hooks/use-personal-bests";
import { useSupabaseSolves } from "@/hooks/use-supabase-solves";
import { useUser } from "@clerk/nextjs";
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
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user } = useUser();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger le profil public
  const loadPublicProfile = async () => {
    try {
      setLoading(true);
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
  }, [username]);

  // Charger les PB et solves si le profil existe
  const { personalBests, formatTime } = usePersonalBests(profile?.id);
  const { solves } = useSupabaseSolves(profile?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement du profil...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Profil non trouvé</h2>
          <p className="text-muted-foreground mb-4">
            {error || "Ce profil n'existe pas ou est privé."}
          </p>
          <Button onClick={() => window.history.back()}>Retour</Button>
        </div>
      </div>
    );
  }

  // Calculer les stats
  const getStats = () => {
    if (solves.length === 0) return null;

    const validSolves = solves.filter((s) => s.penalty !== "dnf");
    const dnfCount = solves.filter((s) => s.penalty === "dnf").length;

    if (validSolves.length === 0) {
      return {
        total: solves.length,
        dnfCount,
        pb: null,
        average: null,
      };
    }

    const times = validSolves.map((s) =>
      s.penalty === "plus2" ? s.time + 2000 : s.time
    );

    const pb = Math.min(...times);
    const average = Math.floor(times.reduce((a, b) => a + b, 0) / times.length);

    return {
      total: solves.length,
      dnfCount,
      pb,
      average,
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header du profil */}
        <div className="mb-8">
          <div className="flex items-center gap-6">
            <img
              src={
                profile.custom_avatar_url ||
                profile.avatar_url ||
                "/default-avatar.png"
              }
              alt={profile.username || "Avatar"}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-foreground">
                  {profile.username}
                </h1>
                {user && profile.id === user.id && (
                  <Link href="/profile/edit">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  </Link>
                )}
              </div>
              {profile.wca_id && (
                <div className="flex items-center gap-2 mt-1">
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
                    className="h-6 px-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {profile.bio && (
                <p className="text-muted-foreground mt-2 max-w-2xl">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats générales */}
        {stats && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistiques générales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {stats.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Solves</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats.pb ? formatTime(stats.pb) : "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Meilleur temps
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {stats.average ? formatTime(stats.average) : "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">Moyenne</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">
                    {stats.dnfCount}
                  </div>
                  <div className="text-sm text-muted-foreground">DNF</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                        {pb.puzzle_type}
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
            {solves.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Aucun solve pour l'instant.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {solves.slice(0, 20).map((solve, index) => (
                  <div
                    key={solve.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-mono text-muted-foreground w-8">
                        #{solves.length - index}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {solve.puzzle_type}
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
