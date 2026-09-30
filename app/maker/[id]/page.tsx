import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getMakerById, getMakerBySlug, getProductsByMaker, getMakerFollowerCount } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import FollowButton from '@/components/FollowButton';
import { Star, MapPin, Award, Calendar, Package, Users } from 'lucide-react';

export default async function MakerPage({ params }: { params: { id: string } }) {
  const id = params.id
  
  // Try by ID first, then by slug
  let maker = await getMakerById(id);
  
  if (!maker) {
    maker = await getMakerBySlug(id);
  }

  if (!maker) {
    notFound();
  }

  const [products, followerCount] = await Promise.all([
    getProductsByMaker(maker.id),
    getMakerFollowerCount(maker.id)
  ]);

  const joinedDate = maker.created_at 
    ? new Date(maker.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    : 'Recently';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Maker Header */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {maker.avatar_url ? (
            <img 
              src={maker.avatar_url} 
              alt={maker.name} 
              className="w-24 h-24 rounded-full object-cover border-2 border-noir-800"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-rose-dark flex items-center justify-center text-rose text-3xl">
              {maker.name[0]}
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="font-serif italic text-3xl text-noir-50 mb-2">
              {maker.name}
            </h1>
            
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
            <button className="btn-secondary text-sm">
              Message maker
            </button>
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
      <div>
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
    </div>
  );
}
