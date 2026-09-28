'use client'

import { useState } from 'react'
import { Star, Send, CheckCircle } from 'lucide-react'

export default function ReviewFormClient({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0 || !text.trim()) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setRating(0)
        setText('')
      }, 3000)
    }, 800)
  }

  return (
    <div className="card-glass p-6 h-fit sticky top-24">
      <h3 className="text-lg font-medium text-noir-100 mb-2">Write a Review</h3>
      <p className="text-xs text-noir-400 mb-4">Share your experience with this product</p>

      {submitted ? (
        <div className="text-center py-6">
          <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-sm text-noir-200">Review submitted!</p>
          <p className="text-xs text-noir-400 mt-1">It will appear after moderation.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-noir-400 mb-1">Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={22}
                    className={(hoverRating || rating) >= star ? 'fill-rose text-rose' : 'text-noir-600'}
                  />
                </button>
              ))}
              <span className="text-xs text-noir-400 ml-2">
                {rating > 0 && ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-noir-400 mb-1">Your Review</label>
            <textarea
              required
              rows={4}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="What did you like? How was the quality?"
              className="w-full bg-noir-950 border border-noir-700 rounded-lg px-3 py-2 text-sm text-noir-100 placeholder:text-noir-500 focus:outline-none focus:border-rose/50 resize-none"
            />
          </div>

          <label className="flex items-start gap-2">
            <input type="checkbox" defaultChecked className="mt-0.5 rounded border-noir-700 bg-noir-950" />
            <span className="text-xs text-noir-400">I confirm I purchased this product</span>
          </label>

          <button
            type="submit"
            disabled={submitting || rating === 0 || !text.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-noir-50/30 border-t-noir-50 rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <><Send size={14} /> Submit Review</>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
