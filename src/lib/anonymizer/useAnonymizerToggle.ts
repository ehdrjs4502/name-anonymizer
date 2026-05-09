'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  getEnabled,
  setEnabled,
  subscribeStorage,
  STORAGE_KEYS,
} from './storage';

/**
 * 익명화 ON/OFF 토글 상태.
 *
 * - `isAnonymized`: 현재 토글 상태 (boolean). 첫 SSR에서는 항상 `false`.
 * - `toggle()`: 현재 상태를 반전.
 * - `setAnonymized(value)`: 명시적으로 값을 설정.
 *
 * 같은 탭의 setter 호출과 다른 탭의 storage 변경 모두 자동 반영된다.
 */
export function useAnonymizerToggle(): {
  isAnonymized: boolean;
  toggle: () => void;
  setAnonymized: (value: boolean) => void;
} {
  // 매핑 변경(STORAGE_KEYS.MAP)에는 리렌더가 필요 없으므로 ENABLED만 통과시킨다.
  const subscribe = useCallback((listener: () => void) => {
    return subscribeStorage((key) => {
      if (key === STORAGE_KEYS.ENABLED) listener();
    });
  }, []);

  const isAnonymized = useSyncExternalStore(
    subscribe,
    () => getEnabled(),
    () => false // SSR snapshot: 첫 렌더는 항상 비활성 상태
  );

  const setAnonymized = useCallback((value: boolean) => {
    setEnabled(value);
  }, []);

  const toggle = useCallback(() => {
    setEnabled(!getEnabled());
  }, []);

  return { isAnonymized, toggle, setAnonymized };
}
