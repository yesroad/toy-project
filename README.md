# Toy Projects Monorepo

> shadcn/ui + Turborepo 기반 토이 프로젝트 모음

공통 UI 컴포넌트와 설정을 공유하는 모노레포입니다.

## 📦 프로젝트

- `fit-track`: [`apps/fit-track`](apps/fit-track/)

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
yarn dev

yarn workspace fit-track dev
```
