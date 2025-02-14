import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { searchProducts, clearSearch } from '@/store/slices/searchSlice';
import { RootState, AppDispatch } from '@/store/store';
import { useDebounce } from '@/hooks/useDebounce';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getStorageFileUrl } from '@/lib/appwrite';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { searchResults, loading } = useSelector((state: RootState) => state.search);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const performSearch = async () => {
      try {
        if (debouncedQuery.trim().length >= 2) {
          await dispatch(searchProducts(debouncedQuery)).unwrap();
        } else {
          dispatch(clearSearch());
        }
      } catch (error) {
        console.error('Search failed:', error);
      }
    };

    performSearch();
  }, [debouncedQuery, dispatch]);

  const handleClose = () => {
    setQuery('');
    dispatch(clearSearch());
    onClose();
  };

  const handleProductClick = (productId: string) => {
    handleClose();
    router.push(`/product/${productId}`);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black/50 transition-all duration-300 ${
      isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
    }`}>
      <div className={`w-full bg-white transition-transform duration-300 ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="container mx-auto px-4 py-4">
          {/* Updated Search Input */}
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Start typing to search products..."
              className="w-full pl-12 pr-10 h-12 focus:border-darkRed outline-none text-lg"
            />
            <button onClick={handleClose} className="absolute right-4">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Results */}
          <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-lg border border-gray-500">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-darkRed border-t-transparent mx-auto"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {searchResults.map((product) => (
                  <div
                    key={product.$id}
                    className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4"
                    onClick={() => handleProductClick(product.$id)}
                  >
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-500">
                        ₹{product.sale_price[0] || product.local_price[0]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : query.trim().length >= 2 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No matches found for "{query}"</p>
                <p className="mt-2 text-sm">Try different keywords or browse our categories</p>
              </div>
            ) : query.trim().length > 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Keep typing to find products...</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
