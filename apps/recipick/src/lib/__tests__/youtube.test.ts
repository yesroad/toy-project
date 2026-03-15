import { describe, it, expect } from 'vitest';
import { filterVideo, parseDurationSeconds, normalizeThumbnailUrl } from '../youtube';

// filterVideo 기본 파라미터 (요리 영상 기본값)
const baseVideoParams = {
  channelId: 'channel123',
  title: '김치찌개 레시피',
  description: '집에서 쉽게 만드는 요리법',
  tags: ['레시피', '요리'],
  categoryId: '26',
  viewCount: 50_000,
  durationSeconds: 600,
};

describe('filterVideo', () => {
  describe('Hard exclude — 즉시 탈락', () => {
    it('제목에 "먹방"이 있으면 false', () => {
      expect(filterVideo({ ...baseVideoParams, title: '오늘의 먹방' })).toBe(false);
    });

    it('제목에 "asmr"이 있으면 false (대소문자 무시)', () => {
      expect(filterVideo({ ...baseVideoParams, title: 'ASMR 먹기' })).toBe(false);
    });

    it('제목에 "mukbang"이 있으면 false', () => {
      expect(filterVideo({ ...baseVideoParams, title: 'Korean mukbang with friends' })).toBe(false);
    });

    it('제목에 "vlog"이 있으면 false', () => {
      expect(filterVideo({ ...baseVideoParams, title: '일상 vlog 요리' })).toBe(false);
    });

    it('제목에 "언박싱"이 있으면 false', () => {
      expect(filterVideo({ ...baseVideoParams, title: '신상 언박싱 요리도구' })).toBe(false);
    });
  });

  describe('Shorts 판별 — duration 기반', () => {
    it('duration 60초 이하이면 false (Shorts)', () => {
      expect(filterVideo({ ...baseVideoParams, durationSeconds: 60 })).toBe(false);
    });

    it('duration 59초이면 false (Shorts)', () => {
      expect(filterVideo({ ...baseVideoParams, durationSeconds: 59 })).toBe(false);
    });

    it('duration 61초이면 탈락하지 않음', () => {
      expect(filterVideo({ ...baseVideoParams, durationSeconds: 61 })).toBe(true);
    });

    it('duration 0이면 Shorts로 판별하지 않음 (정보 없음)', () => {
      // duration 0은 contentDetails 없는 경우 — 탈락시키지 않음
      expect(filterVideo({ ...baseVideoParams, durationSeconds: 0 })).toBe(true);
    });
  });

  describe('점수 기반 통과', () => {
    it('제목에 요리 신호 키워드 포함 시 통과', () => {
      expect(
        filterVideo({
          ...baseVideoParams,
          title: '백종원 김치찌개 만들기',
          description: '',
          tags: [],
          categoryId: undefined,
          viewCount: 0,
        }),
      ).toBe(true);
    });

    it('요리 신호가 없고 조회수도 낮으면 false', () => {
      expect(
        filterVideo({
          ...baseVideoParams,
          title: '백종원 김치찌개',
          description: '',
          tags: [],
          categoryId: undefined,
          viewCount: 0,
        }),
      ).toBe(false);
    });

    it('description에 요리 신호 + 조회수 높으면 통과', () => {
      expect(
        filterVideo({
          ...baseVideoParams,
          title: '백종원 김치찌개',
          description: '이 요리는 집밥으로 만들기 좋습니다',
          tags: [],
          categoryId: undefined,
          viewCount: 100_000,
        }),
      ).toBe(true);
    });

    it('카테고리 26(Howto) + 조회수 10K이면 통과 (점수 3)', () => {
      expect(
        filterVideo({
          ...baseVideoParams,
          title: '닭갈비 황금비율',
          description: '',
          tags: [],
          categoryId: '26',
          viewCount: 10_000,
        }),
      ).toBe(true);
    });

    it('soft exclude 키워드로 점수 감점', () => {
      expect(
        filterVideo({
          ...baseVideoParams,
          title: '맛집 리뷰',
          description: '',
          tags: [],
          categoryId: undefined,
          viewCount: 0,
        }),
      ).toBe(false);
    });
  });

  describe('경계값', () => {
    it('빈 제목, 빈 description, 조회수 0이면 false', () => {
      expect(
        filterVideo({
          ...baseVideoParams,
          title: '',
          description: '',
          tags: [],
          categoryId: undefined,
          viewCount: 0,
        }),
      ).toBe(false);
    });
  });
});

describe('parseDurationSeconds', () => {
  describe('정상 케이스', () => {
    it('분+초 형식 파싱 (PT15M33S)', () => {
      expect(parseDurationSeconds('PT15M33S')).toBe(933);
    });

    it('시+분+초 형식 파싱 (PT1H2M3S)', () => {
      expect(parseDurationSeconds('PT1H2M3S')).toBe(3723);
    });

    it('초만 있는 형식 파싱 (PT45S)', () => {
      expect(parseDurationSeconds('PT45S')).toBe(45);
    });

    it('분만 있는 형식 파싱 (PT10M)', () => {
      expect(parseDurationSeconds('PT10M')).toBe(600);
    });

    it('시간만 있는 형식 파싱 (PT1H)', () => {
      expect(parseDurationSeconds('PT1H')).toBe(3600);
    });
  });

  describe('경계값', () => {
    it('빈 문자열이면 0 반환', () => {
      expect(parseDurationSeconds('')).toBe(0);
    });

    it('잘못된 형식이면 0 반환', () => {
      expect(parseDurationSeconds('invalid')).toBe(0);
    });

    it('Shorts 경계값 60초 (PT1M)', () => {
      expect(parseDurationSeconds('PT1M')).toBe(60);
    });

    it('Shorts 경계값 초과 61초 (PT1M1S)', () => {
      expect(parseDurationSeconds('PT1M1S')).toBe(61);
    });
  });
});

describe('normalizeThumbnailUrl', () => {
  describe('정상 케이스', () => {
    it('high 썸네일을 우선 반환', () => {
      const thumbnails = {
        default: { url: 'http://default.jpg' },
        medium: { url: 'http://medium.jpg' },
        high: { url: 'http://high.jpg' },
      };
      expect(normalizeThumbnailUrl(thumbnails)).toBe('http://high.jpg');
    });

    it('high 없으면 medium 반환', () => {
      const thumbnails = {
        default: { url: 'http://default.jpg' },
        medium: { url: 'http://medium.jpg' },
      };
      expect(normalizeThumbnailUrl(thumbnails)).toBe('http://medium.jpg');
    });
  });

  describe('경계값', () => {
    it('default만 있으면 default 반환', () => {
      const thumbnails = {
        default: { url: 'http://default.jpg' },
      };
      expect(normalizeThumbnailUrl(thumbnails)).toBe('http://default.jpg');
    });

    it('빈 객체이면 빈 문자열 반환', () => {
      expect(normalizeThumbnailUrl({})).toBe('');
    });
  });
});
