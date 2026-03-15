import { NextResponse } from 'next/server';
import { chunkCaption } from '@/lib/caption';
import type { RecipeRequest } from '@/types/api/routeApi/request';
import type { Recipe } from '@/types/api/routeApi/response';
import type { RecipeAnalysis } from '@/types/api/openai/response';

function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

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

  const baseUrl = getBaseUrl(request);

  // 1. Supabase 캐시 조회
  try {
    const cacheRes = await fetch(`${baseUrl}/api/supabase?videoId=${encodeURIComponent(videoId)}`);
    if (cacheRes.ok) {
      const { recipe } = await cacheRes.json();
      if (recipe) return NextResponse.json({ recipe });
    }
  } catch {
    // 캐시 조회 실패해도 계속 진행
  }

  // 2. YouTube 자막 추출
  let caption: string;
  try {
    const captionRes = await fetch(
      `${baseUrl}/api/youtube?action=caption&videoId=${encodeURIComponent(videoId)}`,
    );
    if (!captionRes.ok) {
      return NextResponse.json(
        { error: '자막이 없거나 접근할 수 없는 영상입니다' },
        { status: 422 },
      );
    }
    const { caption: captionText } = await captionRes.json();
    caption = captionText as string;
  } catch {
    return NextResponse.json({ error: '자막이 없거나 접근할 수 없는 영상입니다' }, { status: 422 });
  }

  if (!caption || caption.trim().length === 0) {
    return NextResponse.json({ error: '자막 내용이 없습니다' }, { status: 422 });
  }

  // 3. 자막 청크 분할 → OpenAI 병렬 분석
  let recipe: Omit<Recipe, 'cached'>;
  try {
    const chunks = chunkCaption(caption);
    const analyses = await Promise.all(
      chunks.map(async (chunk) => {
        const res = await fetch(`${baseUrl}/api/openai`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caption: chunk }),
        });
        if (!res.ok) throw new Error('OpenAI 분석 실패');
        return res.json() as Promise<RecipeAnalysis>;
      }),
    );
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

  // 4. Supabase 캐시 저장 (비차단 — 실패해도 응답에 영향 없음)
  fetch(`${baseUrl}/api/supabase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipe }),
  }).catch(() => {});

  return NextResponse.json({ recipe: { ...recipe, cached: false } });
}
