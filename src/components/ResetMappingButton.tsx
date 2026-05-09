'use client';

import { useAnonymizer } from '@/lib/anonymizer';

/**
 * 저장된 모든 이름 ↔ 익명 매핑을 초기화하는 관리자용 버튼.
 */
export function ResetMappingButton() {
  const { reset } = useAnonymizer();

  return (
    <button
      type="button"
      onClick={reset}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        border: '1px solid #c33',
        color: '#c33',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '0.9rem',
      }}
    >
      매핑 초기화
    </button>
  );
}
