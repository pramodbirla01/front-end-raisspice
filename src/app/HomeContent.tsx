'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import HeroSection from "./components/HeroSection";
import Category from "./components/Category";
import Banner from "./components/Banner";
import Product from "./components/Product";
import MiniSection from "./components/Mini-Section";
import TrustedBy from "./components/TrustedBy";
import Loader from '@/components/Loader';
// import { useLoading } from '@/hooks/useLoading';
import { useLoading } from '../hooks/useLoading';
import { fetchHeroSections } from '@/store/slices/heroSectionSlice';
import { fetchCollections } from '@/store/slices/collectionSlice';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function HomeContent() {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useLoading();

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchHeroSections());
        await dispatch(fetchCollections());
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, [dispatch]);

  if (isLoading) {
    return <Loader isLoading={true} />;
  }

  return (
    // <ErrorBoundary>
      <main className="min-h-screen">
        <div>
          <HeroSection />
          <Category />
          <Product />
          <MiniSection />
          <Banner />
          <TrustedBy />
        </div>
      </main>
    // </ErrorBoundary>
  );
}
