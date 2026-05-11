import Link from 'next/link';
import { getDogs, getDogSummary } from '@/lib/queries/dogs';
import { DogCard } from '@/components/DogCard';
import { RollToTrainWidget } from '@/components/RollToTrainWidget';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const allDogs = getDogs();
  const dogs = allDogs.map((d) => getDogSummary(d.id));
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 space-y-4 pb-[env(safe-area-inset-bottom)]">
      <header className="flex items-center justify-between pb-2">
        <h1 className="text-xl font-semibold tracking-tight">Dog Training</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">{today}</span>
          <Link
            href="/manage"
            className="rounded-lg bg-neutral-100 px-3 py-1 text-sm font-medium hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            Manage
          </Link>
        </div>
      </header>

      {allDogs.length === 0 ? (
        <section className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <p className="text-lg font-medium">Add a dog to get started.</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            You&apos;ll also need at least one master set and command before you can train.
          </p>
          <Link
            href="/manage"
            className="mt-4 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            Open Manage
          </Link>
        </section>
      ) : (
        <>
          {dogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
          <RollToTrainWidget dogs={allDogs} />
        </>
      )}
    </main>
  );
}
