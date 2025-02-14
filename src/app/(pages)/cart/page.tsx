"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { fetchCart, updateCartItem, removeCartItem } from '../../../store/slices/cartSlice';
import { CartItem } from '../../../types/cart';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      when: "beforeChildren",
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const ShoppingCartPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cart, loading } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    dispatch(fetchCart()).catch(() => {
      // Handle error if needed
    });
  }, [dispatch]);

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!cart) return;
    await dispatch(updateCartItem({
      lineId,
      quantity,
    }));
  };

  const removeProduct = async (lineId: string) => {
    if (!cart) return;
    await dispatch(removeCartItem({
      lineId,
    }));
  };

  const renderCartItem = (item: CartItem) => (
    <motion.div
      key={item.id}
      className="bg-white rounded-xl shadow-premium hover:shadow-premium-hover p-6 transition-all duration-300"
      variants={itemVariants}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Image
          src={item.thumbnail}
          alt={item.name}
          width={100}
          height={100}
          className="w-24 h-24 object-cover rounded sm:w-28 sm:h-28"
        />
        <div className="flex-1 space-y-2">
          <div>
            <h3 className="font-medium text-lg">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.weight.weight_Value}g</p>
            <p className="text-sm text-gray-600">
              Original Price: ₹{item.weight.original_Price}
            </p>
          </div>
          <motion.button
            onClick={() => removeProduct(item.id)}
            className="text-sm text-blue-600 hover:underline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Remove
          </motion.button>
        </div>
        <div className="flex sm:flex-col items-center gap-3 w-full sm:w-auto justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              -
            </motion.button>
            <span className="w-8 text-center">{item.quantity}</span>
            <motion.button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              +
            </motion.button>
          </div>
          <motion.div
            className="text-right font-medium text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={item.weight.sale_Price * item.quantity}
          >
            ₹{item.weight.sale_Price * item.quantity}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bgColor to-lightBgColor">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.h1
          className="text-center font-bold text-4xl md:text-5xl text-gray-800 mb-4"
          variants={itemVariants}
        >
          Your Shopping Cart
        </motion.h1>
        <motion.p
          className="text-center text-lg md:text-xl text-gray-600 mb-12"
          variants={itemVariants}
        >
          Complete your purchase and experience the finest spices
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Cart Items */}
          <div className="space-y-6">
            {cart?.items.map(renderCartItem)}
          </div>

          {/* Summary Card */}
          <motion.div
            className="lg:sticky lg:top-6 bg-white rounded-xl shadow-premium p-6 h-fit border border-gold-200"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
            <div className="space-y-4">
              <motion.div
                className="flex justify-between items-center text-xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={cart?.total}
              >
                <span>Total</span>
                <span>₹ {cart?.total || 0}</span>
              </motion.div>
              <p className="text-gray-500">Shipping calculated at checkout.</p>
              <Link href="/checkout">
                <motion.button
                  className="w-full bg-gradient-to-r from-darkRed to-darkestRed hover:from-darkestRed hover:to-darkRed text-white py-4 px-6 rounded-lg transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Proceed to Checkout
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ShoppingCartPage;
