# fit-track

운동 및 식단 기록 애플리케이션입니다.

## 개요

- 목적: 운동/식단 기록을 한 곳에서 관리
- 현재 단계: 초기 구현 진행 중

## 기술 스택

- Next.js 15 (App Router)
- React 19
- TypeScript
- React Hook Form
- shadcn/ui
- Tailwind CSS 4

## 현재 구현

- 로그인 UI
- React Hook Form Provider 패턴
- `@workspace/ui` 공통 컴포넌트 연동

## 예정 기능

- 운동 기록 CRUD
- 식단 기록 CRUD
- 통계 대시보드

## 개발 실행

루트 경로에서:

```bash
yarn workspace fit-track dev
```

앱 경로(`apps/fit-track`)에서:

```bash
yarn dev
```

기본 접속 주소: `http://localhost:3000`
