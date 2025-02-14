import React from 'react';
import { motion } from 'framer-motion';

const ShopHeader = () => {
  return (
    <div className="text-center  max-w-3xl mx-auto px-4">
      <motion.h1 
        className="text-4xl md:text-5xl font-bold text-darkRed mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Discover Our Collection
      </motion.h1>
      <motion.p 
        className="text-lg text-gray-600 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Explore our curated selection of premium spices and seasonings, 
        crafted to elevate your culinary experience.
      </motion.p>
    </div>
  );
};

export default ShopHeader;
