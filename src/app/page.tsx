'use client'
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import ClientWrapper from './ClientWrapper';

const HomeContent = dynamic(() => import('./HomeContent'), { ssr: false });

export default function Home() {
  return <ClientWrapper />;
}
