import { NextResponse } from 'next/server';
import {
  analyzeCaption,
  analyzeDescription,
  translateText,
  checkIsCooking,
} from '@/services/openaiService';

export async function POST(request: Request) {
  let body: { type?: string; caption?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '요청 본문이 올바르지 않습니다' }, { status: 400 });
  }

  const type = body.type ?? 'caption';

  if (type === 'isCooking') {
    const content = body.content ?? body.caption;
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'content가 필요합니다' }, { status: 400 });
    }
    try {
      const isCooking = await checkIsCooking(content);
      return NextResponse.json({ isCooking });
    } catch {
      return NextResponse.json({ error: 'isCooking 판별에 실패했습니다' }, { status: 503 });
    }
  }

  if (type === 'translate') {
    const content = body.content ?? body.caption;
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'content가 필요합니다' }, { status: 400 });
    }
    try {
      const translatedText = await translateText(content);
      return NextResponse.json({ translatedText });
    } catch {
      return NextResponse.json({ error: '번역에 실패했습니다' }, { status: 503 });
    }
  }

  if (type === 'description') {
    const content = body.content ?? body.caption;
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'content가 필요합니다' }, { status: 400 });
    }
    try {
      const result = await analyzeDescription(content);
      return NextResponse.json(result);
    } catch {
      return NextResponse.json({ error: 'description 분석에 실패했습니다' }, { status: 503 });
    }
  }

  // type === 'caption' (기본값)
  const caption = body.caption ?? body.content;
  if (!caption || typeof caption !== 'string') {
    return NextResponse.json({ error: 'caption이 필요합니다' }, { status: 400 });
  }

  try {
    const result = await analyzeCaption(caption);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: '레시피 분석에 실패했습니다' }, { status: 503 });
  }
}
