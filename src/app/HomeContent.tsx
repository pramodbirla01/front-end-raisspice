'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import HeroSection from "./components/HeroSection";
import Category from "./components/Category";
import Banner from "./components/Banner";
import Product from "./components/Product";
import MiniSection from "./components/Mini-Section";
import TrustedBy from "./components/TrustedBy";
import Loader from '@/components/Loader';
import { useLoading } from '../hooks/useLoading';
import { fetchHeroSections } from '@/store/slices/heroSectionSlice';
import { fetchCollections } from '@/store/slices/collectionSlice';
import ErrorBoundary from '@/components/ErrorBoundary';
import Blog from './components/Blog';

export default function HomeContent() {
  const dispatch = useDispatch<AppDispatch>();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const heroSectionData = useSelector((state: RootState) => state.heroSection.heroSections);
  const collectionsData = useSelector((state: RootState) => state.collections.collections);
  const loading = useSelector((state: RootState) => 
    state.heroSection.loading || state.collections.loading
  );

  useEffect(() => {
    if (!isInitialized) {
      const initializeData = async () => {
        try {
          await Promise.all([
            dispatch(fetchHeroSections()),
            dispatch(fetchCollections())
          ]);
        } catch (error) {
          console.error('Failed to load data:', error);
        } finally {
          setIsInitialized(true);
        }
      };
      initializeData();
    }
  }, [dispatch, isInitialized]);

  if (loading && !isInitialized) {
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
          <Blog/>
          <TrustedBy />
        </div>
      </main>
    // </ErrorBoundary>
  );
}
