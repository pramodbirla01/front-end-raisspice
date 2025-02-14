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

export default function HomeContent() {
  const dispatch = useDispatch<AppDispatch>();
  const [dataFetched, setDataFetched] = useState(false);
  
  // Update selectors to match your state structure
  const heroSectionData = useSelector((state: RootState) => state.heroSection.heroSections);
  const collectionsData = useSelector((state: RootState) => state.collections.collections);
  
  useEffect(() => {
    if (!dataFetched) {
      const loadData = async () => {
        try {
          await Promise.all([
            dispatch(fetchHeroSections()),
            dispatch(fetchCollections())
          ]);
        } catch (error) {
          console.error('Failed to load data:', error);
        } finally {
          setDataFetched(true);
        }
      };
      loadData();
    }
  }, [dispatch, dataFetched]);

  // Show loader only during initial data fetch
  if (!dataFetched) {
    return <Loader isLoading={true} />;
  }

  // Update the checks to match the new state structure
  if (!heroSectionData?.length || !collectionsData?.length) {
    return <div>No data available</div>;
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
