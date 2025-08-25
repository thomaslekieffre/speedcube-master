"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Target, Clock, Brain } from "lucide-react";
import Link from "next/link";
import { useRevisionBadge } from "@/hooks/use-revision-badge";

interface RevisionNotificationProps {
  onClose: () => void;
  isVisible: boolean;
}

export function RevisionNotification({
  onClose,
  isVisible,
}: RevisionNotificationProps) {
  const { revisionCount, hasRevisions } = useRevisionBadge();
  const [hasShownToday, setHasShownToday] = useState(false);

  useEffect(() => {
    // Vérifier si on a déjà montré la notification aujourd'hui
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem("revision-notification-last-shown");

    if (lastShown === today) {
      setHasShownToday(true);
    }
  }, []);

  useEffect(() => {
    // Marquer qu'on a montré la notification aujourd'hui
    if (isVisible && hasRevisions && !hasShownToday) {
      const today = new Date().toDateString();
      localStorage.setItem("revision-notification-last-shown", today);
      setHasShownToday(true);
    }
  }, [isVisible, hasRevisions, hasShownToday]);

  if (!isVisible || !hasRevisions || hasShownToday) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-20 right-4 z-50 max-w-sm"
      >
        <Card className="border-l-4 border-l-red-500 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <Brain className="h-5 w-5 text-red-600" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-foreground">
                    Révisions disponibles !
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  Vous avez <strong>{revisionCount}</strong> algorithme
                  {revisionCount > 1 ? "s" : ""} à réviser aujourd'hui.
                </p>

                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href="/learning/review">
                      <Target className="h-3 w-3 mr-1" />
                      Commencer
                    </Link>
                  </Button>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    ~5 min
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
