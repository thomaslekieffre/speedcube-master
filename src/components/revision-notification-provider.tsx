"use client";

import { useState, useEffect } from "react";
import { RevisionNotification } from "./revision-notification";
import { useRevisionBadge } from "@/hooks/use-revision-badge";

interface RevisionNotificationProviderProps {
  children: React.ReactNode;
}

export function RevisionNotificationProvider({
  children,
}: RevisionNotificationProviderProps) {
  const [showNotification, setShowNotification] = useState(false);
  const { hasRevisions } = useRevisionBadge();

  useEffect(() => {
    // Afficher la notification après 3 secondes si il y a des révisions
    const timer = setTimeout(() => {
      if (hasRevisions) {
        setShowNotification(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasRevisions]);

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  return (
    <>
      {children}
      <RevisionNotification
        isVisible={showNotification}
        onClose={handleCloseNotification}
      />
    </>
  );
}
