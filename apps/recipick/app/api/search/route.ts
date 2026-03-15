import { NextResponse } from 'next/server';
import { searchVideos } from '@/services/youtube';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const pageToken = searchParams.get('pageToken') ?? undefined;

  if (!q || q.trim() === '') {
    return NextResponse.json({ error: '검색어(q)가 필요합니다' }, { status: 400 });
  }

  try {
    const result = await searchVideos(q.trim(), pageToken);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'YouTube 검색에 실패했습니다' }, { status: 503 });
  }
}
