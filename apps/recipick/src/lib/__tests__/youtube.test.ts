import { describe, it, expect } from 'vitest';
import { isCookingChannel, normalizeThumbnailUrl } from '../youtube';

describe('isCookingChannel', () => {
  describe('정상 케이스', () => {
    it('채널명에 요리 키워드가 있으면 true 반환', () => {
      expect(isCookingChannel('백종원 요리', '간단 레시피')).toBe(true);
    });

    it('영상 제목에 recipe 키워드가 있으면 true 반환', () => {
      expect(isCookingChannel("John's Channel", 'Simple Recipe for Beginners')).toBe(true);
    });

    it('대소문자 무시하고 일치하면 true 반환', () => {
      expect(isCookingChannel('HomeChef', 'How to COOK pasta')).toBe(true);
    });

    it('먹방 키워드가 있으면 true 반환', () => {
      expect(isCookingChannel('먹방채널', '오늘의 먹방')).toBe(true);
    });
  });

  describe('경계값', () => {
    it('빈 문자열이면 false 반환', () => {
      expect(isCookingChannel('', '')).toBe(false);
    });

    it('채널명과 제목 모두 관련 없으면 false 반환', () => {
      expect(isCookingChannel('게임채널', '롤 공략 영상')).toBe(false);
    });
  });

  describe('에러 케이스', () => {
    it('관련 없는 영어 채널은 false 반환', () => {
      expect(isCookingChannel('Tech Reviews', 'Best Laptop 2024')).toBe(false);
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
