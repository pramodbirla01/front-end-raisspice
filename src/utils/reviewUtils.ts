import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { Review } from '@/types/review';

export const calculateAverageRating = (ratings: number[] = []) => {
  if (!ratings.length) return 0;
  const sum = ratings.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / ratings.length).toFixed(2));
};

export const getOrCreateReview = async (productId: string): Promise<Review> => {
  try {
    try {
      // Try to get existing review document
      const response = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_REVIEW_COLLECTION_ID!,
        productId
      );

      // Return existing document
      return {
        $id: response.$id,
        review: response.review || [],
        rating: response.rating || [],
        user: response.user || [],
        title: response.title || [],
        product_id: productId
      };

    } catch (error) {
      // Create new review document if it doesn't exist
      const newDocument = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_REVIEW_COLLECTION_ID!,
        productId, // Use product ID as document ID
        {
          review: [],
          rating: [],
          user: [],
          title: [],
          product_id: productId
        }
      );

      // Return new document
      return {
        $id: newDocument.$id,
        review: [],
        rating: [],
        user: [],
        title: [],
        product_id: productId
      };
    }
  } catch (error) {
    console.error('Error in getOrCreateReview:', error);
    throw error;
  }
};

// Helper function to update a review
export const updateReview = async (
  productId: string,
  newReview: string,
  newRating: number,
  userName: string,
  reviewTitle: string
): Promise<Review> => {
  try {
    const existingReview = await getOrCreateReview(productId);

    const updatedData = {
      review: [...existingReview.review, newReview],
      rating: [...existingReview.rating, newRating],
      user: [...existingReview.user, userName],
      title: [...existingReview.title, reviewTitle],
      product_id: productId
    };

    const response = await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_REVIEW_COLLECTION_ID!,
      productId,
      updatedData
    );

    return {
      $id: response.$id,
      review: response.review,
      rating: response.rating,
      user: response.user,
      title: response.title,
      product_id: response.product_id
    };
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};
