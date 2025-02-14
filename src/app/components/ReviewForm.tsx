import { useState } from 'react';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  onSubmit: (review: {
    userName: string;
    title: string;
    review: string;
    rating: number;
  }) => Promise<void>;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    userName: '',
    title: '',
    review: '',
    rating: 0
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ userName: '', title: '', review: '', rating: 0 });
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Stars */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer ${
                    star <= (hoveredRating || formData.rating)
                      ? 'text-red-800 fill-red-900'
                      : 'text-gray-300'
                  }`}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setFormData({ ...formData, rating: star })}
                />
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              required
              maxLength={50}
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Review Title *</label>
            <input
              type="text"
              required
              maxLength={40}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {40 - formData.title.length} characters remaining
            </p>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium mb-2">Review *</label>
            <textarea
              required
              maxLength={800}
              rows={4}
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {800 - formData.review.length} characters remaining
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
