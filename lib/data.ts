import { createClient } from '@/lib/supabase/client'

export interface Product {
  id: string
  maker_id: string
  category_id: string
  name: string
  slug: string
  description: string
  price: number
  rating: number
  review_count: number
  images: string[]
  materials: string[]
  badge: string | null
  featured: boolean
  created_at: string
  updated_at: string
  // Joined data
  maker?: Maker
  category?: Category
}

export interface Maker {
  id: string
  name: string
  slug: string
  description: string
  bio: string
  location: string
  rating: number
  image_url: string
  verified: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  product_count?: number
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  text: string
  verified: boolean
  created_at: string
  user?: {
    email: string
  }
}

// Products
export async function getProducts(options?: {
  category?: string
  featured?: boolean
  maker?: string
  limit?: number
}): Promise<Product[]> {
  const supabase = createClient()
  let query = supabase
    .from('products')
    .select('*, maker:makers(*), category:categories(*)')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (options?.category) {
    query = query.eq('category_id', options.category)
  }

  if (options?.featured) {
    query = query.eq('featured', true)
  }

  if (options?.maker) {
    query = query.eq('maker_id', options.maker)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data || []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, maker:makers(*), category:categories(*)')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, maker:makers(*), category:categories(*)')
    .eq('id', id)
    .eq('active', true)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data
}

// Makers
export async function getMakers(options?: { featured?: boolean; limit?: number }): Promise<Maker[]> {
  const supabase = createClient()
  let query = supabase
    .from('makers')
    .select('*')
    .order('rating', { ascending: false })

  if (options?.featured) {
    query = query.eq('featured', true)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching makers:', error)
    return []
  }

  return data || []
}

export async function getMakerBySlug(slug: string): Promise<Maker | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('makers')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching maker:', error)
    return null
  }

  return data
}

export async function getMakerById(id: string): Promise<Maker | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('makers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching maker:', error)
    return null
  }

  return data
}

// Categories
export async function getCategories(): Promise<Category[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*, product_count:products(count)')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return (data || []).map(cat => ({
    ...cat,
    product_count: cat.product_count?.[0]?.count || 0,
  }))
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return null
  }

  return data
}

// Reviews
export async function getReviewsByProduct(productId: string): Promise<Review[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:profiles(email)')
    .eq('product_id', productId)
    .eq('approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }

  return data || []
}

export async function createReview(review: {
  product_id: string
  user_id: string
  rating: number
  text: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  const { error } = await supabase.from('reviews').insert({
    ...review,
    verified: false, // Will be updated by trigger if user purchased
    approved: false,  // Requires moderation
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error('Error creating review:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Cart - Database operations
export async function getCartItems(userId: string): Promise<any[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, product:products(*)')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching cart:', error)
    return []
  }

  return data || []
}

export async function addToCart(item: {
  user_id: string
  product_id: string
  quantity: number
  variant?: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // Check if item already exists
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', item.user_id)
    .eq('product_id', item.product_id)
    .eq('variant', item.variant || null)
    .single()

  if (existing) {
    // Update quantity
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + item.quantity })
      .eq('id', existing.id)

    if (error) {
      return { success: false, error: error.message }
    }
  } else {
    // Insert new
    const { error } = await supabase.from('cart_items').insert(item)
    if (error) {
      return { success: false, error: error.message }
    }
  }

  return { success: true }
}

export async function updateCartItem(id: string, quantity: number): Promise<{ success: boolean }> {
  const supabase = createClient()
  
  if (quantity <= 0) {
    await supabase.from('cart_items').delete().eq('id', id)
  } else {
    await supabase.from('cart_items').update({ quantity }).eq('id', id)
  }
  
  return { success: true }
}

export async function removeFromCart(id: string): Promise<{ success: boolean }> {
  const supabase = createClient()
  await supabase.from('cart_items').delete().eq('id', id)
  return { success: true }
}

// Orders
export async function createOrder(order: {
  user_id: string
  items: any[]
  shipping_address: any
  total: number
  shipping: number
}): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const supabase = createClient()

  // Create order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: order.user_id,
      status: 'pending',
      total: order.total,
      shipping: order.shipping,
      shipping_address: order.shipping_address,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (orderError || !orderData) {
    return { success: false, error: orderError?.message }
  }

  // Create order items
  const orderItems = order.items.map(item => ({
    order_id: orderData.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
    variant: item.variant,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  
  if (itemsError) {
    return { success: false, error: itemsError.message }
  }

  // Clear cart
  await supabase.from('cart_items').delete().eq('user_id', order.user_id)

  return { success: true, orderId: orderData.id }
}

export async function getOrdersByUser(userId: string): Promise<any[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(name, images))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data || []
}

// Search
export async function searchProducts(query: string): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, maker:makers(*)')
    .eq('active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(20)

  if (error) {
    console.error('Error searching products:', error)
    return []
  }

  return data || []
}
