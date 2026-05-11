import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getDogs, getDogSummary } from '@/lib/queries/dogs';
import { updateDogProfile } from '@/lib/queries/manage';

export const dynamic = 'force-dynamic';

export default async function EditDogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dogId = Number(id);
  const dogs = getDogs();
  if (!dogs.some((d) => d.id === dogId)) notFound();

  const dog = getDogSummary(dogId);

  async function handleUpdate(formData: FormData) {
    'use server';
    await updateDogProfile(formData);
    redirect(`/dogs/${dogId}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 space-y-4 pb-[env(safe-area-inset-bottom)]">
      <header className="space-y-2">
        <Link href={`/dogs/${dogId}`} className="text-sm text-neutral-500 hover:underline">
          ← Back to {dog.name}'s Profile
        </Link>
        <h1 className="text-2xl font-semibold uppercase tracking-wide">Edit Profile</h1>
      </header>

      <form action={handleUpdate} className="space-y-6">
        <input type="hidden" name="id" value={dog.id} />
        {dog.profile_picture && (
          <input type="hidden" name="existing_profile_picture" value={dog.profile_picture} />
        )}

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Basic Info
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Name</span>
              <input
                name="name"
                defaultValue={dog.name}
                required
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Breed</span>
              <input
                name="breed"
                defaultValue={dog.breed || ''}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Profile Picture</span>
              {dog.profile_picture && (
                <div className="mb-2">
                  <img src={dog.profile_picture} alt="Current" className="h-20 w-20 rounded-full object-cover shadow-sm ring-1 ring-black/10" />
                </div>
              )}
              <input
                name="profile_picture"
                type="file"
                accept="image/*"
                className="w-full text-sm text-neutral-500 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/30 dark:file:text-emerald-300"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Details & Dates
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Birthday</span>
              <input
                name="birthday"
                type="date"
                defaultValue={dog.birthday || ''}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Gotcha Day</span>
              <input
                name="gotcha_day"
                type="date"
                defaultValue={dog.gotcha_day || ''}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Weight</span>
              <input
                name="weight"
                placeholder="e.g. 20 lbs"
                defaultValue={dog.weight || ''}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Dietary Restrictions</span>
              <input
                name="dietary_restrictions"
                placeholder="e.g. Grain-free, No chicken"
                defaultValue={dog.dietary_restrictions || ''}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Microchip Number</span>
              <input
                name="microchip_number"
                defaultValue={dog.microchip_number || ''}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Vet Contact Info</span>
              <input
                name="vet_contact"
                defaultValue={dog.vet_contact || ''}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Medical Info & Notes</span>
              <textarea
                name="medical_info"
                rows={3}
                placeholder="e.g. Vaccinations up to date, allergies, medications"
                defaultValue={dog.medical_info || ''}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Personality & Favorites
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Favorite Toy</span>
              <input
                name="fav_toy"
                defaultValue={dog.fav_toy || ''}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Least Favorite Toy</span>
              <input
                name="least_fav_toy"
                defaultValue={dog.least_fav_toy || ''}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Favorite Games</span>
              <input
                name="fav_games"
                defaultValue={dog.fav_games || ''}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Least Favorite Games</span>
              <input
                name="least_fav_games"
                defaultValue={dog.least_fav_games || ''}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Best Traits</span>
              <input
                name="best_traits"
                defaultValue={dog.best_traits || ''}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600 dark:text-neutral-300">Worst Traits</span>
              <input
                name="worst_traits"
                defaultValue={dog.worst_traits || ''}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
          </div>
        </section>

        <button
          type="submit"
          className="block w-full rounded-xl bg-emerald-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          Save Profile
        </button>
      </form>
    </main>
  );
}
