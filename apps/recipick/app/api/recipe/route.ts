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

export const maxDuration = 60;

export async function POST(request: Request) {
  let body: RecipeRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '요청 본문이 올바르지 않습니다' }, { status: 400 });
  }

  const { videoId } = body;
  if (!videoId || typeof videoId !== 'string') {
    return Response.json({ error: 'videoId가 필요합니다' }, { status: 400 });
  }

  const requestStart = performance.now();
  const t = (label: string) => {
    const ms = Math.round(performance.now() - requestStart);
    console.log(`[recipe-api] ${label}: ${ms}ms | videoId=${videoId}`);
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));

      try {
        // 1. Supabase 캐시 조회
        const cached = await getRecipeCache(videoId).catch(() => null);
        if (cached) {
          t('cache-hit');
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
          send('recipe', { ...cached, cached: true });
          controller.close();
          return;
        }
        t('cache-miss');

        // 2. caption fetch를 백그라운드에서 즉시 시작 (videoDetail과 완전 병렬)
        const captionPromise = getCaption(videoId);

        // 3. videoDetail 완료 즉시 → video_detail 이벤트 전송 (체감 대기 감소)
        const videoMeta = { title: '', thumbnail: '', channelName: '' };
        let descriptionAnalysis: RecipeAnalysis | null = null;

        try {
          const detail = await getVideoDetail(videoId);
          videoMeta.title = detail.title ?? '';
          videoMeta.thumbnail = detail.thumbnail ?? '';
          videoMeta.channelName = detail.channelName ?? '';
          t('video-detail-done');

          // video_detail 이벤트: ~1초 내 전송
          send('video_detail', {
            title: videoMeta.title,
            thumbnail: videoMeta.thumbnail,
            channelName: videoMeta.channelName,
          });

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
          t('openai-description-done');
        } else {
          // 4. captionPromise는 videoDetail + description 분석 동안 이미 백그라운드에서 실행 중
          let captionData: Awaited<ReturnType<typeof getCaption>>;
          try {
            captionData = await captionPromise;
          } catch {
            send('error', {
              message: '자막이 없거나 접근할 수 없는 영상입니다',
              status: 422,
              errorCode: 'CAPTION_UNAVAILABLE',
            });
            controller.close();
            return;
          }

          const caption = captionData.text;

          if (!caption || caption.trim().length === 0) {
            send('error', {
              message: '자막 내용이 비어있습니다',
              status: 422,
              errorCode: 'CAPTION_EMPTY',
            });
            controller.close();
            return;
          }

          rawCaption = caption;

          // 5. 자막 청킹 → OpenAI 병렬 분석
          try {
            const chunks = chunkCaption(caption);
            const analyses = await Promise.all(chunks.map((chunk) => analyzeCaption(chunk)));
            mergedAnalysis = mergeRecipeAnalyses(analyses);
          } catch {
            send('error', {
              message: 'AI 레시피 분석에 실패했습니다',
              status: 503,
              errorCode: 'AI_ANALYSIS_FAILED',
            });
            controller.close();
            return;
          }

          // 6. 재료 개수 검증
          if (mergedAnalysis.ingredients.length < MIN_INGREDIENTS_COUNT) {
            send('error', {
              message: `재료가 ${mergedAnalysis.ingredients.length}개만 추출됐습니다 (최소 ${MIN_INGREDIENTS_COUNT}개 필요)`,
              status: 422,
              errorCode: 'INSUFFICIENT_INGREDIENTS',
            });
            controller.close();
            return;
          }
          t('openai-caption-done');
        }

        // 7. ingredient_links DB에서 재료 링크 조회 (실패해도 계속 진행)
        let coupangLinks: CoupangLinks | undefined;
        try {
          const names = mergedAnalysis.ingredients.map((i) => i.name);
          const links = await getIngredientLinks(names);
          if (Object.keys(links).length > 0) coupangLinks = links;
        } catch {}

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

        // 8. Supabase 캐시 저장 (비차단)
        saveRecipeCache(recipe).catch(() => {});

        const path = descriptionAnalysis ? 'description' : 'caption';
        t(`total | path=${path}`);

        send('recipe', { ...recipe, cached: false });
      } catch {
        send('error', {
          message: '서버 오류가 발생했습니다',
          status: 500,
          errorCode: 'SERVER_ERROR',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
