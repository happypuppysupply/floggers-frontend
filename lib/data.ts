export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  images?: string[];
  category_id?: string;
  maker_id?: string;
  maker?: {
    name: string;
    slug?: string;
    location?: string;
  };
  rating?: number;
  sales_count?: number;
  in_stock?: boolean;
  quantity?: number;
  materials?: string[];
  badges?: string[];
  category?: {
    name: string;
    slug: string;
  };
  // Shipping fields (from 002 migration)
  shipping_cost?: number;
  shipping_time_min?: number;
  shipping_time_max?: number;
  shipping_policies?: string;
  free_shipping_over?: number;
  ships_from?: string;
}

import { createClient } from './supabase/client';

export async function getProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      maker:makers(name, slug, location)
    `)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      maker:makers(*),
      category:categories(name, slug)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

export async function getCategories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  const supabase = createClient();
  // Get random featured products
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      maker:makers(name, slug, location)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return data || [];
}

export async function searchProducts(query: string): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('search_products', {
    search_query: query,
  });

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }

  return data || [];
}

export async function getMakers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('makers')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching makers:', error);
    return [];
  }

  return data || [];
}

export async function getMakerBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('makers')
    .select(`
      *,
      products:products(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching maker:', error);
    return null;
  }

  return data;
}

export async function getMakerById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('makers')
    .select(`
      *,
      products:products(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching maker:', error);
    return null;
  }

  return data;
}

// Cart functions
export async function getCartItems(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(
        id, name, price, image_url,
        maker:makers(name)
      )
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching cart:', error);
    return [];
  }

  return data || [];
}

export async function addToCart({ user_id, product_id, quantity = 1, variant_label = null }: any) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('cart_items')
    .upsert(
      { 
        user_id, 
        product_id, 
        quantity,
        variant_label,
        updated_at: new Date().toISOString()
      },
      { 
        onConflict: 'user_id,product_id',
        ignoreDuplicates: false
      }
    );

  if (error) {
    console.error('Error adding to cart:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateCartItem(itemId: string, quantity: number) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId);

  if (error) {
    console.error('Error updating cart:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function removeFromCart(itemId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error removing from cart:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Order functions
export async function createOrder({ user_id, items, shipping_address, total, shipping }: any) {
  const supabase = createClient();
  
  // Use the RPC function to create order from cart
  const { data: orderId, error: orderError } = await supabase.rpc('create_order_from_cart', {
    p_user_id: user_id,
    p_shipping_address: JSON.stringify(shipping_address),
    p_shipping_cost: shipping
  });

  if (orderError) {
    console.error('Error creating order:', orderError);
    return { success: false, error: orderError.message };
  }

  return { success: true, orderId };
}

export async function getOrders(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(name, image_url)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
}

// Review functions
export async function getReviews(productId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:profiles(first_name, last_name, avatar_url)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return data || [];
}

export async function createReview({ user_id, product_id, rating, comment }: any) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      user_id,
      product_id,
      rating,
      comment
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// NEW: Check if user purchased product (for reviews)
export async function userPurchasedProduct(userId: string, productId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('user_purchased_product', {
    p_user_id: userId,
    p_product_id: productId
  });

  if (error) {
    console.error('Error checking purchase:', error);
    return false;
  }

  return data || false;
}

// NEW: Follow maker functions
export async function isFollowingMaker(userId: string, makerId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('maker_follows')
    .select('id')
    .eq('user_id', userId)
    .eq('maker_id', makerId)
    .maybeSingle();

  if (error) {
    console.error('Error checking follow:', error);
    return false;
  }

  return !!data;
}

export async function getMakerFollowerCount(makerId: string): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('maker_follows')
    .select('id', { count: 'exact', head: true })
    .eq('maker_id', makerId);

  if (error) {
    console.error('Error fetching follower count:', error);
    return 0;
  }

  return data || 0;
}

export async function followMaker(userId: string, makerId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('maker_follows')
    .insert({ user_id: userId, maker_id: makerId });

  if (error) {
    console.error('Error following maker:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function unfollowMaker(userId: string, makerId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('maker_follows')
    .delete()
    .eq('user_id', userId)
    .eq('maker_id', makerId);

  if (error) {
    console.error('Error unfollowing maker:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// NEW: Get related products
export async function getRelatedProducts(productId: string, makerId?: string, categoryId?: string): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_related_products', {
    p_product_id: productId,
    p_maker_id: makerId || null,
    p_category_id: categoryId || null,
    p_limit: 6
  });

  if (error) {
    console.error('Error fetching related products:', error);
    return [];
  }

  return data || [];
}

// NEW: Get products by maker (for "More from this shop")
export async function getProductsByMaker(makerId: string, excludeProductId?: string, limit: number = 4): Promise<Product[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('products')
    .select(`
      *,
      maker:makers(name)
    `)
    .eq('maker_id', makerId)
    .eq('is_active', true);
  
  if (excludeProductId) {
    query = query.neq('id', excludeProductId);
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching maker products:', error);
    return [];
  }

  return data || [];
}

// Message functions
export async function getConversations(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      last_message:messages(content, created_at)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return data || [];
}

export async function getMessages(conversationId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles(first_name, last_name, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}

export async function sendMessage({ conversation_id, sender_id, content }: any) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id,
      sender_id,
      content
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
