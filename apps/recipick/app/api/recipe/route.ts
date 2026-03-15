import { NextResponse } from 'next/server';
import { getCaption } from '@/services/youtube';
import { analyzeRecipe, mergeRecipeAnalyses } from '@/services/openai';
import { getCachedRecipe, setCachedRecipe } from '@/services/supabase';
import { chunkCaption } from '@/lib/caption';
import type { RecipeRequest } from '@/types/recipe.types';

export async function POST(request: Request) {
  let body: RecipeRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '요청 본문이 올바르지 않습니다' }, { status: 400 });
  }

  const { videoId } = body;

  if (!videoId || typeof videoId !== 'string') {
    return NextResponse.json({ error: 'videoId가 필요합니다' }, { status: 400 });
  }

  // 1. Supabase 캐시 확인
  try {
    const cached = await getCachedRecipe(videoId);
    if (cached) {
      return NextResponse.json({ recipe: cached });
    }
  } catch {
    // 캐시 조회 실패해도 계속 진행
  }

  // 2. YouTube 자막 가져오기
  let caption: string;
  try {
    caption = await getCaption(videoId);
  } catch {
    return NextResponse.json({ error: '자막이 없거나 접근할 수 없는 영상입니다' }, { status: 422 });
  }

  if (!caption || caption.trim().length === 0) {
    return NextResponse.json({ error: '자막 내용이 없습니다' }, { status: 422 });
  }

  // 3. 자막 청크 분할 → GPT 병렬 분석
  let recipe;
  try {
    const chunks = chunkCaption(caption);
    const analyses = await Promise.all(chunks.map((chunk) => analyzeRecipe(chunk)));
    const merged = mergeRecipeAnalyses(analyses);

    recipe = {
      videoId,
      title: '', // 검색 결과에서 전달받지 않으므로 빈 값 (클라이언트가 VideoItem 보유)
      thumbnail: '',
      channelName: '',
      ingredients: merged.ingredients,
      steps: merged.steps,
      rawCaption: caption,
    };
  } catch {
    return NextResponse.json({ error: '레시피 분석에 실패했습니다' }, { status: 503 });
  }

  // 4. Supabase에 캐시 저장 (비차단 — 실패해도 응답에 영향 없음)
  setCachedRecipe(recipe).catch(() => {
    // 캐시 저장 실패는 무시
  });

  return NextResponse.json({ recipe: { ...recipe, cached: false } });
}
