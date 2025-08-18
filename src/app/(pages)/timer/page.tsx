import { TimerCard } from "./_components/timer-card";
import { SolveList } from "./_components/solve-list";

export default function TimerPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <section>
        <h1 className="text-2xl font-bold">Timer</h1>
        <p className="text-muted-foreground mt-2">
          Appuie sur espace pour démarrer/arrêter.
        </p>
      </section>
      <section className="grid grid-cols-1 gap-6">
        <TimerCard />
        <SolveList />
      </section>
    </main>
  );
}
