export interface Product {
  id: string
  name: string
  makerId: string
  makerName: string
  category: string
  price: number
  rating: number
  reviews: number
  image: string
  images: string[]
  description: string
  materials: string[]
  variants?: { label: string; price: number }[]
  badge?: string
}

export interface Maker {
  id: string
  name: string
  tagline: string
  bio: string
  location: string
  since: number
  rating: number
  products: number
  image: string
  featured?: boolean
}

export interface Review {
  id: string
  productId: string
  author: string
  rating: number
  text: string
  date: string
  verified: boolean
}

export const categories = [
  { id: 'floggers', name: 'Floggers', count: 42, image: 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=400&h=300&fit=crop' },
  { id: 'paddles', name: 'Paddles', count: 28, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=300&fit=crop' },
  { id: 'crops', name: 'Crops & Canes', count: 19, image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300&fit=crop' },
  { id: 'restraints', name: 'Restraints & Cuffs', count: 35, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop' },
  { id: 'collars', name: 'Collars & Leashes', count: 24, image: 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=400&h=300&fit=crop' },
  { id: 'accessories', name: 'Accessories', count: 31, image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=400&h=300&fit=crop' },
]

export const makers: Maker[] = [
  {
    id: 'black-raven',
    name: 'Black Raven Leather',
    tagline: 'Artisan leather floggers hand-crafted in Portland',
    bio: 'Founded in 2018, Black Raven Leather specializes in premium BDSM floggers and impact toys crafted from full-grain Italian leather. Every piece is hand-cut, hand-dyed, and hand-stitched by a team of four artisans who believe quality should never be compromised.',
    location: 'Portland, OR',
    since: 2018,
    rating: 4.9,
    products: 34,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    featured: true,
  },
  {
    id: 'iron-heart',
    name: 'Iron Heart Forge',
    tagline: 'Steel and fire, forged for play',
    bio: 'A metalworking collective creating heavy-duty restraints, spreader bars, and custom dungeon furniture. Each piece is MIG-welded from aircraft-grade steel and powder-coated for durability.',
    location: 'Detroit, MI',
    since: 2015,
    rating: 4.8,
    products: 28,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    featured: true,
  },
  {
    id: 'velvet-noose',
    name: 'Velvet Noose Ropeworks',
    tagline: 'Japanese-inspired rope in silk and jute',
    bio: 'Specializing in Shibari-grade jute and silk ropes, Velvet Noose sources ethically-produced natural fibers from Japan and India. Their ropes are conditioned, singed, and ready to tie out of the box.',
    location: 'San Francisco, CA',
    since: 2020,
    rating: 4.9,
    products: 19,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face',
  },
  {
    id: 'crimson-crest',
    name: 'Crimson Crest Designs',
    tagline: 'Bold collars for bold statements',
    bio: 'A woman-owned studio creating statement collars and day collars that blur the line between kink and fashion. Vegan leather options available.',
    location: 'Austin, TX',
    since: 2019,
    rating: 4.7,
    products: 41,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
    featured: true,
  },
  {
    id: 'obsidian-oak',
    name: 'Obsidian Oak',
    tagline: 'Solid hardwood paddles and toys',
    bio: 'Sustainable hardwood impact toys sourced from fallen trees. Each piece is carved, sanded to 600-grit, and finished with food-safe mineral oil.',
    location: 'Asheville, NC',
    since: 2017,
    rating: 4.8,
    products: 22,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
  },
  {
    id: 'midnight-silk',
    name: 'Midnight Silk Co.',
    tagline: 'Luxury blindfolds, gags, and sensory gear',
    bio: 'Using deadstock luxury fashion fabrics from Europe, Midnight Silk transforms discarded couture into exquisite sensory deprivation and stimulation gear.',
    location: 'Brooklyn, NY',
    since: 2021,
    rating: 4.6,
    products: 15,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
  },
  {
    id: 'thorn-rose',
    name: 'Thorn & Rose Studios',
    tagline: 'Electrostimulation and violet wands',
    bio: 'Engineer-designed and maker-tested electrostimulation gear. All devices carry CE marking and include comprehensive safety documentation.',
    location: 'Seattle, WA',
    since: 2016,
    rating: 4.9,
    products: 12,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face',
  },
  {
    id: 'copper-chain',
    name: 'Copper Chain Atelier',
    tagline: 'Chainmail and metal body jewelry',
    bio: 'Traditional chainmail techniques applied to body jewelry and decorative restraints. Custom sizing available for every piece.',
    location: 'New Orleans, LA',
    since: 2014,
    rating: 4.7,
    products: 31,
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=300&h=300&fit=crop&crop=face',
  },
]

export const products: Product[] = [
  {
    id: 'flogger-premium',
    name: 'The Sovereign Flogger',
    makerId: 'black-raven',
    makerName: 'Black Raven Leather',
    category: 'floggers',
    price: 185,
    rating: 4.9,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=600&fit=crop',
    ],
    description: 'Our flagship flogger features 36 falls of premium buffalo hide with a balanced, braided leather handle. The Sovereign delivers a satisfying thud with minimal sting, perfect for both beginners and experienced practitioners. Each flogger is individually weighted and tested for perfect balance before shipping.',
    materials: ['Full-grain Italian leather', ' buffalo hide falls', 'Braided leather handle', 'Steel core'],
    variants: [{ label: 'Standard (24")', price: 185 }, { label: 'Long (30")', price: 205 }],
    badge: 'Bestseller',
  },
  {
    id: 'flogger-deer',
    name: 'Velvet Touch Flogger',
    makerId: 'black-raven',
    makerName: 'Black Raven Leather',
    category: 'floggers',
    price: 145,
    rating: 4.8,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=600&h=600&fit=crop',
    ],
    description: 'Ultra-soft deer hide falls create a gentle, caressing sensation. Ideal for sensation play and warm-up scenes. The Velvet Touch is a favorite among those who prefer a lighter, more sensual experience.',
    materials: ['Deer hide falls', 'Suede wrapped handle', 'Nickel-plated hardware'],
    variants: [{ label: 'Suede', price: 145 }, { label: 'Elk Leather', price: 175 }],
  },
  {
    id: 'flogger-rubber',
    name: 'Thunderstrike Rubber Flogger',
    makerId: 'black-raven',
    makerName: 'Black Raven Leather',
    category: 'floggers',
    price: 95,
    rating: 4.7,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&h=600&fit=crop',
    ],
    description: '24 falls of heavy rubber deliver an intense, biting sting. The Thunderstrike is for those who crave intensity. Easy to clean and maintain — perfect for dungeon play.',
    materials: ['Heavy rubber falls', 'Rubberized grip handle', 'Stainless steel core'],
  },
  {
    id: 'paddle-leather',
    name: 'The Courtier Paddle',
    makerId: 'obsidian-oak',
    makerName: 'Obsidian Oak',
    category: 'paddles',
    price: 65,
    rating: 4.8,
    reviews: 134,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
    ],
    description: 'A classic oval paddle carved from fallen Black Walnut. The Courtier is sanded to a silky 600-grit finish and sealed with food-safe mineral oil. Available with or without holes for reduced air resistance.',
    materials: ['Black Walnut hardwood', 'Food-safe mineral oil finish'],
    variants: [{ label: 'Standard (12")', price: 65 }, { label: 'Elite (16")', price: 85 }],
    badge: 'Popular',
  },
  {
    id: 'crop-elegant',
    name: 'The Aristocrat Riding Crop',
    makerId: 'black-raven',
    makerName: 'Black Raven Leather',
    category: 'crops',
    price: 55,
    rating: 4.6,
    reviews: 78,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&h=600&fit=crop',
    ],
    description: 'A slim, elegant riding crop with a braided leather shaft and flexible fiberglass core. The leather loop provides a satisfying snap. Available in classic black, oxblood, and midnight blue.',
    materials: ['Braided leather shaft', 'Fiberglass core', 'Leather loop tip'],
    variants: [{ label: 'Black', price: 55 }, { label: 'Oxblood', price: 55 }, { label: 'Midnight Blue', price: 60 }],
  },
  {
    id: 'cuffs-leather',
    name: 'Abyss Wrist Cuffs',
    makerId: 'black-raven',
    makerName: 'Black Raven Leather',
    category: 'restraints',
    price: 72,
    rating: 4.7,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=600&h=600&fit=crop',
    ],
    description: 'Padded wrist cuffs with a sheepskin lining and locking buckle. The Abyss line prioritizes comfort during long scenes without sacrificing security. D-rings at both ends for versatile suspension compatibility.',
    materials: ['Italian leather', 'Sheepskin lining', 'Nickel hardware'],
    variants: [{ label: 'Standard', price: 72 }, { label: 'Ankle (Pair)', price: 78 }],
  },
  {
    id: 'collar-day',
    name: 'The Sovereign Day Collar',
    makerId: 'crimson-crest',
    makerName: 'Crimson Crest Designs',
    category: 'collars',
    price: 48,
    rating: 4.9,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&h=600&fit=crop',
    ],
    description: 'A subtle day collar designed to pass in public while carrying deep personal meaning. The Sovereign features a discrete D-ring and a locking clasp compatible with standard padlocks. Available in matte black, polished silver, and rose gold finishes.',
    materials: ['316L stainless steel', 'PVD coating', 'Hypoallergenic'],
    variants: [{ label: 'Matte Black', price: 48 }, { label: 'Rose Gold', price: 58 }, { label: 'Polished Silver', price: 48 }],
    badge: 'Most Reviewed',
  },
  {
    id: 'flogger-suede',
    name: 'Phoenix Tail Suede Flogger',
    makerId: 'velvet-noose',
    makerName: 'Velvet Noose Ropeworks',
    category: 'floggers',
    price: 85,
    rating: 4.8,
    reviews: 112,
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=600&h=600&fit=crop',
    ],
    description: '24 falls of premium suede leather with a balanced, braided handle. The Phoenix Tail delivers a satisfying thud with minimal sting. Each flogger is individually weighted and tested for balance before shipping.',
    materials: ['Genuine suede leather', 'Braided leather handle', 'Steel core'],
    variants: [{ label: 'Suede', price: 85 }, { label: 'Elk Leather', price: 120 }],
  },
  {
    id: 'paddle-glass',
    name: 'Crystal Clear Acrylic Paddle',
    makerId: 'obsidian-oak',
    makerName: 'Obsidian Oak',
    category: 'paddles',
    price: 45,
    rating: 4.5,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&h=600&fit=crop',
    ],
    description: 'A sleek, modern paddle crafted from polished acrylic. The transparent design adds a psychological element to play. Easy to sanitize and maintain.',
    materials: ['Polished acrylic', 'Rounded edges', 'Leather hanging strap'],
  },
  {
    id: 'restraints-set',
    name: 'The Prisoner Restraint Set',
    makerId: 'iron-heart',
    makerName: 'Iron Heart Forge',
    category: 'restraints',
    price: 195,
    rating: 4.8,
    reviews: 45,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=600&h=600&fit=crop',
    ],
    description: 'A complete wrist and ankle restraint set in aircraft-grade aluminum. Includes four cuffs, two spreader bars, and quick-release clips. Powder-coated in matte black.',
    materials: ['6061-T6 Aluminum', 'Powder coat finish', 'Stainless fittings'],
  },
  {
    id: 'collar-locking',
    name: 'The Obedience Locking Collar',
    makerId: 'crimson-crest',
    makerName: 'Crimson Crest Designs',
    category: 'collars',
    price: 85,
    rating: 4.7,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&h=600&fit=crop',
    ],
    description: 'A statement collar with a visible padlock closure. Handcrafted from bridle leather with solid brass hardware. The padlock clicks with the most satisfying sound.',
    materials: ['Bridle leather', 'Solid brass hardware', 'Includes padlock'],
  },
  {
    id: 'crop-riding',
    name: 'Equestrian Training Crop',
    makerId: 'black-raven',
    makerName: 'Black Raven Leather',
    category: 'crops',
    price: 42,
    rating: 4.4,
    reviews: 56,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&h=600&fit=crop',
    ],
    description: 'A traditional equestrian crop reimagined for play. The flexible shaft delivers a sharp, precise snap. Available in multiple lengths and colors.',
    materials: ['Fiberglass shaft', 'Leather wrapped grip', 'Leather keeper'],
    variants: [{ label: '26"', price: 42 }, { label: '30"', price: 48 }],
  },
]

export const reviews: Review[] = [
  { id: 'r1', productId: 'flogger-premium', author: 'Raven_K', rating: 5, text: 'Absolutely worth every penny. The balance is perfect, the falls are supple yet substantial. This is now my go-to flogger for scenes.', date: '2024-12-15', verified: true },
  { id: 'r2', productId: 'flogger-premium', author: 'MistressV', rating: 5, text: 'Bought this for my sub and they love it. The craftsmanship is evident in every detail. The braided handle feels incredible in the hand.', date: '2024-11-02', verified: true },
  { id: 'r3', productId: 'flogger-premium', author: 'LeatherLover99', rating: 5, text: 'Beautiful leather work. The buffalo hide falls have the perfect weight for thuddy impact. Will definitely order from Black Raven again.', date: '2024-10-18', verified: true },
  { id: 'r4', productId: 'collar-day', author: 'Kitten_J', rating: 5, text: 'I wear this to work every day and no one has ever noticed. The lock clicks with the most satisfying sound.', date: '2024-12-20', verified: true },
  { id: 'r5', productId: 'collar-day', author: 'Dom_Darius', rating: 5, text: 'The rose gold finish is stunning. My partner cried when I locked it on. Perfect.', date: '2024-11-28', verified: true },
  { id: 'r6', productId: 'paddle-leather', author: 'DungeonKeeper', rating: 4, text: 'Solid construction, beautiful wood grain. The walnut has a lovely heft to it.', date: '2024-09-14', verified: true },
  { id: 'r7', productId: 'crop-elegant', author: 'RopeTopSF', rating: 5, text: 'Elegant and deadly accurate. The snap is sharp and satisfying.', date: '2024-12-10', verified: true },
  { id: 'r8', productId: 'flogger-rubber', author: 'PainPuppet', rating: 5, text: 'This thing HURTS in the best way. Easy to clean after messy scenes too.', date: '2024-11-05', verified: true },
]

export const getProductById = (id: string) => products.find(p => p.id === id)
export const getMakerById = (id: string) => makers.find(m => m.id === id)
export const getProductsByMaker = (makerId: string) => products.filter(p => p.makerId === makerId)
export const getProductsByCategory = (categoryId: string) => products.filter(p => p.category === categoryId)
export const getReviewsByProduct = (productId: string) => reviews.filter(r => r.productId === productId)
