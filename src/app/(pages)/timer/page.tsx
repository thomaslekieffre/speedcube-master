import { TimerCard } from "@/components/timer-card";

export default function TimerPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Timer</h1>
          <p className="text-muted-foreground">
            <span className="hidden sm:inline">Appuie sur espace pour démarrer/arrêter</span>
            <span className="sm:hidden">Appuie sur le timer pour démarrer/arrêter</span>
          </p>
        </div>

        <TimerCard />
      </div>
    </div>
  );
}
