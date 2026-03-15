import { NextResponse } from 'next/server';
import type { SearchResult } from '@/types/api/routeApi/response';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const pageToken = searchParams.get('pageToken') ?? undefined;

  if (!q || q.trim() === '') {
    return NextResponse.json({ error: '검색어(q)가 필요합니다' }, { status: 400 });
  }

  const baseUrl = `${new URL(request.url).protocol}//${new URL(request.url).host}`;
  const params = new URLSearchParams({ action: 'search', q: q.trim() });
  if (pageToken) params.set('pageToken', pageToken);

  try {
    const res = await fetch(`${baseUrl}/api/youtube?${params}`);
    if (!res.ok) {
      return NextResponse.json({ error: 'YouTube 검색에 실패했습니다' }, { status: 503 });
    }
    const result: SearchResult = await res.json();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'YouTube 검색에 실패했습니다' }, { status: 503 });
  }
}
