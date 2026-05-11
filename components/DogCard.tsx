import Link from 'next/link';
import type { DogSummary } from '@/lib/queries/dogs';
import { Heatmap } from './Heatmap';
import { StartWorkoutButton } from './StartWorkoutButton';

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export function DogCard({ dog }: { dog: DogSummary }) {
  const pct = Math.min(100, Math.round((dog.totalXp / dog.nextThreshold) * 100));

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 space-y-3">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-3">
          {dog.profile_picture ? (
            <img src={dog.profile_picture} alt="" className="h-10 w-10 rounded-full object-cover shadow-sm ring-1 ring-black/10" />
          ) : (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg dark:bg-neutral-800">
              🐾
            </div>
          )}
          <div>
            <Link
              href={`/dogs/${dog.id}`}
              className="text-lg font-semibold uppercase tracking-wide hover:underline"
            >
              {dog.name}
            </Link>
            {dog.breed && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{dog.breed}</p>
            )}
          </div>
        </div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
          Lv {dog.level}
        </span>
      </div>

      <div className="space-y-1">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {dog.totalXp} / {dog.nextThreshold} XP
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
        <span>🔥 {dog.streak} day streak</span>
        <span className="text-neutral-300 dark:text-neutral-600">·</span>
        <span>
          {dog.lastSession
            ? `last: ${dog.lastSession.command} ${dog.lastSession.successes}/${dog.lastSession.attempted} ${relativeTime(dog.lastSession.at)}`
            : 'No sessions yet'}
        </span>
      </div>

      <Heatmap days={dog.heatmap} />

      <StartWorkoutButton dogId={dog.id} />
    </section>
  );
}
