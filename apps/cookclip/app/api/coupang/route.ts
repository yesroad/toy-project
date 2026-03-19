import { NextResponse } from 'next/server';
import type { CoupangLinkResponse } from '@/types/api/coupang/response';
import type { CoupangLinks, Recipe } from '@/types/api/routeApi/response';

function getCoupangLink(
  keyword: string,
  coupangLinks: CoupangLinks | null | undefined,
): CoupangLinkResponse {
  if (coupangLinks?.[keyword]) {
    return { url: coupangLinks[keyword], keyword };
  }
  const searchUrl = `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`;
  return { url: searchUrl, keyword };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const videoId = searchParams.get('videoId');

  if (!keyword || keyword.trim() === '') {
    return NextResponse.json({ error: 'keyword가 필요합니다' }, { status: 400 });
  }

  const baseUrl = `${new URL(request.url).protocol}//${new URL(request.url).host}`;

  // videoId가 있으면 /api/supabase에서 해당 영상의 coupang_links 조회
  let coupangLinksFromDb: CoupangLinks | null = null;
  if (videoId) {
    try {
      const cacheRes = await fetch(
        `${baseUrl}/api/supabase?videoId=${encodeURIComponent(videoId)}`,
      );
      if (cacheRes.ok) {
        const { recipe }: { recipe: Recipe | null } = await cacheRes.json();
        coupangLinksFromDb = recipe?.coupangLinks ?? null;
      }
    } catch {
      // DB 조회 실패 시 폴백으로 진행
    }
  }

  const result = getCoupangLink(keyword.trim(), coupangLinksFromDb);
  return NextResponse.json(result);
}
