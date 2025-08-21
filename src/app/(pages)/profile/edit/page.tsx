"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useUsernameCheck } from "@/hooks/use-username-check";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  User,
  Save,
  Loader2,
  Upload,
  Globe,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";

export default function EditProfilePage() {
  const { profile, loading, updateProfile } = useProfile();
  const { checking, isAvailable, checkUsername, resetCheck } =
    useUsernameCheck();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    bio: profile?.bio || "",
    wca_id: profile?.wca_id || "",
    is_public: profile?.is_public ?? true,
  });

  // Mettre à jour le formulaire quand le profil se charge
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        bio: profile.bio || "",
        wca_id: profile.wca_id || "",
        is_public: profile.is_public ?? true,
      });
      resetCheck(); // Reset la vérification quand le profil se charge
    }
  }, [profile, resetCheck]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    // Limiter la taille à 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image doit faire moins de 2MB");
      return;
    }

    try {
      // Convertir l'image en base64 pour la persistance
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;
        
        await updateProfile({
          custom_avatar_url: base64String,
        });

        toast.success("Avatar mis à jour !");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      toast.error("Erreur lors de l'upload de l'avatar");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // Vérifier que le username est disponible
    if (formData.username !== profile.username) {
      await checkUsername(formData.username);
      if (isAvailable === false) {
        toast.error("Ce nom d'utilisateur est déjà pris");
        return;
      }
    }

    setIsUpdating(true);
    try {
      await updateProfile({
        username: formData.username,
        bio: formData.bio,
        wca_id: formData.wca_id || null,
        is_public: formData.is_public,
      });
      toast.success("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      if (error instanceof Error && error.message.includes("unique")) {
        toast.error("Ce nom d'utilisateur est déjà pris");
      } else {
        toast.error("Erreur lors de la mise à jour du profil");
      }
    } finally {
      setIsUpdating(false);
    }
  };

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Profil non trouvé</h2>
          <p className="text-muted-foreground">
            Impossible de charger votre profil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/profile/${profile.username}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au profil
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Modifier le profil
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos informations personnelles
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations du profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                             {/* Avatar */}
               <div className="flex items-center gap-4">
                 <div className="relative">
                   <img
                     src={
                       profile.custom_avatar_url ||
                       profile.avatar_url ||
                       "/default-avatar.png"
                     }
                     alt={profile.username || "Avatar"}
                     className="w-16 h-16 rounded-full object-cover"
                   />
                   <Button
                     size="sm"
                     variant="outline"
                     className="absolute -bottom-1 -right-1 h-6 w-6 p-0"
                     onClick={() =>
                       document.getElementById("avatar-upload")?.click()
                     }
                   >
                     <Upload className="h-3 w-3" />
                   </Button>
                   <input
                     id="avatar-upload"
                     type="file"
                     accept="image/*"
                     className="hidden"
                     onChange={handleAvatarUpload}
                   />
                 </div>
                 <div className="flex-1">
                   <p className="text-sm text-muted-foreground mb-2">
                     Cliquez sur l'icône pour changer votre avatar
                   </p>
                   {profile.custom_avatar_url && (
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={async () => {
                         try {
                           await updateProfile({
                             custom_avatar_url: null,
                           });
                           toast.success("Avatar par défaut restauré");
                         } catch (error) {
                           toast.error("Erreur lors de la suppression");
                         }
                       }}
                       className="text-xs text-destructive hover:text-destructive"
                     >
                       Supprimer l'avatar personnalisé
                     </Button>
                   )}
                 </div>
               </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => {
                      const newUsername = e.target.value;
                      setFormData({ ...formData, username: newUsername });
                      // Vérifier la disponibilité après un délai
                      if (newUsername.length >= 3) {
                        setTimeout(() => checkUsername(newUsername), 500);
                      } else {
                        resetCheck();
                      }
                    }}
                    placeholder="Votre nom d'utilisateur"
                    required
                    className={`pr-10 ${
                      isAvailable === true
                        ? "border-green-500"
                        : isAvailable === false
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {checking ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : isAvailable === true ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : isAvailable === false ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : null}
                  </div>
                </div>
                {isAvailable === false && (
                  <p className="text-sm text-red-500">
                    Ce nom d'utilisateur est déjà pris
                  </p>
                )}
                {isAvailable === true && (
                  <p className="text-sm text-green-500">
                    Nom d'utilisateur disponible
                  </p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Parlez-nous de vous..."
                  rows={4}
                />
              </div>

              {/* WCA ID */}
              <div className="space-y-2">
                <Label htmlFor="wca_id">ID WCA (optionnel)</Label>
                <Input
                  id="wca_id"
                  value={formData.wca_id}
                  onChange={(e) =>
                    setFormData({ ...formData, wca_id: e.target.value })
                  }
                  placeholder="Ex: 2019DUPO01"
                />
              </div>

              {/* Privacy */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Profil public
                </Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) =>
                      setFormData({ ...formData, is_public: e.target.checked })
                    }
                    className="rounded border-border"
                  />
                  <Label htmlFor="is_public" className="text-sm">
                    Permettre aux autres de voir mon profil
                  </Label>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={
                  isUpdating ||
                  checking ||
                  (formData.username !== profile.username &&
                    isAvailable === false)
                }
                className="w-full"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
