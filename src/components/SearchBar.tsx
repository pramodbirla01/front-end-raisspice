import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { searchProducts, clearSearch } from '@/store/slices/searchSlice';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';
import Image from 'next/image';
import { getFullImageUrl } from '@/utils/imageUtils';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: {
    name: string;
  };
  Images?: Array<{
    url: string;
  }>;
  weights: Array<{
    sale_Price: number;
  }>;
}

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const dispatch = useAppDispatch();
  const { searchResults, loading } = useAppSelector((state) => state.search);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (debouncedQuery) {
      dispatch(searchProducts({ query: debouncedQuery }));
    } else {
      dispatch(clearSearch());
    }
  }, [debouncedQuery, dispatch]);

  const handleClose = () => {
    setQuery('');
    dispatch(clearSearch());
    onClose();
  };

  const handleViewAll = () => {
    handleClose();
    // Navigate to shop page with search query
    window.location.href = `/shop?q=${encodeURIComponent(query)}`;
  };

  const getProductPrice = (product: Product) => {
    const weight = product.weights[0];
    return weight ? weight.sale_Price : 0;
  };

  return (
    <div className={`
      fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300
      ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
    `}>
      <div className={`
        w-full bg-white transition-transform duration-300
        ${isOpen ? 'translate-y-0' : '-translate-y-full'}
      `}>
        <div className="container mx-auto px-4 py-4">
          {/* Search Input */}
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-12 pr-10 py-3 border-b-2 border-gray-200 focus:border-lightRed outline-none text-lg"
            />
            <button
              onClick={handleClose}
              className="absolute right-4 p-1.5 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Results */}
          <div className={`
            mt-4 max-h-[70vh] overflow-y-auto bg-gray-50 rounded-lg
            ${searchResults.length > 0 ? 'border' : ''}
          `}>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lightRed mx-auto"></div>
                <p className="mt-2 text-gray-600">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {searchResults.slice(0, 6).map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={handleClose}
                      className="flex items-center p-3 hover:bg-white rounded-lg transition-all duration-300 border border-transparent hover:border-gray-200 hover:shadow-sm"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0">
                        {product.Images?.[0] ? (
                          <Image
                            src={getFullImageUrl(product.Images[0].url)}
                            alt={product.name}
                            fill
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                            <Search className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-grow">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ₹{getProductPrice(product)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {product.category.name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                {searchResults.length > 6 && (
                  <div className="border-t p-4 bg-white">
                    <button
                      onClick={handleViewAll}
                      className="w-full py-3 text-center text-lightRed hover:bg-red-50 rounded-lg transition-colors duration-300"
                    >
                      View all {searchResults.length} products
                    </button>
                  </div>
                )}
              </>
            ) : query && !loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No products found</p>
                <p className="text-sm text-gray-500 mt-1">Try different keywords or browse our shop</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
