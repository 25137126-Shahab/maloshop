/**
 * Malo Garments — Seed Data
 * Contains all initial product data, categories, and admin credentials.
 * This data is loaded into localStorage on first visit.
 */

const MALO_SEED_DATA = {
  // Admin credentials
  admin: {
    username: 'admin',
    password: 'admin123',
    name: 'Malo Admin'
  },

  // Product categories
  categories: [
    {
      id: 'cat-1',
      name: 'Ladies Garments',
      slug: 'ladies-garments',
      image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=400&fit=crop',
      subcategories: [
        { id: 'sub-1', name: 'Dresses', slug: 'dresses' },
        { id: 'sub-2', name: 'Tops & Blouses', slug: 'tops-blouses' },
        { id: 'sub-3', name: 'Pants & Trousers', slug: 'pants-trousers' },
        { id: 'sub-4', name: 'Skirts', slug: 'skirts' },
        { id: 'sub-5', name: 'Abayas & Modest Wear', slug: 'abayas-modest' }
      ]
    },
    {
      id: 'cat-2',
      name: 'Undergarments',
      slug: 'undergarments',
      image: 'https://images.unsplash.com/photo-1616530940213-b0a21d738fd0?w=600&h=400&fit=crop',
      subcategories: [
        { id: 'sub-6', name: 'Bras', slug: 'bras' },
        { id: 'sub-7', name: 'Panties', slug: 'panties' },
        { id: 'sub-8', name: 'Lingerie Sets', slug: 'lingerie-sets' },
        { id: 'sub-9', name: 'Sleepwear', slug: 'sleepwear' },
        { id: 'sub-10', name: 'Shapewear', slug: 'shapewear' }
      ]
    },
    {
      id: 'cat-3',
      name: 'Sale',
      slug: 'sale',
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=600&h=400&fit=crop',
      subcategories: []
    }
  ],

  // Seed products
  products: [
    // ── Ladies Garments: Dresses ──
    {
      id: 'prod-001',
      name: 'Rosewood Floral Maxi Dress',
      price: 4500,
      originalPrice: 5500,
      category: 'cat-1',
      subcategory: 'sub-1',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Blush Pink', hex: '#F2B5B5' },
        { name: 'Ivory', hex: '#FFFFF0' }
      ],
      stock: 25,
      images: [
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop'
      ],
      description: 'A stunning floral maxi dress in soft rosewood tones. Features a flattering A-line silhouette with delicate floral prints. Perfect for garden parties and summer outings.',
      rating: 4.7,
      reviews: 34,
      dateAdded: '2026-08-01',
      featured: true,
      onSale: true
    },
    {
      id: 'prod-002',
      name: 'Midnight Velvet Evening Gown',
      price: 8900,
      originalPrice: 8900,
      category: 'cat-1',
      subcategory: 'sub-1',
      sizes: ['S', 'M', 'L'],
      colors: [
        { name: 'Deep Burgundy', hex: '#722F37' },
        { name: 'Midnight Blue', hex: '#191970' }
      ],
      stock: 12,
      images: [
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop'
      ],
      description: 'Elegant velvet evening gown with a classic silhouette. Features a sweetheart neckline and floor-length design. Ideal for formal events and gala dinners.',
      rating: 4.9,
      reviews: 18,
      dateAdded: '2026-08-15',
      featured: true,
      onSale: false
    },
    {
      id: 'prod-003',
      name: 'Chambray Summer Shift Dress',
      price: 3200,
      originalPrice: 3800,
      category: 'cat-1',
      subcategory: 'sub-1',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Light Blue', hex: '#ADD8E6' },
        { name: 'Soft White', hex: '#F5F5F5' }
      ],
      stock: 40,
      images: [
        'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&h=800&fit=crop'
      ],
      description: 'Lightweight chambray shift dress perfect for summer days. Easy, breezy fit with a relaxed silhouette and side pockets.',
      rating: 4.5,
      reviews: 52,
      dateAdded: '2026-07-20',
      featured: false,
      onSale: true
    },

    // ── Ladies Garments: Tops & Blouses ──
    {
      id: 'prod-004',
      name: 'Silk Bow-Tie Blouse',
      price: 2800,
      originalPrice: 2800,
      category: 'cat-1',
      subcategory: 'sub-2',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: [
        { name: 'Cream', hex: '#FFFDD0' },
        { name: 'Blush', hex: '#F2B5B5' },
        { name: 'Black', hex: '#1a1a1a' }
      ],
      stock: 35,
      images: [
        'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1551799517-eb8f03cb5e6a?w=600&h=800&fit=crop'
      ],
      description: 'Luxurious silk blouse with an elegant bow-tie neckline. A wardrobe essential that transitions seamlessly from office to evening.',
      rating: 4.6,
      reviews: 28,
      dateAdded: '2026-08-10',
      featured: true,
      onSale: false
    },
    {
      id: 'prod-005',
      name: 'Embroidered Peasant Top',
      price: 2200,
      originalPrice: 2800,
      category: 'cat-1',
      subcategory: 'sub-2',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Sage Green', hex: '#B2AC88' }
      ],
      stock: 30,
      images: [
        'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop'
      ],
      description: 'Beautiful peasant-style top with intricate embroidery details. Loose, comfortable fit with billowy sleeves.',
      rating: 4.3,
      reviews: 45,
      dateAdded: '2026-07-15',
      featured: false,
      onSale: true
    },
    {
      id: 'prod-006',
      name: 'Structured Peplum Top',
      price: 2500,
      originalPrice: 2500,
      category: 'cat-1',
      subcategory: 'sub-2',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: [
        { name: 'Dusty Rose', hex: '#DCAE96' },
        { name: 'Navy', hex: '#000080' }
      ],
      stock: 20,
      images: [
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=800&fit=crop'
      ],
      description: 'Sophisticated peplum top with structured shoulders. Creates a beautiful feminine silhouette perfect for formal and semi-formal occasions.',
      rating: 4.4,
      reviews: 19,
      dateAdded: '2026-08-20',
      featured: false,
      onSale: false
    },

    // ── Ladies Garments: Pants & Trousers ──
    {
      id: 'prod-007',
      name: 'High-Waist Wide Leg Trousers',
      price: 3500,
      originalPrice: 3500,
      category: 'cat-1',
      subcategory: 'sub-3',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Beige', hex: '#E8D5C4' },
        { name: 'Black', hex: '#1a1a1a' },
        { name: 'Olive', hex: '#808000' }
      ],
      stock: 28,
      images: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=600&h=800&fit=crop'
      ],
      description: 'Elegant high-waisted wide-leg trousers with a flowing drape. Features a comfortable elasticated back waist and side zip closure.',
      rating: 4.8,
      reviews: 63,
      dateAdded: '2026-08-05',
      featured: true,
      onSale: false
    },
    {
      id: 'prod-008',
      name: 'Slim Fit Ankle Pants',
      price: 2800,
      originalPrice: 3200,
      category: 'cat-1',
      subcategory: 'sub-3',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Charcoal', hex: '#36454F' },
        { name: 'Camel', hex: '#C19A6B' }
      ],
      stock: 32,
      images: [
        'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=800&fit=crop'
      ],
      description: 'Tailored slim-fit ankle pants with a modern cropped length. Perfect for both office wear and smart-casual outings.',
      rating: 4.5,
      reviews: 41,
      dateAdded: '2026-07-25',
      featured: false,
      onSale: true
    },

    // ── Ladies Garments: Skirts ──
    {
      id: 'prod-009',
      name: 'Pleated Midi Skirt',
      price: 3000,
      originalPrice: 3000,
      category: 'cat-1',
      subcategory: 'sub-4',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: [
        { name: 'Mauve', hex: '#E0B0FF' },
        { name: 'Gold', hex: '#C9A96E' }
      ],
      stock: 18,
      images: [
        'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&h=800&fit=crop'
      ],
      description: 'Elegant pleated midi skirt with a satin-like finish. The accordion pleats create beautiful movement and a sophisticated silhouette.',
      rating: 4.6,
      reviews: 27,
      dateAdded: '2026-08-12',
      featured: true,
      onSale: false
    },
    {
      id: 'prod-010',
      name: 'Wrap Mini Skirt',
      price: 1800,
      originalPrice: 2200,
      category: 'cat-1',
      subcategory: 'sub-4',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: [
        { name: 'Terracotta', hex: '#E2725B' },
        { name: 'Forest Green', hex: '#228B22' }
      ],
      stock: 22,
      images: [
        'https://images.unsplash.com/photo-1592301933927-35b597393c0a?w=600&h=800&fit=crop'
      ],
      description: 'Chic wrap-style mini skirt with a flattering asymmetric hemline. Features a self-tie waist and smooth linen-blend fabric.',
      rating: 4.2,
      reviews: 33,
      dateAdded: '2026-07-10',
      featured: false,
      onSale: true
    },

    // ── Ladies Garments: Abayas & Modest Wear ──
    {
      id: 'prod-011',
      name: 'Pearl Embellished Open Abaya',
      price: 6500,
      originalPrice: 6500,
      category: 'cat-1',
      subcategory: 'sub-5',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Black', hex: '#1a1a1a' },
        { name: 'Navy', hex: '#000080' }
      ],
      stock: 15,
      images: [
        'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=600&h=800&fit=crop'
      ],
      description: 'Luxurious open-front abaya adorned with pearl embellishments along the sleeves and front edge. Made from premium flowing crepe fabric.',
      rating: 4.9,
      reviews: 14,
      dateAdded: '2026-08-18',
      featured: true,
      onSale: false
    },

    // ── Undergarments: Bras ──
    {
      id: 'prod-012',
      name: 'Classic T-Shirt Bra',
      price: 1200,
      originalPrice: 1200,
      category: 'cat-2',
      subcategory: 'sub-6',
      sizes: ['32B', '32C', '34B', '34C', '36B', '36C', '38B', '38C'],
      colors: [
        { name: 'Nude', hex: '#E3BC9A' },
        { name: 'Black', hex: '#1a1a1a' },
        { name: 'White', hex: '#FFFFFF' }
      ],
      stock: 60,
      images: [
        'https://images.unsplash.com/photo-1616530940213-b0a21d738fd0?w=600&h=800&fit=crop'
      ],
      description: 'Seamless padded T-shirt bra designed for everyday comfort. Smooth cups provide a natural shape under any outfit.',
      rating: 4.5,
      reviews: 89,
      dateAdded: '2026-08-01',
      featured: false,
      onSale: false
    },
    {
      id: 'prod-013',
      name: 'Lace Underwire Bra',
      price: 1800,
      originalPrice: 2200,
      category: 'cat-2',
      subcategory: 'sub-6',
      sizes: ['32B', '32C', '34B', '34C', '36B', '36C'],
      colors: [
        { name: 'Blush Pink', hex: '#F2B5B5' },
        { name: 'Burgundy', hex: '#722F37' }
      ],
      stock: 45,
      images: [
        'https://images.unsplash.com/photo-1571172964276-91faaa704e1f?w=600&h=800&fit=crop'
      ],
      description: 'Beautiful lace underwire bra with scalloped edges. Combines delicate feminine styling with excellent support and comfort.',
      rating: 4.7,
      reviews: 56,
      dateAdded: '2026-07-28',
      featured: true,
      onSale: true
    },

    // ── Undergarments: Panties ──
    {
      id: 'prod-014',
      name: 'Cotton Bikini Briefs (3-Pack)',
      price: 900,
      originalPrice: 900,
      category: 'cat-2',
      subcategory: 'sub-7',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Assorted Pastels', hex: '#F2B5B5' },
        { name: 'Classic Neutrals', hex: '#E8D5C4' }
      ],
      stock: 80,
      images: [
        'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=600&h=800&fit=crop'
      ],
      description: 'Soft cotton bikini briefs in a convenient 3-pack. Breathable fabric with comfortable elastic waistband for all-day wear.',
      rating: 4.4,
      reviews: 102,
      dateAdded: '2026-08-05',
      featured: false,
      onSale: false
    },
    {
      id: 'prod-015',
      name: 'Seamless Hipster Panties (5-Pack)',
      price: 1500,
      originalPrice: 1800,
      category: 'cat-2',
      subcategory: 'sub-7',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Mixed Colors', hex: '#DCAE96' }
      ],
      stock: 55,
      images: [
        'https://images.unsplash.com/photo-1616530940213-b0a21d738fd0?w=600&h=800&fit=crop'
      ],
      description: 'Ultra-smooth seamless hipster panties in a value 5-pack. No-show design with laser-cut edges for invisible wear under fitted clothing.',
      rating: 4.6,
      reviews: 78,
      dateAdded: '2026-07-30',
      featured: false,
      onSale: true
    },

    // ── Undergarments: Lingerie Sets ──
    {
      id: 'prod-016',
      name: 'French Lace Lingerie Set',
      price: 3500,
      originalPrice: 3500,
      category: 'cat-2',
      subcategory: 'sub-8',
      sizes: ['S', 'M', 'L'],
      colors: [
        { name: 'Black', hex: '#1a1a1a' },
        { name: 'Champagne', hex: '#F7E7CE' }
      ],
      stock: 20,
      images: [
        'https://images.unsplash.com/photo-1571172964276-91faaa704e1f?w=600&h=800&fit=crop'
      ],
      description: 'Exquisite French lace bra and panty set. Delicate floral lace with adjustable straps and matching bottoms for a luxurious feel.',
      rating: 4.8,
      reviews: 22,
      dateAdded: '2026-08-14',
      featured: true,
      onSale: false
    },
    {
      id: 'prod-017',
      name: 'Satin Camisole & Shorts Set',
      price: 2500,
      originalPrice: 3000,
      category: 'cat-2',
      subcategory: 'sub-8',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: [
        { name: 'Rose Gold', hex: '#B76E79' },
        { name: 'Ivory', hex: '#FFFFF0' }
      ],
      stock: 25,
      images: [
        'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=600&h=800&fit=crop'
      ],
      description: 'Luxurious satin camisole with matching shorts. Features delicate lace trim and adjustable spaghetti straps for a perfect fit.',
      rating: 4.5,
      reviews: 31,
      dateAdded: '2026-08-08',
      featured: false,
      onSale: true
    },

    // ── Undergarments: Sleepwear ──
    {
      id: 'prod-018',
      name: 'Silk Pajama Set',
      price: 4200,
      originalPrice: 4200,
      category: 'cat-2',
      subcategory: 'sub-9',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Dusty Pink', hex: '#D4A5A5' },
        { name: 'Navy', hex: '#000080' }
      ],
      stock: 18,
      images: [
        'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=600&h=800&fit=crop'
      ],
      description: 'Premium mulberry silk pajama set with long sleeves and matching pants. Breathable and temperature-regulating for the ultimate sleep experience.',
      rating: 4.9,
      reviews: 15,
      dateAdded: '2026-08-19',
      featured: true,
      onSale: false
    },
    {
      id: 'prod-019',
      name: 'Cotton Nightgown',
      price: 1800,
      originalPrice: 2200,
      category: 'cat-2',
      subcategory: 'sub-9',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'Lavender', hex: '#E6E6FA' },
        { name: 'Mint', hex: '#98FB98' },
        { name: 'Peach', hex: '#FFDAB9' }
      ],
      stock: 35,
      images: [
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop'
      ],
      description: 'Soft cotton nightgown with a relaxed knee-length design. Features lovely lace detailing at the neckline and sleeves.',
      rating: 4.3,
      reviews: 44,
      dateAdded: '2026-07-22',
      featured: false,
      onSale: true
    },

    // ── Undergarments: Shapewear ──
    {
      id: 'prod-020',
      name: 'High-Waist Shaping Brief',
      price: 1600,
      originalPrice: 1600,
      category: 'cat-2',
      subcategory: 'sub-10',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'Nude', hex: '#E3BC9A' },
        { name: 'Black', hex: '#1a1a1a' }
      ],
      stock: 40,
      images: [
        'https://images.unsplash.com/photo-1616530940213-b0a21d738fd0?w=600&h=800&fit=crop'
      ],
      description: 'Smoothing high-waist shaping brief for a streamlined silhouette. Firm control fabric with a comfortable bonded waistband.',
      rating: 4.4,
      reviews: 37,
      dateAdded: '2026-08-03',
      featured: false,
      onSale: false
    },
    {
      id: 'prod-021',
      name: 'Full Body Shaping Suit',
      price: 3200,
      originalPrice: 3800,
      category: 'cat-2',
      subcategory: 'sub-10',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Nude', hex: '#E3BC9A' },
        { name: 'Black', hex: '#1a1a1a' }
      ],
      stock: 15,
      images: [
        'https://images.unsplash.com/photo-1571172964276-91faaa704e1f?w=600&h=800&fit=crop'
      ],
      description: 'All-over shaping bodysuit that smooths and sculpts from bust to thigh. Open-bust design works with any bra and adjustable straps.',
      rating: 4.7,
      reviews: 21,
      dateAdded: '2026-08-16',
      featured: false,
      onSale: true
    },
    // Extra products
    {
      id: 'prod-022',
      name: 'Linen Button-Down Shirt Dress',
      price: 3800,
      originalPrice: 3800,
      category: 'cat-1',
      subcategory: 'sub-1',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Sand', hex: '#C2B280' },
        { name: 'White', hex: '#FFFFFF' }
      ],
      stock: 22,
      images: [
        'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&h=800&fit=crop'
      ],
      description: 'Effortlessly chic linen shirt dress with a relaxed fit. Features a button-down front, waist tie, and rolled sleeves for a casual-elegant look.',
      rating: 4.6,
      reviews: 29,
      dateAdded: '2026-08-22',
      featured: true,
      onSale: false
    },
    {
      id: 'prod-023',
      name: 'Ruffle Wrap Top',
      price: 2000,
      originalPrice: 2400,
      category: 'cat-1',
      subcategory: 'sub-2',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: [
        { name: 'Coral', hex: '#FF7F50' },
        { name: 'Lilac', hex: '#C8A2C8' }
      ],
      stock: 27,
      images: [
        'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=800&fit=crop'
      ],
      description: 'Feminine wrap top with cascading ruffle details. The flattering V-neckline and adjustable tie waist create a beautiful silhouette.',
      rating: 4.4,
      reviews: 36,
      dateAdded: '2026-08-25',
      featured: false,
      onSale: true
    },
    {
      id: 'prod-024',
      name: 'Sports Bra - Medium Support',
      price: 1400,
      originalPrice: 1400,
      category: 'cat-2',
      subcategory: 'sub-6',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Black', hex: '#1a1a1a' },
        { name: 'Grey', hex: '#808080' },
        { name: 'Pink', hex: '#FF69B4' }
      ],
      stock: 50,
      images: [
        'https://images.unsplash.com/photo-1571172964276-91faaa704e1f?w=600&h=800&fit=crop'
      ],
      description: 'Performance sports bra with medium support and moisture-wicking fabric. Racerback design with removable padding for a custom fit.',
      rating: 4.6,
      reviews: 67,
      dateAdded: '2026-08-21',
      featured: false,
      onSale: false
    }
  ]
};

module.exports = MALO_SEED_DATA;
