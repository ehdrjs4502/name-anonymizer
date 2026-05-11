/**
 * localStorage 래퍼.
 *
 * 모든 함수는 SSR(`typeof window === 'undefined'`)에서 안전하게 동작한다.
 * - getter: 기본값(빈 객체/false)을 돌려준다
 * - setter: no-op
 * - subscribeStorage: 같은 탭의 set 호출과 다른 탭의 storage 이벤트를 모두 통지한다
 */

const MAP_KEY = 'anonymizer_map';
const ENABLED_KEY = 'anonymizer_enabled';
const SALT_KEY = 'anonymizer_salt';

/** 외부에서 키 비교에 쓰기 좋도록 노출 */
export const STORAGE_KEYS = {
  MAP: MAP_KEY,
  ENABLED: ENABLED_KEY,
  SALT: SALT_KEY,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

type Listener = (key: StorageKey) => void;

/**
 * 같은 탭의 setter 호출을 통지하기 위한 in-memory listener 집합.
 * `storage` DOM 이벤트는 *다른* 탭에서만 발화하므로 별도 채널이 필요하다.
 */
const localListeners: Set<Listener> = new Set();

function notifyLocal(key: StorageKey): void {
  localListeners.forEach((listener) => {
    try {
      listener(key);
    } catch {
      // 개별 listener 오류로 다른 listener가 영향받지 않도록 격리
    }
  });
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * 저장된 이름 → 익명 매핑을 읽는다. SSR/파싱 실패 시 빈 객체.
 */
export function getMap(): Record<string, string> {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(MAP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * 매핑을 저장하고 같은 탭 listener에 통지한다. SSR에서는 no-op.
 */
export function setMap(map: Record<string, string>): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(MAP_KEY, JSON.stringify(map));
    notifyLocal(STORAGE_KEYS.MAP);
  } catch {
    // 쿼터 초과/사생활 보호 모드 등은 무시
  }
}

/**
 * 익명화 토글 활성 여부를 읽는다. 기본값 false.
 */
export function getEnabled(): boolean {
  if (!isBrowser()) return false;
  try {
    return window.localStorage.getItem(ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * 토글 상태를 저장하고 같은 탭 listener에 통지한다. SSR에서는 no-op.
 */
export function setEnabled(value: boolean): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(ENABLED_KEY, value ? 'true' : 'false');
    notifyLocal(STORAGE_KEYS.ENABLED);
  } catch {
    // ignore
  }
}

/**
 * reset 시 해시 기준점을 바꾸기 위한 랜덤 salt를 읽는다. 기본값 0.
 */
export function getSalt(): number {
  if (!isBrowser()) return 0;
  try {
    const raw = window.localStorage.getItem(SALT_KEY);
    if (!raw) return 0;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/**
 * salt를 저장하고 같은 탭 listener에 통지한다. SSR에서는 no-op.
 */
export function setSalt(value: number): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(SALT_KEY, String(value));
    notifyLocal(STORAGE_KEYS.SALT);
  } catch {
    // ignore
  }
}

/**
 * 익명화 관련 storage 변경을 구독한다.
 * - 같은 탭에서 setMap/setEnabled 호출 시 콜백 호출
 * - 다른 탭에서 localStorage 변경 시 `storage` 이벤트로 콜백 호출
 *
 * @param callback 변경된 키와 함께 호출됨
 * @returns 구독 해제 함수
 */
export function subscribeStorage(callback: Listener): () => void {
  localListeners.add(callback);

  if (!isBrowser()) {
    return () => {
      localListeners.delete(callback);
    };
  }

  const handler = (e: StorageEvent) => {
    if (e.key === MAP_KEY || e.key === ENABLED_KEY || e.key === SALT_KEY) {
      callback(e.key as StorageKey);
    }
  };
  window.addEventListener('storage', handler);

  return () => {
    localListeners.delete(callback);
    window.removeEventListener('storage', handler);
  };
}
