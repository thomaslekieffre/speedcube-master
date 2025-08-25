"use client";

import { useState } from "react";
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
  Target,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useProfile } from "@/hooks/use-profile";
import { useFavorites } from "@/hooks/use-favorites";
import { useUserRole } from "@/hooks/use-user-role";
import { useModerationBadge } from "@/hooks/use-moderation-badge";
import { useRevisionBadge } from "@/hooks/use-revision-badge";
import { AlgorithmNotifications } from "@/components/algorithm-notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export function Navbar() {
  const { isSignedIn, user } = useUser();
  const { profile, loading: profileLoading } = useProfile();
  const { favorites } = useFavorites();
  const { isModerator } = useUserRole();
  const { pendingCount } = useModerationBadge();
  const { revisionCount, hasRevisions } = useRevisionBadge();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLink = ({
    href,
    icon: Icon,
    children,
    badge,
    className = "",
  }: {
    href: string;
    icon: any;
    children: React.ReactNode;
    badge?: number;
    className?: string;
  }) => (
    <Link
      href={href}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors relative ${className}`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{children}</span>
      {badge && badge > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold flex-shrink-0">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );

  const MobileNavLink = ({
    href,
    icon: Icon,
    children,
    badge,
  }: {
    href: string;
    icon: any;
    children: React.ReactNode;
    badge?: number;
  }) => (
    <Link
      href={href}
      onClick={() => setIsMobileMenuOpen(false)}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors relative"
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1 text-base">{children}</span>
      {badge && badge > 0 && (
        <span className="bg-red-500 text-white text-sm rounded-full h-6 w-6 flex items-center justify-center font-bold flex-shrink-0">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity"
          >
            <Zap className="h-6 w-6" />
            <span className="hidden sm:inline">Speedcube Master</span>
            <span className="sm:hidden">SCM</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Main Navigation */}
            <div className="flex items-center gap-1">
              <NavLink href="/timer" icon={Timer}>
                Timer
              </NavLink>
              <NavLink href="/algos" icon={Zap}>
                Algorithmes
              </NavLink>
              <NavLink href="/methods" icon={GraduationCap}>
                Apprentissage
              </NavLink>
              <NavLink
                href="/learning/review"
                icon={Target}
                badge={hasRevisions ? revisionCount : undefined}
              >
                Révision
              </NavLink>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-border mx-2" />

            {/* User Navigation */}
            <div className="flex items-center gap-1">
              {isSignedIn && (
                <NavLink
                  href="/favorites"
                  icon={Heart}
                  badge={favorites.length}
                >
                  Favoris
                </NavLink>
              )}
              {isSignedIn && <AlgorithmNotifications />}
              <NavLink href="/dashboard" icon={BarChart3}>
                Dashboard
              </NavLink>
              <NavLink href="/challenge" icon={Trophy}>
                Défi
              </NavLink>
              {isSignedIn && isModerator() && (
                <NavLink
                  href="/admin/moderation"
                  icon={Shield}
                  badge={pendingCount}
                >
                  Modération
                </NavLink>
              )}
            </div>
          </nav>

          {/* Right Side - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />

            {isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3 py-2 h-auto"
                  >
                    {(profile?.custom_avatar_url || profile?.avatar_url) && (
                      <img
                        src={profile.custom_avatar_url || profile.avatar_url}
                        alt={profile.username || "Avatar"}
                        className="w-8 h-8 rounded-full object-cover border border-border"
                      />
                    )}
                    <span className="text-sm font-medium">
                      {profile?.username ||
                        user?.emailAddresses[0]?.emailAddress}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
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
                    <Link href={`/profile/${profile?.username || "me"}`}>
                      <User className="mr-2 h-4 w-4" />
                      Mon profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <SignOutButton>
                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </SignOutButton>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SignInButton>
                <Button className="bg-primary hover:bg-primary/90">
                  Connexion
                </Button>
              </SignInButton>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <span className="font-semibold text-lg">Menu</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex-1 p-4 space-y-2">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground px-4 py-2">
                        Navigation
                      </h3>
                      <MobileNavLink href="/timer" icon={Timer}>
                        Timer
                      </MobileNavLink>
                      <MobileNavLink href="/algos" icon={Zap}>
                        Algorithmes
                      </MobileNavLink>
                      <MobileNavLink href="/methods" icon={GraduationCap}>
                        Apprentissage
                      </MobileNavLink>
                      <MobileNavLink
                        href="/learning/review"
                        icon={Target}
                        badge={hasRevisions ? revisionCount : undefined}
                      >
                        Révision
                      </MobileNavLink>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground px-4 py-2">
                        Outils
                      </h3>
                      {isSignedIn && (
                        <MobileNavLink
                          href="/favorites"
                          icon={Heart}
                          badge={favorites.length}
                        >
                          Favoris
                        </MobileNavLink>
                      )}
                      {isSignedIn && <AlgorithmNotifications />}
                      <MobileNavLink href="/dashboard" icon={BarChart3}>
                        Dashboard
                      </MobileNavLink>
                      <MobileNavLink href="/challenge" icon={Trophy}>
                        Défi
                      </MobileNavLink>
                      {isSignedIn && isModerator() && (
                        <MobileNavLink
                          href="/admin/moderation"
                          icon={Shield}
                          badge={pendingCount}
                        >
                          Modération
                        </MobileNavLink>
                      )}
                    </div>
                  </nav>

                  {/* User Section */}
                  <div className="p-4 border-t">
                    {isSignedIn ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          {(profile?.custom_avatar_url ||
                            profile?.avatar_url) && (
                            <img
                              src={
                                profile.custom_avatar_url || profile.avatar_url
                              }
                              alt={profile.username || "Avatar"}
                              className="w-10 h-10 rounded-full object-cover border border-border"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {profile?.username ||
                                user?.emailAddresses[0]?.emailAddress}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user?.emailAddresses[0]?.emailAddress}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <MobileNavLink
                            href={`/profile/${profile?.username || "me"}`}
                            icon={User}
                          >
                            Mon profil
                          </MobileNavLink>
                          <MobileNavLink href="/settings" icon={Settings}>
                            Paramètres
                          </MobileNavLink>
                          <SignOutButton>
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-red-600">
                              <LogOut className="h-5 w-5" />
                              <span className="text-base">Déconnexion</span>
                            </button>
                          </SignOutButton>
                        </div>
                      </div>
                    ) : (
                      <SignInButton>
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          Connexion
                        </Button>
                      </SignInButton>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
