# Toy Projects Monorepo

> shadcn/ui + Turborepo 기반 토이 프로젝트 모음

공통 UI 컴포넌트와 설정을 공유하는 모노레포입니다.

## 📦 프로젝트

- `cookclip`: [`apps/cookclip`](apps/cookclip/) — 유튜브 요리 영상 검색 · 레시피/재료 추출 앱
- `fit-track`: [`apps/fit-track`](apps/fit-track/) — 운동/식단 기록 앱

## 🏗️ 모노레포 구조

```
toy-project/
├── apps/
│   ├── fit-track/          # 운동/식단 기록 앱
│   └── cookclip/           # 요리 영상 레시피 앱 (YouTube + OpenAI + Supabase)
│
├── packages/
│   ├── ui/                 # shadcn/ui 공통 컴포넌트
│   ├── services/           # HTTP 클라이언트 베이스 (BaseServices)
│   ├── typescript-config/  # 공통 TypeScript 설정
│   └── eslint-config/      # 공통 ESLint 설정
│
└── turbo.json              # Turborepo 설정
```

## 🚀 시작하기

### 설치

```bash
yarn install
```

### 개발 서버 실행

```bash
# 전체 앱 동시 실행
yarn dev

# 앱별 실행
yarn workspace fit-track dev
yarn workspace cookclip dev
```
