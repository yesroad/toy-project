import 'server-only';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { serverEnv } from '@/env/server';
import type { RecipeAnalysis } from '@/types/api/openai/response';

const RecipeStepDetailSchema = z.object({
  description: z.string().describe('조리 단계 설명'),
  ingredients: z.array(z.string()).optional().describe('이 단계에 사용되는 재료명 목록'),
  duration: z.number().optional().describe('이 단계 소요 시간 (초 단위)'),
});

const RecipeAnalysisSchema = z.object({
  ingredients: z.array(
    z.object({
      name: z.string().describe('재료 이름'),
      amount: z.string().describe('재료 양 (예: 2인분, 200g)'),
    }),
  ),
  steps: z.array(z.string()).describe('요리 순서 단계별 설명 (하위 호환용)'),
  servings: z.string().optional().describe('인분 정보 (예: 2인분, 3~4인분)'),
  cookingTime: z.number().optional().describe('총 조리 시간 (분 단위)'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().describe('난이도'),
  calories: z.number().optional().describe('예상 칼로리 (kcal)'),
  tips: z.array(z.string()).optional().describe('요리 핵심 팁 3~5개'),
  notes: z.array(z.string()).optional().describe('유의사항 2~3개'),
  stepDetails: z.array(RecipeStepDetailSchema).optional().describe('단계별 상세 정보'),
  dishName: z
    .string()
    .optional()
    .describe('요리 이름 (예: "계란말이", "평양냉면"). 간결한 한국어 요리명'),
});

const IsCookingSchema = z.object({
  isCooking: z.boolean().describe('요리 레시피 영상 여부'),
});

const TranslateSchema = z.object({
  translatedText: z.string().describe('번역된 한국어 텍스트'),
});

const CAPTION_SYSTEM_PROMPT = `당신은 요리 레시피 추출 전문가입니다.
주어진 유튜브 영상 자막에서 레시피 정보를 정확하게 추출하세요.

규칙:
- 재료(ingredients): 재료명과 양을 정확히 추출. 자막에 언급된 것만 포함
- 단계(steps): 요리 순서를 자연스럽게 정리. 단계별로 명확하게 구분
- 자막에 레시피 정보가 없거나 불충분하면 빈 배열 반환
- servings: 인분 정보가 언급되면 추출 (예: "2인분"). 없으면 omit
- cookingTime: 총 조리 시간이 언급되면 분 단위로 추출. 없으면 omit
- difficulty: 난이도 언급 시 easy/medium/hard 중 선택. 없으면 omit
- calories: 칼로리 언급 시 숫자만 추출. 없으면 omit
- tips: 요리 핵심 팁 최대 5개 추출. 없으면 omit
- notes: 주의사항 최대 3개 추출. 없으면 omit
- stepDetails: 각 단계별로 사용 재료명(amount 제외)과 소요 시간을 추출 가능한 경우 포함. 없으면 omit
- dishName: 요리 이름을 간결하게 추출 (예: "계란말이", "된장찌개"). 복잡한 제목에서 핵심 요리명만 추출. 없으면 omit`;

const DESCRIPTION_SYSTEM_PROMPT = `당신은 요리 레시피 추출 전문가입니다.
주어진 유튜브 영상 설명(description)에서 레시피 정보를 정확하게 추출하세요.

규칙:
- 재료(ingredients): 재료명과 양을 정확히 추출. description에 명시된 것만 포함
- 단계(steps): 요리 순서를 자연스럽게 정리. 단계별로 명확하게 구분
- 레시피 정보가 없거나 불충분하면 빈 배열 반환
- servings: 인분 정보가 언급되면 추출 (예: "2인분"). 없으면 omit
- cookingTime: 총 조리 시간이 언급되면 분 단위로 추출. 없으면 omit
- difficulty: 난이도 언급 시 easy/medium/hard 중 선택. 없으면 omit
- calories: 칼로리 언급 시 숫자만 추출. 없으면 omit
- tips: 요리 핵심 팁 최대 5개 추출. 없으면 omit
- notes: 주의사항 최대 3개 추출. 없으면 omit
- stepDetails: 각 단계별로 사용 재료명(amount 제외)과 소요 시간을 추출 가능한 경우 포함. 없으면 omit
- dishName: 요리 이름을 간결하게 추출 (예: "계란말이", "된장찌개"). 복잡한 제목에서 핵심 요리명만 추출. 없으면 omit`;

const IS_COOKING_SYSTEM_PROMPT = `당신은 유튜브 영상 분류 전문가입니다.
주어진 텍스트가 요리 레시피 관련 내용인지 판별하세요.

요리 재료, 조리 순서, 레시피가 포함된 경우 isCooking: true를 반환하세요.
먹방, 음식 리뷰, 식당 방문 등 요리 방법이 없으면 isCooking: false를 반환하세요.`;

const TRANSLATE_SYSTEM_PROMPT = `당신은 전문 번역가입니다.
주어진 영어 텍스트를 자연스러운 한국어로 번역하세요.
요리 관련 용어는 한국에서 통용되는 표현을 사용하세요.`;

const openaiClient = new OpenAI({ apiKey: serverEnv.openAiApiKey });

export async function analyzeCaption(caption: string): Promise<RecipeAnalysis> {
  const completion = await openaiClient.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: CAPTION_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `다음 유튜브 자막에서 레시피를 추출해주세요:\n\n${caption}`,
      },
    ],
    response_format: zodResponseFormat(RecipeAnalysisSchema, 'recipe_analysis'),
    max_tokens: 4096,
    temperature: 0.1,
  });
  const result = completion.choices[0]?.message.parsed;
  if (!result) throw new Error('OpenAI 응답을 파싱할 수 없습니다');
  return result as RecipeAnalysis;
}

export async function analyzeDescription(content: string): Promise<RecipeAnalysis> {
  const completion = await openaiClient.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: DESCRIPTION_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `다음 유튜브 영상 설명에서 레시피를 추출해주세요:\n\n${content}`,
      },
    ],
    response_format: zodResponseFormat(RecipeAnalysisSchema, 'recipe_analysis'),
    max_tokens: 1000,
    temperature: 0.1,
  });
  const result = completion.choices[0]?.message.parsed;
  if (!result) throw new Error('OpenAI 응답을 파싱할 수 없습니다');
  return result as RecipeAnalysis;
}

export async function translateText(content: string): Promise<string> {
  const completion = await openaiClient.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: TRANSLATE_SYSTEM_PROMPT },
      { role: 'user', content },
    ],
    response_format: zodResponseFormat(TranslateSchema, 'translate'),
    max_tokens: 4000,
    temperature: 0.1,
  });
  const result = completion.choices[0]?.message.parsed;
  if (!result) throw new Error('OpenAI 응답을 파싱할 수 없습니다');
  return result.translatedText;
}

export async function checkIsCooking(content: string): Promise<boolean> {
  const completion = await openaiClient.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: IS_COOKING_SYSTEM_PROMPT },
      { role: 'user', content },
    ],
    response_format: zodResponseFormat(IsCookingSchema, 'is_cooking'),
    max_tokens: 100,
    temperature: 0.1,
  });
  const result = completion.choices[0]?.message.parsed;
  if (!result) throw new Error('OpenAI 응답을 파싱할 수 없습니다');
  return result.isCooking;
}
