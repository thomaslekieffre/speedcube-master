import { useState, useEffect, useCallback, useRef } from "react";
import {
  getHighPrecisionTime,
  getTimeDifference,
  getRoundedTimeDifference,
  supportsHighPrecisionTimer,
} from "@/lib/time";

interface UsePreciseTimerOptions {
  updateInterval?: number; // Intervalle de mise à jour en ms (défaut: 10ms)
  onTick?: (time: number) => void; // Callback appelé à chaque tick
  onStart?: () => void; // Callback appelé au démarrage
  onStop?: (finalTime: number) => void; // Callback appelé à l'arrêt
}

export function usePreciseTimer(options: UsePreciseTimerOptions = {}) {
  const { updateInterval = 10, onTick, onStart, onStop } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(0);

  // Vérifier la compatibilité du navigateur
  const isHighPrecisionSupported = supportsHighPrecisionTimer();

  // Démarrer le timer
  const start = useCallback(() => {
    if (isRunning) return;

    const now = getHighPrecisionTime();
    setStartTime(now);
    setTime(0);
    setIsRunning(true);
    lastTickRef.current = now;
    onStart?.();
  }, [isRunning, onStart]);

  // Arrêter le timer
  const stop = useCallback(() => {
    if (!isRunning || !startTime) return;

    const finalTime = getRoundedTimeDifference(startTime);
    setIsRunning(false);
    setTime(finalTime);
    setStartTime(null);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    onStop?.(finalTime);
    return finalTime;
  }, [isRunning, startTime, onStop]);

  // Réinitialiser le timer
  const reset = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    setStartTime(null);
    lastTickRef.current = 0;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Timer principal avec haute précision
  useEffect(() => {
    if (!isRunning || !startTime) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Mise à jour immédiate
    const currentTime = getTimeDifference(startTime);
    setTime(currentTime);
    onTick?.(currentTime);

    // Intervalle de mise à jour
    intervalRef.current = setInterval(() => {
      const now = getHighPrecisionTime();
      const currentTime = getTimeDifference(startTime, now);

      // Éviter les mises à jour trop fréquentes
      if (now - lastTickRef.current >= updateInterval) {
        setTime(currentTime);
        onTick?.(currentTime);
        lastTickRef.current = now;
      }
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, startTime, updateInterval, onTick]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    time,
    startTime,
    start,
    stop,
    reset,
    isHighPrecisionSupported,
  };
}
