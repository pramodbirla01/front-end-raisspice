'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronDown, ChevronRight } from 'lucide-react';
import { FaRegUser } from "react-icons/fa";
import { databases, getTypedDatabases, Models } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { calculateAverageRating, getOrCreateReview } from '@/utils/reviewUtils';
import ReviewForm from './ReviewForm';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { motion } from 'framer-motion';

interface ReviewProps {
  productId: string;
}

// Update Review interface to include all required Appwrite Document properties
interface Review extends Models.Document {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  review: string[];
  rating: number[];
  user: string[];
  title: string[];
  product_id: string;
}

const CustomerReviews: React.FC<ReviewProps> = ({ productId }) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [reviewData, setReviewData] = useState<Review | null>(null);
  const [newReview, setNewReview] = useState({
    userName: '',
    title: '',
    review: '',
    rating: 0
  });
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(5);
  
  // Get auth state from Redux
  const { token } = useSelector((state: RootState) => state.customer);
  const isLoggedIn = !!token;

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const review = await getOrCreateReview(productId) as Review;
      setReviewData(review);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewData: {
    userName: string;
    title: string;
    review: string;
    rating: number;
  }) => {
    try {
      const existingData = await getOrCreateReview(productId);
      const typedDatabases = getTypedDatabases();
      
      // Only include the fields we need
      const updatedReview = {
        review: [...existingData.review, reviewData.review],
        rating: [...existingData.rating, reviewData.rating],
        user: [...existingData.user, reviewData.userName],
        title: [...existingData.title, reviewData.title],
        product_id: productId
      };

      await typedDatabases.updateDocument<Review>(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_REVIEW_COLLECTION_ID!,
        productId,
        updatedReview
      );

      setShowReviewForm(false);
      await fetchReviews(); // Refresh reviews after submission
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error; // Re-throw to handle in the form
    }
  };

  const handleWriteReviewClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      setShowReviewForm(true);
    }
  };

  const handleViewMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  return (
    <section className="w-full mx-auto px-4 py-12 max-sm:px-0">
      <div className="w-full flex flex-col justify-start items-start">
        {/* Summary Section */}
        <div className="w-full md:col-span-1">
          <h2 className="w-full text-2xl font-semibold mb-8 text-center">
            Customer Reviews
          </h2>
          
          {/* Review Statistics */}
          <div className="customer_data_graph w-full grid grid-cols-3 max-lg:grid-cols-1 pb-10 border-b border-gray-400">
            <div className="w-full flex flex-col items-center justify-center mb-2">
              <div className="w-[80%] flex justify-center items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.floor(Number(calculateAverageRating(reviewData?.rating)))
                        ? 'text-red-800 fill-red-900'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="font-medium ml-3">
                  {calculateAverageRating(reviewData?.rating)} out of 5
                </span>
              </div>
              <p className="text-gray-600 mb-6">
                Based on {reviewData?.review.length || 0} reviews
              </p>
            </div>

            {/* Add Review Button */}
            <div className="w-full h-full flex justify-center items-center py-8">
              <button 
                onClick={handleWriteReviewClick}
                className="w-full py-2 text-white bg-red-800 hover:bg-red-900 transition-colors"
              >
                Write a review
              </button>
            </div>
          </div>

          {/* Login Modal */}
          {showLoginModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
              >
                <h2 className="text-2xl font-semibold mb-4">Login Required</h2>
                <p className="text-gray-600 mb-6">Please login to write a review.</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push('/login')}
                    className="flex-1 bg-darkRed text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && isLoggedIn && (
            <ReviewForm
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewForm(false)}
            />
          )}

          {/* Reviews List */}
          <div className="space-y-6 mt-8">
            {reviewData?.review.slice(0, displayCount).map((review, index) => (
              <div key={index} className="border-b pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= reviewData.rating[index]
                            ? 'text-red-800 fill-red-900'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="font-semibold">{reviewData.title[index]}</p>
                  <p className="text-gray-600 mt-1">{review}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    By {reviewData.user[index]}
                  </div>
                </div>
              </div>
            ))}

            {/* View More Button */}
            {reviewData && reviewData.review.length > displayCount && (
              <div className="flex justify-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleViewMore}
                  className="px-6 py-2 text-red-800 border border-red-800 rounded-full hover:bg-red-50 transition-colors"
                >
                  View More Reviews
                </motion.button>
              </div>
            )}
          </div>

          {/* Show message when no reviews */}
          {reviewData && reviewData.review.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              No reviews yet. Be the first to review this product!
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
