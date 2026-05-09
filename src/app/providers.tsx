"use client";

import { AnonymizerProvider } from "@/lib/anonymizer";
import { ANON_POOL } from "@/lib/anonymizer-pool";

/**
 * 클라이언트 측 전역 프로바이더 묶음.
 * RootLayout(서버 컴포넌트)에서 children을 감싸기 위한 얇은 래퍼.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <AnonymizerProvider pool={ANON_POOL}>{children}</AnonymizerProvider>;
}
