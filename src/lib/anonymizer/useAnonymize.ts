'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useAnonymizer } from './context';
import { useAnonymizerToggle } from './useAnonymizerToggle';

/**
 * 이름 → 익명 변환 함수를 돌려준다.
 *
 * - 토글이 OFF면 입력 그대로 반환
 * - 토글이 ON이면 결정론적으로 매핑된 익명을 반환
 * - 매핑이 새로 생기거나 다른 탭에서 변경되면 자동으로 리렌더된다
 *
 * @example
 * ```tsx
 * const anon = useAnonymize();
 * return <p>{anon(user.name)}님 환영합니다</p>;
 * ```
 */
export function useAnonymize(): (name: string) => string {
  const { anonymizer } = useAnonymizer();
  const { isAnonymized } = useAnonymizerToggle();

  // 매핑 변경 시 리렌더되도록 version에 구독
  const subscribe = useCallback(
    (listener: () => void) => anonymizer.subscribe(listener),
    [anonymizer]
  );
  useSyncExternalStore(
    subscribe,
    () => anonymizer.getVersion(),
    () => 0 // SSR snapshot
  );

  return useCallback(
    (name: string) => {
      if (!isAnonymized) return name;
      return anonymizer.anonymize(name);
    },
    [anonymizer, isAnonymized]
  );
}
