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
  const initialCommandId = Number(params.command) || undefined;
  return <LiveWorkout dog={dog} commands={commands} initialCommandId={initialCommandId} />;
}
