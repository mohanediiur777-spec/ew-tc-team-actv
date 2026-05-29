'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="text-4xl mb-3">🚀</div>
        <p className="text-slate-600 font-semibold">Redirecting to login...</p>
      </div>
    </div>
  );
}
