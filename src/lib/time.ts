export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${seconds}.${centiseconds.toString().padStart(2, "0")}`;
}

/**
 * Obtient le temps actuel en millisecondes avec une haute précision
 * Utilise performance.now() qui est plus précis que Date.now()
 * Basé sur le temps écoulé depuis le démarrage du navigateur
 */
export function getHighPrecisionTime(): number {
  return performance.now();
}

/**
 * Calcule la différence de temps entre deux moments avec haute précision
 * @param startTime - Temps de début (performance.now())
 * @param endTime - Temps de fin (performance.now()), optionnel
 * @returns Différence en millisecondes
 */
export function getTimeDifference(startTime: number, endTime?: number): number {
  const end = endTime || performance.now();
  return end - startTime;
}

/**
 * Vérifie si le navigateur supporte performance.now()
 * @returns true si supporté, false sinon
 */
export function supportsHighPrecisionTimer(): boolean {
  return (
    typeof performance !== "undefined" && typeof performance.now === "function"
  );
}

/**
 * Obtient le temps le plus précis disponible
 * Fallback vers Date.now() si performance.now() n'est pas supporté
 */
export function getBestAvailableTime(): number {
  if (supportsHighPrecisionTimer()) {
    return performance.now();
  }
  return Date.now();
}

/**
 * Arrondit un temps en millisecondes pour la sauvegarde en base de données
 * @param time - Temps en millisecondes (peut être décimal)
 * @returns Temps arrondi à l'entier le plus proche
 */
export function roundTimeForDatabase(time: number): number {
  return Math.round(time);
}

/**
 * Calcule la différence de temps et l'arrondit pour la base de données
 * @param startTime - Temps de début
 * @param endTime - Temps de fin (optionnel, utilise performance.now() si non fourni)
 * @returns Différence arrondie en millisecondes
 */
export function getRoundedTimeDifference(startTime: number, endTime?: number): number {
  const difference = getTimeDifference(startTime, endTime);
  return roundTimeForDatabase(difference);
}
