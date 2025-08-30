import { useState, useEffect, useCallback, useRef } from "react";
import { getHighPrecisionTime, getTimeDifference } from "@/lib/time";

interface UseInspectionTimerOptions {
  duration?: number; // Durée de l'inspection en ms (défaut: 15000ms = 15s)
  plus2Threshold?: number; // Seuil pour +2 en ms (défaut: 15000ms)
  dnfThreshold?: number; // Seuil pour DNF en ms (défaut: 17000ms)
  updateInterval?: number; // Intervalle de mise à jour en ms (défaut: 100ms)
  onTick?: (remainingTime: number, elapsedTime: number) => void;
  onPlus2?: () => void;
  onDnf?: () => void;
  onComplete?: () => void;
}

export function useInspectionTimer(options: UseInspectionTimerOptions = {}) {
  const {
    duration = 15000,
    plus2Threshold = 15000,
    dnfThreshold = 17000,
    updateInterval = 100,
    onTick,
    onPlus2,
    onDnf,
    onComplete,
  } = options;

  const [isActive, setIsActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [penalty, setPenalty] = useState<"none" | "plus2" | "dnf">("none");
  const [startTime, setStartTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const plus2TriggeredRef = useRef(false);
  const dnfTriggeredRef = useRef(false);

  // Démarrer l'inspection
  const start = useCallback(() => {
    const now = getHighPrecisionTime();
    setStartTime(now);
    setRemainingTime(duration);
    setElapsedTime(0);
    setPenalty("none");
    setIsActive(true);
    plus2TriggeredRef.current = false;
    dnfTriggeredRef.current = false;
  }, [duration]);

  // Arrêter l'inspection
  const stop = useCallback(() => {
    setIsActive(false);
    setStartTime(null);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return {
      elapsedTime,
      penalty,
    };
  }, [elapsedTime, penalty]);

  // Réinitialiser l'inspection
  const reset = useCallback(() => {
    setIsActive(false);
    setRemainingTime(duration);
    setElapsedTime(0);
    setPenalty("none");
    setStartTime(null);
    plus2TriggeredRef.current = false;
    dnfTriggeredRef.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [duration]);

  // Timer d'inspection avec haute précision
  useEffect(() => {
    if (!isActive || !startTime) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Mise à jour immédiate
    const currentElapsed = getTimeDifference(startTime);
    const currentRemaining = Math.max(0, duration - currentElapsed);

    setElapsedTime(currentElapsed);
    setRemainingTime(currentRemaining);
    onTick?.(currentRemaining, currentElapsed);

    // Vérifier les pénalités
    if (currentElapsed > dnfThreshold && !dnfTriggeredRef.current) {
      setPenalty("dnf");
      dnfTriggeredRef.current = true;
      onDnf?.();
    } else if (currentElapsed > plus2Threshold && !plus2TriggeredRef.current) {
      setPenalty("plus2");
      plus2TriggeredRef.current = true;
      onPlus2?.();
    }

    // Vérifier si l'inspection est terminée
    if (currentRemaining <= 0) {
      onComplete?.();
    }

    // Intervalle de mise à jour
    intervalRef.current = setInterval(() => {
      const now = getHighPrecisionTime();
      const currentElapsed = getTimeDifference(startTime, now);
      const currentRemaining = Math.max(0, duration - currentElapsed);

      setElapsedTime(currentElapsed);
      setRemainingTime(currentRemaining);
      onTick?.(currentRemaining, currentElapsed);

      // Vérifier les pénalités
      if (currentElapsed > dnfThreshold && !dnfTriggeredRef.current) {
        setPenalty("dnf");
        dnfTriggeredRef.current = true;
        onDnf?.();
      } else if (
        currentElapsed > plus2Threshold &&
        !plus2TriggeredRef.current
      ) {
        setPenalty("plus2");
        plus2TriggeredRef.current = true;
        onPlus2?.();
      }

      // Vérifier si l'inspection est terminée
      if (currentRemaining <= 0) {
        onComplete?.();
      }
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    isActive,
    startTime,
    duration,
    plus2Threshold,
    dnfThreshold,
    updateInterval,
    onTick,
    onPlus2,
    onDnf,
    onComplete,
  ]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isActive,
    remainingTime,
    elapsedTime,
    penalty,
    startTime,
    start,
    stop,
    reset,
  };
}
