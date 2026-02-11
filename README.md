# Toy Projects Monorepo

> shadcn/ui + Turborepo 기반 토이 프로젝트 모음

공통 UI 컴포넌트와 설정을 공유하며 다양한 토이 프로젝트를 빠르게 개발하기 위한 모노레포 템플릿입니다.

## 📦 프로젝트

### 🏋️ fit-track (진행 중)

운동 및 식단 기록 애플리케이션

**기술 스택:**
- Next.js 15 (App Router)
- React Hook Form
- shadcn/ui
- TypeScript

**현재 구현:**
- 로그인 UI
- React Hook Form Provider 패턴
- shadcn/ui 공통 컴포넌트 활용

**계획:**
- 운동 기록 CRUD
- 식단 기록 CRUD
- 통계 대시보드

## 🏗️ 모노레포 구조

```
toy-project/
├── apps/                    # 개별 애플리케이션
│   └── fit-track/          # 운동/식단 기록 앱
│
├── packages/
│   ├── ui/                 # shadcn/ui 공통 컴포넌트
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
# 전체 프로젝트
yarn dev

# 특정 앱만
yarn workspace fit-track dev
```

### shadcn/ui 컴포넌트 추가

```bash
yarn dlx shadcn@latest add button -c apps/fit-track
```

컴포넌트는 `packages/ui/src/components`에 저장되어 모든 앱에서 공유됩니다.

## 🛠️ 기술 스택

**Core**
- Turborepo - 모노레포 빌드 시스템
- Yarn Berry (v4) - 패키지 매니저
- TypeScript - 타입 안전성

**UI**
- Next.js 15
- React 19
- shadcn/ui - Headless UI 컴포넌트
- Tailwind CSS 4

**Libraries**
- React Hook Form - 폼 관리
- Radix UI - Accessible 컴포넌트

## 💡 개발 철학

- **공통 UI 공유**: shadcn/ui 컴포넌트를 packages/ui에서 관리
- **타입 안전성**: 공통 TypeScript 설정으로 일관된 타입 체크
- **빠른 프로토타이핑**: 새 프로젝트를 apps/에 추가만 하면 바로 시작
- **독립 배포**: 각 앱은 독립적으로 배포 가능

## 📚 사용 예시

### 공통 컴포넌트 사용

```tsx
// apps/fit-track/app/page.tsx
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"

export default function Page() {
  return (
    <Card>
      <Button>Click me</Button>
    </Card>
  )
}
```

### 새 프로젝트 추가

1. `apps/` 에 새 디렉토리 생성
2. Next.js 프로젝트 초기화
3. `@workspace/ui` 패키지 의존성 추가
4. 공통 컴포넌트 바로 사용 가능

## 🔗 관련 문서

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Yarn Berry Documentation](https://yarnpkg.com)
