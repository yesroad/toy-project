import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { serverEnv } from '@/env/server';
import type { Recipe, VideoItem } from '@/types/api/routeApi/response';
import type {
  RecipeCacheRow,
  RecipeUnavailableRow,
  RecipeUnavailableReason,
} from '@/types/api/supabase/response';

const TABLE = 'recipe_cache';

const supabase = createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

export function rowToRecipe(row: RecipeCacheRow, cached: boolean): Recipe {
  return {
    videoId: row.video_id,
    title: row.title,
    thumbnail: row.thumbnail,
    channelName: row.channel_name,
    ingredients: row.ingredients,
    steps: row.steps,
    coupangLinks: row.coupang_links ?? undefined,
    rawCaption: row.raw_caption ?? undefined,
    cached,
    createdAt: row.created_at,
    servings: row.servings ?? undefined,
    cookingTime: row.cooking_time_minutes ?? undefined,
    difficulty: (row.difficulty as Recipe['difficulty']) ?? undefined,
    calories: row.calories ?? undefined,
    tips: row.tips ?? undefined,
    notes: row.notes ?? undefined,
    stepDetails: row.step_details ?? undefined,
  };
}

export async function getRawCaption(videoId: string): Promise<{ text: string; lang: 'ko' } | null> {
  const { data } = await supabase
    .from(TABLE)
    .select('raw_caption')
    .eq('video_id', videoId.trim())
    .single<Pick<RecipeCacheRow, 'raw_caption'>>();

  if (!data?.raw_caption) return null;
  return { text: data.raw_caption, lang: 'ko' };
}

export async function getRecipeCache(videoId: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(
      'id, video_id, title, thumbnail, channel_name, ingredients, steps, coupang_links, raw_caption, created_at, updated_at, servings, cooking_time_minutes, difficulty, calories, tips, notes, step_details',
    )
    .eq('video_id', videoId.trim())
    .single<RecipeCacheRow>();

  if (error || !data) return null;
  return rowToRecipe(data, true);
}

export async function saveRecipeCache(recipe: Omit<Recipe, 'cached'>): Promise<void> {
  const row: Omit<RecipeCacheRow, 'id' | 'created_at' | 'updated_at'> = {
    video_id: recipe.videoId,
    title: recipe.title,
    thumbnail: recipe.thumbnail,
    channel_name: recipe.channelName,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    coupang_links: recipe.coupangLinks ?? null,
    raw_caption: recipe.rawCaption ?? null,
    servings: recipe.servings ?? null,
    cooking_time_minutes: recipe.cookingTime ?? null,
    difficulty: recipe.difficulty ?? null,
    calories: recipe.calories ?? null,
    tips: recipe.tips ?? null,
    notes: recipe.notes ?? null,
    step_details: recipe.stepDetails ?? null,
  };
  await supabase.from(TABLE).upsert(row, { onConflict: 'video_id' });
}

const SKIP_TABLE = 'recipe_unavailable';

export async function getRecipeUnavailable(videoId: string): Promise<RecipeUnavailableRow | null> {
  const { data } = await supabase
    .from(SKIP_TABLE)
    .select('video_id, reason, created_at')
    .eq('video_id', videoId.trim())
    .single<RecipeUnavailableRow>();
  return data ?? null;
}

export async function saveRecipeUnavailable(
  videoId: string,
  reason: RecipeUnavailableReason,
): Promise<void> {
  await supabase.from(SKIP_TABLE).upsert({ video_id: videoId, reason }, { onConflict: 'video_id' });
}

export async function getAllRecipeSitemapEntries(): Promise<
  Array<{ videoId: string; createdAt: string }>
> {
  const { data } = await supabase
    .from(TABLE)
    .select('video_id, created_at')
    .order('created_at', { ascending: false });
  return (data ?? []).map((row) => ({ videoId: row.video_id, createdAt: row.created_at }));
}

export async function getRecentRecipes(limit: number): Promise<VideoItem[]> {
  const { data } = await supabase
    .from(TABLE)
    .select('video_id, title, thumbnail, channel_name, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    videoId: row.video_id,
    title: row.title,
    thumbnail: row.thumbnail,
    channelName: row.channel_name,
    publishedAt: row.created_at,
  }));
}
