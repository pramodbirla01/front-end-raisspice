import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts } from '@/store/slices/productSlice';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { getFullImageUrl } from '@/utils/imageUtils';
import { Product, ProductFetchParams } from '@/types/product';

interface PeopleAlsoBoughtProps {
  currentProductId: string; // Change from number to string
  categorySlug: string;  // Change from categoryId to categorySlug
}

const PeopleAlsoBought: React.FC<PeopleAlsoBoughtProps> = ({ currentProductId, categorySlug }) => {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector(state => state.products);

  useEffect(() => {
    const params: ProductFetchParams = {
      page: 1,
      pageSize: 8, // Increased to ensure we have enough products after filtering
      categorySlug
    };
    dispatch(fetchProducts(params));
  }, [dispatch, categorySlug]);

  // Get similar products excluding current product
  const similarProducts = products
    .filter(product => product.$id !== currentProductId)
    .slice(0, 4); // Ensure exactly 4 products

  if (loading) {
    return (
      <div className="w-full py-12 overflow-x-auto">
        <div className="flex gap-6 min-w-max md:grid md:grid-cols-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-[280px] md:w-auto space-y-4">
              <div className="aspect-[3/4] bg-gray-200 rounded-xl"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Only show section if we have similar products
  if (similarProducts.length === 0) {
    return null;
  }

  // Ensure we have exactly 4 products by padding with duplicates if necessary
  const displayProducts = similarProducts.length < 4 
    ? [...similarProducts, ...similarProducts].slice(0, 4) 
    : similarProducts;

  return (
    <section className="w-full py-12">
      <h2 className="text-2xl font-semibold text-center mb-8">Similar Products</h2>
      <div className="overflow-x-auto pb-4 md:overflow-visible">
        <div className="flex gap-6 min-w-max md:min-w-0 md:grid md:grid-cols-4">
          {displayProducts.map((product, index) => (
            <div key={`${product.$id}-${index}`} className="w-[280px] md:w-auto">
              <ProductCard
                id={product.$id}
                title={product.name}
                image={[{ 
                  url: product.image, // Already transformed URL from API
                  id: product.$id,
                  alt: product.name 
                }]}
                price={product.local_price[0] || 0} // Discounted price
                discount={product.sale_price[0] || 0} // Original price
                sizes={product.weight.map(w => `${w}g`)}
                component="similar"
                slug={product.$id}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PeopleAlsoBought;