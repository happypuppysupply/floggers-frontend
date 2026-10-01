'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  is_verified_purchase: boolean
  seller_response?: string
  seller_response_at?: string
  user: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { user, profile } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadReviews()
  }, [productId, user])

  useEffect(() => {
    if (user) {
      checkPurchaseStatus()
    }
  }, [user, productId])

  const loadReviews = async () => {
    setLoading(true)
    
    // Build query - only show approved reviews to public
    // Show pending reviews to: reviewer themselves, admin
    let query = supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    // If user is not admin, only show approved reviews OR their own pending reviews
    const isAdmin = profile?.role === 'admin'
    if (!isAdmin && user) {
      query = query.or(`status.eq.approved,and(status.eq.pending,user_id.eq.${user.id})`)
    } else if (!user) {
      // Non-logged in users only see approved
      query = query.eq('status', 'approved')
    }

    const { data, error } = await query

    if (data) {
      setReviews(data.map((r: any) => ({
        id: r.id,
        rating: r.rating,
        title: r.title || '',
        comment: r.comment,
        status: r.status,
        created_at: r.created_at,
        is_verified_purchase: r.is_verified_purchase || false,
        seller_response: r.seller_response,
        seller_response_at: r.seller_response_at,
        user: {
          id: r.user?.id,
          full_name: r.user?.full_name || 'Anonymous',
          avatar_url: r.user?.avatar_url
        }
      })))
    }
    
    setLoading(false)
  }

  const checkPurchaseStatus = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .limit(1)
      .single()
    
    if (data) {
      // Check if order contains this product
      const { count } = await supabase
        .from('order_items')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', data.id)
        .eq('product_id', productId)
      
      setHasPurchased(count > 0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!user) {
      setError('Please sign in to leave a review')
      return
    }
    
    if (!hasPurchased) {
      setError('Only verified purchasers can leave reviews')
      return
    }
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setSubmitting(true)
    
    const { error: submitError } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        product_id: productId,
        rating,
        title,
        comment,
        status: 'pending',
        is_verified_purchase: true
      })

    if (submitError) {
      setError('Failed to submit review. You may have already reviewed this product.')
    } else {
      setSuccess('Review submitted and is pending approval!')
      setShowForm(false)
      setRating(0)
      setTitle('')
      setComment('')
      await loadReviews()
    }

    setSubmitting(false)
  }

  const averageRating = reviews.filter(r => r.status === 'approved').length > 0
    ? reviews.filter(r => r.status === 'approved').reduce((a, r) => a + r.rating, 0) / reviews.filter(r => r.status === 'approved').length
    : 0

  const approvedCount = reviews.filter(r => r.status === 'approved').length

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Loader2 size={24} className="animate-spin mx-auto text-rose" />
      </div>
    )
  }

  return (
    <div className="mt-12">
      <h2 className="font-serif italic text-2xl text-noir-50 mb-6">
        Reviews {approvedCount > 0 && `(${approvedCount})`}
      </h2>

      {/* Rating summary */}
      {approvedCount > 0 && (
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
            {approvedCount} review{approvedCount !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Write review section */}
      {!showForm && (
        <div className="mb-8">
          {!user ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-noir-400">Sign in to write a review</p>
              <Link 
                href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`}
                className="btn-secondary text-sm inline-flex items-center justify-center"
              >
                Sign in to review
              </Link>
            </div>
          ) : !hasPurchased ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-sm text-amber-300">
                Only verified purchasers can leave reviews. Purchase this product to share your experience.
              </p>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="btn-secondary text-sm"
            >
              Write a review
            </button>
          )}
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card-glass p-6 mb-8">
          <h3 className="text-sm font-medium text-noir-200 mb-4">Share your experience</h3>

          {error && (
            <div className="mb-4 p-3 bg-rose/20 border border-rose/30 rounded-lg text-sm text-rose">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-sm text-emerald-400">
              {success}
            </div>
          )}

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
            <label className="block text-xs text-noir-400 mb-2">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-noir-900 border border-noir-700 rounded-lg px-3 py-2 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
              placeholder="Summarize your experience"
            />
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
                      {review.user?.full_name?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-noir-100">
                      {review.user?.full_name}
                    </p>
                    <div className="flex items-center gap-2">
                      {review.is_verified_purchase && (
                        <div className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle size={12} />
                          Verified purchase
                        </div>
                      )}
                      {review.status === 'pending' && (
                        <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          Pending approval
                        </span>
                      )}
                    </div>
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

              {review.title && (
                <h4 className="font-medium text-noir-100 mb-1">{review.title}</h4>
              )}
              <p className="text-sm text-noir-200 mt-2">{review.comment}</p>

              {review.seller_response && (
                <div className="mt-4 ml-4 pl-4 border-l-2 border-rose/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-rose">Response from seller</span>
                    <span className="text-xs text-noir-500">
                      {review.seller_response_at && new Date(review.seller_response_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-noir-300">{review.seller_response}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
