"use client"

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchHeroSections } from '@/store/slices/heroSectionSlice';
import { AppDispatch } from '@/store/store';
import { getStorageFileUrl } from '@/lib/appwrite';

const HeroSection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { heroSections, loading, error } = useSelector((state: RootState) => state.heroSection);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    dispatch(fetchHeroSections());
  }, [dispatch]);

  useEffect(() => {
    if (heroSections.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSections.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [currentSlide, heroSections]);

  const getImageUrl = (fileId: string) => {
    try {
      // If the fileId is already a full URL, use it directly
      if (fileId.startsWith('http')) {
        return fileId;
      }
      // Otherwise, generate the preview URL
      return getStorageFileUrl(fileId);
    } catch (error) {
      console.error('Error getting image URL:', error);
      return '/fallback-image.jpg';
    }
  };

  if (loading) return (
    <div className="w-full h-[calc(100vh-6rem)] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
    </div>
  );
  
  if (error) return (
    <div className="w-full h-[calc(100vh-6rem)] flex items-center justify-center text-red-800">
      Error: {error}
    </div>
  );
  
  if (!heroSections.length) return null;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSections.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSections.length) % heroSections.length);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-[calc(100vh-6rem)] mt-20 bg-bgColor max-lg:h-[80vh]"
    >
      <div className="w-[95%] mx-auto h-full rounded-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7 }}
            className="relative h-full w-full"
          >
            {/* Image */}
            <div className="absolute inset-0">
              <Image
                width={1920}
                height={1080}
                src={getImageUrl(heroSections[currentSlide].image)}
                alt={heroSections[currentSlide].heading}
                className="w-full h-full object-cover"
                priority
                unoptimized // Add this to bypass Next.js image optimization
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 w-full flex items-center z-10">
              <div className="container w-full flex justify-start mx-auto px-6 md:px-12">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="max-w-lg w-full"
                >
                  <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    {heroSections[currentSlide].heading}
                  </h2>
                  <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                    {heroSections[currentSlide].sub_text}
                  </p>
                  <Link href={`/${heroSections[currentSlide].slug}`}>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-orange-400 hover:bg-btnHover text-white rounded-md transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-orange-400/30"
                    >
                      {heroSections[currentSlide].button}
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Controls - Only show if multiple slides exist */}
          {heroSections.length > 1 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-all duration-300"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-all duration-300"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>

              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
                {heroSections.map((_, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-orange-400 w-6' 
                        : 'bg-white/50 hover:bg-white'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default HeroSection;