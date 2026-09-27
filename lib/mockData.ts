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

export interface Category {
  id: string
  name: string
  count: number
  image: string
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
  { id: 'bondage', name: 'Bondage & Restraint', count: 42, image: 'https://picsum.photos/seed/bondage/400/300' },
  { id: 'impact', name: 'Impact Play', count: 38, image: 'https://picsum.photos/seed/impact/400/300' },
  { id: 'restraints', name: 'Restraints & Cuffs', count: 56, image: 'https://picsum.photos/seed/restraints/400/300' },
  { id: 'collars', name: 'Collars & Leashes', count: 29, image: 'https://picsum.photos/seed/collars/400/300' },
  { id: 'apparel', name: 'Apparel & Accessories', count: 67, image: 'https://picsum.photos/seed/apparel/400/300' },
  { id: 'gear', name: 'Dungeon Gear', count: 21, image: 'https://picsum.photos/seed/gear/400/300' },
]

export const makers: Maker[] = [
  {
    id: 'black-raven',
    name: 'Black Raven Leather',
    tagline: 'Artisan leather goods hand-crafted in Portland',
    bio: 'Founded in 2018, Black Raven Leather specializes in premium BDSM gear crafted from full-grain Italian leather. Every piece is hand-cut, hand-dyed, and hand-stitched by a team of four artisans who believe quality should never be compromised.',
    location: 'Portland, OR',
    since: 2018,
    rating: 4.9,
    products: 34,
    image: 'https://picsum.photos/seed/raven/300/300',
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
    image: 'https://picsum.photos/seed/iron/300/300',
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
    image: 'https://picsum.photos/seed/velvet/300/300',
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
    image: 'https://picsum.photos/seed/crimson/300/300',
    featured: true,
  },
  {
    id: 'obsidian-oak',
    name: 'Obsidian Oak',
    tagline: 'Solid hardwood impact toys',
    bio: 'Sustainable hardwood impact toys sourced from fallen trees. Each piece is carved, sanded to 600-grit, and finished with food-safe mineral oil.',
    location: 'Asheville, NC',
    since: 2017,
    rating: 4.8,
    products: 22,
    image: 'https://picsum.photos/seed/obsidian/300/300',
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
    image: 'https://picsum.photos/seed/midnight/300/300',
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
    image: 'https://picsum.photos/seed/thorn/300/300',
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
    image: 'https://picsum.photos/seed/copper/300/300',
  },
]

export const products: Product[] = [
  {
    id: 'harness-01',
    name: 'The Penumbra Harness',
    makerId: 'black-raven',
    makerName: 'Black Raven Leather',
    category: 'bondage',
    price: 185,
    rating: 4.9,
    reviews: 127,
    image: 'https://picsum.photos/seed/harness01/600/600',
    images: ['https://picsum.photos/seed/harness01a/600/600', 'https://picsum.photos/seed/harness01b/600/600', 'https://picsum.photos/seed/harness01c/600/600'],
    description: 'A full-torso harness designed for extended wear. The Penumbra features adjustable chest and shoulder straps with quick-release panic clips at three points. Hand-dyed in Oxblood and conditioned with beeswax for a supple, luxurious feel.',
    materials: ['Full-grain Italian leather', 'Nickel-plated hardware', 'Waxed nylon stitching'],
    variants: [{ label: 'Standard (32"–42")', price: 185 }, { label: 'XL (42"–52")', price: 205 }],
    badge: 'Bestseller',
  },
  {
    id: 'flogger-01',
    name: 'Phoenix Tail Flogger',
    makerId: 'velvet-noose',
    makerName: 'Velvet Noose Ropeworks',
    category: 'impact',
    price: 95,
    rating: 4.8,
    reviews: 89,
    image: 'https://picsum.photos/seed/flogger01/600/600',
    images: ['https://picsum.photos/seed/flogger01a/600/600', 'https://picsum.photos/seed/flogger01b/600/600'],
    description: '24 falls of premium suede leather with a balanced, braided handle. The Phoenix Tail delivers a satisfying thud with minimal sting. Each flogger is individually weighted and tested for balance before shipping.',
    materials: ['Genuine suede leather', 'Braided leather handle', 'Steel core'],
    variants: [{ label: 'Suede', price: 95 }, { label: 'Elk Leather', price: 135 }],
  },
  {
    id: 'collar-01',
    name: 'The Sovereign Collar',
    makerId: 'crimson-crest',
    makerName: 'Crimson Crest Designs',
    category: 'collars',
    price: 68,
    rating: 4.9,
    reviews: 203,
    image: 'https://picsum.photos/seed/collar01/600/600',
    images: ['https://picsum.photos/seed/collar01a/600/600', 'https://picsum.photos/seed/collar01b/600/600'],
    description: 'A subtle day collar designed to pass in public while carrying deep personal meaning. The Sovereign features a discrete D-ring and a locking clasp compatible with standard padlocks. Available in matte black, polished silver, and rose gold finishes.',
    materials: ['316L stainless steel', 'PVD coating', 'Hypoallergenic'],
    variants: [{ label: 'Matte Black', price: 68 }, { label: 'Rose Gold', price: 78 }, { label: 'Polished Silver', price: 68 }],
    badge: 'Most Reviewed',
  },
  {
    id: 'cuffs-01',
    name: 'Abyss Wrist Cuffs',
    makerId: 'black-raven',
    makerName: 'Black Raven Leather',
    category: 'restraints',
    price: 72,
    rating: 4.7,
    reviews: 156,
    image: 'https://picsum.photos/seed/cuffs01/600/600',
    images: ['https://picsum.photos/seed/cuffs01a/600/600', 'https://picsum.photos/seed/cuffs01b/600/600'],
    description: 'Padded wrist cuffs with a sheepskin lining and locking buckle. The Abyss line prioritizes comfort during long scenes without sacrificing security. D-rings at both ends for versatile suspension compatibility.',
    materials: ['Italian leather', 'Sheepskin lining', 'Nickel hardware'],
    variants: [{ label: 'Standard', price: 72 }, { label: 'Ankle (Pair)', price: 78 }],
  },
  {
    id: 'paddle-01',
    name: 'The Courtier Paddle',
    makerId: 'obsidian-oak',
    makerName: 'Obsidian Oak',
    category: 'impact',
    price: 45,
    rating: 4.6,
    reviews: 67,
    image: 'https://picsum.photos/seed/paddle01/600/600',
    images: ['https://picsum.photos/seed/paddle01a/600/600', 'https://picsum.photos/seed/paddle01b/600/600'],
    description: 'A classic oval paddle carved from fallen Black Walnut. The Courtier is sanded to a silky 600-grit finish and sealed with food-safe mineral oil. Engraving available for personalization.',
    materials: ['Black Walnut hardwood', 'Food-safe mineral oil finish'],
    variants: [{ label: 'Standard (12")', price: 45 }, { label: 'Elite (16")', price: 58 }],
  },
  {
    id: 'spreader-01',
    name: 'The Iron Spreader Bar',
    makerId: 'iron-heart',
    makerName: 'Iron Heart Forge',
    category: 'restraints',
    price: 120,
    rating: 4.8,
    reviews: 45,
    image: 'https://picsum.photos/seed/spreader01/600/600',
    images: ['https://picsum.photos/seed/spreader01a/600/600', 'https://picsum.photos/seed/spreader01b/600/600'],
    description: 'Aircraft-grade aluminum spreader bar with four attachment points and an adjustable range from 24" to 36". Powder-coated in matte black. Rated for suspension loads up to 300 lbs.',
    materials: ['6061-T6 Aluminum', 'Powder coat finish', 'Stainless fittings'],
    variants: [{ label: 'Standard (24–36")', price: 120 }, { label: 'Wide (32–48")', price: 145 }],
  },
  {
    id: 'blindfold-01',
    name: 'Veil of Nyx Blindfold',
    makerId: 'midnight-silk',
    makerName: 'Midnight Silk Co.',
    category: 'gear',
    price: 38,
    rating: 4.5,
    reviews: 112,
    image: 'https://picsum.photos/seed/blindfold01/600/600',
    images: ['https://picsum.photos/seed/blindfold01a/600/600', 'https://picsum.photos/seed/blindfold01b/600/600'],
    description: 'A luxurious padded blindfold crafted from deadstock velvet and lined with silk charmeuse. Completely opaque yet feather-light on the face. Adjustable elastic strap with satin cover.',
    materials: ['Deadstock velvet exterior', 'Silk charmeuse lining', 'Memory foam padding'],
    variants: [{ label: 'Onyx', price: 38 }, { label: 'Merlot', price: 38 }, { label: 'Ivory', price: 38 }],
  },
  {
    id: 'wand-01',
    name: 'Violet Tempest Wand',
    makerId: 'thorn-rose',
    makerName: 'Thorn & Rose Studios',
    category: 'gear',
    price: 245,
    rating: 4.9,
    reviews: 34,
    image: 'https://picsum.photos/seed/wand01/600/600',
    images: ['https://picsum.photos/seed/wand01a/600/600', 'https://picsum.photos/seed/wand01b/600/600'],
    description: 'A solid-state violet wand with adjustable intensity from subtle tingle to sharp crack. Includes four glass electrodes and a grounding pad. CE certified with two-year warranty.',
    materials: ['Anodized aluminum body', 'Borosilicate glass electrodes', 'Medical-grade wiring'],
  },
  {
    id: 'rope-set-01',
    name: 'Shibari Starter Bundle',
    makerId: 'velvet-noose',
    makerName: 'Velvet Noose Ropeworks',
    category: 'bondage',
    price: 65,
    rating: 4.7,
    reviews: 198,
    image: 'https://picsum.photos/seed/rope01/600/600',
    images: ['https://picsum.photos/seed/rope01a/600/600', 'https://picsum.photos/seed/rope01b/600/600'],
    description: 'Six 30-foot lengths of 6mm jute rope, conditioned and ready to tie. Includes a PDF tying guide and safety shears. The ideal entry point for rope bondage enthusiasts.',
    materials: ['Japanese jute rope', 'Natural oil conditioning', 'Safety shears included'],
    badge: 'Popular',
  },
  {
    id: 'chain-01',
    name: 'Copper Lattice Body Chain',
    makerId: 'copper-chain',
    makerName: 'Copper Chain Atelier',
    category: 'apparel',
    price: 85,
    rating: 4.6,
    reviews: 56,
    image: 'https://picsum.photos/seed/chain01/600/600',
    images: ['https://picsum.photos/seed/chain01a/600/600', 'https://picsum.photos/seed/chain01b/600/600'],
    description: 'A decorative body chain in European 4-in-1 weave, adjustable to fit most torso sizes. Hand-polished copper with a protective lacquer coating to prevent tarnishing.',
    materials: ['Solid copper rings', 'Protective lacquer coating', 'Adjustable clasp'],
    variants: [{ label: 'Copper', price: 85 }, { label: 'Blackened Steel', price: 95 }],
  },
  {
    id: 'stocks-01',
    name: 'Medieval Stocks Restraint',
    makerId: 'iron-heart',
    makerName: 'Iron Heart Forge',
    category: 'restraints',
    price: 340,
    rating: 4.8,
    reviews: 12,
    image: 'https://picsum.photos/seed/stocks01/600/600',
    images: ['https://picsum.photos/seed/stocks01a/600/600', 'https://picsum.photos/seed/stocks01b/600/600'],
    description: 'A classic pillory-style stocks restraint in heavy-duty steel. Adjustable height and neck/wrist opening. Includes floor anchors for dungeon installation. Ships in two pieces for easy assembly.',
    materials: ['Steel tube frame', 'Powder coat finish', 'Rubber padding inserts'],
  },
  {
    id: 'mask-01',
    name: 'The Masquerade Hood',
    makerId: 'midnight-silk',
    makerName: 'Midnight Silk Co.',
    category: 'gear',
    price: 110,
    rating: 4.4,
    reviews: 29,
    image: 'https://picsum.photos/seed/mask01/600/600',
    images: ['https://picsum.photos/seed/mask01a/600/600', 'https://picsum.photos/seed/mask01b/600/600'],
    description: 'A sensory deprivation hood with removable eye and mouth panels. Crafted from perforated leather for breathability. Available in full or open-face configurations.',
    materials: ['Perforated leather', 'Silk lining', 'Lockable buckles'],
    variants: [{ label: 'Full Face', price: 110 }, { label: 'Open Face', price: 95 }],
  },
]

export const reviews: Review[] = [
  { id: 'r1', productId: 'harness-01', author: 'Raven_K', rating: 5, text: 'Absolutely exquisite. The leather feels like butter and the hardware is solid. Worth every penny.', date: '2024-12-15', verified: true },
  { id: 'r2', productId: 'harness-01', author: 'MistressV', rating: 5, text: 'Bought this for my sub and they have not stopped wearing it. The panic clips give us both peace of mind.', date: '2024-11-02', verified: true },
  { id: 'r3', productId: 'harness-01', author: 'LeatherLover99', rating: 4, text: 'Beautiful craftsmanship. Took two weeks to break in but now it fits like a second skin.', date: '2024-10-18', verified: true },
  { id: 'r4', productId: 'collar-01', author: 'Kitten_J', rating: 5, text: 'I wear this to work every day and no one has ever noticed. The lock clicks with the most satisfying sound.', date: '2024-12-20', verified: true },
  { id: 'r5', productId: 'collar-01', author: 'Dom_Darius', rating: 5, text: 'The rose gold finish is stunning. My partner cried when I locked it on. Perfect.', date: '2024-11-28', verified: true },
  { id: 'r6', productId: 'flogger-01', author: 'RopeTopSF', rating: 5, text: 'Sends the person receiving it straight to subspace. Incredible thud, zero bruising if you know how to throw.', date: '2024-12-10', verified: true },
  { id: 'r7', productId: 'spreader-01', author: 'DungeonKeeper', rating: 4, text: 'Solid construction. The adjustment mechanism is a little stiff but that is probably a good thing.', date: '2024-09-14', verified: true },
  { id: 'r8', productId: 'wand-01', author: 'ElectroEnthusiast', rating: 5, text: 'This replaced my vintage wand and honestly it is better. The intensity range is huge. Safety documentation was top notch too.', date: '2024-11-05', verified: true },
]

export const getProductById = (id: string) => products.find(p => p.id === id)
export const getMakerById = (id: string) => makers.find(m => m.id === id)
export const getProductsByMaker = (makerId: string) => products.filter(p => p.makerId === makerId)
export const getProductsByCategory = (categoryId: string) => products.filter(p => p.category === categoryId)
export const getReviewsByProduct = (productId: string) => reviews.filter(r => r.productId === productId)
