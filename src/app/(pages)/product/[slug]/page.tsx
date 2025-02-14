"use client";

import { useEffect, useState } from "react";
import { use } from 'react';
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import Single_Product_Main_Info from "../Single_Product_Main_Info";
import Single_Product_Main_Img_Container from "../Single_Product_Main_Img_Container";
import PeopleAlsoBought from "@/app/components/PeopleAlsoBought";
import CustomerReviews from "@/app/components/CustomerReview";
import ErrorBoundary from '@/components/ErrorBoundary';
import { getStorageFileUrl } from "@/lib/appwrite";
import { calculateAverageRating, getOrCreateReview } from '@/utils/reviewUtils';
import { Review } from '@/types/review';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface ImageProps {
  id: number;
  url: string;
  alt: string;
}

interface ProductData {
  $id: string;
  name: string;
  description: string;
  category: string[];
  weight: number[];
  image: string;
  additionalImages: string[];
  stock: number;
  product_collection: string[];
  local_price: number[];
  sale_price: number[];
}

const ProductPage = ({ params }: ProductPageProps) => {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [categories, setCategories] = useState<Map<string, string>>(new Map());
  const [selectedWeightIndex, setSelectedWeightIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeightId, setSelectedWeightId] = useState<string>("");
  const [reviewData, setReviewData] = useState<Review | null>(null);

  // Fetch category names
  const fetchCategories = async (categoryIds: string[]) => {
    try {
      const categoryMap = new Map<string, string>();
      
      for (const id of categoryIds) {
        const response = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_CATEGORY_COLLECTION_ID!,
          id
        );
        categoryMap.set(id, response.name);
      }
      
      setCategories(categoryMap);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        setLoading(true);
        console.log('Fetching product with ID:', resolvedParams.slug); // Debug log

        const productResponse = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID!,
          resolvedParams.slug // This should be the document ID
        );

        console.log('Raw API response:', productResponse); // Debug log

        if (!productResponse) {
          throw new Error('Product not found');
        }

        // Transform the product data according to schema
        const transformedProduct: ProductData = {
          $id: productResponse.$id,
          name: productResponse.name || '',
          description: productResponse.description || '',
          category: Array.isArray(productResponse.category) ? productResponse.category : [],
          weight: Array.isArray(productResponse.weight) ? productResponse.weight : [],
          image: productResponse.image ? getStorageFileUrl(productResponse.image) : '/placeholder-image.jpg',
          additionalImages: (productResponse.additionalImages || [])
            .map((imgId: string) => getStorageFileUrl(imgId)),
          stock: parseInt(productResponse.stock) || 0,
          product_collection: Array.isArray(productResponse.product_collection) 
            ? productResponse.product_collection 
            : [],
          local_price: Array.isArray(productResponse.local_price) 
            ? productResponse.local_price.map(Number) 
            : [Number(productResponse.local_price) || 0],
          sale_price: Array.isArray(productResponse.sale_price) 
            ? productResponse.sale_price.map(Number) 
            : [Number(productResponse.sale_price) || 0]
        };

        console.log('Transformed product:', transformedProduct); // Debug log
        setProduct(transformedProduct);
        
        if (transformedProduct.category.length > 0) {
          await fetchCategories(transformedProduct.category);
        }

        if (transformedProduct.weight.length > 0) {
          setSelectedWeightId(transformedProduct.weight[0].toString());
        }

        // Fetch or create review document
        try {
          const review = await getOrCreateReview(productResponse.$id);
          setReviewData(review);
        } catch (reviewError) {
          console.error('Error handling reviews:', reviewError);
        }

      } catch (err) {
        console.error('Detailed error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.slug) {
      fetchProductAndReviews();
    }
  }, [resolvedParams.slug]);

  // Handle weight selection
  const handleWeightSelect = (weightId: string) => {
    const index = product?.weight.findIndex(w => w.toString() === weightId) ?? 0;
    setSelectedWeightIndex(index);
    setSelectedWeightId(weightId);
  };

  const getSelectedWeight = () => {
    if (!product?.weight) return null;
    return product.weight.find((w: any) => w.$id === selectedWeightId) || product.weight[0];
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-gray-600">
          {error || "This product might be unavailable or doesn't exist."}
        </p>
      </div>
    );
  }

  const selectedWeight = getSelectedWeight();

  // Transform additionalImages to match ImageProps interface
  const productImages: ImageProps[] = [
    {
      id: 1,
      url: product.image,
      alt: product.name
    },
    ...product.additionalImages.map((url, index) => ({
      id: index + 2,
      url,
      alt: `${product.name} - ${index + 2}`
    }))
  ];

  // Transform weight array into variants with both prices
  const productVariants = product.weight.map((weight, index) => ({
    id: weight.toString(),
    title: weight,
    price: product.local_price[index] || 0,
    original_price: product.local_price[index] || 0,
    sale_price: product.sale_price[index] || 0,
    inventory: product.stock
  }));

  // Get current prices based on selected weight
  const currentPrice = product.local_price[selectedWeightIndex] || 0;
  const currentSalePrice = product.sale_price[selectedWeightIndex] || 0;

  // Get category names
  const categoryNames = product.category.map(id => categories.get(id) || 'Loading...').join(', ');

  return (
    <div className="w-full mx-auto px-4 py-10 mt-14 bg-[#fef9e5]">
      <div className="single_product_inner_container w-[90%] max-sm:w-[95%] mx-auto">
        {/* Breadcrumb with category names */}
        <div className="mb-6 text-gray-600">
          <span className="hover:text-gray-900 cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="hover:text-gray-900 cursor-pointer">{categoryNames}</span>
          <span className="mx-2">/</span>
          <span>{product.name}</span>
        </div>

        <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-16 relative">
          <Single_Product_Main_Img_Container 
            images={productImages}
          />
          <Single_Product_Main_Info
            product={product} // Add this line
            title={product.name}
            description={product.description}
            features={categoryNames.split(', ')}
            rating={calculateAverageRating(reviewData?.rating || [])} // Will be calculated from reviews
            reviews={reviewData?.review.length || 0} // Number of reviews
            variants={productVariants}
            selectedVariantId={selectedWeightId}
            onVariantChange={handleWeightSelect}
            price={product.local_price[selectedWeightIndex] || 0}      // Regular price
            discountedPrice={product.sale_price[selectedWeightIndex] || 0} // Sale price
          />
        </div>

        <PeopleAlsoBought
          currentProductId={product.$id} // Pass as string
          categorySlug={product.category[0] || ''}
        />
        <CustomerReviews productId={product.$id} />
      </div>
    </div>
  );
};

const ProductPageWrapper = (props: ProductPageProps) => (
  <ErrorBoundary
    fallback={
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-gray-600">
          This product might be unavailable or doesn't exist.
        </p>
      </div>
    }
  >
    <ProductPage {...props} />
  </ErrorBoundary>
);

export default ProductPageWrapper;

