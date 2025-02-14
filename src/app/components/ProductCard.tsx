import { getFullImageUrl } from "@/utils/imageUtils";
import { getStorageFileUrl } from "@/lib/appwrite";
import { ShoppingCart, Heart } from "lucide-react"; // Remove unused imports
import Image from "next/image";
import Link from "next/link";
import { useState } from 'react';
import { Product } from '@/types/product';
import { useDispatch } from 'react-redux';
import { toggleCart } from '@/store/slices/uiSlice';
import QuickAddPopup from './QuickAddPopup'; // Add this import

// Define types
interface ProductCardImage {
  url: string;
  id: string | number; // Update to accept both string and number
  alt: string;
}

// Remove the Partial<Product> extension and define props directly
interface ProductCardProps {
  id: string;
  title: string;
  image: ProductCardImage[];
  additionalImages?: string[]; // Add this
  price: number;
  discount?: number; // Make discount optional
  sizes: string[];
  component?: string; // Make component optional
  slug: string; // Add slug to props
  weight: number[];        // Add this
  category?: string[];     // Add this
  local_price: number[];   // Add this
  sale_price: number[];    // Add this
  description?: string;    // Add this
}

const ProductCard: React.FC<ProductCardProps> = (props) => {
  const dispatch = useDispatch();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  // Remove unused state
  // const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);
  // const [quantity, setQuantity] = useState(1);

  // Default image if none provided
  const defaultImage = {
    url: '/placeholder-image.jpg',
    alt: 'Product placeholder image'
  };

  const imageToShow = props.image.length ? props.image[0] : defaultImage;

  const getValidImageUrl = (url: string) => {
    if (!url) return '/placeholder-image.jpg';
    // If URL is already complete, return it
    if (url.startsWith('http')) return url;
    // If it's a file ID, convert it to URL
    return getStorageFileUrl(url);
  };

  

  // Format price helper function - ensure it always returns a number
  const formatPrice = (amount: number | undefined) => {
    return amount || 0;  // Return 0 if amount is undefined
  };

  // Add helper function to check if there's a valid discount
  const hasValidDiscount = () => {
    const originalPrice = props.local_price?.[0];
    const salePrice = props.sale_price?.[0];
    return originalPrice && salePrice && originalPrice > salePrice;
  };

  const handleCartIconClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    setShowQuickAdd(true);
  };

  const handleCartOpen = () => {
    dispatch(toggleCart(true)); // Action to open cart sidebar
  };

  const transformToProduct = (): Product => {
    // Create proper product object with all required data
    const productData: Product = {
      $id: props.id,
      name: props.title,
      description: props.description || '',
      category: props.category || [],
      weight: props.weight || [],
      image: getValidImageUrl(props.image[0]?.url),
      additionalImages: props.additionalImages || [],
      stock: 0,
      product_collection: [],
      local_price: props.local_price || [],
      sale_price: props.sale_price || [],
      slug: props.slug
    };

    return productData;
  };

  // Calculate the current price based on selected weight index
  const currentPrice = props.sale_price?.[0] || props.local_price?.[0] || 0;
  const originalPrice = props.local_price?.[0] || 0;

  return (
    <>
      <div className="w-full h-full">
        {/* Update the Link href to use the product ID */}
        <Link href={`/product/${props.id}`} className="block h-full">
          <div
            key={props.id}
            className="group bg-white rounded-2xl h-full shadow-premium hover:shadow-premium-hover transition-all duration-500"
          >
            <div className="relative w-full overflow-hidden">
              {/* Product Image Container - Adjusted for full image */}
              <div className="aspect-[3/4] overflow-hidden rounded-t-2xl">
                <Image
                  width={400}
                  height={500}
                  src={getValidImageUrl(imageToShow.url)}
                  alt={imageToShow.alt || props.title || 'Product image'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  priority
                />
                
                {/* Themed Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-premium-600/40 via-premium-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>

              {/* Discount Badge */}
              {props.discount && (
                <span className="absolute top-3 left-3 rounded-full bg-premium-50/90 backdrop-blur-sm border border-premium-200 px-3 py-1.5 text-xs sm:text-sm font-semibold text-premium-800 shadow-premium-button">
                  {(((props.price-props.discount)/props.price)*100).toFixed(1)}% OFF
                </span>
              )}

              {/* Quick Action Icons with Theme Colors */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button className="bg-premium-50/90 backdrop-blur p-2 sm:p-2.5 rounded-full hover:bg-premium-100 shadow-premium-button hover:shadow-premium-hover transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100 transform translate-x-8 group-hover:translate-x-0">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-premium-700 hover:text-premium-800 transition-colors" />
                </button>
                <button 
                  onClick={handleCartIconClick}
                  className="bg-premium-50/90 backdrop-blur p-2 sm:p-2.5 rounded-full hover:bg-premium-100 shadow-premium-button hover:shadow-premium-hover transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100 transform translate-x-8 group-hover:translate-x-0 delay-75"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-premium-700 hover:text-premium-800 transition-colors" />
                </button>
              </div>

              {/* Size Options with Theme Colors */}
              {props.sizes && props.sizes.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-premium-50/90 backdrop-blur-sm py-2.5 px-3 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-full group-hover:translate-y-0 border-t border-premium-200/50">
                  {props.sizes.map((size) => (
                    <button
                      key={size}
                      className="text-xs sm:text-sm font-medium text-premium-700 hover:text-premium-900 transition-colors hover:scale-110 transform duration-200"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info with Theme Colors */}
            <div className="p-4 sm:p-5 bg-gradient-to-b from-premium-50/50 to-white rounded-b-2xl">
              <h3 className="text-premium-800 text-center font-medium text-sm sm:text-base md:text-lg mb-2.5 line-clamp-2 group-hover:text-premium-900 transition-colors duration-300">
                {props.title}
              </h3>
              <div className="flex justify-center items-center gap-3 text-sm sm:text-base">
                {hasValidDiscount() ? (
                  <>
                    {/* Original price with line-through */}
                    <span className="text-premium-400 font-medium line-through">
                      ₹{formatPrice(props.local_price?.[0])}
                    </span>
                    {/* Sale price without line-through */}
                    <span className="text-premium-800 font-semibold tracking-wide">
                      ₹{formatPrice(props.sale_price?.[0])}
                    </span>
                  </>
                ) : (
                  // Show only the regular price if no valid discount
                  <span className="text-premium-800 font-semibold tracking-wide">
                    ₹{formatPrice(props.local_price?.[0])}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Replace old modal with QuickAddPopup */}
      <QuickAddPopup
        product={transformToProduct()}
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onAddToCart={() => {
          handleCartOpen();
          setShowQuickAdd(false);
        }}
        onCartAdd={() => {
          // Add any additional cart add logic here
        }}
      />
    </>
  );
};

export default ProductCard;