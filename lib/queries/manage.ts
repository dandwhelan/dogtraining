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
