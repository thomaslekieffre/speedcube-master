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
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useProfile } from "@/hooks/use-profile";
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

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-primary"
        >
          <Zap className="h-6 w-6" />
          Speedcube Master
        </Link>

        <nav className="ml-auto flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1">
            <Link
              href="/timer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Timer className="h-4 w-4" />
              Timer
            </Link>
            <Link
              href="/algos"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Zap className="h-4 w-4" />
              Algorithmes
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/challenge"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Trophy className="h-4 w-4" />
              Défi
            </Link>
            {isSignedIn && (
              <Link
                href={`/profile/${profile?.username || "me"}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                <User className="h-4 w-4" />
                Profil
              </Link>
            )}
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-background/10 transition-all duration-200 hover:scale-105">
                    {(profile?.custom_avatar_url || profile?.avatar_url) && (
                      <img
                        src={profile.custom_avatar_url || profile.avatar_url}
                        alt={profile.username || "Avatar"}
                        className="w-8 h-8 rounded-full object-cover border border-border"
                      />
                    )}
                    <span className="text-sm font-medium text-foreground">
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
