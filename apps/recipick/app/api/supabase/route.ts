import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions, type CookieMethodsServer } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { serverEnv } from '@/env/server';
import type { Recipe } from '@/types/api/routeApi/response';
import type { RecipeCacheRow } from '@/types/api/supabase/response';

const TABLE = 'recipe_cache';

async function createSupabaseClient() {
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

  return createServerClient(
    serverEnv.supabaseUrl,
    serverEnv.supabaseAnonKey,
    { cookies: cookieMethods },
  );
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId || videoId.trim() === '') {
    return NextResponse.json({ error: 'videoId가 필요합니다' }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('video_id', videoId.trim())
      .single<RecipeCacheRow>();

    if (error || !data) {
      return NextResponse.json({ recipe: null });
    }

    return NextResponse.json({ recipe: rowToRecipe(data, true) });
  } catch {
    return NextResponse.json({ error: 'Supabase 조회에 실패했습니다' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let body: { recipe: Omit<Recipe, 'cached'> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '요청 본문이 올바르지 않습니다' }, { status: 400 });
  }

  const { recipe } = body;
  if (!recipe || !recipe.videoId) {
    return NextResponse.json({ error: 'recipe 데이터가 필요합니다' }, { status: 400 });
  }

  try {
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
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Supabase 저장에 실패했습니다' }, { status: 503 });
  }
}
