"use client"

import React, { useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchCart, updateCartItem, removeCartItem, refreshCartExpiry, createCart, setCartOpen } from '../../store/slices/cartSlice';
import { motion } from 'framer-motion';
import { CartItem } from '../../types/cart';
import { useRouter } from 'next/navigation';

interface ShoppingCartProps {
  onClose: () => void;
}

const ShoppingCart_Sidebar: React.FC<ShoppingCartProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { cart, loading, isCartOpen } = useSelector((state: RootState) => state.cart);
  const router = useRouter();

  useEffect(() => {
    if (isCartOpen) {
      dispatch(fetchCart()).catch(() => {
        dispatch(createCart());
      });
    }
  }, [dispatch, isCartOpen]);

  // Add auto-refresh functionality
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (cart) {
        dispatch(refreshCartExpiry());
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(refreshInterval);
  }, [cart, dispatch]);

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!cart) return;
    // Enforce minimum quantity of 1
    const newQuantity = Math.max(1, quantity);
    await dispatch(updateCartItem({
      lineId,
      quantity: newQuantity,
    }));
  };

  const removeItem = async (lineId: string) => {
    if (!cart) return;
    await dispatch(removeCartItem({
      lineId,
    }));
  };

  const handleViewCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(setCartOpen(false));
    setTimeout(() => {
      router.push('/cart');
    }, 100);
  };

  const handleCheckout = () => {
    if (!cart?.items?.length) {
      // Show error or notification if cart is empty
      return;
    }
    
    // Close the cart sidebar
    dispatch(setCartOpen(false));
    
    // Navigate to checkout with cart mode
    setTimeout(() => {
      router.push('/checkout?mode=cart');
    }, 100);
  };

  const renderCartItem = (item: CartItem) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={item.id} 
      className="flex gap-4 p-4 bg-white rounded-xl shadow-premium hover:shadow-premium-hover"
    >
      <div className="w-24 h-24 bg-gray-100 rounded">
        <Image
          width={100}
          height={100}
          src={item.thumbnail}
          alt={item.name}
          className="w-full h-full object-cover rounded"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-lg">{item.name}</h3>
        <p className="text-gray-600">
          {item.weight.weight_Value}g
        </p>
        <div className="flex items-center mt-1">
          <span className="text-lg">₹ {item.weight.sale_Price}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border rounded">
            <button
              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
              className={`p-2 ${item.quantity <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="p-2"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="text-gray-500 hover:text-gray-700"
          >
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (!isCartOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-lightestBgColor to-bgColor shadow-2xl z-[201]"
      >
        <div className="flex flex-col h-full">
          {/* Header with improved positioning */}
          <div className="sticky top-0 z-[202] flex justify-between items-center p-6 border-b border-gold-200 bg-white/50 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-gray-800">Your Cart</h2>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch(setCartOpen(false))} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </motion.button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-darkRed"></div>
              </div>
            ) : cart?.items.map(renderCartItem)}
          </div>

          {/* Footer */}
          <div className="border-t border-gold-200 p-6 bg-white/50 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold">Total</span>
              <span className="text-xl">₹ {cart?.total || 0}</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Tax included. Shipping calculated at checkout.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleViewCart}
                className="p-3 border-2 border-darkRed text-darkRed hover:bg-darkRed hover:text-white rounded-md text-center transition-all duration-300"
              >
                View cart
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="p-3 bg-darkRed text-white hover:bg-darkestRed rounded-md text-center transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!cart?.items?.length}
              >
                Checkout
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShoppingCart_Sidebar;
