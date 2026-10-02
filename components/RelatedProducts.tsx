'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getProductsByMaker, getProductsByCategory, getRelatedProducts, getMakerById } from '@/lib/data'
import ProductCard from './ProductCard'

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  maker_id: string;
  maker_name: string;
  relevance_score?: number;
}

interface RelatedProductsProps {
  productId: string;
  makerId: string;
  makerName: string;
  categoryId?: string;
  makerSlug?: string;
}

export default function RelatedProducts({ 
  productId, 
  makerId, 
  makerName,
  categoryId,
  makerSlug
}: RelatedProductsProps) {
  const [makerProducts, setMakerProducts] = useState<Product[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [makerLinkSlug, setMakerLinkSlug] = useState<string>(makerSlug || makerId);

  useEffect(() => {
    loadProducts();
  }, [productId, makerId, categoryId]);

  const loadProducts = async () => {
    setLoading(true);
    
    // Get "More from this shop"
    const makerProds = await getProductsByMaker(makerId, productId, 4);
    setMakerProducts(makerProds);
    
    // Get "Similar Products" from same category (different makers)
    if (categoryId) {
      const similarProds = await getProductsByCategory(categoryId, productId, makerId, 4);
      setSimilarProducts(similarProds);
    }
    
    // Get "You may also like" - only if IDs are valid UUIDs
    // Validate UUID format before calling RPC
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidProductId = uuidRegex.test(productId);
    const isValidMakerId = uuidRegex.test(makerId);
    const isValidCategoryId = categoryId ? uuidRegex.test(categoryId) : false;
    
    if (isValidProductId && (isValidMakerId || isValidCategoryId)) {
      const relProds = await getRelatedProducts(productId, makerId, categoryId);
      setRelatedProducts(relProds.filter(p => p.id !== productId));
    }
    
    // Fetch maker slug if not provided
    if (!makerSlug) {
      const maker = await getMakerById(makerId);
      if (maker?.slug) {
        setMakerLinkSlug(maker.slug);
      }
    }
    
    setLoading(false);
  };

  if (loading) return null;

  return (
    <div className="mt-16">
      {/* More from this shop */}
      {makerProducts.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif italic text-xl text-noir-50">
              More from {makerName}
            </h2>
            <Link 
              href={`/maker/${makerLinkSlug}`}
              className="text-sm text-rose hover:text-rose-light"
            >
              View shop
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {makerProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  ...product,
                  maker: { name: makerName }
                }} 
                compact 
              />
            ))}
          </div>
        </div>
      )}

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="font-serif italic text-xl text-noir-50 mb-6">
            Similar Products
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  ...product,
                  maker: { name: product.maker_name || 'Unknown' }
                }} 
                compact 
              />
            ))}
          </div>
        </div>
      )}

      {/* You may also like */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="font-serif italic text-xl text-noir-50 mb-6">
            You may also like
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {relatedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  ...product,
                  maker: { name: product.maker_name || 'Unknown' }
                }} 
                compact 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
