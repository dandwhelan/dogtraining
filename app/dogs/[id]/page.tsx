import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDogs, getDogSummary, calculateDogAge } from '@/lib/queries/dogs';
import {
  getDogCommands,
  getUnassignedMasterCommands,
} from '@/lib/queries/commands';
import {
  assignCommandToDog,
  unassignDogCommand,
} from '@/lib/queries/manage';
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
  const unassigned = getUnassignedMasterCommands(dogId);
  const grouped = new Map<string, typeof commands>();
  for (const c of commands) {
    const arr = grouped.get(c.set_name) ?? [];
    arr.push(c);
    grouped.set(c.set_name, arr);
  }

  const ageInfo = calculateDogAge(dog.birthday);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 space-y-4 pb-[env(safe-area-inset-bottom)]">
      <header className="space-y-4">
        <Link href="/" className="text-sm text-neutral-500 hover:underline">
          ← Dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {dog.profile_picture ? (
              <img src={dog.profile_picture} alt={dog.name} className="h-16 w-16 rounded-full object-cover shadow-sm ring-1 ring-black/10" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-2xl dark:bg-neutral-800">
                🐾
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold uppercase tracking-wide">{dog.name}</h1>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {dog.breed && <span>{dog.breed}</span>}
                {ageInfo && (
                  <span className="ml-2">
                    · {ageInfo.humanYears}y ({ageInfo.dogYears} dog years)
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              Lv {dog.level}
            </span>
            <Link
              href={`/dogs/${dog.id}/edit`}
              className="text-xs text-neutral-500 hover:underline"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </header>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Profile Details
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          {dog.weight && (
            <div>
              <span className="block text-xs text-neutral-500">Weight</span>
              <span className="font-medium">{dog.weight}</span>
            </div>
          )}
          {dog.gotcha_day && (
            <div>
              <span className="block text-xs text-neutral-500">Gotcha Day</span>
              <span className="font-medium">{dog.gotcha_day}</span>
            </div>
          )}
          {dog.dietary_restrictions && (
            <div>
              <span className="block text-xs text-neutral-500">Diet</span>
              <span className="font-medium">{dog.dietary_restrictions}</span>
            </div>
          )}
          {dog.fav_toy && (
            <div>
              <span className="block text-xs text-neutral-500">Fav Toy</span>
              <span className="font-medium">{dog.fav_toy}</span>
            </div>
          )}
          {dog.fav_games && (
            <div>
              <span className="block text-xs text-neutral-500">Fav Games</span>
              <span className="font-medium">{dog.fav_games}</span>
            </div>
          )}
          {dog.best_traits && (
            <div>
              <span className="block text-xs text-neutral-500">Best Traits</span>
              <span className="font-medium">{dog.best_traits}</span>
            </div>
          )}
        </div>
        {(dog.microchip_number || dog.vet_contact || dog.medical_info) && (
          <div className="mt-4 border-t border-neutral-100 pt-3 text-sm dark:border-neutral-800 space-y-1">
            {dog.microchip_number && (
              <p><span className="text-neutral-500">Microchip:</span> {dog.microchip_number}</p>
            )}
            {dog.vet_contact && (
              <p><span className="text-neutral-500">Vet:</span> {dog.vet_contact}</p>
            )}
            {dog.medical_info && (
              <p><span className="text-neutral-500">Medical Notes:</span> {dog.medical_info}</p>
            )}
          </div>
        )}
      </section>

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

      {/* ASSIGN COMMAND */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Assign a command
        </h2>
        {unassigned.length === 0 ? (
          <p className="text-sm text-neutral-500">
            {commands.length === 0 ? (
              <>
                No master commands exist yet.{' '}
                <Link href="/manage" className="text-emerald-600 hover:underline dark:text-emerald-400">
                  Create some in Manage
                </Link>
                .
              </>
            ) : (
              <>Every master command is already assigned to this dog.</>
            )}
          </p>
        ) : (
          <form action={assignCommandToDog} className="space-y-2">
            <input type="hidden" name="dog_id" value={dog.id} />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <select
                name="command_id"
                required
                defaultValue=""
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              >
                <option value="" disabled>
                  Master command…
                </option>
                {unassigned.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.set_name} · {c.default_name}
                  </option>
                ))}
              </select>
              <input
                name="custom_cue"
                placeholder="Custom cue (optional, e.g. “Here”)"
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              />
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                Assign
              </button>
            </div>
            <p className="text-xs text-neutral-500">
              Starts at Lv 1 with 0/0 reps. The custom cue is what you&apos;ll see in
              workouts.
            </p>
          </form>
        )}
      </section>

      {commands.length === 0 ? (
        <section className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <p className="text-sm text-neutral-500">
            No commands assigned yet. Use the form above to start tracking.
          </p>
        </section>
      ) : (
        [...grouped.entries()].map(([setName, items]) => (
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
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium">
                        {c.custom_cue ?? c.command_name}
                        {c.custom_cue && (
                          <span className="ml-2 text-xs font-normal text-neutral-500">
                            ({c.command_name})
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-3 text-xs text-neutral-500">
                        <span>
                          Lv {lvl} · {c.total_successes}/{next} XP
                        </span>
                        <form action={unassignDogCommand}>
                          <input type="hidden" name="id" value={c.dog_command_id} />
                          <input type="hidden" name="dog_id" value={dog.id} />
                          <button
                            type="submit"
                            className="text-red-600 hover:underline dark:text-red-400"
                            title="Unassign this command"
                          >
                            remove
                          </button>
                        </form>
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
        ))
      )}
    </main>
  );
}
