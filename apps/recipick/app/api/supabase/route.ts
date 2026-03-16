import { NextResponse } from 'next/server';
import { getRecipeCache, saveRecipeCache } from '@/services/supabaseService';
import type { Recipe } from '@/types/api/routeApi/response';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId || videoId.trim() === '') {
    return NextResponse.json({ error: 'videoId가 필요합니다' }, { status: 400 });
  }

  try {
    const recipe = await getRecipeCache(videoId);
    return NextResponse.json({ recipe });
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
    await saveRecipeCache(recipe);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Supabase 저장에 실패했습니다' }, { status: 503 });
  }
}
