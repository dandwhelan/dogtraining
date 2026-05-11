import Link from 'next/link';
import { getDogs } from '@/lib/queries/dogs';
import { getMasterSets, getMasterCommands } from '@/lib/queries/commands';
import {
  createDog,
  deleteDog,
  createMasterSet,
  deleteMasterSet,
  createMasterCommand,
  deleteMasterCommand,
} from '@/lib/queries/manage';

export const dynamic = 'force-dynamic';

export default function ManagePage() {
  const dogs = getDogs();
  const sets = getMasterSets();
  const commands = getMasterCommands();

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 space-y-4 pb-[env(safe-area-inset-bottom)]">
      <header className="space-y-1">
        <Link href="/" className="text-sm text-neutral-500 hover:underline">
          ← Dashboard
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">Manage</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Set up the dogs, training categories, and commands you want to track.
        </p>
      </header>

      {/* DOGS */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Dogs
        </h2>

        <form action={createDog} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input
            name="name"
            required
            placeholder="Name"
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <input
            name="breed"
            placeholder="Breed (optional)"
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            Add dog
          </button>
        </form>

        {dogs.length === 0 ? (
          <p className="text-sm text-neutral-500">No dogs yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {dogs.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-2">
                <div>
                  <Link href={`/dogs/${d.id}`} className="font-medium hover:underline">
                    {d.name}
                  </Link>
                  {d.breed && (
                    <span className="ml-2 text-sm text-neutral-500">{d.breed}</span>
                  )}
                </div>
                <form action={deleteDog}>
                  <input type="hidden" name="id" value={d.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-600 hover:underline dark:text-red-400"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* MASTER SETS */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Master Sets
        </h2>
        <p className="text-xs text-neutral-500">
          Categories like &ldquo;Obedience&rdquo;, &ldquo;Scentwork&rdquo;, &ldquo;Canicross&rdquo;.
        </p>

        <form action={createMasterSet} className="grid grid-cols-[1fr_auto] gap-2">
          <input
            name="set_name"
            required
            placeholder="Set name (e.g. Obedience)"
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            Add set
          </button>
        </form>

        {sets.length === 0 ? (
          <p className="text-sm text-neutral-500">No master sets yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {sets.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2">
                <span className="font-medium">{s.set_name}</span>
                <form action={deleteMasterSet}>
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-600 hover:underline dark:text-red-400"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* MASTER COMMANDS */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Master Commands
        </h2>
        <p className="text-xs text-neutral-500">
          Specific commands inside a set (e.g. &ldquo;Sit&rdquo; under &ldquo;Obedience&rdquo;).
        </p>

        {sets.length === 0 ? (
          <p className="text-sm text-neutral-500">Create a master set first.</p>
        ) : (
          <form action={createMasterCommand} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <select
              name="set_id"
              required
              defaultValue=""
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            >
              <option value="" disabled>
                Set…
              </option>
              {sets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.set_name}
                </option>
              ))}
            </select>
            <input
              name="default_name"
              required
              placeholder="Command name (e.g. Sit)"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              Add command
            </button>
          </form>
        )}

        {commands.length === 0 ? (
          <p className="text-sm text-neutral-500">No commands yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {commands.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2">
                <span>
                  <span className="text-xs uppercase tracking-wide text-neutral-500">
                    {c.set_name}
                  </span>
                  <span className="ml-2 font-medium">{c.default_name}</span>
                </span>
                <form action={deleteMasterCommand}>
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-600 hover:underline dark:text-red-400"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {dogs.length > 0 && (
        <p className="text-sm text-neutral-500">
          To assign commands to a specific dog (with an optional custom cue), open that
          dog&apos;s profile.
        </p>
      )}
    </main>
  );
}
