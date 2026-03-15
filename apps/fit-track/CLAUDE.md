# fit-track 앱 규칙

## 개요

운동/식단 기록 Next.js 16 App Router 앱. 패키지명 `fit-track`.

**기술 스택:**

- Next.js 16 (App Router) + React 19
- Tailwind CSS v4 (PostCSS 방식, `tailwind.config.js` 없음)
- shadcn/ui (New York 스타일, `@workspace/ui/components/*`)
- React Hook Form v7 (`@workspace/ui/components/form` 연동)
- SVGR (`@svgr/webpack` — SVG를 React 컴포넌트로 import)

## 명령어

```bash
yarn workspace fit-track dev
yarn workspace fit-track build
yarn workspace fit-track lint
```

## 소스 구조

```
src/
├── app/                    # App Router 라우트
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # /
│   └── login/page.tsx      # /login
├── views/                  # 페이지별 뷰 컴포넌트 (Container 역할)
│   └── login/
│       ├── index.tsx       # 로그인 뷰 (레이아웃 + 프로바이더 조합)
│       ├── types.ts        # 폼 필드 타입 (FieldValues)
│       └── components/     # 뷰 전용 컴포넌트
│           ├── LoginForm/  # 폼 필드 모음
│           └── LogoBlock/  # 로고 + 타이틀
├── components/             # 앱 공통 재사용 컴포넌트
│   ├── FormInput/          # 제네릭 shadcn Form 필드 래퍼
│   └── Logo/               # 로고 컴포넌트 (SVGR)
├── provider/
│   └── HookFormProvider.tsx # useForm + Form 컨텍스트 제네릭 래퍼
└── assets/
    └── logo.svg
```

## 핵심 패턴

### 페이지 → 뷰 위임

페이지는 뷰 컴포넌트만 렌더링한다.

```typescript
// app/login/page.tsx
import Login from '@/views/login';
export default function LoginPage() {
  return <Login />;
}
```

### HookFormProvider 사용

`useForm` 상태는 `HookFormProvider`로 위임한다. 타입 파라미터로 폼 필드 타입을 전달한다.

```typescript
// views/login/index.tsx
import { HookFormProvider } from '@/provider';
import { LoginFieldValues } from './types';

const defaultValues: LoginFieldValues = { email: '', password: '' };

const Login = () => (
  <HookFormProvider<LoginFieldValues> options={{ defaultValues }}>
    {/* Card 안에 폼 필드 + 버튼 */}
  </HookFormProvider>
);
```

### FormInput 컴포넌트

`@workspace/ui/components/form`의 `FormField` 패턴을 래핑한 제네릭 컴포넌트.
`control`을 prop으로 받아 shadcn Form 컨텍스트와 연결한다.

```typescript
import FormInput from '@/components/FormInput';

// LoginForm 내부에서
const { control } = useFormContext<LoginFieldValues>();

<FormInput
  control={control}
  name="email"
  label="이메일"
  type="email"
  placeholder="name@example.com"
/>
```

### shadcn/ui 컴포넌트 import 경로

```typescript
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardFooter } from '@workspace/ui/components/card';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
```

### SVG import (SVGR)

```typescript
import LogoIcon from '@/assets/logo.svg'; // React 컴포넌트로 사용
```

## Path Alias

| 앨리어스          | 실제 경로           |
| ----------------- | ------------------- |
| `@/*`             | `src/*`             |
| `@workspace/ui/*` | `packages/ui/src/*` |

## 주의사항

- **테스트 환경 미설정** — 테스트 작성 전 `unit-test-conventions.md` 참조하여 Vitest 설치 필요
- **TanStack Query / Jotai 미설치** — API 연동 시 `state-and-server-state.md` 참조
- `'use client'` 지시문은 브라우저 API 또는 Hook 사용 컴포넌트에만 추가
- shadcn/ui 컴포넌트 추가는 `packages/ui` 디렉토리에서 `npx shadcn@latest add` 실행
