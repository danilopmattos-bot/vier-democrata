import type { BeerRecipe, BrewSession } from '../types/brewing';

/** Browser data contract. Keep these keys stable for backwards compatibility. */
export const STORAGE_KEYS = {
  recipes: 'democrata_craft_recipes_v1',
  customStyles: 'democrata_custom_styles_v1',
  brewSessions: 'democrata_brew_sessions_v1',
} as const;

export const readStoredArray = <T>(key: string, fallback: T[]): T[] => {
  if (typeof window === 'undefined') return fallback;
  const saved = window.localStorage.getItem(key);
  if (!saved) return fallback;

  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch (error) {
    console.error(`Failed to parse local data at ${key}`, error);
    return fallback;
  }
};

export const writeStoredArray = <T>(key: string, value: T[]): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to persist local data at ${key}`, error);
  }
};

export const loadRecipes = (fallback: BeerRecipe[]): BeerRecipe[] => {
  const recipes = readStoredArray<BeerRecipe>(STORAGE_KEYS.recipes, fallback);
  return recipes.length > 0 ? recipes : fallback;
};

export const loadBrewSessions = (): BrewSession[] =>
  readStoredArray<BrewSession>(STORAGE_KEYS.brewSessions, []);

export const saveBrewSessions = (sessions: BrewSession[]): void =>
  writeStoredArray(STORAGE_KEYS.brewSessions, sessions);
