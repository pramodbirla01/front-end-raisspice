'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const HomeContent = dynamic(() => import('./HomeContent'), { 
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function ClientWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
