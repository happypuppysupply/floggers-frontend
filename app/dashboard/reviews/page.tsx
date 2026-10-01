'use client'

import { useState, useEffect } from 'react'
import { Star, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string
  product_name: string
  product_image: string
  reviewer_name: string
  rating: number
  title: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function ReviewsPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all')
  const supabase = createClient()

  useEffect(() => {
    loadReviews()
  }, [user])

  const loadReviews = async () => {
    if (!user) return
    
    // Get maker ID
    const { data: maker } = await supabase
      .from('makers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!maker) {
      setLoading(false)
      return
    }

    // Get reviews for this maker's products
    const { data } = await supabase
      .from('reviews')
      .select(`
        *,
        product:products(name, image_url),
        user:profiles(full_name)
      `)
      .eq('maker_id', maker.id)
      .order('created_at', { ascending: false })

    if (data) {
      setReviews(data.map((r: any) => ({
        id: r.id,
        product_name: r.product?.name || 'Unknown Product',
        product_image: r.product?.image_url || '/placeholder.jpg',
        reviewer_name: r.user?.full_name || 'Anonymous',
        rating: r.rating,
        title: r.title || '',
        content: r.comment || '',
        status: r.status || 'pending',
        created_at: r.created_at
      })))
    }
    
    setLoading(false)
  }

  const handleApproveReview = async (reviewId: string) => {
    await supabase
      .from('reviews')
      .update({ status: 'approved' })
      .eq('id', reviewId)
    
    loadReviews()
  }

  const filteredReviews = reviews.filter(r => {
    if (activeTab === 'all') return true
    return r.status === activeTab
  })

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    averageRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0'
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif italic text-2xl text-noir-50 mb-2">Reviews</h1>
        <p className="text-sm text-noir-400">Manage customer reviews for your products</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card-glass p-4">
          <p className="text-2xl font-serif italic text-noir-50">{stats.total}</p>
          <p className="text-xs text-noir-400">Total Reviews</p>
        </div>
        <div className="card-glass p-4">
          <p className="text-2xl font-serif italic text-amber-400">{stats.averageRating}</p>
          <p className="text-xs text-noir-400">Average Rating</p>
        </div>
        <div className="card-glass p-4">
          <p className="text-2xl font-serif italic text-noir-50">{stats.pending}</p>
          <p className="text-xs text-noir-400">Pending Approval</p>
        </div>
        <div className="card-glass p-4">
          <p className="text-2xl font-serif italic text-emerald-400">{stats.approved}</p>
          <p className="text-xs text-noir-400">Approved</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === tab
                ? 'bg-rose-dark text-white'
                : 'bg-noir-800 text-noir-300 hover:bg-noir-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'pending' && stats.pending > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                {stats.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-rose border-t-transparent rounded-full" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="card-glass p-8 text-center">
          <MessageSquare className="w-12 h-12 text-noir-600 mx-auto mb-4" />
          <h3 className="text-lg text-noir-200 mb-2">No reviews yet</h3>
          <p className="text-sm text-noir-400">
            {activeTab === 'pending' 
              ? 'No reviews pending approval'
              : activeTab === 'approved'
              ? 'No approved reviews yet'
              : 'You haven\'t received any reviews yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="card-glass p-6">
              <div className="flex items-start gap-4">
                <img
                  src={review.product_image}
                  alt={review.product_name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-noir-400 mb-1">{review.product_name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < review.rating ? 'fill-rose text-rose' : 'text-noir-700'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-noir-300">{review.reviewer_name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.status === 'pending' && (
                        <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                          <Clock size={12} />
                          Pending
                        </span>
                      )}
                      {review.status === 'approved' && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                          <CheckCircle size={12} />
                          Approved
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {review.title && (
                    <h4 className="font-medium text-noir-100 mb-1">{review.title}</h4>
                  )}
                  <p className="text-sm text-noir-300 mb-3">{review.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-noir-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    
                    {review.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveReview(review.id)}
                          className="btn-primary text-xs py-1.5 px-3"
                        >
                          <CheckCircle size={14} className="inline mr-1" />
                          Approve
                        </button>
                        <button
                          className="btn-ghost text-xs py-1.5 px-3 text-rose"
                        >
                          <AlertCircle size={14} className="inline mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
