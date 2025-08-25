import { useState, useEffect } from "react";
import { createSupabaseClientWithUser } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import type { Database } from "@/types/database";

type Session = Database["public"]["Tables"]["sessions"]["Row"];
type InsertSession = Database["public"]["Tables"]["sessions"]["Insert"];
type UpdateSession = Database["public"]["Tables"]["sessions"]["Update"];

export function useSessions(puzzleType?: string) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const loadSessions = async () => {
    if (!user?.id) {
      setSessions([]);
      setActiveSession(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user.id);

      let query = supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (puzzleType) {
        query = query.eq("puzzle_type", puzzleType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erreur lors du chargement des sessions:", error);
        setError(error.message);
      } else {
        setSessions(data || []);

        // Trouver la session active
        const active = data?.find((session) => session.is_active);
        setActiveSession(active || null);
      }
    } catch (err) {
      console.error("Erreur inattendue:", err);
      setError("Erreur inattendue lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [user?.id, puzzleType]);

  const createSession = async (name: string, puzzleType: string) => {
    if (!user?.id) {
      throw new Error("Utilisateur non connecté");
    }

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user.id);

      // Désactiver toutes les autres sessions pour ce puzzle
      await supabase
        .from("sessions")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("puzzle_type", puzzleType);

      // Créer la nouvelle session
      const newSession = {
        user_id: user.id,
        name,
        puzzle_type: puzzleType,
        is_active: true,
      };

      const { data, error } = await supabase
        .from("sessions")
        .insert(newSession)
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la création de la session:", error);
        throw error;
      }

      setSessions((prev) => [data, ...prev]);
      setActiveSession(data);

      // Déclencher une mise à jour des stats après création
      console.log(
        "📤 Déclenchement de l'événement sessions-updated (création)"
      );
      window.dispatchEvent(new CustomEvent("sessions-updated"));

      return data;
    } catch (err) {
      console.error("Erreur lors de la création de la session:", err);
      throw err;
    }
  };

  const activateSession = async (sessionId: string) => {
    if (!user?.id) return;

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user.id);

      // Désactiver toutes les autres sessions pour ce puzzle
      const sessionToActivate = sessions.find((s) => s.id === sessionId);
      if (sessionToActivate) {
        await supabase
          .from("sessions")
          .update({ is_active: false })
          .eq("user_id", user.id)
          .eq("puzzle_type", sessionToActivate.puzzle_type);
      }

      // Activer la session sélectionnée
      const { data, error } = await supabase
        .from("sessions")
        .update({ is_active: true })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de l'activation de la session:", error);
        throw error;
      }

      setSessions((prev) =>
        prev.map((session) => ({
          ...session,
          is_active: session.id === sessionId,
        }))
      );
      setActiveSession(data);

      // Déclencher une mise à jour des stats après activation
      console.log(
        "📤 Déclenchement de l'événement sessions-updated (activation)"
      );
      window.dispatchEvent(new CustomEvent("sessions-updated"));

      return data;
    } catch (err) {
      console.error("Erreur lors de l'activation de la session:", err);
      throw err;
    }
  };

  const updateSession = async (sessionId: string, updates: UpdateSession) => {
    if (!user?.id) return;

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user.id);

      const { data, error } = await supabase
        .from("sessions")
        .update(updates)
        .eq("id", sessionId)
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la mise à jour de la session:", error);
        throw error;
      }

      setSessions((prev) =>
        prev.map((session) => (session.id === sessionId ? data : session))
      );

      if (data.is_active) {
        setActiveSession(data);
      }

      return data;
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la session:", err);
      throw err;
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!user?.id) return;

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = createSupabaseClientWithUser(user.id);

      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("id", sessionId);

      if (error) {
        console.error("Erreur lors de la suppression de la session:", error);
        throw error;
      }

      setSessions((prev) => prev.filter((session) => session.id !== sessionId));

      // Si la session supprimée était active, réactiver la première session disponible
      if (activeSession?.id === sessionId) {
        const remainingSessions = sessions.filter((s) => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          await activateSession(remainingSessions[0].id);
        } else {
          setActiveSession(null);
        }
      }

      // Déclencher une mise à jour des stats après suppression
      console.log(
        "📤 Déclenchement de l'événement sessions-updated (suppression)"
      );
      window.dispatchEvent(new CustomEvent("sessions-updated"));
    } catch (err) {
      console.error("Erreur lors de la suppression de la session:", err);
      throw err;
    }
  };

  const getSessionStats = (sessionId: string) => {
    // Cette fonction sera utilisée pour calculer les stats d'une session
    // Elle sera implémentée quand on aura accès aux solves
    return {
      totalSolves: 0,
      bestTime: null,
      average: null,
    };
  };

  return {
    sessions,
    activeSession,
    loading,
    error,
    createSession,
    activateSession,
    updateSession,
    deleteSession,
    refresh: loadSessions,
  };
}
