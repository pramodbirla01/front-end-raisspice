"use client"

import React, { useState, useEffect } from 'react';
import { Leaf, Smile, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
  isInView: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, index, isInView }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
    transition={{ duration: 0.6, delay: index * 0.2 }}
    whileHover={{ y: -5 }}
    className="flex flex-col items-center text-center p-8 space-y-4 rounded-lg border border-darkRed/10 relative overflow-hidden"
  >
    {/* Background image div */}
    <div 
      className="absolute inset-0"
      style={{
        backgroundImage: `url('/images/product-card.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.2,
      }}
    />
    
    {/* Content with higher z-index */}
    <div className="relative z-10 flex flex-col items-center space-y-4 w-full">
      <motion.div 
        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
        className="text-darkRed p-3 bg-white/80 backdrop-blur-sm rounded-full"
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-semibold text-darkRed">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  </motion.div>
);

const MiniSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const features = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Pure for Sure",
      description: "For years, we've been dedicated to providing our customers with the finest, unadulterated spices, and we'll continue to uphold this promise"
    },
    {
      icon: <Smile className="w-8 h-8" />,
      title: "Flavourful",
      description: "Our cutting-edge technology ensures our blends retain their flavor, aroma, and color for an extended period, resulting in a longer shelf life and unparalleled freshness."
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "Hygienically Packed",
      description: "From cleaning to packaging, our fully automated process eliminates human contact, ensuring absolute purity and quality for our customers."
    }
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSignificantSwipe = Math.abs(distance) > 75;

    if (isSignificantSwipe) {
      if (distance > 0 && currentSlide < features.length - 1) {
        setCurrentSlide(prev => prev + 1);
      } else if (distance < 0 && currentSlide > 0) {
        setCurrentSlide(prev => prev - 1);
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const goToPrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const goToNextSlide = () => {
    if (currentSlide < features.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  return (
    <section ref={ref} className="w-full py-20 px-4 bg-gradient-to-b from-bgColor to-lightBgColor">
      <div className="w-[90%] max-sm:w-[95%] 2xl:w-[70%] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-darkRed mb-4">
            Rai&apos;s Spices: Your Best Choice for Spices
          </h2>
          <motion.div 
            className="w-24 h-0.5 bg-darkRed mx-auto"
            initial={{ width: 0 }}
            animate={isInView ? { width: 96 } : { width: 0 }}
            transition={{ duration: 0.8 }}
          />
        </motion.div>

        {isMobile ? (
          <div className="relative">
            <motion.div 
              className="overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="w-full flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {features.map((feature, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <FeatureCard
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                      index={index}
                      isInView={isInView}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Navigation Buttons */}
            <button
              onClick={goToPrevSlide}
              className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white/40 rounded-full shadow-md ${
                currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'
              }`}
              disabled={currentSlide === 0}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            
            <button
              onClick={goToNextSlide}
              className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md ${
                currentSlide === features.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'
              }`}
              disabled={currentSlide === features.length - 1}
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
            
            {/* Dot Navigation */}
            <div className="flex justify-center items-center space-x-2 mt-8">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'bg-darkRed w-4' : 'bg-darkRed/30'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.2 }}
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
                isInView={isInView}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default MiniSection;