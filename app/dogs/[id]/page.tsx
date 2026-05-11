import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDogs, getDogSummary } from '@/lib/queries/dogs';
import { getDogCommands } from '@/lib/queries/commands';
import { levelFor, nextLevelThreshold, accuracy } from '@/lib/leveling';
import { Heatmap } from '@/components/Heatmap';
import { StartWorkoutButton } from '@/components/StartWorkoutButton';

export const dynamic = 'force-dynamic';

function relTime(ts: number | null): string {
  if (!ts) return 'never';
  const days = Math.floor((Date.now() - ts) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default async function DogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dogId = Number(id);
  const dogs = getDogs();
  if (!dogs.some((d) => d.id === dogId)) notFound();

  const dog = getDogSummary(dogId);
  const commands = getDogCommands(dogId);
  const grouped = new Map<string, typeof commands>();
  for (const c of commands) {
    const arr = grouped.get(c.set_name) ?? [];
    arr.push(c);
    grouped.set(c.set_name, arr);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 space-y-4 pb-[env(safe-area-inset-bottom)]">
      <header className="space-y-2">
        <Link href="/" className="text-sm text-neutral-500 hover:underline">
          ← Dashboard
        </Link>
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-semibold uppercase tracking-wide">{dog.name}</h1>
            {dog.breed && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{dog.breed}</p>
            )}
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            Lv {dog.level}
          </span>
        </div>
      </header>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 space-y-3">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-semibold tabular-nums">{dog.totalXp}</p>
            <p className="text-xs text-neutral-500">Total XP</p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums">🔥 {dog.streak}</p>
            <p className="text-xs text-neutral-500">Day streak</p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums">
              {dog.nextThreshold > dog.totalXp ? dog.nextThreshold - dog.totalXp : '—'}
            </p>
            <p className="text-xs text-neutral-500">XP to next</p>
          </div>
        </div>
        <Heatmap days={dog.heatmap} />
        <StartWorkoutButton dogId={dog.id} />
      </section>

      {[...grouped.entries()].map(([setName, items]) => (
        <section
          key={setName}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            {setName}
          </h2>
          <ul className="mt-3 divide-y divide-neutral-200 dark:divide-neutral-800">
            {items.map((c) => {
              const lvl = levelFor(c.total_successes);
              const next = nextLevelThreshold(c.total_successes);
              const acc = accuracy(c.total_successes, c.total_attempted);
              const pct = Math.min(100, Math.round((c.total_successes / next) * 100));
              return (
                <li key={c.dog_command_id} className="py-3 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium">{c.custom_cue ?? c.command_name}</span>
                    <span className="text-xs text-neutral-500">
                      Lv {lvl} · {c.total_successes}/{next} XP
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500">
                    {c.total_attempted > 0
                      ? `${Math.round(acc * 100)}% accuracy (${c.total_successes}/${c.total_attempted})`
                      : 'No reps logged'}
                    {' · last '}
                    {relTime(c.last_trained_date)}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
