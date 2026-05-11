'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Anonymizer } from './Anonymizer';

type AnonymizerContextValue = {
  anonymizer: Anonymizer;
};

const AnonymizerContext = createContext<AnonymizerContextValue | null>(null);

/**
 * 앱 루트(또는 익명화가 필요한 서브트리)에 배치한다.
 *
 * `pool`은 마운트 시점에 한 번만 사용되어 Anonymizer 인스턴스에 포함된다.
 * 런타임에 풀을 동적으로 바꾸는 시나리오는 지원하지 않는다 (필요하면 컴포넌트를 언마운트/재마운트).
 *
 * @example
 * ```tsx
 * <AnonymizerProvider pool={['에디슨', '뉴턴', '소크라테스']}>
 *   <App />
 * </AnonymizerProvider>
 * ```
 */
export function AnonymizerProvider({
  pool,
  excludes = [],
  children,
}: {
  pool: readonly string[];
  excludes?: readonly string[];
  children: React.ReactNode;
}) {
  // useState의 lazy initializer로 한 번만 생성. 렌더 중 ref.current 접근 문제를 피한다.
  const [anonymizer] = useState(() => new Anonymizer(pool, excludes));

  // 언마운트 시 storage 구독 정리
  useEffect(() => {
    return () => {
      anonymizer.destroy();
    };
  }, [anonymizer]);

  const value = useMemo<AnonymizerContextValue>(() => ({ anonymizer }), [anonymizer]);

  return <AnonymizerContext.Provider value={value}>{children}</AnonymizerContext.Provider>;
}

/**
 * Provider 인스턴스에 접근. 매핑 초기화 같은 관리자 동작에 사용.
 *
 * @throws AnonymizerProvider 외부에서 호출 시
 */
export function useAnonymizer(): {
  anonymizer: Anonymizer;
  reset: () => void;
} {
  const ctx = useContext(AnonymizerContext);
  if (!ctx) {
    throw new Error('useAnonymizer는 AnonymizerProvider 내부에서만 사용해야 합니다');
  }
  return {
    anonymizer: ctx.anonymizer,
    reset: () => ctx.anonymizer.reset(),
  };
}
