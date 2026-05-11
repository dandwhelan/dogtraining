import { getDogs } from '@/lib/queries/dogs';
import { getDogCommands } from '@/lib/queries/commands';
import { LiveWorkout } from './LiveWorkout';

export const dynamic = 'force-dynamic';

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ dog?: string; command?: string }>;
}) {
  const params = await searchParams;
  const dogs = getDogs();
  const dogId = Number(params.dog) || dogs[0]?.id;
  const dog = dogs.find((d) => d.id === dogId) ?? dogs[0];
  if (!dog) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6">
        <p>No dogs found. Add a dog first.</p>
      </main>
    );
  }
  const commands = getDogCommands(dog.id);
  
  if (commands.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <div className="rounded-2xl bg-amber-50 p-6 text-center shadow-sm ring-1 ring-amber-500/20 dark:bg-amber-900/20">
          <p className="text-lg font-medium text-amber-900 dark:text-amber-200">
            Hold your horses! 🐾
          </p>
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            {dog.name} doesn't have any commands assigned yet. You need to assign commands to them before you can log a workout.
          </p>
          <a
            href={`/dogs/${dog.id}`}
            className="mt-4 inline-block rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
          >
            ← Back to {dog.name}'s Profile to Assign Commands
          </a>
        </div>
      </main>
    );
  }

  const initialCommandId = Number(params.command) || undefined;
  return <LiveWorkout dog={dog} commands={commands} initialCommandId={initialCommandId} />;
}
