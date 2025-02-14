"use client";

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuthStatus } from '@/store/slices/customerSlice';
import { AppDispatch } from '@/store/store';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
