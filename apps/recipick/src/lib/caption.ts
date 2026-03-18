// 자막 텍스트 처리 관련 순수 함수

const MAX_CAPTION_CHARS = 18000; // 단일 호출 최대 자막 길이 (~6000토큰)

const MAX_TOKENS_PER_CHUNK = 2000; // GPT 입력 토큰 상한
const AVG_CHARS_PER_TOKEN = 3; // 한국어 기준 평균 (약 1~2자/토큰)
const MAX_CHARS_PER_CHUNK = MAX_TOKENS_PER_CHUNK * AVG_CHARS_PER_TOKEN;

/**
 * 자막 텍스트를 단일 OpenAI 호출에 적합한 길이로 잘라냄.
 * 요리 레시피 정보는 영상 초반~중반에 집중되므로 앞쪽만 유지.
 */
export function truncateCaption(caption: string): string {
  if (caption.length <= MAX_CAPTION_CHARS) return caption;
  return caption.slice(0, MAX_CAPTION_CHARS);
}

/**
 * 긴 자막 텍스트를 GPT 토큰 상한에 맞게 분할
 * 문장 단위(줄바꿈)를 유지하며 분할
 */
export function chunkCaption(caption: string): string[] {
  if (!caption || caption.trim().length === 0) return [];

  const lines = caption.split('\n').filter((line) => line.trim().length > 0);
  const chunks: string[] = [];
  let current = '';

  for (const line of lines) {
    const next = current ? `${current}\n${line}` : line;

    if (next.length > MAX_CHARS_PER_CHUNK) {
      if (current) {
        chunks.push(current.trim());
        current = '';
      }
      // 단일 줄이 한계를 초과하는 경우 반복 분할
      let remaining = line;
      while (remaining.length > MAX_CHARS_PER_CHUNK) {
        chunks.push(remaining.slice(0, MAX_CHARS_PER_CHUNK).trim());
        remaining = remaining.slice(MAX_CHARS_PER_CHUNK);
      }
      current = remaining;
    } else {
      current = next;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

/**
 * XML 형식의 YouTube 자막(timedtext)에서 순수 텍스트 추출
 */
export function parseTimedTextXml(xml: string): string {
  const textMatches = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g) ?? [];
  return textMatches
    .map((match) => {
      const content = match.replace(/<text[^>]*>/, '').replace(/<\/text>/, '');
      return decodeHtmlEntities(content);
    })
    .join('\n')
    .trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}
