'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { rollCommand } from '@/lib/queries/workouts';
import type { RollPick } from '@/lib/roll';
import type { Dog } from '@/lib/queries/dogs';

export function RollToTrainWidget({ dogs }: { dogs: Dog[] }) {
  const [dogId, setDogId] = useState<number>(dogs[0]?.id ?? 0);
  const [pick, setPick] = useState<RollPick | null>(null);
  const [mode, setMode] = useState<'smart' | 'weighted' | null>(null);
  const [empty, setEmpty] = useState(false);
  const [pending, startTransition] = useTransition();

  function roll(m: 'smart' | 'weighted') {
    setMode(m);
    setEmpty(false);
    startTransition(async () => {
      const result = await rollCommand(dogId, m);
      setPick(result);
      setEmpty(result === null);
    });
  }

  if (dogs.length === 0) return null;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          🎲 Roll to Train
        </h3>
        <select
          value={dogId}
          onChange={(e) => {
            setDogId(Number(e.target.value));
            setPick(null);
            setEmpty(false);
          }}
          className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        >
          {dogs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => roll('smart')}
          disabled={pending}
          className="rounded-xl bg-neutral-100 px-3 py-2 text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          title="Random command not trained in 7+ days"
        >
          {pending && mode === 'smart' ? 'Rolling…' : 'Smart roll (stale)'}
        </button>
        <button
          onClick={() => roll('weighted')}
          disabled={pending}
          className="rounded-xl bg-neutral-100 px-3 py-2 text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          title="Random pick from your 3 weakest commands by accuracy"
        >
          {pending && mode === 'weighted' ? 'Rolling…' : 'Weighted (weakest)'}
        </button>
      </div>

      {pick && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-900/20">
          <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            {pick.set_name}
          </p>
          <p className="mt-0.5 text-lg font-semibold">{pick.command_name}</p>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            {pick.total_attempted > 0
              ? `${Math.round((pick.total_successes / pick.total_attempted) * 100)}% accuracy · ${pick.total_successes}/${pick.total_attempted}`
              : 'No reps yet'}
            {pick.last_trained_date
              ? ` · last ${Math.max(1, Math.floor((Date.now() - pick.last_trained_date) / 86_400_000))}d ago`
              : ' · never trained'}
          </p>
          <Link
            href={`/workouts/new?dog=${dogId}&command=${pick.dog_command_id}`}
            className="mt-3 block w-full rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            ▶  Train this now
          </Link>
        </div>
      )}

      {empty && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {mode === 'smart'
            ? 'Nothing stale — every command has been trained in the last 7 days. Try weighted.'
            : 'Not enough data yet — log a few sets first so we can find your weak points.'}
        </p>
      )}
    </section>
  );
}
