import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const categories = [
  { id: 'floggers', name: 'Floggers', slug: 'floggers', description: 'Handcrafted leather floggers and whips', image_url: 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=400&h=300&fit=crop' },
  { id: 'paddles', name: 'Paddles', slug: 'paddles', description: 'Impact paddles in various materials', image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=300&fit=crop' },
  { id: 'crops', name: 'Crops & Canes', slug: 'crops-canes', description: 'Riding crops and canes', image_url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300&fit=crop' },
  { id: 'restraints', name: 'Restraints', slug: 'restraints', description: 'Cuffs, ropes, and bondage gear', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop' },
  { id: 'collars', name: 'Collars', slug: 'collars', description: 'Collars and leashes', image_url: 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=400&h=300&fit=crop' },
  { id: 'accessories', name: 'Accessories', slug: 'accessories', description: 'Additional BDSM accessories', image_url: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=400&h=300&fit=crop' },
]

const makers = [
  {
    id: 'maker-1',
    name: 'Black Raven Leather',
    slug: 'black-raven-leather',
    description: 'Artisan leather floggers hand-crafted in Portland',
    bio: 'Founded in 2018, Black Raven Leather specializes in premium BDSM floggers and impact toys crafted from full-grain Italian leather. Every piece is hand-cut, hand-dyed, and hand-stitched by a team of four artisans.',
    location: 'Portland, OR',
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    verified: true,
    featured: true,
  },
  {
    id: 'maker-2',
    name: 'Iron Heart Forge',
    slug: 'iron-heart-forge',
    description: 'Steel and fire, forged for play',
    bio: 'A metalworking collective creating heavy-duty restraints, spreader bars, and custom dungeon furniture. Each piece is MIG-welded from aircraft-grade steel and powder-coated for durability.',
    location: 'Detroit, MI',
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    verified: true,
    featured: true,
  },
  {
    id: 'maker-3',
    name: 'Velvet Noose Ropeworks',
    slug: 'velvet-noose-ropeworks',
    description: 'Japanese-inspired rope in silk and jute',
    bio: 'Specializing in Shibari-grade jute and silk ropes, Velvet Noose sources ethically-produced natural fibers from Japan and India. Their ropes are conditioned, singed, and ready to tie.',
    location: 'San Francisco, CA',
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face',
    verified: true,
    featured: false,
  },
  {
    id: 'maker-4',
    name: 'Crimson Crest Designs',
    slug: 'crimson-crest-designs',
    description: 'Bold collars for bold statements',
    bio: 'A woman-owned studio creating statement collars and day collars that blur the line between kink and fashion. Vegan leather options available.',
    location: 'Austin, TX',
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
    verified: true,
    featured: true,
  },
]

const products = [
  {
    id: 'prod-1',
    maker_id: 'maker-1',
    category_id: 'floggers',
    name: 'The Penumbra Flogger',
    slug: 'the-penumbra-flogger',
    description: 'A 24-tailed deer hide flogger with a weighted oak handle. The tails are cut to graduated lengths for a satisfying thud that builds with each swing.',
    price: 185.00,
    rating: 4.9,
    review_count: 47,
    images: ['https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=600&h=600&fit=crop'],
    materials: ['Full-grain Italian leather', 'Oak handle', 'Brass hardware'],
    badge: 'Bestseller',
    featured: true,
  },
  {
    id: 'prod-2',
    maker_id: 'maker-1',
    category_id: 'floggers',
    name: 'Midnight Mini Flogger',
    slug: 'midnight-mini-flogger',
    description: 'Compact 12-tailed flogger perfect for travel or close-quarters play. Same quality leather, portable size.',
    price: 95.00,
    rating: 4.7,
    review_count: 28,
    images: ['https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&h=600&fit=crop'],
    materials: ['Latigo leather', 'Walnut handle'],
    badge: null,
    featured: false,
  },
  {
    id: 'prod-3',
    maker_id: 'maker-2',
    category_id: 'restraints',
    name: 'Abyss Wrist Cuffs',
    slug: 'abyss-wrist-cuffs',
    description: 'Heavy-duty leather wrist cuffs with locking buckle and D-rings. Lined with soft suede for comfort during extended wear.',
    price: 72.00,
    rating: 4.8,
    review_count: 38,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'],
    materials: ['4oz latigo leather', 'Suede lining', 'Nickel-plated hardware'],
    badge: null,
    featured: true,
  },
  {
    id: 'prod-4',
    maker_id: 'maker-4',
    category_id: 'collars',
    name: 'The Sovereign Collar',
    slug: 'the-sovereign-collar',
    description: 'A statement collar in deep burgundy leather with hand-stamped filigree pattern. Features a locking clasp and discreet D-ring.',
    price: 68.00,
    rating: 4.9,
    review_count: 32,
    images: ['https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=600&h=600&fit=crop'],
    materials: ['Full-grain leather', 'Locking clasp', 'Hand-stamped pattern'],
    badge: 'Featured',
    featured: true,
  },
  {
    id: 'prod-5',
    maker_id: 'maker-2',
    category_id: 'paddles',
    name: 'Ironwood Spanking Paddle',
    slug: 'ironwood-spanking-paddle',
    description: 'Solid maple paddle with a leather-wrapped handle. The smooth, polished surface delivers a satisfying sting.',
    price: 55.00,
    rating: 4.6,
    review_count: 19,
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&h=600&fit=crop'],
    materials: ['Hard maple', 'Leather wrap', 'Beeswax finish'],
    badge: null,
    featured: false,
  },
  {
    id: 'prod-6',
    maker_id: 'maker-3',
    category_id: 'restraints',
    name: 'Shibari Jute Rope Set',
    slug: 'shibari-jute-rope-set',
    description: 'Six 8-meter jute ropes, singed and conditioned. Ideal for Shibari and suspension work.',
    price: 89.00,
    rating: 4.9,
    review_count: 42,
    images: ['https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=600&fit=crop'],
    materials: ['Japanese jute', 'Natural oils'],
    badge: 'Top Rated',
    featured: true,
  },
  {
    id: 'prod-7',
    maker_id: 'maker-1',
    category_id: 'floggers',
    name: 'Phoenix Tail Flogger',
    slug: 'phoenix-tail-flogger',
    description: 'A dramatic 36-tailed flogger with graduated lengths. The longer tails create a cascading sensation.',
    price: 245.00,
    rating: 5.0,
    review_count: 15,
    images: ['https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=600&h=600&fit=crop'],
    materials: ['Premium suede', 'Brass handle', 'Leather lacing'],
    badge: 'Premium',
    featured: true,
  },
  {
    id: 'prod-8',
    maker_id: 'maker-4',
    category_id: 'collars',
    name: 'Day Collar - Minimalist',
    slug: 'day-collar-minimalist',
    description: 'Subtle enough for daily wear, beautiful enough for play. Magnetic clasp for safety.',
    price: 45.00,
    rating: 4.5,
    review_count: 56,
    images: ['https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=600&h=600&fit=crop'],
    materials: ['Vegan leather', 'Magnetic clasp'],
    badge: null,
    featured: false,
  },
]

async function seedData() {
  console.log('Seeding categories...')
  for (const category of categories) {
    const { error } = await supabase.from('categories').upsert(category)
    if (error) console.error('Category error:', error)
  }

  console.log('Seeding makers...')
  for (const maker of makers) {
    const { error } = await supabase.from('makers').upsert(maker)
    if (error) console.error('Maker error:', error)
  }

  console.log('Seeding products...')
  for (const product of products) {
    const { error } = await supabase.from('products').upsert(product)
    if (error) console.error('Product error:', error)
  }

  console.log('Seed complete!')
}

seedData().catch(console.error)
