import 'server-only';
import { createServerClient, type CookieOptions, type CookieMethodsServer } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { serverEnv } from '@/env/server';
import type { Recipe } from '@/types/api/routeApi/response';
import type { RecipeCacheRow } from '@/types/api/supabase/response';

const TABLE = 'recipe_cache';

export async function createSupabaseClient() {
  const cookieStore = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
      cookiesToSet.forEach(({ name, value, options }) => {
        cookieStore.set(name, value, options);
      });
    },
  };

  return createServerClient(serverEnv.supabaseUrl, serverEnv.supabaseAnonKey, {
    cookies: cookieMethods,
  });
}

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
  };
}

export async function getRecipeCache(videoId: string): Promise<Recipe | null> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('video_id', videoId.trim())
    .single<RecipeCacheRow>();

  if (error || !data) return null;
  return rowToRecipe(data, true);
}

export async function saveRecipeCache(recipe: Omit<Recipe, 'cached'>): Promise<void> {
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
