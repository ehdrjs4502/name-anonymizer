/**
 * 이름 익명화 모듈 공개 API.
 *
 * 사용 흐름:
 * 1. 앱 루트(클라이언트 컴포넌트)에 `<AnonymizerProvider pool={...}>`로 감싼다
 * 2. 화면에 이름을 노출하는 곳에서 `useAnonymize()`를 호출
 * 3. 토글 UI에서는 `useAnonymizerToggle()` 사용
 * 4. 매핑 초기화가 필요하면 `useAnonymizer().reset()`
 */

export { Anonymizer } from './Anonymizer';
export { AnonymizerProvider, useAnonymizer } from './context';
export { useAnonymize } from './useAnonymize';
export { useAnonymizerToggle } from './useAnonymizerToggle';
