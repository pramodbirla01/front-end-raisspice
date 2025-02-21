"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/app/components/Pagination";
import Product_Display_Navigation from "./Product_Display_Navigation";
import Product_Display_Category from "./Product_Display_Category";
import Product_Display_Availablity from "./Product_Display_Availablity";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts, setFilters, setPage } from "@/store/slices/productSlice";
import ProductCard from "@/app/components/ProductCard";
import { Product } from '@/types/product';
import ShopHeader from './ShopHeader';
import { getFullImageUrl } from "@/utils/imageUtils";
import { useSearchParams } from 'next/navigation';
import { testAppwriteConnection } from '@/utils/testAppwrite';
import Loader from '@/components/Loader';

const ProductPage = () => {
  const searchParams = useSearchParams();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const { products, loading, filters, pagination } = useAppSelector((state) => state.products);
  const hasMorePages = pagination.total > pagination.pageSize * pagination.page;

  // Add currentPage state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Number of items per page

  // Only run animations after component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch products on mount with a larger limit
  useEffect(() => {
    // Test Appwrite connection
    testAppwriteConnection().then(success => {
      console.log('Appwrite connection test:', success ? 'Success' : 'Failed');
    });

    // Existing fetch products call
    dispatch(fetchProducts({
      page: 1,
      pageSize: itemsPerPage // Use consistent page size
    }));
  }, [dispatch]);

  // Update category from URL when it changes
  useEffect(() => {
    const categorySlug = searchParams.get('category');
    if (categorySlug) {
      dispatch(setFilters({
        ...filters,
        categorySlug
      }));
    }
  }, [searchParams]);

  // Fetch products when filters change
  useEffect(() => {
    if (filters.categorySlug || filters.collection_id) {
      setCurrentPage(1); // Reset to first page when filters change
      dispatch(fetchProducts({
        page: 1,
        pageSize: itemsPerPage,
        categorySlug: filters.categorySlug,
        collection_id: filters.collection_id,
      }));
    }
  }, [filters]);

  // Separate effect for page changes
  useEffect(() => {
    if (currentPage > 1) {
      dispatch(fetchProducts({
        page: currentPage,
        pageSize: itemsPerPage,
        categorySlug: filters.categorySlug,
        collection_id: filters.collection_id,
      }));
    }
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadMore = () => {
    dispatch(setPage(pagination.page + 1));
  };

  // Update these helper functions to match the correct price logic
  const getProductPrice = (product: Product) => {
    return product.local_price?.[0] || 0;  // Original price
  };

  const getProductDiscount = (product: Product) => {
    return product.sale_price?.[0] || 0;   // Sale price
  };

  const renderProductsContent = () => {
    if (loading) {
      return <Loader isLoading={true} />;
    }

    if (!products?.length) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
          <img 
            src="/images/no-products.png" 
            alt="No products found" 
            className="w-48 h-48 mb-4 opacity-50"
          />
          <h3 className="text-2xl font-medium text-gray-800 mb-2">
            No Products Found
          </h3>
          <p className="text-gray-600 max-w-md">
            We couldn't find any products matching your current filters. 
            Try adjusting your search or filter criteria.
          </p>
        </div>
      );
    }

    // Remove client-side slicing, use server pagination instead
    return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product) => (
            <motion.div
              key={product.$id}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <ProductCard
                key={product.$id}
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
                sizes={product.weight.map(w => `${w}g`)}
                weight={product.weight}
                category={product.category}
                local_price={product.local_price}
                sale_price={product.sale_price}
                description={product.description}
                component="shop"
                slug={product.$id}
              />
            </motion.div>
          ))}
        </div>

        {pagination.total > itemsPerPage && (
          <Pagination 
            currentPage={currentPage}
            totalPages={Math.ceil(pagination.total / itemsPerPage)}
            onPageChange={handlePageChange}
          />
        )}
      </>
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const sidebarVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  if (!mounted) {
    return null; // Return null on server-side
  }

  return (
    <section className="product_display_page relative bg-gradient-to-b from-bgColor to-lightBgColor min-h-screen pt-20">
      <motion.div
        className="product_display_container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <ShopHeader />
        
        <div className="relative">
          <Product_Display_Navigation isToggle={() => setShowDropdown(!showDropdown)} />

          <div className="product_display_main w-full grid grid-cols-[300px_1fr] max-lg:grid-cols-1 gap-8 mt-8">
            <motion.div
              className="product_display_category max-lg:hidden w-full space-y-6"
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
            >
              <Product_Display_Category />
              <Product_Display_Availablity />
            </motion.div>

            <motion.div
              className="product_display_product w-full"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {renderProductsContent()}
              
              {products.length > 0 && (
                <div className="mt-8">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={Math.ceil(products.length / itemsPerPage)}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            className="product_display_category_in_mobile flex flex-col w-[350px] max-sm:w-[300px] min-h-screen bg-lightBgColor p-4 fixed top-0 left-0 lg:hidden z-50 shadow-premium"
            initial={{ x: -350 }}
            animate={{ x: 0 }}
            exit={{ x: -350 }}
            transition={{ duration: 0.3 }}
          >
            <div className="product_display_mobile_heading flex justify-between items-center text-xl border-b border-gold-200 pb-4">
              <p className="text-darkRed font-medium">Filters</p>
              <IoClose
                onClick={() => setShowDropdown(false)}
                className="text-2xl cursor-pointer text-darkRed hover:text-lightRed transition-colors"
              />
            </div>
            <Product_Display_Category />
            <Product_Display_Availablity />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProductPage;