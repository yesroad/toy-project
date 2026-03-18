/**
 * 브라우저에서 YouTube 자막을 직접 조회하는 클라이언트 유틸.
 *
 * YouTube timedtext API는 CORS를 허용하며 (access-control-allow-origin 응답),
 * 사용자의 주거용 IP와 YouTube 쿠키로 ASR 자막도 접근 가능.
 * 서버(클라우드 IP)에서는 차단되는 자막을 브라우저에서 우회 취득.
 */

import { parseYouTubeCaptionXml } from './caption';
import { TIMEOUT } from './constants';

const BROWSER_CAPTION_TIMEOUT_MS = TIMEOUT.CAPTION_CLIENT;

async function fetchSingleCaption(
  videoId: string,
  lang: string,
  kind: string,
  externalSignal?: AbortSignal,
): Promise<{ text: string; lang: 'ko' | 'en' }> {
  const kindParam = kind ? `&kind=${kind}` : '';
  const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}${kindParam}`;
  const signal = externalSignal
    ? AbortSignal.any([AbortSignal.timeout(2500), externalSignal])
    : AbortSignal.timeout(2500);
  const res = await fetch(url, {
    credentials: 'include', // YouTube 세션 쿠키 포함
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const text = parseYouTubeCaptionXml(xml);
  if (!text.trim()) throw new Error('empty caption');
  return { text, lang: lang as 'ko' | 'en' };
}

export async function fetchCaptionFromBrowser(
  videoId: string,
): Promise<{ text: string; lang: 'ko' | 'en' } | null> {
  // 4개 후보를 병렬로 시작 → 첫 성공 시 나머지 요청 즉시 취소, 전체 3초 cap
  const candidates = [
    { lang: 'ko', kind: 'asr' },
    { lang: 'ko', kind: '' },
    { lang: 'en', kind: 'asr' },
    { lang: 'en', kind: '' },
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BROWSER_CAPTION_TIMEOUT_MS);

  try {
    return await Promise.any(
      candidates.map(async ({ lang, kind }) => {
        const result = await fetchSingleCaption(videoId, lang, kind, controller.signal);
        controller.abort(); // 성공 시 나머지 취소
        return result;
      }),
    );
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
