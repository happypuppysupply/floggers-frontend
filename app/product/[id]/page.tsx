import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductById, getProductBySlug, getMakerFollowerCount } from '@/lib/data';
import AddToCartClient from '@/components/AddToCartClient';
import ProductReviews from '@/components/ProductReviews';
import ShippingInfo from '@/components/ShippingInfo';
import FollowButton from '@/components/FollowButton';
import RelatedProducts from '@/components/RelatedProducts';
import MessageMakerButton from '@/components/MessageMakerButton';
import { formatLastActive, isOnline } from '@/lib/time';
import { Star, MapPin, Package, Shield, Clock, Award, Users, Store, MessageSquare } from 'lucide-react';

interface PageProps {
  params: { id: string };
}

function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = isUUID(params.id) 
    ? await getProductById(params.id) 
    : await getProductBySlug(params.id);
  if (!product) {
    return { title: 'Product Not Found' };
  }
  return {
    title: `${product.name} | Floggers`,
    description: product.description?.slice(0, 160),
  };
}

export default async function ProductPage({ params }: PageProps) {
  // Support both UUIDs and slugs
  const product = isUUID(params.id) 
    ? await getProductById(params.id) 
    : await getProductBySlug(params.id);

  if (!product) {
    notFound();
  }

  const followerCount = await getMakerFollowerCount(product.maker_id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-noir-950">
            <img
              src={product.image_url || product.images?.[0] || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnail gallery */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          
          {/* Badges */}
          <div className="grid grid-cols-2 gap-3">
            {product.sales_count && product.sales_count > 100 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Award size={18} className="text-amber-400" />
                <span className="text-xs text-amber-400">Bestseller</span>
              </div>
            )}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Shield size={18} className="text-emerald-400" />
              <span className="text-xs text-emerald-400">Purchase protected</span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div>
          {/* Category & Maker */}
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider text-rose-muted mb-2">
              {product.category?.name}
            </p>
            <h1 className="font-serif italic text-3xl lg:text-4xl text-noir-50 mb-4">
              {product.name}
            </h1>
            
            {/* Maker Info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-noir-900/30 border border-noir-800">
              <div className="relative shrink-0">
                {product.maker?.avatar_url ? (
                  <img 
                    src={product.maker.avatar_url} 
                    alt="" 
                    className="w-12 h-12 rounded-full object-cover" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-rose-dark flex items-center justify-center text-rose text-lg">
                    {product.maker?.name?.[0]}
                  </div>
                )}
                {/* Online indicator */}
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-noir-900 ${
                    isOnline(product.maker?.profile?.last_active) ? 'bg-emerald-400' : 'bg-noir-600'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/maker/${product.maker?.slug || product.maker_id}`}
                  className="text-sm font-medium text-noir-100 hover:text-rose transition-colors block truncate"
                >
                  {product.maker?.name}
                </Link>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs ${isOnline(product.maker?.profile?.last_active) ? 'text-emerald-400' : 'text-noir-500'}`}>
                    {formatLastActive(product.maker?.profile?.last_active)}
                  </span>
                  {product.maker?.rating && (
                    <span className="text-xs text-amber-400 flex items-center gap-1">
                      <Star size={12} className="fill-amber-400" />
                      {product.maker.rating.toFixed(1)}
                    </span>
                  )}
                  {product.maker?.sales_count && (
                    <span className="text-xs text-noir-500">
                      {product.maker.sales_count >= 1000 
                        ? `${(product.maker.sales_count / 1000).toFixed(1)}k` 
                        : product.maker.sales_count} sales
                    </span>
                  )}
                </div>
              </div>
              <FollowButton 
                makerId={product.maker_id} 
                followerCount={followerCount}
              />
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-serif italic text-noir-50">
              ${product.price}
            </span>
            {product.price > 100 && (
              <span className="text-sm text-emerald-400">
                or 4 interest-free payments of ${(product.price / 4).toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock */}
          {product.quantity !== undefined && (
            <p className="text-sm text-noir-400 mb-6">
              {product.quantity > 10 ? 'In stock' : product.quantity > 0 ? `Only ${product.quantity} left` : 'Out of stock'}
            </p>
          )}

          {/* Materials */}
          {product.materials && product.materials.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-noir-400 uppercase tracking-wider mb-2">Materials</p>
              <div className="flex flex-wrap gap-2">
                {product.materials.map((material) => (
                  <span 
                    key={material}
                    className="px-3 py-1.5 text-xs bg-noir-900 rounded-full text-noir-300"
                  >
                    {material}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <p className="text-sm text-noir-300 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Shipping Info */}
          <div className="mb-6">
            <ShippingInfo
              shipping_cost={product.shipping_cost || 0}
              shipping_time_min={product.shipping_time_min}
              shipping_time_max={product.shipping_time_max}
              free_shipping_over={product.free_shipping_over}
              ships_from={product.ships_from}
              product_price={product.price}
            />
          </div>

          {/* Add to Cart */}
          <AddToCartClient product={product} />

          {/* Maker quick actions */}
          <div className="flex gap-3">
            <Link 
              href={`/maker/${product.maker?.slug || product.maker_id}`}
              className="flex-1 btn-secondary text-sm inline-flex items-center justify-center gap-2"
            >
              <Store size={16} /> Visit shop
            </Link>
            <MessageMakerButton 
              makerId={product.maker_id} 
              makerName={product.maker?.name || 'Maker'}
              productName={product.name}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url || product.images?.[0],
                description: product.description,
                materials: product.materials,
                shipping_cost: product.shipping_cost,
                shipping_time_min: product.shipping_time_min,
                shipping_time_max: product.shipping_time_max,
                free_shipping_over: product.free_shipping_over
              }}
            />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <ProductReviews productId={product.id} />

      {/* Related Products */}
      <RelatedProducts 
        productId={product.id}
        makerId={product.maker_id}
        makerName={product.maker?.name || 'Unknown'}
        categoryId={product.category_id}
        makerSlug={product.maker?.slug}
      />
    </div>
  );
}
