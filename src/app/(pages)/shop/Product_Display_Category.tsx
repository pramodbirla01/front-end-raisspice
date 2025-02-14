"use client";

import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/categorySlice';
import { setFilters } from '@/store/slices/productSlice';
import { databases } from '@/lib/appwrite';
import { useSearchParams, useRouter } from 'next/navigation';
import { Collection, AppwriteCollection } from '@/types/product';
import { Models } from 'appwrite';

const Product_Display_Category = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector(state => state.productCategories);
  const { filters } = useAppSelector(state => state.products);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    dispatch(fetchCategories());
    fetchCollectionsData();
  }, [dispatch]);

  const fetchCollectionsData = async () => {
    try {
      const response = await (databases.listDocuments as (
        databaseId: string,
        collectionId: string,
        queries?: string[]
      ) => Promise<Models.DocumentList<AppwriteCollection>>)(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COLLECTION_ID!
      );
      
      // Transform Appwrite documents to Collection type
      const transformedCollections: Collection[] = response.documents.map((doc: Models.Document) => ({
        $id: doc.$id,
        name: doc.name as string  // Type assertion since we know the structure
      }));
      
      setCollections(transformedCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const handleCategoryClick = (categoryId: string | null) => {
    if (categoryId) {
      router.push(`/shop?category=${categoryId}`);
      dispatch(setFilters({
        ...filters,
        categorySlug: categoryId // Pass as single string
      }));
    } else {
      router.push('/shop');
      dispatch(setFilters({
        ...filters,
        categorySlug: undefined
      }));
    }
  };

  const handleCollectionClick = (collectionId: string | null) => {
    dispatch(setFilters({
      ...filters,
      collection_id: collectionId // Remove array wrapper, handled in slice
    }));
  };

  return (
    <div className="space-y-6">
      {/* Categories Section */}
      <div className="w-full bg-lightBgColor rounded-lg shadow-premium p-4">
        <div className="border-b border-gold-200">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full py-4 flex justify-between items-center group"
          >
            <h2 className="text-lg font-medium text-darkRed">Product Categories</h2>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-darkRed group-hover:text-lightRed" />
            ) : (
              <ChevronDown className="w-5 h-5 text-darkRed group-hover:text-lightRed" />
            )}
          </button>
        </div>
        
        {isOpen && (
          <div className="mt-4">
            {loading ? (
              <div className="py-4 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-darkRed border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <ul className="space-y-2">
                <li key="all-categories">
                  <button
                    onClick={() => handleCategoryClick(null)}
                    className={`w-full px-3 py-2 text-left rounded-md transition-colors
                      ${!searchParams.get('category') ? 'bg-bgColor text-darkRed font-medium' : 'text-gray-600 hover:text-darkRed'}
                    `}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category.$id}>
                    <button
                      onClick={() => handleCategoryClick(category.$id)}
                      className={`w-full px-3 py-2 text-left rounded-md transition-colors
                        ${searchParams.get('category') === category.$id 
                          ? 'bg-bgColor text-darkRed font-medium' 
                          : 'text-gray-600 hover:text-darkRed'}
                      `}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Collections Section */}
      <div className="bg-lightBgColor rounded-lg shadow-premium p-4">
        <div className="border-b border-gold-200">
          <h2 className="text-lg font-medium text-darkRed py-4">Collections</h2>
        </div>
        <div className="mt-4">
          <ul className="space-y-2">
            {collections.map(collection => (
              <li key={collection.$id}>
                <button
                  onClick={() => handleCollectionClick(collection.$id)}
                  className={`w-full px-3 py-2 text-left rounded-md transition-colors
                    ${filters.collection_id === collection.$id
                      ? 'bg-bgColor text-darkRed font-medium'
                      : 'text-gray-600 hover:text-darkRed'}
                  `}
                >
                  {collection.name} {/* Changed from collection_name to name */}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Product_Display_Category;