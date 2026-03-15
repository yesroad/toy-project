import { NextResponse } from 'next/server';
import { chunkCaption } from '@/lib/caption';
import type { RecipeRequest } from '@/types/api/routeApi/request';
import type { Recipe, CoupangLinks } from '@/types/api/routeApi/response';
import type { RecipeAnalysis } from '@/types/api/openai/response';

const MIN_INGREDIENTS_COUNT = 3;

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
      if (recipe) return NextResponse.json({ recipe: { ...recipe, cached: true } });
    }
  } catch {
    // 캐시 조회 실패해도 계속 진행
  }

  // 2. description 분석 (YouTube API quota 절약 — 자막 호출 전 우선 시도)
  let descriptionAnalysis: RecipeAnalysis | null = null;
  try {
    const detailRes = await fetch(
      `${baseUrl}/api/youtube?action=videoDetail&videoId=${encodeURIComponent(videoId)}`,
    );
    if (detailRes.ok) {
      const { description } = (await detailRes.json()) as { title: string; description: string };
      if (description && description.trim().length > 0) {
        const descRes = await fetch(`${baseUrl}/api/openai`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'description', content: description }),
        });
        if (descRes.ok) {
          const analysis: RecipeAnalysis = await descRes.json();
          if (analysis.ingredients.length >= MIN_INGREDIENTS_COUNT) {
            descriptionAnalysis = analysis;
          }
        }
      }
    }
  } catch {
    // description 분석 실패 → 자막으로 fallback
  }

  let mergedAnalysis: RecipeAnalysis;
  let rawCaption: string | undefined;

  if (descriptionAnalysis) {
    // description에서 충분한 재료 추출 성공 → 자막 단계 건너뜀
    mergedAnalysis = descriptionAnalysis;
  } else {
    // 3. YouTube 자막 추출 (수동 ko → 수동 en → ASR ko → ASR en)
    let caption: string;
    let captionLang = 'ko';
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
      const { caption: captionText, lang } = (await captionRes.json()) as {
        caption: string;
        lang: string;
      };
      caption = captionText;
      captionLang = lang ?? 'ko';
    } catch {
      return NextResponse.json(
        { error: '자막이 없거나 접근할 수 없는 영상입니다' },
        { status: 422 },
      );
    }

    // 영어 자막이면 한국어로 번역 후 분석
    if (captionLang === 'en') {
      try {
        const translateRes = await fetch(`${baseUrl}/api/openai`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'translate', content: caption }),
        });
        if (translateRes.ok) {
          const { translatedText } = (await translateRes.json()) as { translatedText: string };
          caption = translatedText;
        }
      } catch {
        // 번역 실패 → 원본 영어로 계속 진행
      }
    }

    if (!caption || caption.trim().length === 0) {
      return NextResponse.json({ error: '자막 내용이 없습니다' }, { status: 422 });
    }

    rawCaption = caption;

    // 4. isCooking 체크 — 비요리 영상 API 낭비 방지
    try {
      const firstChunk = caption.substring(0, 2000);
      const isCookingRes = await fetch(`${baseUrl}/api/openai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'isCooking', content: firstChunk }),
      });
      if (isCookingRes.ok) {
        const { isCooking } = (await isCookingRes.json()) as { isCooking: boolean };
        if (!isCooking) {
          return NextResponse.json({ error: '요리 레시피 영상이 아닙니다' }, { status: 422 });
        }
      }
    } catch {
      // isCooking 체크 실패 → 계속 진행
    }

    // 5. 자막 청킹 → OpenAI 병렬 분석
    try {
      const chunks = chunkCaption(caption);
      const analyses = await Promise.all(
        chunks.map(async (chunk) => {
          const res = await fetch(`${baseUrl}/api/openai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'caption', caption: chunk }),
          });
          if (!res.ok) throw new Error('OpenAI 분석 실패');
          return res.json() as Promise<RecipeAnalysis>;
        }),
      );
      mergedAnalysis = mergeRecipeAnalyses(analyses);
    } catch {
      return NextResponse.json({ error: '레시피 분석에 실패했습니다' }, { status: 503 });
    }

    // 6. 재료 개수 검증 — 품질 낮은 결과 DB 저장 차단
    if (mergedAnalysis.ingredients.length < MIN_INGREDIENTS_COUNT) {
      return NextResponse.json({ error: '레시피 정보가 충분하지 않습니다' }, { status: 422 });
    }
  }

  // 7. ingredient_links DB에서 재료 링크 조회 (실패해도 계속 진행)
  let coupangLinks: CoupangLinks | undefined;
  try {
    const names = mergedAnalysis.ingredients.map((i) => i.name).join(',');
    const linkRes = await fetch(
      `${baseUrl}/api/ingredient-links?names=${encodeURIComponent(names)}`,
    );
    if (linkRes.ok) {
      const { links } = await linkRes.json();
      if (Object.keys(links).length > 0) coupangLinks = links;
    }
  } catch {
    // 링크 조회 실패해도 레시피 반환에 영향 없음
  }

  const recipe: Omit<Recipe, 'cached'> = {
    videoId,
    title: '',
    thumbnail: '',
    channelName: '',
    ingredients: mergedAnalysis.ingredients,
    steps: mergedAnalysis.steps,
    coupangLinks,
    rawCaption,
  };

  // 8. Supabase 캐시 저장 (비차단 — 실패해도 응답에 영향 없음)
  fetch(`${baseUrl}/api/supabase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipe }),
  }).catch(() => {});

  return NextResponse.json({ recipe: { ...recipe, cached: false } });
}
