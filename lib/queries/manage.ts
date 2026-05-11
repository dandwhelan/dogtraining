'use server';

import { db } from '../db';
import { revalidatePath } from 'next/cache';

function normalize(input: string): string {
  return input.trim();
}

export async function createDog(formData: FormData): Promise<void> {
  const name = normalize(String(formData.get('name') ?? ''));
  const breed = normalize(String(formData.get('breed') ?? ''));
  if (!name) throw new Error('Name is required');
  db.prepare('INSERT INTO dogs (name, breed) VALUES (?, ?)').run(
    name,
    breed || null,
  );
  revalidatePath('/');
  revalidatePath('/manage');
}

export async function updateDog(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  const name = normalize(String(formData.get('name') ?? ''));
  const breed = normalize(String(formData.get('breed') ?? ''));
  if (!id || !name) throw new Error('Name is required');
  db.prepare('UPDATE dogs SET name = ?, breed = ? WHERE id = ?').run(
    name,
    breed || null,
    id,
  );
  revalidatePath('/');
  revalidatePath('/manage');
  revalidatePath(`/dogs/${id}`);
}

export async function updateDogProfile(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!id) throw new Error('Dog ID is required');

  const name = normalize(String(formData.get('name') ?? ''));
  const breed = normalize(String(formData.get('breed') ?? ''));
  const weight = normalize(String(formData.get('weight') ?? '')) || null;
  const dietary_restrictions = normalize(String(formData.get('dietary_restrictions') ?? '')) || null;
  const fav_toy = normalize(String(formData.get('fav_toy') ?? '')) || null;
  const least_fav_toy = normalize(String(formData.get('least_fav_toy') ?? '')) || null;
  const fav_games = normalize(String(formData.get('fav_games') ?? '')) || null;
  const least_fav_games = normalize(String(formData.get('least_fav_games') ?? '')) || null;
  const best_traits = normalize(String(formData.get('best_traits') ?? '')) || null;
  const worst_traits = normalize(String(formData.get('worst_traits') ?? '')) || null;
  const birthday = normalize(String(formData.get('birthday') ?? '')) || null;
  const gotcha_day = normalize(String(formData.get('gotcha_day') ?? '')) || null;
  const microchip_number = normalize(String(formData.get('microchip_number') ?? '')) || null;
  const vet_contact = normalize(String(formData.get('vet_contact') ?? '')) || null;
  const medical_info = normalize(String(formData.get('medical_info') ?? '')) || null;

  let profile_picture = formData.get('existing_profile_picture') as string | null;
  const file = formData.get('profile_picture') as File | null;
  
  if (file && file.size > 0) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    profile_picture = `data:${file.type};base64,${buffer.toString('base64')}`;
  }

  db.prepare(`
    UPDATE dogs SET 
      name = ?, breed = ?, weight = ?, dietary_restrictions = ?,
      fav_toy = ?, least_fav_toy = ?, fav_games = ?, least_fav_games = ?,
      best_traits = ?, worst_traits = ?, birthday = ?, gotcha_day = ?,
      microchip_number = ?, vet_contact = ?, medical_info = ?, profile_picture = ?
    WHERE id = ?
  `).run(
    name, breed, weight, dietary_restrictions,
    fav_toy, least_fav_toy, fav_games, least_fav_games,
    best_traits, worst_traits, birthday, gotcha_day,
    microchip_number, vet_contact, medical_info, profile_picture, id
  );

  revalidatePath('/');
  revalidatePath('/manage');
  revalidatePath(`/dogs/${id}`);
}

export async function deleteDog(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!id) throw new Error('Missing id');
  db.prepare('DELETE FROM dogs WHERE id = ?').run(id);
  revalidatePath('/');
  revalidatePath('/manage');
}

export async function createMasterSet(formData: FormData): Promise<void> {
  const setName = normalize(String(formData.get('set_name') ?? ''));
  if (!setName) throw new Error('Set name is required');
  db.prepare('INSERT INTO master_sets (set_name) VALUES (?)').run(setName);
  revalidatePath('/manage');
}

export async function deleteMasterSet(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!id) throw new Error('Missing id');
  db.prepare('DELETE FROM master_sets WHERE id = ?').run(id);
  revalidatePath('/manage');
  revalidatePath('/');
}

export async function createMasterCommand(formData: FormData): Promise<void> {
  const setId = Number(formData.get('set_id'));
  const defaultName = normalize(String(formData.get('default_name') ?? ''));
  if (!setId || !defaultName) throw new Error('Set and command name are required');
  db.prepare(
    'INSERT INTO master_commands (set_id, default_name) VALUES (?, ?)',
  ).run(setId, defaultName);
  revalidatePath('/manage');
}

export async function deleteMasterCommand(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!id) throw new Error('Missing id');
  db.prepare('DELETE FROM master_commands WHERE id = ?').run(id);
  revalidatePath('/manage');
}

export async function assignCommandToDog(formData: FormData): Promise<void> {
  const dogId = Number(formData.get('dog_id'));
  const commandId = Number(formData.get('command_id'));
  const customCueRaw = normalize(String(formData.get('custom_cue') ?? ''));
  if (!dogId || !commandId) throw new Error('Dog and command are required');
  // total_attempted and total_successes default to 0 in the schema.
  // Level is derived from total_successes via levelFor(); 0 successes -> Lv 1.
  db.prepare(
    `INSERT INTO dog_commands (dog_id, command_id, custom_cue)
     VALUES (?, ?, ?)`,
  ).run(dogId, commandId, customCueRaw || null);
  revalidatePath('/');
  revalidatePath(`/dogs/${dogId}`);
}

export async function updateDogCommandCue(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  const dogId = Number(formData.get('dog_id'));
  const customCueRaw = normalize(String(formData.get('custom_cue') ?? ''));
  if (!id) throw new Error('Missing id');
  db.prepare('UPDATE dog_commands SET custom_cue = ? WHERE id = ?').run(
    customCueRaw || null,
    id,
  );
  if (dogId) revalidatePath(`/dogs/${dogId}`);
}

export async function unassignDogCommand(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  const dogId = Number(formData.get('dog_id'));
  if (!id) throw new Error('Missing id');
  db.prepare('DELETE FROM dog_commands WHERE id = ?').run(id);
  if (dogId) revalidatePath(`/dogs/${dogId}`);
  revalidatePath('/');
}
