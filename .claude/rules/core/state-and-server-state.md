# 상태 관리 경계 규칙

이 프로젝트는 현재 스택 기준으로 상태를 명확한 경계로 분리한다.

> **현재 설치된 상태 관리 라이브러리**: React Hook Form, useState/useReducer (내장)
> TanStack Query, Jotai는 미설치 — 필요 시 추가 후 아래 가이드 참고

---

## 상태 유형별 도구 (현재 스택)

| 상태 유형 | 도구 | 상태 |
|-----------|------|------|
| 폼 상태 | React Hook Form | 설치됨 |
| 로컬 UI 상태 | useState/useReducer | 기본 |
| 서버 상태 (API 데이터) | TanStack Query v5 | 미설치 |
| 전역 UI/세션 상태 | Jotai | 미설치 |

### 판단 기준

- **폼 입력값인가?** → React Hook Form
- **이 컴포넌트에서만 쓰는 상태인가?** → useState
- **서버에서 온 데이터인가?** → TanStack Query 추가 후 사용
- **여러 컴포넌트가 공유해야 하는 UI 상태인가?** → Jotai 추가 후 사용

---

## React Hook Form 사용 규칙

### 적합한 사용 사례

- 사용자 입력 폼
- 검증 로직이 필요한 입력
- 여러 필드가 있는 복잡한 폼

### 기본 패턴

```typescript
import { useForm } from 'react-hook-form';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = (data: LoginFormData) => {
    // API 호출 등 처리
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: true })} />
      {errors.email && <span>필수 입력</span>}
    </form>
  );
};
```

### 기존 패턴 참조

`apps/fit-track/src/views/login/components/LoginForm/` 참고.

---

## 안티패턴과 대안 (현재 스택 기준)

### 1. useEffect로 API 호출 (TanStack Query 미설치 시)

```typescript
// ❌ 안티패턴: useEffect + 수동 로딩/에러 상태
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchData()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);

// ✅ 대안 (현재): 커스텀 훅으로 캡슐화
function useFetchData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

// ✅ 대안 (TanStack Query 설치 후):
// const { data, isLoading } = useQuery({ queryKey: ['data'], queryFn: fetchData });
```

### 2. 파생 상태를 위한 useEffect

```typescript
// ❌ 안티패턴: 파생 상태에 useEffect 사용
const [items, setItems] = useState([]);
const [filteredItems, setFilteredItems] = useState([]);

useEffect(() => {
  setFilteredItems(items.filter((item) => item.active));
}, [items]);

// ✅ 대안: useMemo로 파생 계산
const filteredItems = useMemo(() => items.filter((item) => item.active), [items]);
```

---

## TanStack Query 도입 가이드 (미래 참조)

TanStack Query 설치 후 아래 구조로 사용한다.

```bash
yarn workspace @apps/fit-track add @tanstack/react-query
```

### 디렉토리 구조

```
src/
├── queries/
│   └── {도메인}/
│       ├── index.ts       # useXxxQuery, useXxxMutation 훅
│       └── queryKeys.ts   # 쿼리 키 정의
└── services/
    └── {도메인}/
        ├── index.ts       # API 호출 함수
        └── types.ts       # 요청/응답 타입
```

### 쿼리 키 패턴

```typescript
// queries/user/queryKeys.ts
export const userKeys = {
  all: ['user'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};
```

---

## Jotai 도입 가이드 (미래 참조)

Jotai 설치 후 아래 구조로 사용한다.

```bash
yarn workspace @apps/fit-track add jotai
```

### Atom 정의 위치

```typescript
// src/atoms/uiAtoms.ts
import { atom } from 'jotai';

export const sidebarOpenAtom = atom(false);
export const selectedTabAtom = atom<'all' | 'active'>('all');
```

### 금지 사항

- 서버 데이터를 atom에 저장하지 않는다
- atom에서 API 호출을 직접 하지 않는다

---

## 체크리스트

새로운 상태를 추가할 때:

- [ ] 폼 입력인가? → React Hook Form
- [ ] 이 컴포넌트에서만 쓰이는가? → useState
- [ ] 렌더링에 영향 없는 값인가? → useRef (react-hooks-patterns.md 참조)
- [ ] 서버 데이터인가? → TanStack Query 설치 여부 확인
- [ ] 전역 공유 UI 상태인가? → Jotai 설치 여부 확인
