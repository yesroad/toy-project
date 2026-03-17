import { after } from 'next/server';
import { getRecipeCache } from '@/services/supabaseService';

const MAX_PREWARM = 3;

export async function POST(request: Request) {
  let videoIds: string[];
  try {
    ({ videoIds } = await request.json());
  } catch {
    return Response.json({ error: '요청 본문이 올바르지 않습니다' }, { status: 400 });
  }

  if (!Array.isArray(videoIds)) {
    return Response.json({ error: 'videoIds 배열이 필요합니다' }, { status: 400 });
  }

  const targets = videoIds.slice(0, MAX_PREWARM);

  after(async () => {
    // 이미 캐시된 항목 필터링 → 불필요한 API 호출 방지
    const uncached = (
      await Promise.all(
        targets.map(async (id) => ((await getRecipeCache(id).catch(() => null)) ? null : id)),
      )
    ).filter(Boolean) as string[];

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    // 순차 처리: 병렬 시 YouTube IP 차단 위험
    for (const videoId of uncached) {
      try {
        const res = await fetch(`${baseUrl}/api/recipe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId }),
          signal: AbortSignal.timeout(30_000),
        });

        // SSE 스트림 소비 (응답 완료까지 대기)
        if (res.body) {
          const reader = res.body.getReader();
          while (true) {
            const { done } = await reader.read();
            if (done) break;
          }
        }

        // YouTube 차단 방지를 위한 요청 간 대기
        await new Promise((r) => setTimeout(r, 1_000));
      } catch {
        // 개별 실패는 무시 — pre-warm은 최선 시도(best-effort)
      }
    }
  });

  return Response.json({ queued: targets.length }, { status: 202 });
}
