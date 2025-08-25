"use client";

import Link from "next/link";
import {
  Timer,
  Zap,
  BarChart3,
  Trophy,
  User,
  LogOut,
  Settings,
  Heart,
  Shield,
  GraduationCap,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useProfile } from "@/hooks/use-profile";
import { useFavorites } from "@/hooks/use-favorites";
import { useUserRole } from "@/hooks/use-user-role";
import { useModerationBadge } from "@/hooks/use-moderation-badge";
import { AlgorithmNotifications } from "@/components/algorithm-notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { isSignedIn, user } = useUser();
  const { profile, loading: profileLoading } = useProfile();
  const { favorites } = useFavorites();
  const { isModerator } = useUserRole();
  const { pendingCount } = useModerationBadge();

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center gap-3 sm:gap-6">
        {/* Logo - Responsive */}
        <Link
          href="/"
          className="flex items-center gap-1.5 sm:gap-2 font-bold text-lg sm:text-xl text-primary"
        >
          <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="hidden sm:inline">Speedcube Master</span>
          <span className="sm:hidden">SCM</span>
        </Link>

        {/* Navigation - Responsive */}
        <nav className="ml-auto flex items-center gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Link
              href="/timer"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Timer className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Timer</span>
            </Link>
            <Link
              href="/algos"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden lg:inline">Algorithmes</span>
              <span className="lg:hidden hidden sm:inline">Algos</span>
            </Link>
            <Link
              href="/methods"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden lg:inline">Apprentissage</span>
              <span className="lg:hidden hidden sm:inline">Apprentissage</span>
            </Link>
            {isSignedIn && (
              <Link
                href="/favorites"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-muted transition-colors relative"
              >
                <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Favoris</span>
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {favorites.length > 99 ? "99+" : favorites.length}
                  </span>
                )}
              </Link>
            )}
            {isSignedIn && <AlgorithmNotifications />}
            <Link
              href="/dashboard"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              href="/challenge"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Défi</span>
            </Link>
            {isSignedIn && isModerator() && (
              <Link
                href="/admin/moderation"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-muted transition-colors relative"
              >
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Modération</span>
                {pendingCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </div>
                )}
              </Link>
            )}
            {isSignedIn && (
              <Link
                href={`/profile/${profile?.username || "me"}`}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-muted transition-colors"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Profil</span>
              </Link>
            )}
          </div>

          <div className="h-4 sm:h-6 w-px bg-border" />

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />

            {isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 sm:gap-3 rounded-lg px-1.5 sm:px-2 py-1 hover:bg-background/10 transition-all duration-200 hover:scale-105">
                    {(profile?.custom_avatar_url || profile?.avatar_url) && (
                      <img
                        src={profile.custom_avatar_url || profile.avatar_url}
                        alt={profile.username || "Avatar"}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border border-border"
                      />
                    )}
                    <span className="text-xs sm:text-sm font-medium text-foreground hidden sm:inline">
                      {profile?.username ||
                        user?.emailAddresses[0]?.emailAddress}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    {(profile?.custom_avatar_url || profile?.avatar_url) && (
                      <img
                        src={profile.custom_avatar_url || profile.avatar_url}
                        alt={profile.username || "Avatar"}
                        className="w-8 h-8 rounded-full object-cover border border-border"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {profile?.username ||
                          user?.emailAddresses[0]?.emailAddress}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user?.emailAddresses[0]?.emailAddress}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/profile/${profile?.username || "me"}`}
                      className="cursor-pointer hover:bg-background/20 focus:bg-background/20"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Mon profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="cursor-pointer hover:bg-background/10 focus:bg-background/10"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <SignOutButton>
                    <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-background/10 focus:bg-background/10 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </SignOutButton>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SignInButton>
                <button className="rounded-lg border border-border px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
                  Connexion
                </button>
              </SignInButton>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
