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
    console.log(
      "🔄 Chargement des sessions pour puzzle:",
      puzzleType,
      "user:",
      user?.id
    );

    if (!user?.id) {
      setSessions([]);
      setActiveSession(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = await createSupabaseClientWithUser(user.id);

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
        console.log("📊 Sessions récupérées:", data?.length || 0, "sessions");
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

  // Écouter les événements de mise à jour des sessions
  useEffect(() => {
    const handleSessionsUpdate = () => {
      console.log(
        "📥 Réception de l'événement sessions-updated, rafraîchissement..."
      );
      loadSessions();
    };

    const handleSolvesUpdate = () => {
      console.log(
        "📥 Réception de l'événement solves-updated, rafraîchissement des sessions..."
      );
      loadSessions();
    };

    window.addEventListener("sessions-updated", handleSessionsUpdate);
    window.addEventListener("solves-updated", handleSolvesUpdate);

    return () => {
      window.removeEventListener("sessions-updated", handleSessionsUpdate);
      window.removeEventListener("solves-updated", handleSolvesUpdate);
    };
  }, [user?.id, puzzleType]);

  const createSession = async (name: string, puzzleType: string) => {
    if (!user?.id) {
      throw new Error("Utilisateur non connecté");
    }

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = await createSupabaseClientWithUser(user.id);

      // Utiliser la fonction RPC pour créer la session
      const { data, error } = await supabase.rpc("create_session_with_auth", {
        p_user_id: user.id,
        p_name: name,
        p_puzzle_type: puzzleType,
        p_is_active: true,
      });

      if (error) {
        console.error("Erreur lors de la création de la session:", error);
        throw error;
      }

      if (data && data.length > 0) {
        const newSession = data[0];
        setSessions((prev) => [newSession, ...prev]);
        setActiveSession(newSession);

        // Déclencher une mise à jour des stats après création
        console.log(
          "📤 Déclenchement de l'événement sessions-updated (création)"
        );
        window.dispatchEvent(new CustomEvent("sessions-updated"));

        return newSession;
      } else {
        throw new Error("Aucune session créée");
      }
    } catch (err) {
      console.error("Erreur lors de la création de la session:", err);
      throw err;
    }
  };

  const activateSession = async (sessionId: string) => {
    if (!user?.id) return;

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = await createSupabaseClientWithUser(user.id);

      // Utiliser la fonction RPC pour activer la session
      const { data, error } = await supabase.rpc("update_session_with_auth", {
        p_session_id: sessionId,
        p_user_id: user.id,
        p_name: null, // Pas de changement de nom
        p_is_active: true,
      });

      if (error) {
        console.error("Erreur lors de l'activation de la session:", error);
        throw error;
      }

      if (data && data.length > 0) {
        const activatedSession = data[0];
        setSessions((prev) =>
          prev.map((session) => ({
            ...session,
            is_active: session.id === sessionId,
          }))
        );
        setActiveSession(activatedSession);

        // Déclencher une mise à jour des stats après activation
        console.log(
          "📤 Déclenchement de l'événement sessions-updated (activation)"
        );
        window.dispatchEvent(new CustomEvent("sessions-updated"));

        return activatedSession;
      } else {
        throw new Error("Session non trouvée ou accès refusé");
      }
    } catch (err) {
      console.error("Erreur lors de l'activation de la session:", err);
      throw err;
    }
  };

  const updateSession = async (sessionId: string, updates: UpdateSession) => {
    if (!user?.id) return;

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = await createSupabaseClientWithUser(user.id);

      const { data, error } = await supabase.rpc("update_session_with_auth", {
        p_session_id: sessionId,
        p_user_id: user.id,
        p_name: updates.name,
        p_is_active: updates.is_active,
      });

      if (error) {
        console.error("Erreur lors de la mise à jour de la session:", error);
        throw error;
      }

      if (data && data.length > 0) {
        const updatedSession = data[0];
        setSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId ? updatedSession : session
          )
        );

        if (updatedSession.is_active) {
          setActiveSession(updatedSession);
        }

        return updatedSession;
      } else {
        throw new Error("Session non trouvée ou accès refusé");
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la session:", err);
      throw err;
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!user?.id) return;

    try {
      // Créer un client Supabase avec l'ID utilisateur dans les headers
      const supabase = await createSupabaseClientWithUser(user.id);

      const { data, error } = await supabase.rpc("delete_session_with_auth", {
        p_session_id: sessionId,
        p_user_id: user.id,
      });

      if (error) {
        console.error("Erreur lors de la suppression de la session:", error);
        throw error;
      }

      if (data) {
        setSessions((prev) =>
          prev.filter((session) => session.id !== sessionId)
        );

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
      } else {
        throw new Error("Session non trouvée ou accès refusé");
      }
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
