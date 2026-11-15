/**
 * Database Module Barrel Export — Saathi
 * Smart factory: uses Supabase if configured, otherwise in-memory
 */

export * from './repo';
export * from './memory';
export * from './supabase';

import type { Repository } from './repo';
import { getRepository as getMemoryRepository, resetRepository as resetMemoryRepository } from './memory';
import { getSupabaseRepository, resetSupabaseRepository } from './supabase';

let useSupabase = false;
let repositoryInstance: Repository | null = null;

function hasSupabaseConfig(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getRepository(): Promise<Repository> {
  // Determine which repository to use
  const shouldUseSupabase = hasSupabaseConfig();

  if (shouldUseSupabase !== useSupabase || !repositoryInstance) {
    // Switch or first init
    useSupabase = shouldUseSupabase;
    repositoryInstance = null;

    if (useSupabase) {
      resetMemoryRepository();
      repositoryInstance = await getSupabaseRepository();
    } else {
      resetSupabaseRepository();
      repositoryInstance = await getMemoryRepository();
    }
  }

  return repositoryInstance;
}

export function resetRepository(): void {
  repositoryInstance = null;
  resetMemoryRepository();
  resetSupabaseRepository();
}

export function isUsingSupabase(): boolean {
  return useSupabase;
}