/**
 * djb2 해시 함수.
 *
 * Daniel J. Bernstein이 제안한 단순 비암호 해시.
 * 결정론적이며, 동일한 문자열 입력에 항상 같은 32비트 부호 없는 정수를 돌려준다.
 * 익명 풀에서의 시작 인덱스를 정할 때 사용한다.
 *
 * @param str 해시할 문자열
 * @returns 0 이상 2^32 미만의 정수
 */
export function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // hash * 33 + c, 32비트 정수로 강제
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}
