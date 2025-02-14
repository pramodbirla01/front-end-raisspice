'use client';

import React, { useState, useEffect } from 'react';
import { X as CloseIcon } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/types/product';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { addToCart } from '@/store/slices/cartSlice';

interface QuickAddPopupProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: () => void;
  onCartAdd: () => void;
}

const QuickAddPopup: React.FC<QuickAddPopupProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onCartAdd,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.cart);
  
  const [mounted, setMounted] = React.useState(false);
  const [selectedWeightIndex, setSelectedWeightIndex] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const handleAddToCart = async () => {
    try {
      setError(null);
      
      // Create weights array for all available weights
      const weights = product.weight.map((weightValue, index) => ({
        id: index,  // Use index as id
        documentId: `${product.$id}_${index}`, // Create unique documentId
        weight_Value: weightValue,
        original_Price: product.local_price[index],
        sale_Price: product.sale_price?.[index] || product.local_price[index],
        inventory: []
      }));

      // Dispatch addToCart action with all weights
      await dispatch(addToCart({
        product: {
          ...product,
          weights: weights // Add all weights
        },
        weightIndex: selectedWeightIndex,
        quantity: quantity
      })).unwrap();

      // Call the provided callbacks
      onAddToCart();
      onCartAdd();
      
    } catch (err) {
      setError('Failed to add item to cart');
      console.error('Add to cart error:', err);
    }
  };

  const currentPrice = product.local_price[selectedWeightIndex] || 0;
  const currentSalePrice = product.sale_price[selectedWeightIndex] || 0;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div 
        className="bg-white p-4 sm:p-6 max-w-lg rounded-lg w-full relative z-[10000] transform transition-all duration-300 ease-out animate-scale-up"
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <CloseIcon className="h-5 w-5 text-gray-500" />
        </button>

        <div className="flex flex-col gap-4">
          {/* Row 1: Image, Name, and Price */}
          <div className="flex gap-4">
            {/* Image */}
            <div className="relative h-24 w-24 flex-shrink-0">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>

            {/* Name and Price Column */}
            <div className="flex flex-col justify-between">
              <h2 className="text-lg font-bold text-gray-800">{product.name}</h2>
              <div className="flex items-center gap-2">
                {currentSalePrice > 0 && currentSalePrice < currentPrice ? (
                  <>
                    <span className="text-lg font-bold text-red-600">
                      ₹{currentSalePrice}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ₹{currentPrice}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-gray-900">
                    ₹{currentPrice}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Weight Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Weight</label>
            <div className="flex flex-wrap gap-2">
              {product.weight.map((weight, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedWeightIndex(index)}
                  className={`
                    px-4 py-1.5 rounded-full text-sm font-medium transition-all
                    ${selectedWeightIndex === index
                      ? 'bg-red-600 text-white'
                      : 'border border-red-600 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {weight}g
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Quantity Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Quantity</label>
            <div className="flex items-center border border-red-600 rounded-full w-fit py-1.5 px-0.5">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="p-2 hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="p-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Row 4: Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className={`
                flex-1 px-8 py-3 border border-red-600 rounded-full
                hover:bg-black hover:text-white transition-colors
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {loading ? 'Adding...' : 'ADD TO CART'}
            </button>
            <button
              className="flex-1 px-8 py-3 bg-red-600 text-white rounded-full hover:bg-black transition-colors"
            >
              BUY IT NOW
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm mt-2">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default QuickAddPopup;