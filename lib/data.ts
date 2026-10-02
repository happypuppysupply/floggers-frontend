export interface Product {
  id: string;
  name: string;
  slug?: string;
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
    avatar_url?: string;
    sales_count?: number;
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

export async function getProducts(options?: { featured?: boolean; limit?: number }): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase
    .from('products')
    .select(`
      *,
      maker:makers(name, slug, location)
    `)
    .eq('is_active', true);

  if (options?.featured) {
    query = query.eq('featured', true);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      maker:makers(name, slug, location)
    `)
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
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

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      maker:makers(*),
      category:categories(name, slug)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching product by slug:', error);
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

export async function getMakers(options?: { featured?: boolean; limit?: number }) {
  const supabase = createClient();
  let query = supabase
    .from('makers')
    .select('*')
    .eq('is_verified', true)
    .order('name');

  if (options?.featured) {
    query = query.eq('featured', true);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

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
      user:profiles(full_name, avatar_url)
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
  
  // Try RPC first, fallback to direct query
  try {
    const { data, error } = await supabase.rpc('get_related_products', {
      p_product_id: productId,
      p_maker_id: makerId || null,
      p_category_id: categoryId || null,
      p_limit: 6
    });

    if (!error) {
      return data || [];
    }
  } catch (e) {
    // RPC not available, fallback below
  }

  // Fallback: query products directly
  let query = supabase
    .from('products')
    .select('*, maker:makers(name)')
    .neq('id', productId)
    .eq('is_active', true)
    .limit(6);

  if (makerId) {
    query = query.eq('maker_id', makerId);
  }
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching related products:', error);
    return [];
  }

  return (data || []).map((p: any) => ({
    ...p,
    maker_name: p.maker?.name || 'Unknown'
  }));
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
      sender:profiles(full_name, avatar_url)
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

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

export async function getDashboardStats(makerId: string) {
  const supabase = createClient();
  
  // Get total sales
  const { data: salesData, error: salesError } = await supabase
    .from('order_items')
    .select('quantity, price')
    .eq('maker_id', makerId);
  
  if (salesError) {
    console.error('Error fetching sales:', salesError);
  }
  
  const totalSales = salesData?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;
  const totalOrders = salesData?.length || 0;
  
  // Get product count
  const { count: productCount, error: productError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('maker_id', makerId);
  
  // Get unique customers (fix: query order_items first, then orders)
  const { data: orderItemsData } = await supabase
    .from('order_items')
    .select('order_id')
    .eq('maker_id', makerId);
  
  const orderIds = orderItemsData?.map(i => i.order_id).filter(Boolean) || [];
  let uniqueCustomers = 0;
  if (orderIds.length > 0) {
    const { data: customersData } = await supabase
      .from('orders')
      .select('user_id')
      .in('id', orderIds)
      .not('user_id', 'is', null);
    uniqueCustomers = customersData ? [...new Set(customersData.map(o => o.user_id))].length : 0;
  }
  
  return {
    totalSales,
    totalOrders,
    productCount: productCount || 0,
    customerCount: uniqueCustomers
  };
}

export async function getMakerOrders(makerId: string, status?: string) {
  const supabase = createClient();
  
  // Fix: get order IDs from order_items first, then fetch full orders
  const { data: orderItemsData, error: itemsError } = await supabase
    .from('order_items')
    .select('order_id')
    .eq('maker_id', makerId);
  
  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    return [];
  }
  
  const orderIds = orderItemsData?.map(i => i.order_id).filter(Boolean) || [];
  if (orderIds.length === 0) return [];
  
  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(name, image_url, id)
      ),
      user:profiles(email, full_name)
    `)
    .in('id', orderIds)
    .order('created_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching maker orders:', error);
    return [];
  }
  
  return data || [];
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);
  
  if (error) {
    console.error('Error updating order:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

// Start or get conversation
export async function getOrCreateConversation(user1Id: string, user2Id: string) {
  const supabase = createClient();
  
  // Check if conversation exists — find all conversations user1 is in
  const { data: existingConvs, error: findError } = await supabase
    .from('conversations')
    .select('*')
    .or(`user1_id.eq.${user1Id},user2_id.eq.${user1Id}`);
  
  const existingConv = existingConvs?.find(c =>
    c.user1_id === user2Id || c.user2_id === user2Id
  );
  
  if (existingConv) {
    return existingConv;
  }
  
  // Create new conversation
  const { data: newConv, error: createError } = await supabase
    .from('conversations')
    .insert({
      user1_id: user1Id,
      user2_id: user2Id
    })
    .select()
    .single();
  
  if (createError) {
    console.error('Error creating conversation:', createError);
    return null;
  }
  
  return newConv;
}

// Get maker reviews
export async function getMakerReviews(makerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('maker_reviews')
    .select(`
      *,
      reviewer:profiles(full_name, avatar_url)
    `)
    .eq('maker_id', makerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching maker reviews:', error);
    return [];
  }

  return data || [];
}

// Favorites/Wishlist functions
export async function toggleFavorite(userId: string, productId: string): Promise<{ success: boolean; isFavorited: boolean; error?: string }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .rpc('toggle_favorite', {
      p_user_id: userId,
      p_product_id: productId
    });

  if (error) {
    console.error('Error toggling favorite:', error);
    return { success: false, isFavorited: false, error: error.message };
  }

  return { success: true, isFavorited: data };
}

export async function isFavorited(userId: string, productId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .rpc('is_favorited', {
      p_user_id: userId,
      p_product_id: productId
    });

  if (error) {
    console.error('Error checking favorite:', error);
    return false;
  }

  return data || false;
}

export async function getUserFavorites(userId: string): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .rpc('get_user_favorites', {
      p_user_id: userId
    });

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.product_id,
    name: item.product_name,
    slug: item.product_slug,
    price: item.product_price,
    image_url: item.product_image_url,
    maker_id: item.maker_id,
    maker: {
      name: item.maker_name || 'Unknown'
    }
  }));
}

// Get followed makers for a user
export async function getUserFollowedMakers(userId: string) {
  const supabase = createClient();
  
  // First get the maker IDs
  const { data: follows, error: followError } = await supabase
    .from('maker_follows')
    .select('maker_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (followError) {
    console.error('Error fetching follows:', followError);
    return [];
  }

  if (!follows || follows.length === 0) {
    return [];
  }

  const makerIds = follows.map((f: any) => f.maker_id);

  // Then fetch maker details
  const { data: makers, error: makerError } = await supabase
    .from('makers')
    .select('id, name, slug, avatar_url, location, bio, rating, sales_count')
    .in('id', makerIds);

  if (makerError) {
    console.error('Error fetching makers:', makerError);
    return [];
  }

  return makers || [];
}

// Get similar makers (for carousel)
export async function getSimilarMakers(makerId: string, limit: number = 6) {
  const supabase = createClient();
  
  // Get the current maker's category/location to find similar ones
  const { data: currentMaker } = await supabase
    .from('makers')
    .select('category_id, location')
    .eq('id', makerId)
    .single();
  
  let query = supabase
    .from('makers')
    .select('id, name, slug, avatar_url, location, bio, rating, sales_count')
    .neq('id', makerId)
    .eq('is_verified', true)
    .limit(limit);
  
  if (currentMaker?.location) {
    // Prioritize same location
    query = query.order('location', { ascending: false });
  }
  
  const { data, error } = await query.order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching similar makers:', error);
    return [];
  }

  return data || [];
}
