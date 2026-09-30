'use client'

import { useState, useEffect } from 'react'
import { Star, Loader2, CheckCircle, MessageSquare } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getReviews, createReview, userPurchasedProduct } from '@/lib/data'

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  is_verified_purchase: boolean;
  seller_response?: string;
  seller_response_at?: string;
  user: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadReviews();
  }, [productId]);

  useEffect(() => {
    if (user) {
      checkPurchaseStatus();
    }
  }, [user]);

  const loadReviews = async () => {
    setLoading(true);
    const data = await getReviews(productId);
    setReviews(data);
    setLoading(false);
  };

  const checkPurchaseStatus = async () => {
    if (!user) return;
    const purchased = await userPurchasedProduct(user.id, productId);
    setHasPurchased(purchased);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) return;

    setSubmitting(true);
    const result = await createReview({
      user_id: user.id,
      product_id: productId,
      rating,
      comment
    });

    if (result.success) {
      setShowForm(false);
      setRating(0);
      setComment('');
      await loadReviews();
    }

    setSubmitting(false);
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return <div className="py-8 text-center"><Loader2 size={24} className="animate-spin mx-auto text-rose" /></div>;
  }

  return (
    <div className="mt-12">
      <h2 className="font-serif italic text-2xl text-noir-50 mb-6">
        Reviews {reviews.length > 0 && `(${reviews.length})`}
      </h2>

      {/* Rating summary */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-medium text-noir-50">{averageRating.toFixed(1)}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= Math.round(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-noir-700'}
                />
              ))}
            </div>
          </div>
          <div className="text-sm text-noir-400">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Write review button/form */}
      {!showForm ? (
        <div className="mb-8">
          {!user ? (
            <p className="text-sm text-noir-400 mb-2">Sign in to write a review</p>
          ) : !hasPurchased ? (
            <p className="text-sm text-noir-400 mb-2">Only verified purchasers can leave reviews</p>
          ) : null}
          
          {hasPurchased && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-secondary text-sm"
            >
              Write a review
            </button>
          )}
          
          {!user && (
            <a href={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} className="btn-secondary text-sm">
              Sign in to review
            </a>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-glass p-6 mb-8">
          <h3 className="text-sm font-medium text-noir-200 mb-4">Share your experience</h3>
          
          <div className="mb-4">
            <label className="block text-xs text-noir-400 mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    size={24}
                    className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-noir-700'}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-xs text-noir-400 mb-2">Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full bg-noir-900 border border-noir-700 rounded-lg px-3 py-2 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
              placeholder="Share your thoughts about this product..."
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0 || submitting}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin inline" /> : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-noir-400 text-center py-8">No reviews yet</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-noir-800/50 pb-6 last:border-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                  {review.user?.avatar_url ? (
                    <img 
                      src={review.user.avatar_url} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-rose-dark flex items-center justify-center text-rose">
                      {review.user?.first_name?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-noir-100">
                      {review.user?.first_name} {review.user?.last_name?.[0]}.
                    </p>
                    {review.is_verified_purchase && (
                      <div className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle size={12} />
                        Verified purchase
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-noir-700'}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-noir-200 mt-2">{review.comment}</p>
              
              {review.seller_response && (
                <div className="mt-4 ml-4 pl-4 border-l-2 border-rose/30">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={14} className="text-rose" />
                    <span className="text-xs font-medium text-rose">Response from seller</span>
                  </div>
                  <p className="text-sm text-noir-300">{review.seller_response}</p>
                </div>
              )}
            </div>
          ))}
        )}
      </div>
    </div>
  );
}
