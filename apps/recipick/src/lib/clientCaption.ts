/**
 * 브라우저에서 YouTube 자막을 직접 조회하는 클라이언트 유틸.
 *
 * YouTube timedtext API는 CORS를 허용하며 (access-control-allow-origin 응답),
 * 사용자의 주거용 IP와 YouTube 쿠키로 ASR 자막도 접근 가능.
 * 서버(클라우드 IP)에서는 차단되는 자막을 브라우저에서 우회 취득.
 */

function parseTimedText(xml: string): string {
  if (!xml || xml.includes('<html')) return '';

  // srv3 포맷: <p t=".." d=".."><s>text</s></p>
  const pMatches = xml.match(/<p[^>]*>([\s\S]*?)<\/p>/g) ?? [];
  if (pMatches.length > 0) {
    return pMatches
      .map((p) => {
        const sMatches = p.match(/<s[^>]*>([^<]*)<\/s>/g) ?? [];
        return sMatches.length > 0
          ? sMatches.map((s) => s.replace(/<s[^>]*>/, '').replace(/<\/s>/, '')).join('')
          : p.replace(/<p[^>]*>/, '').replace(/<\/p>/, '').replace(/<[^>]+>/g, '');
      })
      .map(decodeEntities)
      .filter((t) => t.trim())
      .join('\n')
      .trim();
  }

  // 기본 포맷: <text start=".." dur="..">text</text>
  const textMatches = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g) ?? [];
  return textMatches
    .map((m) => m.replace(/<text[^>]*>/, '').replace(/<\/text>/, '').trim())
    .map(decodeEntities)
    .filter(Boolean)
    .join('\n')
    .trim();
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

const BROWSER_CAPTION_TIMEOUT_MS = 3000;

async function fetchSingleCaption(
  videoId: string,
  lang: string,
  kind: string,
): Promise<{ text: string; lang: 'ko' | 'en' }> {
  const kindParam = kind ? `&kind=${kind}` : '';
  const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}${kindParam}`;
  const res = await fetch(url, {
    credentials: 'include', // YouTube 세션 쿠키 포함
    signal: AbortSignal.timeout(2500),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const text = parseTimedText(xml);
  if (!text.trim()) throw new Error('empty caption');
  return { text, lang: lang as 'ko' | 'en' };
}

export async function fetchCaptionFromBrowser(
  videoId: string,
): Promise<{ text: string; lang: 'ko' | 'en' } | null> {
  // 4개 후보를 동시에 fetch → 첫 성공 반환, 전체 3초 cap
  const candidates = [
    { lang: 'ko', kind: 'asr' },
    { lang: 'ko', kind: '' },
    { lang: 'en', kind: 'asr' },
    { lang: 'en', kind: '' },
  ];

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), BROWSER_CAPTION_TIMEOUT_MS),
  );

  try {
    return await Promise.race([
      Promise.any(candidates.map(({ lang, kind }) => fetchSingleCaption(videoId, lang, kind))),
      timeout,
    ]);
  } catch {
    return null;
  }
}
