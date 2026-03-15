import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import crypto from 'crypto';
import { generateCoupangAuthHeader, buildCoupangApiUrl } from '../coupang-sign';

// 고정 날짜: 2024-01-15T12:34:56Z → datetime = "20240115T123456"
const FIXED_DATE = new Date('2024-01-15T12:34:56.000Z');

describe('generateCoupangAuthHeader', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('정상 케이스', () => {
    it('CEA 프리픽스를 포함한 인증 헤더 반환', () => {
      const header = generateCoupangAuthHeader({
        method: 'GET',
        url: 'https://api-gateway.coupang.com/v2/test',
        accessKey: 'test-access-key',
        secretKey: 'test-secret-key',
      });

      expect(header).toMatch(/^CEA algorithm=HmacSHA256/);
    });

    it('access-key 필드를 포함한다', () => {
      const header = generateCoupangAuthHeader({
        method: 'GET',
        url: 'https://api-gateway.coupang.com/v2/test',
        accessKey: 'my-access-key',
        secretKey: 'test-secret-key',
      });

      expect(header).toContain('access-key=my-access-key');
    });

    it('signed-date가 YYYYMMDDTHHmmss 형식 15자리인지 확인', () => {
      const header = generateCoupangAuthHeader({
        method: 'GET',
        url: 'https://api-gateway.coupang.com/v2/test',
        accessKey: 'key',
        secretKey: 'secret',
      });

      const match = header.match(/signed-date=(\w+)/);
      expect(match).not.toBeNull();
      expect(match![1]).toHaveLength(15);
      expect(match![1]).toBe('20240115T123456');
    });

    it('signature가 64자리 hex 문자열인지 확인', () => {
      const header = generateCoupangAuthHeader({
        method: 'GET',
        url: 'https://api-gateway.coupang.com/v2/test',
        accessKey: 'key',
        secretKey: 'secret',
      });

      const match = header.match(/signature=([a-f0-9]+)/);
      expect(match).not.toBeNull();
      expect(match![1]).toHaveLength(64);
    });

    it('HMAC-SHA256 서명이 올바르게 생성되는지 검증', () => {
      const method = 'GET';
      const url = 'https://api-gateway.coupang.com/v2/test?foo=bar';
      const accessKey = 'key';
      const secretKey = 'secret';

      const header = generateCoupangAuthHeader({ method, url, accessKey, secretKey });

      // 예상 서명 직접 계산
      const datetime = '20240115T123456';
      const message = `${datetime}${method}/v2/testfoo=bar`;
      const expected = crypto.createHmac('sha256', secretKey).update(message).digest('hex');

      expect(header).toContain(`signature=${expected}`);
    });

    it('쿼리스트링 없는 URL도 처리한다', () => {
      const header = generateCoupangAuthHeader({
        method: 'GET',
        url: 'https://api-gateway.coupang.com/v2/test',
        accessKey: 'key',
        secretKey: 'secret',
      });

      // 서명이 포함되어 있으면 성공
      expect(header).toMatch(/signature=[a-f0-9]{64}/);
    });

    it('동일 입력에 대해 항상 동일한 서명 반환 (결정론적)', () => {
      const opts = {
        method: 'GET',
        url: 'https://api-gateway.coupang.com/v2/test',
        accessKey: 'key',
        secretKey: 'secret',
      };

      expect(generateCoupangAuthHeader(opts)).toBe(generateCoupangAuthHeader(opts));
    });
  });

  describe('정책 케이스', () => {
    it('method가 POST일 때도 서명 생성', () => {
      const header = generateCoupangAuthHeader({
        method: 'POST',
        url: 'https://api-gateway.coupang.com/v2/test',
        accessKey: 'key',
        secretKey: 'secret',
      });

      expect(header).toMatch(/^CEA algorithm=HmacSHA256/);
    });

    it('secretKey가 다르면 signature가 다르다', () => {
      const base = {
        method: 'GET',
        url: 'https://api-gateway.coupang.com/v2/test',
        accessKey: 'key',
      };

      const sig1 = generateCoupangAuthHeader({ ...base, secretKey: 'secret-a' });
      const sig2 = generateCoupangAuthHeader({ ...base, secretKey: 'secret-b' });

      expect(sig1).not.toBe(sig2);
    });
  });
});

describe('buildCoupangApiUrl', () => {
  describe('정상 케이스', () => {
    it('keyword가 URL 인코딩된 검색 URL 반환', () => {
      const url = buildCoupangApiUrl('떡볶이');
      expect(url).toContain(encodeURIComponent('떡볶이'));
    });

    it('영문 keyword도 처리한다', () => {
      const url = buildCoupangApiUrl('chicken');
      expect(url).toContain('keyword=chicken');
    });

    it('subId=recipick 포함', () => {
      const url = buildCoupangApiUrl('떡볶이');
      expect(url).toContain('subId=recipick');
    });

    it('limit=1 포함', () => {
      const url = buildCoupangApiUrl('떡볶이');
      expect(url).toContain('limit=1');
    });

    it('올바른 API gateway URL 기반', () => {
      const url = buildCoupangApiUrl('test');
      expect(url).toContain('https://api-gateway.coupang.com');
    });
  });

  describe('경계값', () => {
    it('공백 포함 키워드도 인코딩 처리', () => {
      const url = buildCoupangApiUrl('간장 계란밥');
      expect(url).toContain(encodeURIComponent('간장 계란밥'));
    });

    it('특수문자 포함 키워드도 인코딩 처리', () => {
      const url = buildCoupangApiUrl('recipe & cook');
      expect(url).toContain(encodeURIComponent('recipe & cook'));
    });
  });
});
