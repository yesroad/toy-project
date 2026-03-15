import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import type { RecipeAnalysis } from '@/types/api/openai/response';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RecipeAnalysisSchema = z.object({
  ingredients: z.array(
    z.object({
      name: z.string().describe('재료 이름'),
      amount: z.string().describe('재료 양 (예: 2인분, 200g)'),
    }),
  ),
  steps: z.array(z.string()).describe('요리 순서 단계별 설명'),
});

const SYSTEM_PROMPT = `당신은 요리 레시피 추출 전문가입니다.
주어진 유튜브 영상 자막에서 레시피 정보를 정확하게 추출하세요.

규칙:
- 재료(ingredients): 재료명과 양을 정확히 추출. 자막에 언급된 것만 포함
- 단계(steps): 요리 순서를 자연스럽게 정리. 단계별로 명확하게 구분
- 자막에 레시피 정보가 없거나 불충분하면 빈 배열 반환`;

export async function POST(request: Request) {
  let body: { caption: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '요청 본문이 올바르지 않습니다' }, { status: 400 });
  }

  const { caption } = body;
  if (!caption || typeof caption !== 'string') {
    return NextResponse.json({ error: 'caption이 필요합니다' }, { status: 400 });
  }

  try {
    const completion = await client.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `다음 유튜브 자막에서 레시피를 추출해주세요:\n\n${caption}`,
        },
      ],
      response_format: zodResponseFormat(RecipeAnalysisSchema, 'recipe_analysis'),
      max_tokens: 1000,
      temperature: 0.1,
    });

    const result = completion.choices[0]?.message.parsed;
    if (!result) {
      throw new Error('OpenAI 응답을 파싱할 수 없습니다');
    }

    const analysis: RecipeAnalysis = result;
    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json({ error: '레시피 분석에 실패했습니다' }, { status: 503 });
  }
}
