import { truncateCaption } from '@/lib/caption';
import { getRecipeCache, saveRecipeCache, getRecipeUnavailable, saveRecipeUnavailable } from '@/services/supabaseService';
import { getVideoDetail, getCaption, DefinitiveCaptionError } from '@/services/captionService';
import { analyzeDescription, analyzeCaption } from '@/services/openaiService';
import { getIngredientLinks } from '@/services/ingredientService';
import type { RecipeRequest } from '@/types/api/routeApi/request';
import type { Recipe, CoupangLinks } from '@/types/api/routeApi/response';
import type { RecipeAnalysis } from '@/types/api/openai/response';

const MIN_INGREDIENTS_COUNT = 3;

export const maxDuration = 60;

export async function POST(request: Request) {
  let body: RecipeRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '요청 본문이 올바르지 않습니다' }, { status: 400 });
  }

  const { videoId, caption: clientCaption, captionLang: clientCaptionLang } = body;
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
        // 1. Supabase 캐시 조회 (recipe + skip 동시 확인)
        const [cached, skipped] = await Promise.all([
          getRecipeCache(videoId).catch(() => null),
          getRecipeUnavailable(videoId).catch(() => null),
        ]);

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

        if (skipped) {
          t(`skip-cache-hit | reason=${skipped.reason}`);
          const errorCode = skipped.reason === 'NO_CAPTION' ? 'CAPTION_UNAVAILABLE' : 'INSUFFICIENT_INGREDIENTS';
          const message =
            skipped.reason === 'NO_CAPTION'
              ? '자막이 없는 영상입니다'
              : '레시피 정보가 부족한 영상입니다';
          send('error', { message, status: 422, errorCode });
          controller.close();
          return;
        }
        t('cache-miss');

        // 2. caption fetch + analysis 파이프라인을 t=0에 즉시 시작
        //    videoDetail을 기다리지 않고 병렬로 실행
        //    서버 caption fetch가 불가능한 경우 빠르게 포기하기 위해 AbortSignal 사용
        const captionAbortController = clientCaption ? null : new AbortController();
        const captionPromise = clientCaption
          ? Promise.resolve({ text: clientCaption, lang: clientCaptionLang ?? 'ko' } as const)
          : getCaption(videoId, captionAbortController!.signal);

        const CAPTION_TIMEOUT_MS = 7_000;
        const captionTimeoutId = captionAbortController
          ? setTimeout(() => captionAbortController.abort(), CAPTION_TIMEOUT_MS)
          : null;

        const captionResultPromise: Promise<{
          analysis: RecipeAnalysis;
          rawCaption: string;
        } | null> = (async () => {
          try {
            const captionData = await captionPromise;
            if (captionTimeoutId) clearTimeout(captionTimeoutId);
            const caption = captionData.text;
            if (!caption || !caption.trim()) return null;
            t('caption-fetch-done');
            const analysis = await analyzeCaption(truncateCaption(caption));
            return { analysis, rawCaption: caption };
          } catch (e) {
            if (captionTimeoutId) clearTimeout(captionTimeoutId);
            if (e instanceof DefinitiveCaptionError) {
              saveRecipeUnavailable(videoId, 'NO_CAPTION').catch(() => {});
              t('caption-definitively-unavailable');
            }
            return null;
          }
        })();

        // 3. videoDetail 조회 (captionResultPromise와 병렬)
        const videoMeta = { title: '', thumbnail: '', channelName: '' };
        let description = '';

        try {
          const detail = await getVideoDetail(videoId);
          videoMeta.title = detail.title ?? '';
          videoMeta.thumbnail = detail.thumbnail ?? '';
          videoMeta.channelName = detail.channelName ?? '';
          description = detail.description ?? '';
          t('video-detail-done');

          // video_detail 이벤트: videoDetail 완료 즉시 전송
          send('video_detail', {
            title: videoMeta.title,
            thumbnail: videoMeta.thumbnail,
            channelName: videoMeta.channelName,
          });
        } catch {
          // videoDetail 실패해도 caption 경로로 계속 진행
        }

        // 4. description 분석 (videoDetail 완료 후 시작, captionResultPromise와 병렬)
        const descResultPromise: Promise<RecipeAnalysis | null> =
          description.trim().length > 0
            ? analyzeDescription(description).catch(() => null)
            : Promise.resolve(null);

        const [descResult, captionResult] = await Promise.all([
          descResultPromise,
          captionResultPromise,
        ]);

        // 5. 결과 선택: description 충분하면 사용, 아니면 caption 결과 사용
        let mergedAnalysis: RecipeAnalysis | null = null;
        let rawCaption: string | undefined;
        let analysisPath: string;

        if (descResult && descResult.ingredients.length >= MIN_INGREDIENTS_COUNT) {
          mergedAnalysis = descResult;
          analysisPath = 'description';
          t('openai-description-done');
        } else if (captionResult) {
          mergedAnalysis = captionResult.analysis;
          rawCaption = captionResult.rawCaption;
          analysisPath = 'caption';
          t('openai-caption-done');
        } else if (descResult) {
          // description 결과가 있지만 재료 부족, caption도 실패
          mergedAnalysis = descResult;
          analysisPath = 'description-fallback';
          t('openai-description-fallback');
        } else {
          send('error', {
            message: '자막이 없거나 접근할 수 없는 영상입니다',
            status: 422,
            errorCode: 'CAPTION_UNAVAILABLE',
          });
          controller.close();
          return;
        }

        // 6. 재료 개수 검증
        if (mergedAnalysis.ingredients.length < MIN_INGREDIENTS_COUNT) {
          saveRecipeUnavailable(videoId, 'INSUFFICIENT_INGREDIENTS').catch(() => {});
          send('error', {
            message: `재료가 ${mergedAnalysis.ingredients.length}개만 추출됐습니다 (최소 ${MIN_INGREDIENTS_COUNT}개 필요)`,
            status: 422,
            errorCode: 'INSUFFICIENT_INGREDIENTS',
          });
          controller.close();
          return;
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

        t(`total | path=${analysisPath}`);

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
