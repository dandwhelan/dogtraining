import { getDogs, getDogSummary } from '@/lib/queries/dogs';
import { DogCard } from '@/components/DogCard';
import { RollToTrainWidget } from '@/components/RollToTrainWidget';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const dogs = getDogs().map((d) => getDogSummary(d.id));
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 space-y-4 pb-[env(safe-area-inset-bottom)]">
      <header className="flex items-center justify-between pb-2">
        <h1 className="text-xl font-semibold tracking-tight">Dog Training</h1>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">{today}</span>
      </header>

      {dogs.map((dog) => (
        <DogCard key={dog.id} dog={dog} />
      ))}

      <RollToTrainWidget />
    </main>
  );
}
