import { describe, it, expect } from 'vitest';
import {
  chunkCaption,
  parseTimedTextXml,
  parseSrv3Format,
  parseYouTubeCaptionXml,
} from '../caption';

describe('chunkCaption', () => {
  describe('정상 케이스', () => {
    it('짧은 자막은 단일 청크로 반환', () => {
      const caption = '재료: 양파 1개\n마늘 2쪽\n소금 약간';
      const chunks = chunkCaption(caption);
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toContain('양파');
    });

    it('긴 자막은 여러 청크로 분할', () => {
      const longLine = '재료 설명 '.repeat(100);
      const caption = Array.from({ length: 100 }, (_, i) => `${longLine} 줄 ${i}`).join('\n');
      const chunks = chunkCaption(caption);
      expect(chunks.length).toBeGreaterThan(1);
    });

    it('각 청크는 MAX 길이를 초과하지 않음', () => {
      const MAX_CHARS = 2000 * 3;
      const longCaption = 'a'.repeat(MAX_CHARS * 3);
      const chunks = chunkCaption(longCaption);
      chunks.forEach((chunk) => {
        expect(chunk.length).toBeLessThanOrEqual(MAX_CHARS);
      });
    });
  });

  describe('경계값', () => {
    it('빈 문자열이면 빈 배열 반환', () => {
      expect(chunkCaption('')).toEqual([]);
    });

    it('공백만 있으면 빈 배열 반환', () => {
      expect(chunkCaption('   \n  \n  ')).toEqual([]);
    });

    it('빈 줄은 무시하고 처리', () => {
      const caption = '재료\n\n\n양파 1개\n\n소금';
      const chunks = chunkCaption(caption);
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toContain('양파');
    });
  });

  describe('정책 케이스', () => {
    it('분할 후 모든 내용이 보존됨 (청크 합치면 원본과 동일한 줄 구성)', () => {
      const lines = Array.from({ length: 10 }, (_, i) => `줄 ${i + 1}`);
      const caption = lines.join('\n');
      const chunks = chunkCaption(caption);
      const merged = chunks.join('\n');
      lines.forEach((line) => {
        expect(merged).toContain(line);
      });
    });
  });
});

describe('parseTimedTextXml', () => {
  describe('정상 케이스', () => {
    it('XML에서 텍스트를 추출', () => {
      const xml = `<timedtext><text start="1">안녕하세요</text><text start="2">오늘 요리할게요</text></timedtext>`;
      expect(parseTimedTextXml(xml)).toContain('안녕하세요');
      expect(parseTimedTextXml(xml)).toContain('오늘 요리할게요');
    });

    it('HTML 엔티티를 디코딩', () => {
      const xml = `<timedtext><text start="1">재료 &amp; 도구</text></timedtext>`;
      expect(parseTimedTextXml(xml)).toContain('재료 & 도구');
    });
  });

  describe('경계값', () => {
    it('text 태그가 없으면 빈 문자열 반환', () => {
      expect(parseTimedTextXml('<timedtext></timedtext>')).toBe('');
    });

    it('빈 문자열이면 빈 문자열 반환', () => {
      expect(parseTimedTextXml('')).toBe('');
    });
  });
});

describe('parseSrv3Format', () => {
  describe('정상 케이스', () => {
    it('<s> 태그가 있는 srv3 포맷에서 텍스트 추출', () => {
      const xml = `<timedtext><p t="0" d="1000"><s>안녕하세요</s></p><p t="1000" d="1000"><s>오늘 요리할게요</s></p></timedtext>`;
      const result = parseSrv3Format(xml);
      expect(result).toContain('안녕하세요');
      expect(result).toContain('오늘 요리할게요');
    });

    it('<s> 태그 없는 <p> 태그에서 텍스트 추출', () => {
      const xml = `<timedtext><p t="0" d="1000">재료 설명</p></timedtext>`;
      expect(parseSrv3Format(xml)).toContain('재료 설명');
    });

    it('HTML 엔티티를 디코딩', () => {
      const xml = `<timedtext><p t="0"><s>재료 &amp; 도구</s></p></timedtext>`;
      expect(parseSrv3Format(xml)).toContain('재료 & 도구');
    });
  });

  describe('경계값', () => {
    it('<p> 태그가 없으면 빈 문자열 반환', () => {
      expect(parseSrv3Format('<timedtext></timedtext>')).toBe('');
    });

    it('빈 문자열이면 빈 문자열 반환', () => {
      expect(parseSrv3Format('')).toBe('');
    });
  });
});

describe('parseYouTubeCaptionXml', () => {
  describe('정상 케이스', () => {
    it('srv3 포맷을 우선 파싱', () => {
      const xml = `<timedtext><p t="0"><s>srv3 텍스트</s></p></timedtext>`;
      expect(parseYouTubeCaptionXml(xml)).toContain('srv3 텍스트');
    });

    it('srv3 없으면 timedtext 포맷으로 fallback', () => {
      const xml = `<timedtext><text start="1">timedtext 텍스트</text></timedtext>`;
      expect(parseYouTubeCaptionXml(xml)).toContain('timedtext 텍스트');
    });
  });

  describe('경계값', () => {
    it('빈 문자열이면 빈 문자열 반환', () => {
      expect(parseYouTubeCaptionXml('')).toBe('');
    });

    it('HTML 페이지(차단 응답)이면 빈 문자열 반환', () => {
      const html = `<html><head><title>429</title></head><body>차단됨</body></html>`;
      expect(parseYouTubeCaptionXml(html)).toBe('');
    });
  });
});
