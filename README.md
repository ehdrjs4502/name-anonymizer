# name-anonymizer

Next.js 16 (App Router) + React 19 데모 프로젝트.
`src/lib/anonymizer/`에 들어있는 **결정론적 이름 익명화 모듈**의 사용 예시를 담고 있습니다.

## 모듈이 보장하는 동작

- **결정론적 매핑**: `김동건` → `에디슨`은 페이지 이동/새로고침/다른 탭에서도 동일.
- **토글 ON/OFF**: 끄면 원본, 켜면 익명. 토글 상태도 localStorage에 저장.
- **탭 간 실시간 동기화**: `storage` 이벤트로 다른 탭에 즉시 반영.
- **사용자 정의 풀**: 풀이 소진되면 `에디슨2`, `에디슨3`처럼 suffix를 붙임.
- **SSR 안전**: `window`/`localStorage`가 없을 때도 throw 없이 기본값으로 동작. 첫 SSR은 원본 이름, 클라이언트 hydration 후 익명화 반영.

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속.
홈에서 토글을 ON으로 두고 `/team`으로 이동하면 같은 매핑이 유지됩니다.
브라우저 두 개 탭에 같은 페이지를 띄워서 한쪽 토글을 누르면 다른 쪽도 자동으로 따라옵니다.

## 사용법 요약

```tsx
// 1) 앱 루트(클라이언트 컴포넌트 경계)에서 Provider로 감싼다
import { AnonymizerProvider } from '@/lib/anonymizer';

const POOL = ['에디슨', '뉴턴', '소크라테스'] as const;

<AnonymizerProvider pool={POOL}>
  <App />
</AnonymizerProvider>
```

```tsx
// 2) 이름을 보여주는 컴포넌트에서 useAnonymize()
'use client';
import { useAnonymize } from '@/lib/anonymizer';

export function Greeting({ name }: { name: string }) {
  const anon = useAnonymize();
  return <p>{anon(name)}님 환영합니다</p>;
}
```

```tsx
// 3) 토글 UI
'use client';
import { useAnonymizerToggle } from '@/lib/anonymizer';

export function Toggle() {
  const { isAnonymized, toggle } = useAnonymizerToggle();
  return <button onClick={toggle}>{isAnonymized ? '실명 보기' : '익명화'}</button>;
}
```

```tsx
// 4) 매핑 초기화 (관리자용)
'use client';
import { useAnonymizer } from '@/lib/anonymizer';

const { reset } = useAnonymizer();
reset(); // localStorage 매핑 전부 비움
```

## 파일 구조

```
src/lib/anonymizer/
├── hash.ts                  # djb2 해시
├── storage.ts               # localStorage 래퍼 (SSR 안전 + 같은 탭/다른 탭 구독)
├── Anonymizer.ts            # 핵심 클래스 (결정론적 매핑 + 선형 프로빙 + suffix)
├── context.tsx              # AnonymizerProvider, useAnonymizer
├── useAnonymize.ts          # 메인 훅
├── useAnonymizerToggle.ts   # 토글 상태 훅
└── index.ts                 # public API
```

데모는 `src/app/page.tsx`, `src/app/team/page.tsx`, `src/components/*` 참고.

## 주의사항

- 이 모듈의 훅들은 모두 **클라이언트 컴포넌트**에서만 사용해야 합니다 (`'use client'`).
  Provider도 마찬가지라 `app/providers.tsx`처럼 클라이언트 래퍼를 만들어 RootLayout에서 import 해주세요.
- 첫 SSR HTML은 항상 **원본 이름**으로 렌더됩니다 (서버에는 localStorage가 없음).
  클라이언트 hydration 직후 토글이 ON이었다면 익명으로 교체됩니다 — 일시적인 "깜빡임"이 자연스럽습니다.
- 결정론은 **localStorage 매핑이 살아있는 동안** 보장됩니다. 매핑을 reset하면 같은 이름이 풀의 다른 후보로 다시 매핑될 수 있습니다 (어떤 익명이 남아있는지에 따라).
- 풀의 모든 후보가 다 쓰였을 때만 suffix(`에디슨2`)가 붙습니다. 풀 크기를 N개 이상의 고유 이름이 들어올 만큼 넉넉히 잡는 것을 권장합니다.
- 풀을 런타임에 동적으로 바꾸는 시나리오는 지원하지 않습니다 (Provider 마운트 시점에 고정).
