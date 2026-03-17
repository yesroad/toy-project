import { NextResponse } from 'next/server';
import { chunkCaption } from '@/lib/caption';
import { getRecipeCache, saveRecipeCache } from '@/services/supabaseService';
import { getVideoDetail, getCaption } from '@/services/captionService';
import { analyzeDescription, analyzeCaption } from '@/services/openaiService';
import { getIngredientLinks } from '@/services/ingredientService';
import type { RecipeRequest } from '@/types/api/routeApi/request';
import type { Recipe, CoupangLinks } from '@/types/api/routeApi/response';
import type { RecipeAnalysis } from '@/types/api/openai/response';

const MIN_INGREDIENTS_COUNT = 3;

function mergeRecipeAnalyses(analyses: RecipeAnalysis[]): RecipeAnalysis {
  const ingredientMap = new Map<string, string>();
  const allSteps: string[] = [];

  for (const analysis of analyses) {
    for (const ingredient of analysis.ingredients) {
      if (!ingredientMap.has(ingredient.name)) {
        ingredientMap.set(ingredient.name, ingredient.amount);
      }
    }
    allSteps.push(...analysis.steps);
  }

  return {
    ingredients: Array.from(ingredientMap.entries()).map(([name, amount]) => ({
      name,
      amount,
    })),
    steps: allSteps,
  };
}

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

  // 1. Supabase 캐시 조회
  try {
    const cached = await getRecipeCache(videoId);
    if (cached) {
      if (!cached.coupangLinks) {
        try {
          const names = cached.ingredients.map((i) => i.name);
          const links = await getIngredientLinks(names);
          if (Object.keys(links).length > 0) {
            cached.coupangLinks = links;
            saveRecipeCache(cached).catch(() => {});
          }
        } catch {}
      }
      return NextResponse.json({ recipe: { ...cached, cached: true } });
    }
  } catch {
    // 캐시 조회 실패해도 계속 진행
  }

  // 2. caption fetch를 백그라운드에서 즉시 시작 (videoDetail과 완전 병렬)
  const captionPromise = getCaption(videoId);

  // 3. videoDetail 완료 즉시 description 분석 시작 (captionPromise 완료를 기다리지 않음)
  const videoMeta = { title: '', thumbnail: '', channelName: '' };
  let descriptionAnalysis: RecipeAnalysis | null = null;

  try {
    const detail = await getVideoDetail(videoId);
    videoMeta.title = detail.title ?? '';
    videoMeta.thumbnail = detail.thumbnail ?? '';
    videoMeta.channelName = detail.channelName ?? '';

    if (detail.description && detail.description.trim().length > 0) {
      try {
        const analysis = await analyzeDescription(detail.description);
        if (analysis.ingredients.length >= MIN_INGREDIENTS_COUNT) {
          descriptionAnalysis = analysis;
        }
      } catch {
        // description 분석 실패 → 자막으로 fallback
      }
    }
  } catch {
    // videoDetail 실패해도 자막 경로로 계속 진행
  }

  let mergedAnalysis: RecipeAnalysis;
  let rawCaption: string | undefined;

  if (descriptionAnalysis) {
    // description에서 충분한 재료 추출 성공 → 자막 단계 건너뜀
    mergedAnalysis = descriptionAnalysis;
  } else {
    // 4. captionPromise는 videoDetail + description 분석 동안 이미 백그라운드에서 실행 중
    let captionData: Awaited<ReturnType<typeof getCaption>>;
    try {
      captionData = await captionPromise;
    } catch {
      return NextResponse.json(
        { error: '자막이 없거나 접근할 수 없는 영상입니다' },
        { status: 422 },
      );
    }

    const caption = captionData.text;

    if (!caption || caption.trim().length === 0) {
      return NextResponse.json({ error: '자막 내용이 없습니다' }, { status: 422 });
    }

    rawCaption = caption;

    // 5. 자막 청킹 → OpenAI 병렬 분석 (영어/한국어 무관하게 gpt-4o-mini가 직접 처리)
    try {
      const chunks = chunkCaption(caption);
      const analyses = await Promise.all(chunks.map((chunk) => analyzeCaption(chunk)));
      mergedAnalysis = mergeRecipeAnalyses(analyses);
    } catch {
      return NextResponse.json({ error: '레시피 분석에 실패했습니다' }, { status: 503 });
    }

    // 6. 재료 개수 검증 — 품질 낮은 결과 DB 저장 차단
    if (mergedAnalysis.ingredients.length < MIN_INGREDIENTS_COUNT) {
      return NextResponse.json({ error: '레시피 정보가 충분하지 않습니다' }, { status: 422 });
    }
  }

  // 6. ingredient_links DB에서 재료 링크 조회 (실패해도 계속 진행)
  let coupangLinks: CoupangLinks | undefined;
  try {
    const names = mergedAnalysis.ingredients.map((i) => i.name);
    const links = await getIngredientLinks(names);
    if (Object.keys(links).length > 0) coupangLinks = links;
  } catch {
    // 링크 조회 실패해도 레시피 반환에 영향 없음
  }

  const recipe: Omit<Recipe, 'cached'> = {
    videoId,
    title: videoMeta.title,
    thumbnail: videoMeta.thumbnail,
    channelName: videoMeta.channelName,
    ingredients: mergedAnalysis.ingredients,
    steps: mergedAnalysis.steps,
    coupangLinks,
    rawCaption,
  };

  // 7. Supabase 캐시 저장 (비차단 — 실패해도 응답에 영향 없음)
  saveRecipeCache(recipe).catch(() => {});

  return NextResponse.json({ recipe: { ...recipe, cached: false } });
}
