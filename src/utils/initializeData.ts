import { Product, Category, User, UserProfile, UserAddress } from '../types';

// Sample Categories
export const sampleCategories: Category[] = [
  {
    id: '1',
    name: 'Living Room',
    slug: 'living-room',
    description: 'Comfortable and stylish furniture for your living space',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Bedroom',
    slug: 'bedroom',
    description: 'Peaceful and elegant bedroom furniture',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: 'Dining Room',
    slug: 'dining-room',
    description: 'Beautiful dining furniture for family gatherings',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    name: 'Office',
    slug: 'office',
    description: 'Professional and ergonomic office furniture',
    isActive: true,
    sortOrder: 4,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '5',
    name: 'Outdoor',
    slug: 'outdoor',
    description: 'Durable outdoor furniture for your garden and patio',
    isActive: true,
    sortOrder: 5,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Fixed purchase costs (20-40% less than selling price)
const getPurchaseCost = (sellingPrice: number): number => {
  // Use a deterministic calculation based on product ID to ensure consistency
  const margin = 0.25 + (sellingPrice % 3) * 0.05; // 25-35% margin based on price
  return Math.round(sellingPrice * (1 - margin));
};

// Sample Products
export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Modern L-Shaped Sofa',
    slug: 'modern-l-shaped-sofa',
    description: 'Contemporary L-shaped sofa with premium fabric upholstery, perfect for modern living rooms. Features comfortable seating for 4-5 people with built-in storage compartments.',
    shortDescription: 'Contemporary L-shaped sofa with premium fabric upholstery',
    price: 45000,
    originalPrice: 55000,
    purchaseCost: getPurchaseCost(45000), // Fixed margin calculation
    categoryId: '1',
    stockQuantity: 15,
    sku: 'SOFA-001',
    weight: 85,
    dimensions: {
      length: 280,
      width: 180,
      height: 85,
    },
    isActive: true,
    isFeatured: true,
    tags: ['modern', 'comfortable', 'storage', 'premium'],
    specifications: {
      'Material': 'Premium Fabric',
      'Color': 'Gray',
      'Seating Capacity': '4-5 people',
      'Warranty': '2 years',
      'Assembly': 'Required',
    },
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&h=500&fit=crop'
    ],
    // Analytics tracking fields
    viewCount: 0,
    cartAdditions: 0,
    wishlistAdditions: 0,
    purchaseCount: 0,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Solid Wood Dining Table Set',
    slug: 'solid-wood-dining-table-set',
    description: 'Elegant solid wood dining table with 6 matching chairs. Perfect for family gatherings and dinner parties. Made from sustainable teak wood.',
    shortDescription: 'Elegant solid wood dining table with 6 matching chairs',
    price: 32000,
    originalPrice: 38000,
    purchaseCost: getPurchaseCost(32000), // Fixed margin calculation
    categoryId: '3',
    stockQuantity: 8,
    sku: 'DINE-001',
    weight: 120,
    dimensions: {
      length: 180,
      width: 90,
      height: 75,
    },
    isActive: true,
    isFeatured: true,
    tags: ['wooden', 'elegant', 'family', 'sustainable'],
    specifications: {
      'Material': 'Solid Teak Wood',
      'Color': 'Natural Wood',
      'Seating Capacity': '6 people',
      'Warranty': '3 years',
      'Assembly': 'Required',
    },
    image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1577140917170-285929fb55b9?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop'
    ],
    // Analytics tracking fields
    viewCount: 0,
    cartAdditions: 0,
    wishlistAdditions: 0,
    purchaseCount: 0,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    name: 'Queen Size Platform Bed',
    slug: 'queen-size-platform-bed',
    description: 'Modern queen size platform bed with built-in storage drawers. Includes premium memory foam mattress for ultimate comfort.',
    shortDescription: 'Modern queen size platform bed with built-in storage',
    price: 55000,
    originalPrice: 65000,
    purchaseCost: getPurchaseCost(55000), // Fixed margin calculation
    categoryId: '2',
    stockQuantity: 12,
    sku: 'BED-001',
    weight: 95,
    dimensions: {
      length: 210,
      width: 160,
      height: 45,
    },
    isActive: true,
    isFeatured: false,
    tags: ['modern', 'storage', 'comfortable', 'queen'],
    specifications: {
      'Material': 'Engineered Wood',
      'Color': 'Walnut',
      'Size': 'Queen (160x210cm)',
      'Warranty': '2 years',
      'Assembly': 'Required',
    },
    image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500&h=500&fit=crop'
    ],
    // Analytics tracking fields
    viewCount: 0,
    cartAdditions: 0,
    wishlistAdditions: 0,
    purchaseCount: 0,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '4',
    name: 'Ergonomic Office Chair',
    slug: 'ergonomic-office-chair',
    description: 'High-quality ergonomic office chair with adjustable lumbar support, headrest, and multiple adjustment options for optimal comfort during long work hours.',
    shortDescription: 'High-quality ergonomic office chair with adjustable features',
    price: 12000,
    originalPrice: 15000,
    purchaseCost: getPurchaseCost(12000), // Fixed margin calculation
    categoryId: '4',
    stockQuantity: 25,
    sku: 'CHAIR-001',
    weight: 18,
    dimensions: {
      length: 65,
      width: 65,
      height: 120,
    },
    isActive: true,
    isFeatured: false,
    tags: ['ergonomic', 'adjustable', 'comfortable', 'office'],
    specifications: {
      'Material': 'Mesh Fabric',
      'Color': 'Black',
      'Weight Capacity': '120kg',
      'Warranty': '1 year',
      'Assembly': 'Minimal',
    },
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop'
    ],
    // Analytics tracking fields
    viewCount: 0,
    cartAdditions: 0,
    wishlistAdditions: 0,
    purchaseCount: 0,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '5',
    name: 'Glass Top Coffee Table',
    slug: 'glass-top-coffee-table',
    description: 'Elegant glass top coffee table with wooden legs. Perfect centerpiece for your living room with ample storage space.',
    shortDescription: 'Elegant glass top coffee table with wooden legs',
    price: 8500,
    originalPrice: 10000,
    purchaseCost: getPurchaseCost(8500), // Fixed margin calculation
    categoryId: '1',
    stockQuantity: 20,
    sku: 'TABLE-001',
    weight: 25,
    dimensions: {
      length: 120,
      width: 60,
      height: 45,
    },
    isActive: true,
    isFeatured: false,
    tags: ['glass', 'elegant', 'storage', 'modern'],
    specifications: {
      'Material': 'Tempered Glass + Wood',
      'Color': 'Clear Glass, Walnut Wood',
      'Weight Capacity': '50kg',
      'Warranty': '1 year',
      'Assembly': 'Required',
    },
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop'
    ],
    // Analytics tracking fields
    viewCount: 0,
    cartAdditions: 0,
    wishlistAdditions: 0,
    purchaseCount: 0,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: '6',
    name: 'Outdoor Patio Set',
    slug: 'outdoor-patio-set',
    description: 'Weather-resistant outdoor patio furniture set including table and 4 chairs. Perfect for garden and balcony spaces.',
    shortDescription: 'Weather-resistant outdoor patio furniture set',
    price: 18000,
    originalPrice: 22000,
    purchaseCost: getPurchaseCost(18000), // Fixed margin calculation
    categoryId: '5',
    stockQuantity: 10,
    sku: 'OUTDOOR-001',
    weight: 45,
    dimensions: {
      length: 150,
      width: 90,
      height: 75,
    },
    isActive: true,
    isFeatured: true,
    tags: ['outdoor', 'weather-resistant', 'patio', 'garden'],
    specifications: {
      'Material': 'Powder Coated Steel + Wicker',
      'Color': 'Brown Wicker, Black Frame',
      'Seating Capacity': '4 people',
      'Warranty': '2 years',
      'Assembly': 'Required',
    },
    image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b9?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1577140917170-285929fb55b9?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1577140917170-285929fb55b9?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1577140917170-285929fb55b9?w=500&h=500&fit=crop'
    ],
    // Analytics tracking fields
    viewCount: 0,
    cartAdditions: 0,
    wishlistAdditions: 0,
    purchaseCount: 0,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '7',
    name: 'Bookshelf with Drawers',
    slug: 'bookshelf-with-drawers',
    description: 'Versatile bookshelf with built-in drawers for storage. Perfect for organizing books, files, and decorative items.',
    shortDescription: 'Versatile bookshelf with built-in drawers for storage',
    price: 9500,
    originalPrice: 12000,
    purchaseCost: getPurchaseCost(9500), // Fixed margin calculation
    categoryId: '4',
    stockQuantity: 18,
    sku: 'SHELF-001',
    weight: 35,
    dimensions: {
      length: 80,
      width: 30,
      height: 180,
    },
    isActive: true,
    isFeatured: false,
    tags: ['storage', 'versatile', 'organized', 'modern'],
    specifications: {
      'Material': 'Engineered Wood',
      'Color': 'White',
      'Shelves': '5 adjustable',
      'Drawers': '3',
      'Warranty': '1 year',
      'Assembly': 'Required',
    },
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop'
    ],
    // Analytics tracking fields
    viewCount: 0,
    cartAdditions: 0,
    wishlistAdditions: 0,
    purchaseCount: 0,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: '8',
    name: 'Leather Recliner Chair',
    slug: 'leather-recliner-chair',
    description: 'Premium leather recliner chair with massage function and multiple recline positions. Ultimate comfort for relaxation.',
    shortDescription: 'Premium leather recliner chair with massage function',
    price: 35000,
    originalPrice: 42000,
    purchaseCost: getPurchaseCost(35000), // Fixed margin calculation
    categoryId: '1',
    stockQuantity: 6,
    sku: 'RECLINER-001',
    weight: 65,
    dimensions: {
      length: 95,
      width: 85,
      height: 110,
    },
    isActive: true,
    isFeatured: true,
    tags: ['leather', 'recliner', 'massage', 'premium'],
    specifications: {
      'Material': 'Genuine Leather',
      'Color': 'Brown',
      'Massage': 'Yes',
      'Recline Positions': '5',
      'Warranty': '2 years',
      'Assembly': 'Minimal',
    },
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&h=500&fit=crop'
    ],
    // Analytics tracking fields
    viewCount: 0,
    cartAdditions: 0,
    wishlistAdditions: 0,
    purchaseCount: 0,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
];

// Sample Users
export const sampleUsers: User[] = [
  {
    id: '1',
    email: 'admin@furnicraft.com',
    role: 'admin',
    isEmailVerified: true,
    isActive: true,
    failedLoginAttempts: 0,
    lastLoginAt: new Date('2024-01-30'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-30'),
  },
  {
    id: '2',
    email: 'customer@example.com',
    role: 'customer',
    isEmailVerified: true,
    isActive: true,
    failedLoginAttempts: 0,
    lastLoginAt: new Date('2024-01-29'),
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-29'),
  },
  {
    id: '3',
    email: 'premium@example.com',
    role: 'premium',
    isEmailVerified: true,
    isActive: true,
    failedLoginAttempts: 0,
    lastLoginAt: new Date('2024-01-28'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-28'),
  },
];

// Sample User Profiles
export const sampleUserProfiles: UserProfile[] = [
  {
    id: '1',
    userId: '1',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+1234567890',
    avatar: '/avatars/admin.jpg',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'male',
    preferences: {
      newsletter: true,
      marketingEmails: true,
      notifications: true,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-30'),
  },
  {
    id: '2',
    userId: '2',
    firstName: 'John',
    lastName: 'Doe1',
    phone: '+1234567891',
    avatar: '/avatars/john.jpg',
    dateOfBirth: new Date('1985-05-15'),
    gender: 'male',
    preferences: {
      newsletter: true,
      marketingEmails: false,
      notifications: true,
    },
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-29'),
  },
  {
    id: '3',
    userId: '3',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1234567892',
    avatar: '/avatars/jane.jpg',
    dateOfBirth: new Date('1988-08-20'),
    gender: 'female',
    preferences: {
      newsletter: true,
      marketingEmails: true,
      notifications: true,
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-28'),
  },
];

// Sample User Addresses
export const sampleUserAddresses: UserAddress[] = [
  {
    id: '1',
    userId: '2',
    addressLine1: '123 Main Street',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
    isDefault: true,
    label: 'Home',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '2',
    userId: '2',
    addressLine1: '456 Business Ave',
    addressLine2: 'Suite 200',
    city: 'New York',
    state: 'NY',
    postalCode: '10002',
    country: 'USA',
    isDefault: false,
    label: 'Office',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    userId: '3',
    addressLine1: '789 Luxury Lane',
    addressLine2: '',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90210',
    country: 'USA',
    isDefault: true,
    label: 'Home',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

// Ensure all products have purchase costs
export const ensurePurchaseCosts = () => {
  try {
    const productsRaw = localStorage.getItem('furnicraft_products');
    if (!productsRaw) return;

    const products = JSON.parse(productsRaw);
    let updated = false;

    products.forEach((product: any) => {
      if (!product.purchaseCost || product.purchaseCost === 0) {
        product.purchaseCost = getPurchaseCost(product.price);
        updated = true;
        console.log(`Added purchase cost for ${product.name}: ₹${product.purchaseCost}`);
      }
    });

    if (updated) {
      localStorage.setItem('furnicraft_products', JSON.stringify(products));
      console.log('Updated products with missing purchase costs');
    }
  } catch (error) {
    console.error('Error ensuring purchase costs:', error);
  }
};

// Initialize sample data in localStorage for development
export const initializeSampleData = () => {
  try {
    // Initialize categories
    if (!localStorage.getItem('furnicraft_categories')) {
      localStorage.setItem('furnicraft_categories', JSON.stringify(sampleCategories));
      console.log('Categories initialized');
    }

    // Initialize products
    if (!localStorage.getItem('furnicraft_products')) {
      localStorage.setItem('furnicraft_products', JSON.stringify(sampleProducts));
      console.log('Products initialized');
    }

    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

// Get sample data from localStorage
export const getSampleData = () => {
  if (typeof window !== 'undefined') {
    try {
      return {
        categories: JSON.parse(localStorage.getItem('furnicraft_categories') || '[]'),
        products: JSON.parse(localStorage.getItem('furnicraft_products') || '[]'),
        users: JSON.parse(localStorage.getItem('furnicraft_users') || '[]'),
        userProfiles: JSON.parse(localStorage.getItem('furnicraft_user_profiles') || '[]'),
        userAddresses: JSON.parse(localStorage.getItem('furnicraft_user_addresses') || '[]'),
      };
    } catch (error) {
      console.error('Error parsing sample data:', error);
      return {
        categories: [],
        products: [],
        users: [],
        userProfiles: [],
        userAddresses: [],
      };
    }
  }
  return {
    categories: [],
    products: [],
    users: [],
    userProfiles: [],
    userAddresses: [],
  };
};

// Reset all data to initial state (for development purposes)
export const resetSampleData = () => {
  try {
    // Clear existing data
    localStorage.removeItem('furnicraft_products');
    localStorage.removeItem('furnicraft_categories');
    localStorage.removeItem('furnicraft_users');
    localStorage.removeItem('furnicraft_user_profiles');
    localStorage.removeItem('furnicraft_user_addresses');
    localStorage.removeItem('furnicraft_initialized');

    // Clear all order data
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('furnicraft_orders_') || key.startsWith('furnicraft_returns_'))) {
        localStorage.removeItem(key);
      }
    }

    // Initialize fresh sample data
    localStorage.setItem('furnicraft_categories', JSON.stringify(sampleCategories));
    localStorage.setItem('furnicraft_products', JSON.stringify(sampleProducts));
    localStorage.setItem('furnicraft_users', JSON.stringify(sampleUsers));
    localStorage.setItem('furnicraft_user_profiles', JSON.stringify(sampleUserProfiles));
    localStorage.setItem('furnicraft_user_addresses', JSON.stringify(sampleUserAddresses));
    localStorage.setItem('furnicraft_initialized', 'true');

    console.log('Sample data reset successfully with new purchase costs');
    console.log('Products with fixed margins (20-40%):', sampleProducts.map(p => ({
      name: p.name,
      price: p.price,
      purchaseCost: p.purchaseCost,
      margin: ((p.price - p.purchaseCost) / p.price * 100).toFixed(1) + '%'
    })));

    return true;
  } catch (error) {
    console.error('Error resetting sample data:', error);
    return false;
  }
};
