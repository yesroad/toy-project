# cookclip 앱 규칙

## 개요

유튜브 요리 영상 검색 → AI 레시피/재료 추출 앱. 패키지명 `cookclip`.

## 명령어

```bash
dev:          yarn workspace cookclip dev
build:        yarn workspace cookclip build
lint:         yarn workspace cookclip lint
check-types:  yarn workspace cookclip check-types   # tsc --noEmit (type-check 아님)
test:         yarn workspace cookclip test           # vitest (watch mode)
test CI:      yarn workspace cookclip test -- --run  # 단발 실행 시 --run 필수
```

## 비직관적 도구 규칙

- **환경변수는 반드시 `serverEnv`를 통해 접근** — `process.env.XXX` 직접 사용 금지.
  `src/env/server.ts`의 `serverEnv` 객체만 사용한다.
  ```typescript
  import { serverEnv } from '@/env/server';
  serverEnv.youtubeDataApiKey; // ✅
  process.env.YOUTUBE_DATA_API_KEY; // ❌
  ```
- **`src/env/server.ts`에 `'server-only'` import** — 클라이언트 컴포넌트에서 절대 import 금지. 빌드 에러 발생.
- **환경변수 레거시 alias** — `YOUTUBE_DATA_API_KEY`의 구 이름은 `YOUTUBE_API_KEY`,
  `SUPABASE_URL`의 구 이름은 `NEXT_PUBLIC_SUPABASE_URL`. `LEGACY_ENV_KEYS` 상수 참조.
  신규 환경변수 추가 시 동일 패턴으로 alias 등록.

## 수정/삭제 금지

- `src/env/server.ts`의 `LEGACY_ENV_KEYS` — 구 환경변수명 alias. 제거 시 기존 `.env` 사용자 환경 깨짐
- `packages/ui/src/lib/utils.ts` — `cn()` 유틸. 변경 시 모든 UI 컴포넌트 영향

## 핵심 패턴 (비직관적)

### use[컴포넌트명] 훅 분리 필수

비즈니스 로직은 컴포넌트와 같은 폴더에 `use[ComponentName].ts`로 분리한다.
컴포넌트 파일은 훅 호출 + JSX 반환만 담당한다.

```
SearchBar/
  index.tsx        ← UI only, useSearchBar 호출
  useSearchBar.ts  ← 입력 상태, submit 처리
```

### SSR-safe localStorage

`useState` lazy initializer에서 `typeof window` 분기 사용 금지 → Hydration 오류 발생.

```typescript
// ❌ 금지 — 서버/클라이언트 불일치로 Hydration 오류
const [tabs, setTabs] = useState(() => {
  if (typeof window === 'undefined') return [];
  return parseTabs(localStorage.getItem(KEY));
});

// ✅ 올바른 패턴 — 초기값 [] 고정, useEffect에서 로드
const [tabs, setTabs] = useState<SearchTab[]>([]);
useEffect(() => {
  setTabs(parseTabs(localStorage.getItem(KEY)));
}, []);
```

### 로딩 스피너

`lucide-react`의 `Loader2` + `animate-spin`. 스피너는 IntersectionObserver sentinel **위**에 배치해야 보임.

```typescript
import { Loader2 } from 'lucide-react';
<Loader2 size={20} className="animate-spin text-[#c4724a]" />
```

## 에이전트 주의사항

- shadcn/ui 컴포넌트 추가는 `packages/ui` 기준: `cd packages/ui && npx shadcn@latest add [컴포넌트]`
- 새 의존성: `yarn workspace cookclip add [패키지]` (루트에서 추가하지 않음)
- `'use client'` — 브라우저 API, Hook, 이벤트 핸들러 사용 시에만 추가
- Route Handler(`app/api/**`) 내에서도 `serverEnv` 사용, `process.env` 직접 접근 금지

## MCP 도구

| 도구         | 용도                                            |
| ------------ | ----------------------------------------------- |
| `supabase`   | DB 쿼리, 마이그레이션, 타입 생성, Edge Function |
| `playwright` | UI 테스트, 브라우저 자동화                      |
