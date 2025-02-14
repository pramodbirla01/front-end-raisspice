"use client";

import React, { useEffect } from 'react';
import { FiArrowRight } from "react-icons/fi";
import { motion, useInView } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '@/store/slices/categorySlice';
import { RootState, AppDispatch } from '@/store/store';
import { useRouter } from 'next/navigation';
import { ProductCategory } from '@/types/product-category';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const overlayVariants = {
  rest: { 
    opacity: 0,
    y: 20
  },
  hover: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const Category = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error } = useSelector((state: RootState) => state.categories);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const router = useRouter();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await dispatch(fetchCategories()).unwrap();
        console.log('Fetched categories:', result);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, [dispatch]);

  const getDisplayText = (name: string = '') => {
    return name.split(' ')[0].toUpperCase();
  };

  const handleCategoryClick = (category: ProductCategory) => {
    if (category.$id) {
      router.push(`/shop?category=${category.$id}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[400px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-56"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="w-full h-40 flex items-center justify-center text-red-500">{error}</div>;
  }

  console.log('Rendering categories:', categories);

  return (
    <div ref={ref} id='category_section' className='w-full bg-gradient-to-br from-amber-50/80 to-white relative overflow-hidden'>
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none select-none opacity-50 overflow-hidden">
        <h1 className="absolute text-[25vw] font-black uppercase text-amber-900/20 tracking-tighter leading-none whitespace-nowrap left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          RAIS SPICES
        </h1>
      </div>

      <div className="w-[95%] 2xl:w-[70%] mx-auto py-16 relative z-20">
        <div className="relative mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <span className="block text-sm font-semibold text-amber-600 mb-2 tracking-widest uppercase">
              Explore Our Collection
            </span>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 bg-clip-text text-transparent pb-2">
              Premium Categories
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-yellow-500 mx-auto mt-4 rounded-full"></div>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((category, index) => (
              <motion.div
                key={category.$id}
                variants={itemVariants}
                initial="rest"
                whileHover="hover"
                className="relative h-56 rounded-2xl overflow-hidden shadow-lg transform-gpu cursor-pointer"
                onClick={() => handleCategoryClick(category)}
                style={{
                  backgroundImage: "url('/images/category_bg_img.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[80px] font-black text-white/70 text-center leading-none tracking-tighter px-4">
                    {getDisplayText(category.name)}
                  </span>
                </div>

                <motion.div 
                  variants={overlayVariants}
                  className="absolute inset-0 bg-gradient-to-b from-yellow-600/90 to-amber-900/95 flex flex-col justify-between p-6"
                >
                  <div className="space-y-2">
                    <span className="text-yellow-300 text-sm tracking-widest uppercase">
                      Collection {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <h3 className="font-bold text-2xl text-white tracking-wide">
                      {category.name}
                      <div className="w-12 h-0.5 bg-yellow-400 mt-2"></div>
                    </h3>
                    <p className="text-sm text-yellow-300/90">{category.sub_text}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-white/90 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-2 text-yellow-300 cursor-pointer">
                      <span className="font-medium tracking-wider text-sm">EXPLORE NOW</span>
                      <FiArrowRight className="text-lg" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No categories found</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Category;