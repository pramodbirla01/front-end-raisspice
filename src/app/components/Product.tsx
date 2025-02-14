"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchProducts, setFilters, setProducts } from "@/store/slices/productSlice";
import { fetchCollections } from "@/store/slices/collectionSlice";
import ProductCard from "./ProductCard";
import { motion, useInView } from "framer-motion";
import { Collection } from '@/types/collection';
import { Product } from '@/types/product';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { getStorageFileUrl } from '@/lib/appwrite';

interface ProductComponentProps {}

const ProductComponent: React.FC<ProductComponentProps> = () => {
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const { products, loading } = useSelector((state: RootState) => state.products);
  const { collections } = useSelector((state: RootState) => state.collections);

  useEffect(() => {
    fetchInitialProducts();
    dispatch(fetchCollections());
  }, [dispatch]);

  const fetchInitialProducts = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID!,
        [Query.limit(4)] // Fetch only first 4 products initially
      );

      if (!response || !response.documents) {
        dispatch(setProducts([]));
        return;
      }

      const mappedProducts = response.documents.map(product => ({
        $id: product.$id,
        name: product.name,
        description: product.description,
        category: product.category || [],
        weight: product.weight || [],
        image: getStorageFileUrl(product.image), // Convert image ID to full URL
        additionalImages: (product.additionalImages || []).map((imgId: string) => getStorageFileUrl(imgId)),
        stock: product.stock || 0,
        product_collection: product.product_collection || [],
        local_price: product.local_price || [0],
        sale_price: product.sale_price || [0]
      }));

      dispatch(setProducts(mappedProducts));
    } catch (error) {
      console.error('Error fetching initial products:', error);
      dispatch(setProducts([]));
    }
  };

  const handleCollectionClick = async (collectionId: string | null) => {
    if (collectionId === null) {
      fetchInitialProducts();
      setActiveCollection(null);
      return;
    }
    
    setActiveCollection(collectionId);
    
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID!,
        [
          Query.limit(100),
          Query.contains('product_collection', collectionId) // Fix: Use contains() instead of equal()
        ]
      );

      const filteredProducts = response.documents.filter(product => 
        Array.isArray(product.product_collection) && 
        product.product_collection.includes(collectionId)
      ).slice(0, 4); // Take only first 4 filtered products

      const mappedProducts = filteredProducts.map(product => ({
        $id: product.$id,
        name: product.name,
        description: product.description,
        category: product.category || [],
        weight: product.weight || [],
        image: getStorageFileUrl(product.image),
        additionalImages: (product.additionalImages || []).map((imgId: string) => getStorageFileUrl(imgId)),
        stock: product.stock || 0,
        product_collection: product.product_collection || [],
        local_price: product.local_price || [0],
        sale_price: product.sale_price || [0]
      }));

      dispatch(setProducts(mappedProducts));
    } catch (error) {
      console.error('Error fetching collection products:', error);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollPosition = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="product_page bg-gradient-to-b from-bgColor to-lightBgColor py-12"
    >
      <div className="product_page_inner w-[95%] 2xl:w-[85%] mx-auto">
        {/* Enhanced Header Section with Side-by-side Layout */}
        <motion.div
          variants={itemVariants}
          className="relative mb-12"
        >
          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-4">
            {/* Title Section */}
            <div className="space-y-2">
              <motion.div 
                className="inline-block px-3 py-1 bg-darkRed/10 rounded-full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-darkRed text-xs font-semibold">Premium Selection</span>
              </motion.div>
              <motion.h3 
                className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight"
                variants={itemVariants}
              >
                Featured Products
              </motion.h3>
              <motion.p 
                className="text-gray-600 text-sm max-w-md lg:hidden"
                variants={itemVariants}
              >
                Discover our handpicked premium spice collection
              </motion.p>
            </div>

            {/* Chips Section - Desktop */}
            <div className="hidden lg:block">
              <div className="flex gap-3 items-center">
                <motion.button
                  key="all"
                  onClick={() => handleCollectionClick(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-shrink-0 py-2 px-5 text-sm font-medium rounded-full transition-all duration-300 ${
                    activeCollection === null 
                    ? 'bg-gradient-to-r from-darkRed to-red-700 text-white shadow-md' 
                    : 'border border-gray-200 hover:border-darkRed/30'
                  }`}
                >
                  All Products
                </motion.button>

                {collections.map((collection: Collection) => (
                  <motion.button
                    key={collection.documentId} // Use documentId as key instead of id
                    onClick={() => handleCollectionClick(collection.documentId)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-shrink-0 py-2 px-5 text-sm font-medium rounded-full transition-all duration-300 ${
                      activeCollection === collection.documentId
                      ? 'bg-gradient-to-r from-darkRed to-red-700 text-white shadow-md' 
                      : 'border border-gray-200 hover:border-darkRed/30'
                    }`}
                  >
                    {collection.name}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Chips Section - Mobile */}
            <div className="lg:hidden w-full overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 items-center pb-2">
                {/* Same buttons as desktop but with smaller text */}
                <motion.button
                  key="all"
                  onClick={() => handleCollectionClick(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-shrink-0 py-1.5 px-4 text-xs font-medium rounded-full transition-all duration-300 ${
                    activeCollection === null 
                    ? 'bg-gradient-to-r from-darkRed to-red-700 text-white shadow-md' 
                    : 'border border-gray-200 hover:border-darkRed/30'
                  }`}
                >
                  All Products
                </motion.button>

                {collections.map((collection: Collection) => (
                  <motion.button
                    key={collection.documentId} // Use documentId as key instead of id
                    onClick={() => handleCollectionClick(collection.documentId)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-shrink-0 py-1.5 px-4 text-xs font-medium rounded-full transition-all duration-300 ${
                      activeCollection === collection.documentId
                      ? 'bg-gradient-to-r from-darkRed to-red-700 text-white shadow-md' 
                      : 'border border-gray-200 hover:border-darkRed/30'
                    }`}
                  >
                    {collection.name}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Grid - Adjusted for larger cards */}
        <motion.div 
          variants={containerVariants}
          className="popular_product_content relative"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {loading ? (
              // Loading skeleton - adjusted size
              [...Array(4)].map((_, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white rounded-xl p-6 shadow-premium animate-pulse"
                >
                  <div className="w-full h-72 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                </motion.div>
              ))
            ) : (
              products && products.length > 0 ? (
                products.map((product: Product) => (
                  <motion.div
                    key={`motion-${product.$id}`}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="transform transition-all duration-300 min-w-[280px] w-full"
                  >
                    <ProductCard
                      key={`product-${product.$id}`}
                      id={product.$id}
                      title={product.name}
                      image={[{ 
                        url: product.image,
                        id: product.$id,
                        alt: product.name 
                      }]}
                      additionalImages={product.additionalImages}
                      price={product.local_price[0]}
                      discount={product.sale_price[0]}
                      sizes={product.weight?.map(w => `${w}g`) || []}
                      weight={product.weight || []}
                      category={product.category}
                      local_price={product.local_price}
                      sale_price={product.sale_price}
                      description={product.description}
                      component="product"
                      slug={product.name.toLowerCase().replace(/ /g, '-')}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No products found</p>
                </div>
              )
            )}
          </div>
        </motion.div>

        {/* View All Products Button */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-darkRed to-darkestRed text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            View All Products
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductComponent;