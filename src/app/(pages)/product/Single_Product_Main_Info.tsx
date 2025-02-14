"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Minus, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { addToCart, createCart } from '../../../store/slices/cartSlice';
import { Product, Weight } from '@/types/product';

interface SingleProductMainInfoProps {
  product: Product;
  title: string;
  features: string[];
  rating: number;
  reviews: number;
  variants: {
    id: string;
    title: number;
    original_price: number; // Regular price
    sale_price: number;    // Discounted price
    inventory: number;
  }[];
  selectedVariantId: string;
  onVariantChange: (id: string) => void;
  price: number;
  discountedPrice: number;
  description: string;
}

const Single_Product_Main_Info = ({
  product,
  title,
  features,
  rating,
  reviews,
  variants,
  selectedVariantId,
  onVariantChange,
  price,
  discountedPrice,
  description,
}: SingleProductMainInfoProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { cart, loading } = useSelector((state: RootState) => state.cart);
  
  const [quantity, setQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentVariantId, setCurrentVariantId] = useState(selectedVariantId || variants[0]?.id);

  const handleQuantityChange = (action: "increase" | "decrease") => {
    if (action === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleVariantChange = (id: string) => {
    setCurrentVariantId(id);
    const selectedVariant = variants.find(v => v.id === id);
    if (selectedVariant) {
      onVariantChange(id);
    }
  };

  const handleAddToCart = async () => {
    try {
      const currentVariant = variants.find(v => v.id === currentVariantId);
      if (!currentVariant) return;

      // Transform to match Weight interface
      const weights: Weight[] = variants.map(v => ({
        id: 0, // Default value
        documentId: v.id,
        weight_Value: v.title,
        original_Price: v.original_price,
        sale_Price: v.sale_price,
        inventory: [] // Empty array since we don't have inventory data
      }));

      const weightIndex = variants.findIndex(v => v.id === currentVariantId);
      
      await dispatch(addToCart({
        product: {
          ...product,
          weights
        },
        weightIndex,
        quantity
      }));
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const calculateDiscount = () => {
    if (!discountedPrice || !price) return 0;
    return Math.round(((price - discountedPrice) / price) * 100);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-semibold mb-2">
        {title}
      </motion.h1>

      <motion.p variants={itemVariants} className="text-gray-400 font-semibold">
        {features.join(" | ")}
      </motion.p>

      <motion.div variants={itemVariants} className="flex items-center gap-2 mb-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-xl ${
                i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-gray-600">{reviews} reviews</span>
      </motion.div>

      <motion.div variants={itemVariants} className="relative mb-6">
        <p
          className={`product_description text-gray-700 text-sm transition-all duration-300 ${
            isExpanded ? "" : "line-clamp-2"
          }`}
        >
          {description}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-red-600 text-sm font-medium flex items-center gap-1 hover:text-red-700 mt-1"
        >
          {isExpanded ? (
            <>
              Show Less
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show More
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6">
        {discountedPrice < price ? (
          <>
            <span className="text-2xl font-bold text-red-600">₹{discountedPrice}</span>
            <span className="text-xl text-gray-500 line-through">₹{price}</span>
            <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">
              {Math.round(((price - discountedPrice) / price) * 100)}% OFF
            </span>
          </>
        ) : (
          <span className="text-2xl font-bold">₹{price}</span>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6">
        <p className="font-medium mb-2">Weight:</p>
        <div className="flex gap-2">
          {variants.map((variant) => (
            <motion.button
              key={variant.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-0.5 rounded-full border ${
                variant.id === currentVariantId
                  ? 'bg-red-600 text-white border-red-700'
                  : 'border-gray-300 hover:border-red-700'
              }`}
              onClick={() => handleVariantChange(variant.id)}
            >
              {variant.title}g
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-8 mb-6">
        <div className="flex items-center border border-red-600 rounded-full py-1.5 px-0.5">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleQuantityChange("decrease")}
            className="p-2 hover:bg-gray-100"
          >
            <Minus className="w-4 h-4" />
          </motion.button>
          <span className="w-12 text-center">{quantity}</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleQuantityChange("increase")}
            className="p-2 hover:bg-gray-100"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-4 mb-6">
        <motion.button
          onClick={handleAddToCart}
          whileHover={{ scale: 1.05, backgroundColor: "black", color: "white" }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 max-sm:py-0 max-sm:text-xs border border-red-600 rounded-full"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'ADD TO CART'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "black" }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 max-sm:py-0 max-sm:text-xs bg-red-600 text-white rounded-full"
        >
          BUY IT NOW
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 border border-red-600 rounded-full hover:bg-gray-50"
        >
          <Heart className="w-6 h-6" />
        </motion.button>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="grid grid-cols-4 gap-4 mb-6"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="text-center flex flex-col items-center"
          >
            <Image
              width={12}
              height={12}
              src="/images/single_product_bulk_inquiry_img.svg"
              className="w-12"
              alt={feature}
            />
            <p className="text-sm text-gray-600">{feature}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Single_Product_Main_Info;