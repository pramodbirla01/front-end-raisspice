'use client'

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loader from '@/components/Loader';

const HomeContent = dynamic(() => import('./HomeContent'), {
  loading: () => <Loader isLoading={true} />,
  ssr: false
});

export default function Home() {
  return (
    <Suspense fallback={<Loader isLoading={true} />}>
      <HomeContent />
    </Suspense>
  );
}
