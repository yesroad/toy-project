# shadcn-ui-monorepo 규칙

## 개요

Yarn Workspaces + Turbo 기반 모노레포. Next.js 16 App Router 애플리케이션과 공유 UI 패키지로 구성.

## 명령어

```bash
# 루트 (모든 워크스페이스)
dev:    yarn dev       # turbo dev — 전체 앱 동시 실행
build:  yarn build     # turbo build
lint:   yarn lint      # turbo lint (ESLint 9 Flat Config)
format: yarn format    # prettier --write

# 특정 앱만 실행할 때 (workspace 이름은 @apps/xxx 가 아닌 패키지명 그대로)
yarn workspace fit-track dev
yarn workspace recipick dev
yarn workspace fit-track lint
yarn workspace recipick check-types   # recipick 타입 체크 명령어는 check-types
```

## 비직관적 도구 규칙

- `npm` 또는 `pnpm` 대신 반드시 `yarn` 사용. `.yarnrc.yml` + `yarn.lock` 기반.
- SVG 파일은 `@svgr/webpack` 플러그인으로 React 컴포넌트로 import 가능:
  ```tsx
  import LogoIcon from '@/assets/logo.svg'; // ReactComponent로 사용
  ```
  일반 `<img src="...">` 방식도 작동하지만 SVGR 방식을 우선 사용.
- **Tailwind CSS v4** 사용 중. v3와 설정 방식이 다름:
  - `tailwind.config.js` 없음 — `postcss.config.mjs` + CSS `@import "tailwindcss"` 방식
  - v3의 `theme.extend`, `content` 배열 설정은 적용 불가

## 수정/삭제 금지

- `packages/eslint-config/index.js` — 모든 워크스페이스가 공유하는 ESLint 설정. 수정 시 전체 영향
- `packages/typescript-config/tsconfig.json` — 기본 TS 설정. 수정 시 타입 에러 전파 가능
- `packages/ui/src/lib/utils.ts` — `cn()` 유틸 (clsx + tailwind-merge). 변경 시 모든 UI 컴포넌트 영향

## 에이전트 주의사항

- 새 의존성 추가 시 **워크스페이스 루트**가 아닌 **해당 앱**에 추가: `yarn workspace recipick add [패키지]`
- workspace 이름은 `@apps/xxx` 형식이 아닌 `package.json`의 `"name"` 필드값 그대로 사용 (`fit-track`, `recipick`)
- `packages/ui`의 shadcn/ui 컴포넌트 추가: `packages/ui` 디렉토리에서 `npx shadcn@latest add` 실행
- 공유 컴포넌트는 `packages/ui/src/components/`에, 앱 전용 컴포넌트는 `apps/[project]/src/components/`에 작성
- `packages/services` — HTTP 클라이언트 베이스(`BaseServices`). 앱 서비스는 이를 상속해서 작성

## 컨텍스트 라우팅

- **[apps/fit-track](./apps/fit-track/CLAUDE.md)** — Next.js App Router 앱 고유 규칙 (Server Components, 폴더 구조)
- **[apps/recipick](./apps/recipick/CLAUDE.md)** — 요리 영상 레시피 앱 규칙 (훅 분리 패턴, SSR-safe localStorage, Supabase/OpenAI 연동)
- **[코딩 표준](.claude/rules/core/coding-standards.md)** — TypeScript/React 코딩 규칙
- **[상태 관리](.claude/rules/core/state-and-server-state.md)** — 현재 스택 기준 상태 관리 경계
- **[App Router 규칙](.claude/rules/core/nextjs-app-router.md)** — Suspense, Server Actions, RSC 패턴
