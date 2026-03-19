import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // 순수 함수(lib/)만 커버리지 측정 대상
      // 컴포넌트/API Route/서비스는 외부 의존성으로 단위 테스트 제외
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/**/__tests__/**'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
