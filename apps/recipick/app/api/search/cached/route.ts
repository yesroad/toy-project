import { NextResponse } from 'next/server';
import { getAllCachedSearchVideos } from '@/lib/youtubeCache';

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q');
  if (!q?.trim()) {
    return NextResponse.json({ error: '검색어(q)가 필요합니다' }, { status: 400 });
  }

  try {
    const videos = await getAllCachedSearchVideos(q.trim());
    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ error: 'DB 캐시 조회에 실패했습니다' }, { status: 503 });
  }
}
