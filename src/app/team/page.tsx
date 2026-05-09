import Link from 'next/link';
import { AnonymizeToggle } from '@/components/AnonymizeToggle';
import { UserList } from '@/components/UserList';

export default function TeamPage() {
  return (
    <main
      style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '3rem 1.5rem',
        display: 'grid',
        gap: '1.5rem',
      }}
    >
      <header style={{ display: 'grid', gap: '0.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem' }}>팀 페이지</h1>
        <p style={{ margin: 0, color: '#666' }}>
          홈에서 매핑된 익명이 그대로 유지되는 걸 확인하세요.
        </p>
      </header>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <AnonymizeToggle />
        <Link
          href="/"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid currentColor',
            textDecoration: 'none',
            color: 'inherit',
            fontSize: '0.95rem',
          }}
        >
          ← 홈으로
        </Link>
      </div>

      <UserList />
    </main>
  );
}
