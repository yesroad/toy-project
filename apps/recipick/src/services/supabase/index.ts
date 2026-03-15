import type { Recipe, RecipeCacheRow } from '@/types/recipe.types';
import { createSupabaseClient } from './client';

const TABLE = 'recipe_cache';

/**
 * Supabase에서 캐시된 레시피 조회
 * 캐시 히트 시 Recipe 반환, 미스 시 null 반환
 */
export async function getCachedRecipe(videoId: string): Promise<Recipe | null> {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('video_id', videoId)
    .single<RecipeCacheRow>();

  if (error || !data) return null;

  return rowToRecipe(data, true);
}

/**
 * 레시피 분석 결과를 Supabase에 저장 (upsert — video_id 기준 중복 방지)
 */
export async function setCachedRecipe(recipe: Omit<Recipe, 'cached'>): Promise<void> {
  const supabase = await createSupabaseClient();

  const row: Omit<RecipeCacheRow, 'id' | 'created_at' | 'updated_at'> = {
    video_id: recipe.videoId,
    title: recipe.title,
    thumbnail: recipe.thumbnail,
    channel_name: recipe.channelName,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    coupang_links: recipe.coupangLinks ?? null,
    raw_caption: recipe.rawCaption ?? null,
  };

  await supabase.from(TABLE).upsert(row, { onConflict: 'video_id' });
}

function rowToRecipe(row: RecipeCacheRow, cached: boolean): Recipe {
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
  };
}
