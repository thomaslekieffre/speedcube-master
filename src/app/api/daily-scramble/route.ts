import { NextRequest, NextResponse } from "next/server";
import {
  generateAndSaveDailyScramble,
  getDailyScrambleFromDB,
  getTodayDate,
} from "@/lib/daily-scramble";

// GET - Récupérer le scramble du jour
export async function GET() {
  try {
    const today = getTodayDate();
    const scramble = await getDailyScrambleFromDB(today);

    if (!scramble) {
      // Si pas de scramble pour aujourd'hui, en générer un
      await generateAndSaveDailyScramble();
      const newScramble = await getDailyScrambleFromDB(today);

      return NextResponse.json({
        date: today,
        scramble: newScramble,
        generated: true,
      });
    }

    return NextResponse.json({
      date: today,
      scramble: scramble,
      generated: false,
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
    const { force = false } = await request.json();

    if (force) {
      // Forcer la régénération même si un scramble existe déjà
      await generateAndSaveDailyScramble();
    } else {
      // Générer seulement si aucun scramble n'existe pour aujourd'hui
      const today = getTodayDate();
      const existingScramble = await getDailyScrambleFromDB(today);

      if (!existingScramble) {
        await generateAndSaveDailyScramble();
      }
    }

    const today = getTodayDate();
    const scramble = await getDailyScrambleFromDB(today);

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
