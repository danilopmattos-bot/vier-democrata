import type { BeerRecipe, BrewSession } from '../types/brewing';

/**
 * These keys are part of the browser data contract. Keep the recipe key stable
 * so installations from previous versions open with no migration required.
 */
export const STORAGE_KEYS = {
  recipes: 'democrata_craft_recipes_v1',
  customStyles: 'democrata_custom_styles_v1',
  brewSessions: 'democrata_brew_sessions_v1',
} as const;

export const readStoredArray = <T>(key: string, fallback: T[]): T[] => {
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;

  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch (error) {
    console.error(`Failed to parse local data at ${key}`, error);
    return fallback;
  }
};

export const loadRecipes = (fallback: BeerRecipe[]): BeerRecipe[] => {
  const recipes = readStoredArray<BeerRecipe>(STORAGE_KEYS.recipes, fallback);
  return recipes.length > 0 ? recipes : fallback;
};

export const loadBrewSessions = (): BrewSession[] =>
  readStoredArray<BrewSession>(STORAGE_KEYS.brewSessions, []);
