import { djb2 } from './hash';
import { getMap, setMap, subscribeStorage, STORAGE_KEYS } from './storage';

/**
 * 결정론적 이름 → 익명 매핑을 관리하는 핵심 클래스.
 *
 * - 같은 이름은 항상 같은 익명으로 변환된다 (localStorage 매핑이 살아있는 한)
 * - djb2로 시작 인덱스를 정한 뒤 풀에서 선형 프로빙으로 빈 슬롯을 찾는다
 * - 풀이 모두 소진되면 `<풀_첫_후보><번호>` 형태의 suffix 전략으로 새 익명을 만든다
 * - localStorage 변경(같은 탭 setter 또는 다른 탭 storage 이벤트)을 감지해 자동 동기화
 * - subscribe()로 React 등 외부 구독자에게 변경을 통지한다
 */
export class Anonymizer {
  private readonly pool: readonly string[];
  private map: Record<string, string>;
  private readonly listeners: Set<() => void> = new Set();
  private unsubscribeStorage: (() => void) | null = null;
  private version = 0;

  constructor(pool: readonly string[]) {
    if (!pool || pool.length === 0) {
      throw new Error('[Anonymizer] pool은 비어있을 수 없습니다');
    }
    // 풀은 외부 변경에 영향받지 않도록 사본을 보관
    this.pool = [...pool];
    this.map = getMap();

    // localStorage 변화를 인스턴스 캐시에 반영
    this.unsubscribeStorage = subscribeStorage((key) => {
      if (key === STORAGE_KEYS.MAP) {
        this.map = getMap();
        this.bump();
      } else if (key === STORAGE_KEYS.ENABLED) {
        // 토글 상태 변경은 useAnonymizerToggle이 별도로 구독한다.
        // 여기서도 bump해 두면 useAnonymize가 매핑 구독으로도 토글 변화를 흡수할 수 있어 안전.
        this.bump();
      }
    });
  }

  /**
   * 이름을 익명으로 변환한다. 비어있는 입력은 그대로 돌려준다.
   *
   * @throws suffix 카운터가 1,000,000을 넘으면 (사실상 불가능)
   */
  anonymize(name: string): string {
    if (!name) return name;
    const cached = this.map[name];
    if (cached !== undefined) return cached;

    const used = new Set(Object.values(this.map));
    const startIdx = djb2(name) % this.pool.length;

    // 1) 선형 프로빙으로 풀에서 빈 슬롯 탐색
    for (let i = 0; i < this.pool.length; i++) {
      const candidate = this.pool[(startIdx + i) % this.pool.length];
      if (!used.has(candidate)) {
        return this.assign(name, candidate);
      }
    }

    // 2) 풀 소진 → suffix 전략 (`<base>2`, `<base>3`, ...)
    const base = this.pool[startIdx];
    let suffix = 2;
    while (used.has(`${base}${suffix}`)) {
      suffix++;
      if (suffix > 1_000_000) {
        throw new Error(
          `[Anonymizer] suffix 한계 초과 (poolSize=${this.pool.length}, mappingCount=${Object.keys(this.map).length})`
        );
      }
    }
    return this.assign(name, `${base}${suffix}`);
  }

  /**
   * 모든 매핑을 지운다. localStorage에도 반영된다.
   */
  reset(): void {
    this.map = {};
    setMap(this.map);
    // setMap이 같은 탭 listener를 통해 bump를 트리거하지만,
    // 우리도 storage 구독자라 자기 자신이 호출됨 → 안전.
  }

  /**
   * 현재 매핑의 얕은 복사본. 외부 수정으로부터 내부 상태를 보호한다.
   */
  getMapping(): Readonly<Record<string, string>> {
    return { ...this.map };
  }

  /**
   * 매핑이 변경될 때마다 1씩 증가하는 버전 번호.
   * useSyncExternalStore의 getSnapshot용으로 안정적인 원시값.
   */
  getVersion(): number {
    return this.version;
  }

  /**
   * 외부 구독자(예: React 컴포넌트)가 매핑 변경을 감지하도록 등록.
   * @returns 구독 해제 함수
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 인스턴스가 더 이상 필요 없을 때 호출. storage 구독을 끊고 listener를 비운다.
   */
  destroy(): void {
    this.unsubscribeStorage?.();
    this.unsubscribeStorage = null;
    this.listeners.clear();
  }

  private assign(name: string, anon: string): string {
    this.map = { ...this.map, [name]: anon };
    setMap(this.map);
    return anon;
  }

  private bump(): void {
    this.version = (this.version + 1) | 0;
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // 개별 listener 오류 격리
      }
    });
  }
}
