import { NextResponse } from 'next/server';
import { parseTimedTextXml } from '@/lib/caption';
import { isCookingChannel, normalizeThumbnailUrl } from '@/lib/youtube';
import type { SearchResult, VideoItem } from '@/types/api/routeApi/response';
import type { YouTubeSearchResponse } from '@/types/api/youtube/response';

async function searchVideos(q: string, pageToken?: string): Promise<SearchResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set');

  const params = new URLSearchParams({
    part: 'snippet',
    q: `${q} 레시피 요리`,
    type: 'video',
    maxResults: '20',
    regionCode: 'KR',
    relevanceLanguage: 'ko',
    key: apiKey,
    ...(pageToken && { pageToken }),
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!res.ok) throw new Error(`YouTube API 오류: ${res.status}`);

  const data: YouTubeSearchResponse = await res.json();

  const videos: VideoItem[] = data.items
    .filter((item) => isCookingChannel(item.snippet.channelTitle, item.snippet.title))
    .map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelName: item.snippet.channelTitle,
      thumbnail: normalizeThumbnailUrl(item.snippet.thumbnails),
      publishedAt: item.snippet.publishedAt,
    }));

  return {
    videos,
    nextPageToken: data.nextPageToken,
  };
}

async function getCaption(videoId: string): Promise<string> {
  const url = `https://www.youtube.com/api/timedtext?lang=ko&v=${videoId}&fmt=srv3`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok || res.status === 204) {
    const asrUrl = `https://www.youtube.com/api/timedtext?lang=ko&v=${videoId}&kind=asr&fmt=srv3`;
    const asrRes = await fetch(asrUrl, { cache: 'no-store' });
    if (!asrRes.ok) throw new Error(`자막을 찾을 수 없습니다: ${videoId}`);
    const xml = await asrRes.text();
    return parseTimedTextXml(xml);
  }

  const xml = await res.text();
  return parseTimedTextXml(xml);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'search') {
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

  if (action === 'caption') {
    const videoId = searchParams.get('videoId');

    if (!videoId || videoId.trim() === '') {
      return NextResponse.json({ error: 'videoId가 필요합니다' }, { status: 400 });
    }

    try {
      const caption = await getCaption(videoId.trim());
      return NextResponse.json({ caption });
    } catch {
      return NextResponse.json(
        { error: '자막이 없거나 접근할 수 없는 영상입니다' },
        { status: 422 },
      );
    }
  }

  return NextResponse.json(
    { error: 'action 파라미터가 필요합니다 (search | caption)' },
    { status: 400 },
  );
}
