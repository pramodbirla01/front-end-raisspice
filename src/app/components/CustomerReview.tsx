'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronDown, ChevronRight } from 'lucide-react';
import { FaRegUser } from "react-icons/fa";
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { calculateAverageRating, getOrCreateReview } from '@/utils/reviewUtils';
import ReviewForm from './ReviewForm';

interface ReviewProps {
  productId: string;
}

interface Review {
  $id: string;
  review: string[];
  rating: number[];
  user: string[];
  title: string[];
  product_id: string;
}

const CustomerReviews: React.FC<ReviewProps> = ({ productId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState<Review | null>(null);
  const [newReview, setNewReview] = useState({
    userName: '',
    title: '',
    review: '',
    rating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const review = await getOrCreateReview(productId);
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
      
      // Only include the fields we need
      const updatedReview = {
        review: [...existingData.review, reviewData.review],
        rating: [...existingData.rating, reviewData.rating],
        user: [...existingData.user, reviewData.userName],
        title: [...existingData.title, reviewData.title],
        product_id: productId
      };

      await databases.updateDocument(
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
                onClick={() => setShowReviewForm(true)}
                className="w-full py-2 text-white bg-red-800 hover:bg-red-900 transition-colors"
              >
                Write a review
              </button>
            </div>
          </div>

          {/* Replace the existing review form modal with the new ReviewForm component */}
          {showReviewForm && (
            <ReviewForm
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewForm(false)}
            />
          )}

          {/* Reviews List */}
          <div className="space-y-6 mt-8">
            {reviewData?.review.map((review, index) => (
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
