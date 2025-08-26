import { NextRequest, NextResponse } from "next/server";
import {
  getTodayDate,
  generateOfficialScramble,
  getDailyScrambleFromDB,
  saveDailyScramble,
} from "@/lib/daily-scramble";

// GET - Récupérer le scramble du jour
export async function GET() {
  try {
    const today = getTodayDate();

    // Essayer de récupérer depuis la DB d'abord
    let scramble = await getDailyScrambleFromDB(today);

    // Si pas en DB, générer un nouveau
    if (!scramble) {
      try {
        scramble = await generateOfficialScramble();

        // Essayer de sauvegarder en DB (mais continuer même si ça échoue)
        try {
          await saveDailyScramble(today, scramble);
        } catch (dbError) {
          console.warn(
            "Impossible de sauvegarder en DB, mais scramble généré:",
            dbError
          );
        }
      } catch (error) {
        console.error(
          "Erreur avec generateOfficialScramble, utilisation du fallback:",
          error
        );
        scramble = "R U R' U' R' F R2 U' R' U' R U R' F'";
      }
    }

    return NextResponse.json({
      date: today,
      scramble: scramble,
      generated: true,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du scramble:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du scramble" },
      { status: 500 }
    );
  }
}

// POST - Forcer la génération d'un nouveau scramble pour aujourd'hui
export async function POST(request: NextRequest) {
  try {
    const today = getTodayDate();
    const scramble = await generateOfficialScramble();

    // Essayer de sauvegarder en DB
    try {
      await saveDailyScramble(today, scramble);
    } catch (dbError) {
      console.warn("Impossible de sauvegarder en DB:", dbError);
    }

    return NextResponse.json({
      date: today,
      scramble: scramble,
      success: true,
    });
  } catch (error) {
    console.error("Erreur lors de la génération du scramble:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du scramble" },
      { status: 500 }
    );
  }
}
