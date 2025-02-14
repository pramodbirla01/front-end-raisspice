import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ImageProps {
  id: number;
  url: string;
  alt: string;
}

interface ProductGalleryProps {
  images: ImageProps[];
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // If no images provided, return placeholder
  if (!images?.length) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
        <Image
          src="/placeholder-image.png"
          alt="No image available"
          width={400}
          height={400}
          className="w-auto h-[60%] object-contain"
        />
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <motion.div
      className="w-full lg:grid lg:grid-cols-[1fr_8fr] lg:gap-4 flex flex-col-reverse gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Thumbnails section */}
      <div className="side_img w-full px-2">
        <div className="grid grid-cols-6 gap-2 lg:grid-cols-1 lg:gap-3 lg:max-h-[600px] lg:overflow-y-auto">
          {images.map((img, index) => (
            <motion.div
              key={`thumb-${img.id || index}`} // Add fallback for key
              className={`relative flex justify-center items-center bg-center cursor-pointer transition-opacity duration-300 aspect-square ${
                currentIndex === index
                  ? 'border-2 border-black rounded-lg'
                  : 'opacity-70 hover:opacity-100'
              }`}
              onClick={() => handleThumbnailClick(index)}
            >
              <Image
                src={img.url}
                alt={img.alt}
                className="rounded-md w-auto h-full object-cover bg-center"
                width={100} // Adjust width as needed
                height={100} // Adjust height as needed
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main image section */}
      <motion.div className="w-full relative">
        <div className="aspect-square bg-lightRed relative flex justify-center items-center bg-center">
          <Image
            key={currentIndex}
            src={images[currentIndex].url}
            alt={images[currentIndex].alt}
            className="main_image rounded-md w-auto h-[60%] object-cover bg-center"
            width={800} // Adjust width for the main image
            height={800} // Adjust height for the main image
            priority // Prioritize the main image for faster loading
          />

          {/* Navigation container */}
          <div className="absolute top-0 left-0 h-full w-full">
            <div className="relative h-full flex items-center justify-between px-4">
              {/* Previous button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSlide}
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-white/80 rounded-full shadow-lg hover:bg-white transition-all duration-300 opacity-90 hover:opacity-100 focus:outline-none"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </motion.button>

              {/* Next button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSlide}
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-white/80 rounded-full shadow-lg hover:bg-white transition-all duration-300 opacity-90 hover:opacity-100 focus:outline-none"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductGallery;
