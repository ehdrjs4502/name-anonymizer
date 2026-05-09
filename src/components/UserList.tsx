'use client';

import { useAnonymize } from '@/lib/anonymizer';

type User = { id: number; name: string; role: string };

const USERS: User[] = [
  { id: 1, name: '김동건', role: '프론트엔드' },
  { id: 2, name: '이서연', role: '백엔드' },
  { id: 3, name: '박지훈', role: '디자이너' },
  { id: 4, name: '최민지', role: '기획' },
  { id: 5, name: '정현우', role: 'QA' },
];

/**
 * 익명화 훅을 실제로 활용하는 데모 리스트.
 * 토글 ON → 결정론적 익명, OFF → 원본 이름.
 */
export function UserList() {
  const anon = useAnonymize();

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
      {USERS.map((user) => (
        <li
          key={user.id}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #ddd',
            borderRadius: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontWeight: 600 }}>{anon(user.name)}</span>
          <span style={{ color: '#888' }}>{user.role}</span>
        </li>
      ))}
    </ul>
  );
}
