import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMakerById, getMakerBySlug, getProductsByMaker, getMakerFollowerCount, getMakerReviews } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import FollowButton from '@/components/FollowButton';
import MessageMakerButton from '@/components/MessageMakerButton';
import SimilarMakers from '@/components/SimilarMakers';
import { formatLastActive, isOnline } from '@/lib/time';
import { Star, MapPin, Award, Calendar, Package, Users } from 'lucide-react';

function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

export default async function MakerPage({ params }: { params: { id: string } }) {
  const id = params.id
  
  // If it's a UUID, look up by ID. Otherwise look up by slug.
  let maker = isUUID(id) ? await getMakerById(id) : await getMakerBySlug(id);

  if (!maker) {
    notFound();
  }

  const [products, followerCount, reviews] = await Promise.all([
    getProductsByMaker(maker.id),
    getMakerFollowerCount(maker.id),
    getMakerReviews(maker.id)
  ]);

  const joinedDate = maker.created_at 
    ? new Date(maker.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    : 'Recently';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Cover Photo */}
      {maker.cover_image_url ? (
        <div className="h-48 md:h-64 relative overflow-hidden">
          <img 
            src={maker.cover_image_url} 
            alt={`${maker.name} cover`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noir-950/80 to-transparent" />
        </div>
      ) : (
        <div className="h-32 md:h-48 bg-gradient-to-r from-rose-dark/20 to-noir-900" />
      )}

      <div className="px-4 sm:px-6 lg:px-8 py-10">
        {/* Maker Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative -mt-12 relative z-10">
              {maker.avatar_url ? (
                <img 
                  src={maker.avatar_url} 
                  alt={maker.name} 
                  className="w-24 h-24 rounded-full object-cover border-2 border-noir-800 bg-noir-950"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-rose-dark flex items-center justify-center text-rose text-3xl border-2 border-noir-800">
                  {maker.name[0]}
                </div>
              )}
              {/* Online indicator */}
              <span
                className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-noir-900 ${
                  isOnline(maker.profile?.last_active) ? 'bg-emerald-400' : 'bg-noir-600'
                }`}
              />
            </div>
            
            <div className="flex-1">
              <h1 className="font-serif italic text-3xl text-noir-50 mb-2">
                {maker.name}
              </h1>

              <p className={`text-xs mb-2 ${isOnline(maker.profile?.last_active) ? 'text-emerald-400' : 'text-noir-500'}`}>
                {formatLastActive(maker.profile?.last_active)}
              </p>

              {maker.location && (
                <p className="text-sm text-noir-400 flex items-center gap-1 mb-2">
                  <MapPin size={14} />
                  {maker.location}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mt-3">
                {maker.rating && (
                  <span className="text-sm text-amber-400 flex items-center gap-1">
                    <Star size={16} className="fill-amber-400" />
                    {maker.rating.toFixed(1)}
                    <span className="text-noir-500">({maker.sales_count || 0} sales)</span>
                  </span>
                )}
                
                {followerCount > 0 && (
                  <span className="text-sm text-noir-400 flex items-center gap-1">
                    <Users size={14} />
                    {followerCount >= 1000 ? `${(followerCount / 1000).toFixed(1)}k` : followerCount} followers
                  </span>
                )}
                
                {maker.badges && maker.badges.length > 0 && (
                  <div className="flex gap-2">
                    {maker.badges.map((badge: string) => (
                      <span 
                        key={badge}
                        className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <FollowButton 
                makerId={maker.id}
                followerCount={followerCount}
              />
              <MessageMakerButton 
                makerId={maker.id} 
                makerName={maker.name} 
              />
            </div>
          </div>
          
          {/* Bio */}
          {maker.bio && (
            <div className="mt-6 max-w-3xl">
              <p className="text-sm text-noir-300 leading-relaxed">
                {maker.bio}
              </p>
            </div>
          )}
          
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 p-6 rounded-xl bg-noir-900/30 border border-noir-800">
            <div className="text-center">
              <p className="text-2xl font-serif italic text-noir-50">{products.length}</p>
              <p className="text-xs text-noir-400 uppercase tracking-wider mt-1">Products</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-serif italic text-noir-50">
                {maker.sales_count || 0}
              </p>
              <p className="text-xs text-noir-400 uppercase tracking-wider mt-1">Sales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-serif italic text-noir-50">
                {maker.rating?.toFixed(1) || '—'}
              </p>
              <p className="text-xs text-noir-400 uppercase tracking-wider mt-1">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-serif italic text-noir-50">{joinedDate}</p>
              <p className="text-xs text-noir-400 uppercase tracking-wider mt-1">Joined</p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-16">
          <h2 className="font-serif italic text-2xl text-noir-50 mb-6">
            All Products
          </h2>
          
          {products.length === 0 ? (
            <p className="text-noir-400 text-center py-16">
              No products available from this maker yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={{
                  ...product,
                  maker: { name: maker.name }
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif italic text-2xl text-noir-50">
              Reviews ({reviews.length})
            </h2>
            {maker.average_rating && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.round(maker.average_rating) ? 'fill-rose text-rose' : 'text-noir-600'}
                    />
                  ))}
                </div>
                <span className="text-amber-400 font-medium">{maker.average_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="card-glass p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {review.reviewer?.avatar_url ? (
                        <img 
                          src={review.reviewer.avatar_url} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-rose-dark/20 flex items-center justify-center">
                          <span className="text-rose font-medium">
                            {(review.reviewer?.full_name || 'U').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-noir-200">{review.reviewer?.full_name || 'Anonymous'}</p>
                        <p className="text-xs text-noir-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? 'fill-rose text-rose' : 'text-noir-700'}
                        />
                      ))}
                    </div>
                  </div>
                  {review.title && <h4 className="font-medium text-noir-100 mb-2">{review.title}</h4>}
                  <p className="text-noir-300 text-sm">{review.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-glass p-8 text-center">
              <p className="text-noir-400">No reviews yet</p>
            </div>
          )}
        </div>

        {/* Similar Makers Carousel */}
        <SimilarMakers currentMakerId={maker.id} />
      </div>
    </div>
  );
}
