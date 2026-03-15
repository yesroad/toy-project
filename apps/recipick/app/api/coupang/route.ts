import { NextResponse } from 'next/server';
import { getCachedRecipe } from '@/services/supabase';
import { getCoupangLinkFromCache } from '@/services/coupang';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const videoId = searchParams.get('videoId');

  if (!keyword || keyword.trim() === '') {
    return NextResponse.json({ error: 'keyword가 필요합니다' }, { status: 400 });
  }

  // videoId가 있으면 DB에서 해당 영상의 coupang_links 조회
  let coupangLinksFromDb: Record<string, string> | null = null;

  if (videoId) {
    try {
      const cached = await getCachedRecipe(videoId);
      coupangLinksFromDb = cached?.coupangLinks ?? null;
    } catch {
      // DB 조회 실패 시 폴백으로 진행
    }
  }

  const result = getCoupangLinkFromCache(keyword.trim(), coupangLinksFromDb);
  return NextResponse.json(result);
}
