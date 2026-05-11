import Link from 'next/link';

export function StartWorkoutButton({ dogId }: { dogId: number }) {
  return (
    <Link
      href={`/workouts/new?dog=${dogId}`}
      className="block w-full rounded-xl bg-emerald-600 px-4 py-3 text-center text-base font-medium text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99] dark:bg-emerald-500 dark:hover:bg-emerald-600"
    >
      ▶  Start Workout
    </Link>
  );
}
