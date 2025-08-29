import { supabase } from "./supabase";
import { generateScrambleSync } from "scrambled";

// Fonction pour obtenir la date du jour au format YYYY-MM-DD (heure locale française)
export function getTodayDate(): string {
  // Utiliser l'heure locale française (UTC+1/+2 selon l'heure d'été)
  const now = new Date();

  // Convertir en heure locale française
  const frenchTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Paris" })
  );

  const year = frenchTime.getFullYear();
  const month = String(frenchTime.getMonth() + 1).padStart(2, "0");
  const day = String(frenchTime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Fonction pour générer un scramble officiel via la bibliothèque scrambled
export async function generateOfficialScramble(): Promise<string> {
  try {
    // Utiliser la bibliothèque scrambled pour générer un scramble officiel 3x3
    // 20 mouvements est la longueur standard pour les mélanges 3x3 officiels
    const result = generateScrambleSync(20, 3);
    console.log("Scramble généré avec scrambled:", result.scramble);
    return result.scramble;
  } catch (error) {
    console.error("Erreur lors de la génération du scramble officiel:", error);

    // Fallback vers des scrambles valides si scrambled échoue
    const FALLBACK_SCRAMBLES = [
      "R U R' U' R' F R2 U' R' U' R U R' F'",
      "F R U R' U' F' R U R' U' R' F R F'",
      "R U R' U R U2 R' F R U R' U' F'",
      "R U R' U' R' F R F' R U R' U' R' F R F'",
      "F R U R' U' F' U F R U R' U' F'",
      "R U R' U' R' F R F' U2 R U R' U' R' F R F'",
      "F R U R' U' F' U2 F R U R' U' F'",
      "R U R' U' R' F R F' R U R' U' R' F R F'",
      "F R U R' U' F' R U R' U' R' F R F'",
      "R U R' U R U2 R' F R U R' U' F' U2",
      "R U R' U' R' F R F' U F R U R' U' F'",
      "F R U R' U' F' U R U R' U' R' F R F'",
      "R U R' U' R' F R F' R U R' U' R' F R F' U2",
      "F R U R' U' F' U2 R U R' U' R' F R F'",
      "R U R' U R U2 R' F R U R' U' F' U'",
      "R U R' U' R' F R F' U' F R U R' U' F'",
      "F R U R' U' F' U' R U R' U' R' F R F'",
      "R U R' U' R' F R F' U2 F R U R' U' F'",
      "F R U R' U' F' R U R' U' R' F R F' U2",
      "R U R' U R U2 R' F R U R' U' F' U",
      "L U L' U L U2 L' F L U L' U' F'",
      "L U L' U' L' F L F' L U L' U' L' F L F'",
      "F L U L' U' F' L U L' U' L' F L F'",
      "B U B' U B U2 B' F B U B' U' F'",
      "B U B' U' B' F B F' B U B' U' B' F B F'",
      "F B U B' U' F' B U B' U' B' F B F'",
    ];

    const randomIndex = Math.floor(Math.random() * FALLBACK_SCRAMBLES.length);
    console.log(
      "Utilisation du fallback scramble:",
      FALLBACK_SCRAMBLES[randomIndex]
    );
    return FALLBACK_SCRAMBLES[randomIndex];
  }
}

// Fonction pour sauvegarder un scramble en base de données
export async function saveDailyScramble(
  date: string,
  scramble: string
): Promise<void> {
  try {
    const { error } = await supabase.from("daily_scrambles").upsert(
      {
        challenge_date: date,
        scramble: scramble,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "challenge_date",
      }
    );

    if (error) {
      console.error("Erreur lors de la sauvegarde du scramble:", error);
      throw error;
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du scramble:", error);
    throw error;
  }
}

// Fonction pour récupérer le scramble du jour depuis la base de données
export async function getDailyScrambleFromDB(
  date: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("daily_scrambles")
      .select("scramble")
      .eq("challenge_date", date)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Aucun scramble trouvé pour cette date
        return null;
      }
      throw error;
    }

    return data.scramble;
  } catch (error) {
    console.error("Erreur lors de la récupération du scramble:", error);
    return null;
  }
}

// Fonction pour obtenir ou générer le scramble du jour
export async function getDailyScramble(): Promise<string> {
  const today = getTodayDate();

  // Essayer de récupérer le scramble depuis la DB
  let scramble = await getDailyScrambleFromDB(today);

  // Si pas de scramble en DB, en générer un nouveau
  if (!scramble) {
    console.log("Génération d'un nouveau scramble pour", today);
    scramble = await generateOfficialScramble();

    // Sauvegarder le nouveau scramble
    try {
      await saveDailyScramble(today, scramble);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du scramble:", error);
      // Continuer avec le scramble généré même si la sauvegarde échoue
    }
  }

  return scramble;
}

// Fonction pour vérifier si un scramble est pour aujourd'hui
export function isScrambleForToday(scramble: string, date: string): boolean {
  const today = getTodayDate();
  return date === today;
}

// Fonction pour calculer le temps restant jusqu'à minuit
export function getTimeRemaining(): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}

// Fonction pour générer et sauvegarder le scramble du jour (pour les tâches cron)
export async function generateAndSaveDailyScramble(): Promise<void> {
  const today = getTodayDate();
  console.log(`Génération du scramble pour ${today}`);

  try {
    const scramble = await generateOfficialScramble();
    await saveDailyScramble(today, scramble);
    console.log(`Scramble généré et sauvegardé pour ${today}:`, scramble);
  } catch (error) {
    console.error(
      `Erreur lors de la génération du scramble pour ${today}:`,
      error
    );
    throw error;
  }
}
