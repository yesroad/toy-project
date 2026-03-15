# Recipick 구현 계획

> 작업 진행 시 각 Phase 완료 후 체크박스 업데이트

---

## 개요

유튜브 요리 영상을 검색하면 GPT로 재료/레시피를 자동 추출하고, 재료 클릭 시 쿠팡 파트너스 링크로 연결하는 풀스택 웹서비스.
모노레포(`apps/recipick`)에 신규 Next.js 앱으로 추가.

---

## 기술 스택

| 카테고리    | 기술                                          |
| ----------- | --------------------------------------------- |
| **앱**      | Next.js 16 App Router + API Route             |
| **DB/캐시** | Supabase (`recipe_cache` 테이블)              |
| **AI**      | GPT-4o mini (openai SDK, Structured Outputs)  |
| **검색**    | YouTube Data API v3                           |
| **커머스**  | 쿠팡 파트너스 API (HMAC-SHA256 서명)          |
| **UI**      | Tailwind CSS v4 + shadcn/ui (`@workspace/ui`) |
| **상태**    | TanStack Query v5 + useState                  |
| **테스트**  | Vitest, 커버리지 85%                          |

---

## 환경변수 (`.env.local`)

```bash
YOUTUBE_API_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
COUPANG_ACCESS_KEY=
COUPANG_SECRET_KEY=
```

---

## Supabase 테이블 스키마

```sql
CREATE TABLE recipe_cache (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id     TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  thumbnail    TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  ingredients  JSONB NOT NULL,  -- [{ name: string, amount: string }]
  steps        JSONB NOT NULL,  -- string[]
  raw_caption  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_recipe_cache_video_id ON recipe_cache(video_id);
```

---

## API Route 설계

| Method | 경로                              | 설명                           |
| ------ | --------------------------------- | ------------------------------ |
| `GET`  | `/api/search?q=&pageToken=`       | YouTube 검색 + 채널 필터링     |
| `POST` | `/api/recipe` body: `{ videoId }` | 자막 분석 (Supabase 캐시 우선) |
| `GET`  | `/api/coupang?keyword=`           | 쿠팡 파트너스 링크 생성        |

---

## 디렉토리 구조

```
apps/recipick/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       ├── search/route.ts
│       ├── recipe/route.ts
│       └── coupang/route.ts
├── src/
│   ├── types/
│   ├── services/
│   │   ├── youtube/
│   │   ├── openai/
│   │   ├── supabase/
│   │   └── coupang/
│   ├── queries/
│   │   ├── search/
│   │   └── recipe/
│   ├── components/
│   │   ├── SearchBar/
│   │   ├── SearchHistoryTabs/
│   │   ├── VideoCard/
│   │   ├── RecipeModal/
│   │   └── IngredientChip/
│   ├── views/home/
│   ├── lib/
│   │   ├── youtube.ts
│   │   ├── caption.ts
│   │   ├── coupang-sign.ts
│   │   ├── search-history.ts
│   │   └── __tests__/
│   ├── hooks/
│   │   └── useSearchHistory.ts
│   └── provider/
│       └── QueryProvider.tsx
├── vitest.config.ts
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── .env.local
```

---

## 진행 상황

- [x] **Phase 1**: 앱 스캐폴딩 및 기반 설정
- [x] **Phase 2**: 타입 정의 및 서비스 레이어
- [ ] **Phase 3**: API Route 구현
- [ ] **Phase 4**: TanStack Query 훅 및 검색 기록
- [ ] **Phase 5**: UI 구현
- [ ] **Phase 6**: Supabase 캐싱 검증 + 무한 스크롤
- [ ] **Phase 7**: 테스트 완성 및 빌드 검증
- [ ] **Phase 8**: E2E 테스트 (Playwright + /agent-browser)

---

## Phase 1: 앱 스캐폴딩 및 기반 설정

**목표**: 모노레포에 `apps/recipick` 등록, 기반 파일 생성

### 작업 목록

- [x] `apps/recipick/package.json` 생성
- [x] `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs` 생성
- [x] `app/layout.tsx` — globals.css import, QueryProvider 감싸기
- [x] `app/page.tsx` — `<HomeView />` 렌더
- [x] `src/provider/QueryProvider.tsx` — QueryClient 설정
- [x] `src/views/home/index.tsx` — 빈 HomeView
- [x] `.env.local` — 환경변수 템플릿
- [x] shadcn 컴포넌트 추가 (dialog, skeleton, badge)
- [x] 패키지 설치

### 패키지 설치

```bash
yarn workspace recipick add @tanstack/react-query@^5 @supabase/ssr @supabase/supabase-js openai zod
yarn workspace recipick add -D vitest @vitest/coverage-v8 @tanstack/react-query-devtools
```

### shadcn 추가

```bash
cd packages/ui && npx shadcn@latest add dialog skeleton badge
```

**검증**: `yarn workspace recipick dev` → 빈 화면 렌더링, `yarn lint` 통과

**완료 액션**: `/quality` → `/commit`

---

## Phase 2: 타입 정의 및 서비스 레이어

**목표**: 외부 API 호출 함수를 순수 함수로 분리

### 작업 목록

- [x] `src/types/youtube.types.ts`
- [x] `src/types/recipe.types.ts`
- [x] `src/types/coupang.types.ts`
- [x] `src/lib/youtube.ts` — `isCookingChannel()` 필터 로직
- [x] `src/lib/caption.ts` — `chunkCaption()` 토큰 분할
- [x] `src/lib/coupang-sign.ts` — HMAC-SHA256 서명
- [x] `src/lib/search-history.ts` — 탭 CRUD 순수 함수
- [x] `src/services/supabase/client.ts` — createClient
- [x] `src/services/openai/index.ts` — `analyzeRecipe()` Structured Outputs
- [x] `src/services/youtube/index.ts` — `searchVideos()`, `getCaption()`
- [x] `src/services/coupang/index.ts` — `generateCoupangLink()`

**검증**: `yarn workspace recipick test` → youtube, caption 유닛 테스트 통과

**완료 액션**: `/quality` → `/commit`

---

## Phase 3: API Route 구현

**목표**: 3개 API Route 완성, Supabase 캐시 로직 포함

### `/api/recipe` 흐름

```
getCachedRecipe(videoId) → 캐시 히트: 즉시 반환
캐시 미스:
  → YouTube Captions API
  → chunkCaption() → Promise.all(chunks.map(analyzeRecipe))
  → 재료 중복 병합
  → setCachedRecipe() → Supabase 저장
  → 반환 (cached: false)
```

### 작업 목록

- [ ] `app/api/search/route.ts`
- [ ] `app/api/recipe/route.ts`
- [ ] `app/api/coupang/route.ts`
- [ ] `src/services/supabase/index.ts` — `getCachedRecipe()`, `setCachedRecipe()`

### 에러 처리

| 상황               | 응답 |
| ------------------ | ---- |
| 자막 없는 영상     | 422  |
| API 실패           | 503  |
| 필수 파라미터 누락 | 400  |

**검증**: curl로 각 엔드포인트 직접 호출

**완료 액션**: `/quality` → `/commit`

---

## Phase 4: TanStack Query 훅 및 검색 기록

**목표**: 클라이언트 데이터 레이어 완성

### 작업 목록

- [ ] `src/queries/search/queryKeys.ts`
- [ ] `src/queries/search/index.ts` — `useInfiniteSearchQuery()`
- [ ] `src/queries/recipe/queryKeys.ts`
- [ ] `src/queries/recipe/index.ts` — `useRecipeQuery()` (staleTime: 1시간)
- [ ] `src/hooks/useSearchHistory.ts` — localStorage 지연 초기화

**검증**: `yarn test -- --testPathPattern="search-history"` 통과

**완료 액션**: `/quality` → `/commit`

---

## Phase 5: UI 구현

**목표**: 검색/리스트/모달/재료칩 전체 UI

### 컴포넌트 목록

- [ ] `src/components/SearchBar/index.tsx`
- [ ] `src/components/SearchHistoryTabs/index.tsx`
- [ ] `src/components/VideoCard/index.tsx`
- [ ] `src/components/IngredientChip/index.tsx`
- [ ] `src/components/RecipeModal/index.tsx`
- [ ] `src/components/RecipeModal/IngredientList.tsx`
- [ ] `src/components/RecipeModal/RecipeSteps.tsx`
- [ ] `src/views/home/index.tsx` — HomeView (selectedVideoId 상태 관리)
- [ ] `src/views/home/components/VideoList/index.tsx`
- [ ] `src/views/home/components/EmptyState/index.tsx`

**검증**: 수동 E2E (검색 → 영상 클릭 → 재료 클릭 → 쿠팡 이동)

**완료 액션**: `/quality` → `/commit`

> ⚠️ UI 구현은 `/web-design` 스킬 사용 필수 — 컴포넌트 작성 전 반드시 호출

---

## Phase 6: Supabase 캐싱 검증 + 무한 스크롤

**목표**: 캐시 동작 검증, VideoList 무한 스크롤 완성

### 작업 목록

- [ ] Intersection Observer 무한 스크롤 구현
- [ ] `cached: true` 응답 시 모달 배지 표시

**검증**:

- 동일 videoId 두 번 요청 → 1차: 2-5초 / 2차: 100ms 이하
- Supabase 대시보드 `recipe_cache` 테이블 row 확인

**완료 액션**: `/quality` → `/commit`

---

## Phase 7: 테스트 완성 및 빌드 검증

**목표**: Vitest 85% 커버리지, lint/tsc 에러 0, 프로덕션 빌드 통과

### 테스트 파일

- [ ] `src/lib/__tests__/youtube.test.ts`
- [ ] `src/lib/__tests__/caption.test.ts`
- [ ] `src/lib/__tests__/coupang-sign.test.ts`
- [ ] `src/lib/__tests__/search-history.test.ts`

### 검증 명령어

```bash
yarn workspace recipick test:coverage   # 85% 이상
yarn workspace recipick check-types     # tsc --noEmit
yarn workspace recipick lint
yarn workspace recipick build
```

**완료 액션**: `/quality` → `/commit`

---

## Phase 8: E2E 테스트 (Playwright + /agent-browser)

**목표**: 핵심 사용자 플로우 전체를 브라우저 자동화로 검증

### 테스트 시나리오

- [ ] **검색 플로우**: 검색어 입력 → 영상 목록 렌더링 확인
- [ ] **레시피 추출**: 영상 카드 클릭 → 모달 열림 → 재료/단계 표시 확인
- [ ] **검색 기록 탭**: 검색 후 탭 추가 → 탭 클릭으로 재검색 → 탭 삭제
- [ ] **쿠팡 링크**: 재료 클릭 → 쿠팡 URL로 이동 확인
- [ ] **캐시 동작**: 동일 영상 재클릭 → `cached: true` 배지 표시 확인
- [ ] **무한 스크롤**: 스크롤 다운 → 추가 영상 로드 확인

### 도구

- Playwright MCP (`mcp__playwright__*`)
- `/agent-browser` 스킬 — 시나리오 기반 자동 브라우저 조작

### 실행 방법

```bash
# dev 서버 실행 후
yarn workspace recipick dev

# /agent-browser 스킬로 E2E 시나리오 실행
```

**검증**: 모든 시나리오 통과, 스크린샷 캡처

---

## 참조 파일

| 파일                                 | 용도             |
| ------------------------------------ | ---------------- |
| `apps/fit-track/package.json`        | 패키지 구조 패턴 |
| `apps/fit-track/tsconfig.json`       | TS alias 설정    |
| `apps/fit-track/app/layout.tsx`      | RootLayout 패턴  |
| `packages/ui/src/styles/globals.css` | CSS 변수 체계    |
| `packages/ui/postcss.config.mjs`     | Tailwind v4 설정 |
| `docs/recipick-mockup.html`          | UI 목업 참조     |
