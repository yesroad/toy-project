import { describe, it, expect } from 'vitest';
import { filterVideoByTitle, isVideoShorts, normalizeThumbnailUrl } from '../youtube';

describe('filterVideoByTitle', () => {
  describe('정상 케이스 — 포함 키워드', () => {
    it('제목에 "레시피"가 있으면 true 반환', () => {
      expect(filterVideoByTitle('떡볶이 레시피')).toBe(true);
    });

    it('제목에 "만들기"가 있으면 true 반환', () => {
      expect(filterVideoByTitle('떡볶이 만들기')).toBe(true);
    });

    it('제목에 "recipe"가 있으면 true 반환 (영문)', () => {
      expect(filterVideoByTitle('Simple Recipe for Beginners')).toBe(true);
    });

    it('제목에 "cook"이 있으면 true 반환 (대소문자 무시)', () => {
      expect(filterVideoByTitle('How to COOK pasta')).toBe(true);
    });

    it('제목에 "요리법"이 있으면 true 반환', () => {
      expect(filterVideoByTitle('간단 요리법 5가지')).toBe(true);
    });
  });

  describe('정상 케이스 — 제외 키워드 우선 적용', () => {
    it('포함+제외 키워드가 동시에 있으면 false (제외 우선)', () => {
      expect(filterVideoByTitle('레시피 vlog')).toBe(false);
    });

    it('제목에 "먹방"이 있으면 false', () => {
      expect(filterVideoByTitle('오늘의 먹방 떡볶이')).toBe(false);
    });

    it('제목에 "asmr"이 있으면 false (대소문자 무시)', () => {
      expect(filterVideoByTitle('ASMR 먹기')).toBe(false);
    });

    it('제목에 "리뷰"가 있으면 false', () => {
      expect(filterVideoByTitle('맛집 리뷰 서울')).toBe(false);
    });

    it('제목에 "mukbang"이 있으면 false', () => {
      expect(filterVideoByTitle('Korean mukbang with friends')).toBe(false);
    });
  });

  describe('경계값', () => {
    it('빈 문자열이면 false 반환', () => {
      expect(filterVideoByTitle('')).toBe(false);
    });

    it('포함/제외 키워드 모두 없으면 false 반환', () => {
      expect(filterVideoByTitle('롤 공략 영상')).toBe(false);
    });

    it('포함/제외 키워드 모두 없는 영문 제목도 false 반환', () => {
      expect(filterVideoByTitle('Best Laptop 2024')).toBe(false);
    });
  });
});

describe('isVideoShorts', () => {
  describe('정상 케이스 — description 해시태그', () => {
    it('description에 #shorts 포함 시 true 반환', () => {
      expect(isVideoShorts('맛있는 레시피 #shorts')).toBe(true);
    });

    it('description에 #Shorts 포함 시 true 반환 (대소문자 무시)', () => {
      expect(isVideoShorts('맛있는 레시피 #Shorts')).toBe(true);
    });

    it('description에 #short 포함 시 true 반환', () => {
      expect(isVideoShorts('quick recipe #short')).toBe(true);
    });
  });

  describe('정상 케이스 — tags 배열', () => {
    it("tags에 'shorts' 항목 포함 시 true 반환", () => {
      expect(isVideoShorts('', ['요리', 'shorts'])).toBe(true);
    });

    it("tags에 'Shorts' 항목 포함 시 true 반환 (대소문자 무시)", () => {
      expect(isVideoShorts('', ['요리', 'Shorts'])).toBe(true);
    });

    it("tags에 'short' 항목 포함 시 true 반환", () => {
      expect(isVideoShorts('', ['요리', 'short'])).toBe(true);
    });
  });

  describe('경계값 / false 케이스', () => {
    it('description과 tags 모두 없으면 false 반환', () => {
      expect(isVideoShorts('일반 레시피 영상입니다')).toBe(false);
    });

    it('빈 description, undefined tags이면 false 반환', () => {
      expect(isVideoShorts('', undefined)).toBe(false);
    });

    it('빈 tags 배열이면 false 반환', () => {
      expect(isVideoShorts('', [])).toBe(false);
    });

    it("tags에 'shortcut' 같은 부분 일치 단어는 false 반환", () => {
      expect(isVideoShorts('', ['shortcut', 'recipe'])).toBe(false);
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
