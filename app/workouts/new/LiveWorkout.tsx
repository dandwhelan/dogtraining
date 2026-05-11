'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import type { DogCommandRow } from '@/lib/queries/commands';
import type { Dog } from '@/lib/queries/dogs';
import { addSet, finishWorkout, startWorkout } from '@/lib/queries/workouts';

type LoggedSet = {
  dogCommandId: number;
  commandName: string;
  setName: string;
  repsAttempted: number;
  repsSuccess: number;
  distractionLevel: number;
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function LiveWorkout({
  dog,
  commands,
  initialCommandId,
}: {
  dog: Dog;
  commands: DogCommandRow[];
  initialCommandId?: number;
}) {
  const [workoutId, setWorkoutId] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [logged, setLogged] = useState<LoggedSet[]>([]);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ commandName: string; newLevel: number } | null>(null);

  // form state
  const defaultCmd =
    (initialCommandId && commands.some((c) => c.dog_command_id === initialCommandId)
      ? initialCommandId
      : commands[0]?.dog_command_id) ?? 0;
  const [dogCommandId, setDogCommandId] = useState<number>(defaultCmd);
  const [repsAttempted, setRepsAttempted] = useState(5);
  const [repsSuccess, setRepsSuccess] = useState(5);
  const [distraction, setDistraction] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const grouped = useMemo(() => {
    const map = new Map<string, DogCommandRow[]>();
    for (const c of commands) {
      const arr = map.get(c.set_name) ?? [];
      arr.push(c);
      map.set(c.set_name, arr);
    }
    return [...map.entries()];
  }, [commands]);

  const elapsed = startedAt ? Math.floor((now - startedAt) / 1000) : 0;

  async function handleStart() {
    const id = await startWorkout(dog.id);
    setWorkoutId(id);
    const currentTime = Date.now();
    setStartedAt(currentTime);
    setNow(currentTime);
  }

  function handleAddSet(e: React.FormEvent) {
    e.preventDefault();
    if (!workoutId) return;
    if (repsSuccess > repsAttempted) {
      alert('Successes cannot exceed attempts.');
      return;
    }
    const cmd = commands.find((c) => c.dog_command_id === dogCommandId);
    if (!cmd) return;
    const entry: LoggedSet = {
      dogCommandId,
      commandName: cmd.command_name,
      setName: cmd.set_name,
      repsAttempted,
      repsSuccess,
      distractionLevel: distraction,
    };
    startTransition(async () => {
      const result = await addSet({
        workoutId,
        dogCommandId,
        repsAttempted,
        repsSuccess,
        distractionLevel: distraction,
      });
      setLogged((prev) => [...prev, entry]);
      setRepsAttempted(5);
      setRepsSuccess(5);
      setDistraction(0);
      if (result.leveledUp) {
        setToast({ commandName: result.commandName, newLevel: result.newLevel });
        setTimeout(() => setToast(null), 4000);
      }
    });
  }

  function handleFinish() {
    if (!workoutId || !startedAt) return;
    const seconds = Math.floor((Date.now() - startedAt) / 1000);
    startTransition(async () => {
      await finishWorkout(workoutId, seconds);
    });
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 space-y-4 pb-[env(safe-area-inset-bottom)]">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-neutral-500 hover:underline">
            ← Dashboard
          </Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            {dog.name}
            <span className="ml-2 text-sm font-normal text-neutral-500">{dog.breed}</span>
          </h1>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl tabular-nums">{formatDuration(elapsed)}</p>
          <p className="text-xs text-neutral-500">
            {startedAt ? 'in session' : 'not started'}
          </p>
        </div>
      </header>

      {!startedAt && (
        <button
          onClick={handleStart}
          className="block w-full rounded-xl bg-emerald-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          ▶  Start Workout
        </button>
      )}

      {startedAt && (
        <>
          <form
            onSubmit={handleAddSet}
            className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Add set
            </h2>
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Command</span>
              <select
                value={dogCommandId}
                onChange={(e) => setDogCommandId(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              >
                {grouped.map(([setName, items]) => (
                  <optgroup key={setName} label={setName}>
                    {items.map((c) => (
                      <option key={c.dog_command_id} value={c.dog_command_id}>
                        {c.custom_cue ?? c.command_name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Attempted</span>
                <input
                  type="number"
                  min={1}
                  value={repsAttempted}
                  onChange={(e) => {
                    const v = Math.max(1, Number(e.target.value) || 1);
                    setRepsAttempted(v);
                    if (repsSuccess > v) setRepsSuccess(v);
                  }}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Successes</span>
                <input
                  type="number"
                  min={0}
                  max={repsAttempted}
                  value={repsSuccess}
                  onChange={(e) =>
                    setRepsSuccess(Math.min(repsAttempted, Math.max(0, Number(e.target.value) || 0)))
                  }
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </label>
            </div>

            <div>
              <span className="mb-1 block text-sm text-neutral-600 dark:text-neutral-300">
                Distraction level
              </span>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setDistraction(lvl)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                      distraction === lvl
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="block w-full rounded-xl bg-neutral-900 px-4 py-3 text-base font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {pending ? 'Saving…' : '+ Add Set'}
            </button>
          </form>

          {logged.length > 0 && (
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                This session
              </h3>
              <ul className="mt-2 divide-y divide-neutral-200 dark:divide-neutral-800">
                {logged.map((l, i) => (
                  <li key={i} className="flex items-baseline justify-between py-2 text-sm">
                    <span>
                      <span className="text-neutral-500">{l.setName}</span> · {l.commandName}
                    </span>
                    <span className="font-mono tabular-nums">
                      {l.repsSuccess}/{l.repsAttempted} · d{l.distractionLevel}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <button
            onClick={handleFinish}
            disabled={pending}
            className="block w-full rounded-xl bg-rose-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
          >
            ■  Finish Workout
          </button>
        </>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-6 mx-auto max-w-md rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 px-5 py-4 text-amber-950 shadow-lg ring-1 ring-black/10 animate-in fade-in slide-in-from-bottom-4"
        >
          <p className="text-xs font-semibold uppercase tracking-wide">Level up!</p>
          <p className="mt-0.5 text-base font-semibold">
            {toast.commandName} reached Lv {toast.newLevel} 🏆
          </p>
        </div>
      )}
    </main>
  );
}
