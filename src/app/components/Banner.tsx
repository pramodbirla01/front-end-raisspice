"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Banner() {
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.2 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="banner w-full grid grid-cols-2 gap-0 max-lg:grid-cols-1 min-h-[400px] max-lg:min-h-[700px]">
      {/* Left Content Section */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-col justify-center items-start p-12 max-lg:p-8 space-y-6 bg-gradient-to-r from-[#942c23] to-[#b13b31] text-white h-[400px] max-lg:h-[400px]"
      >
        <motion.h1 
          variants={textVariants}
          className="text-5xl max-lg:text-4xl max-md:text-3xl font-bold tracking-tight leading-tight"
        >
          Quality Promises<br/>
          <span className="text-yellow-300">Premium Spices</span>
        </motion.h1>
        
        <motion.p 
          variants={textVariants}
          className="text-lg max-lg:text-base leading-relaxed opacity-90 max-w-xl"
        >
          Experience the authentic taste of premium spices, carefully sourced and 
          expertly crafted to elevate your culinary creations to new heights.
        </motion.p>
        
        <motion.button 
          variants={textVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 py-3 px-8 text-lg font-semibold text-white bg-[#cf934a] transition-all duration-300 rounded-md shadow-lg hover:bg-[#b57c3a] hover:shadow-xl"
        >
          Shop Now
        </motion.button>
      </motion.div>
      
      {/* Right Image Section */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative flex justify-center items-center bg-gradient-to-b from-[#f5f5f5] to-[#e5e5e5] overflow-hidden h-[400px] max-lg:h-[300px]"
      >
        <motion.div
          variants={imageVariants}
          className="relative w-full h-full"
        >
          <Image
            fill
            src="/images/highresolimg.jpeg" 
            alt="Premium Spices Banner" 
            className="object-cover object-center"
            priority
          />
        </motion.div>
      </motion.div>
    </div>
  );
}