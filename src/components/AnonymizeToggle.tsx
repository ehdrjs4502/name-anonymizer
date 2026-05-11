'use client';

import { useAnonymizer, useAnonymizerToggle } from '@/lib/anonymizer';

/**
 * 익명화 ON/OFF 토글 버튼.
 */
export function AnonymizeToggle() {
  const { isAnonymized, toggle } = useAnonymizerToggle();
  const { reset } = useAnonymizer();

  return (
    <button
      type="button"
      onClick={() => { reset(); toggle(); }}
      aria-pressed={isAnonymized}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        border: '1px solid currentColor',
        background: isAnonymized ? '#222' : 'transparent',
        color: isAnonymized ? '#fff' : 'inherit',
        cursor: 'pointer',
        fontSize: '0.95rem',
      }}
    >
      {isAnonymized ? '실명 보기' : '익명화'}
    </button>
  );
}
