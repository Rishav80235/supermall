// Mock data for testing the Super Mall application
export const mockShops = [
  {
    id: 'shop1',
    name: 'Tech Store',
    category: 'Electronics',
    floor: 'Ground Floor',
    description: 'Latest gadgets and electronics',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
    contact: '+1-555-0123',
    email: 'tech@mall.com',
    hours: '9:00 AM - 10:00 PM',
    rating: 4.5,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'shop2',
    name: 'Fashion Hub',
    category: 'Fashion',
    floor: 'First Floor',
    description: 'Trendy clothing and accessories',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    contact: '+1-555-0124',
    email: 'fashion@mall.com',
    hours: '10:00 AM - 9:00 PM',
    rating: 4.2,
    isActive: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'shop3',
    name: 'Food Court',
    category: 'Food & Beverage',
    floor: 'Second Floor',
    description: 'Delicious food from around the world',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    contact: '+1-555-0125',
    email: 'food@mall.com',
    hours: '8:00 AM - 11:00 PM',
    rating: 4.7,
    isActive: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'shop4',
    name: 'Beauty Corner',
    category: 'Beauty & Health',
    floor: 'First Floor',
    description: 'Cosmetics and beauty products',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    contact: '+1-555-0126',
    email: 'beauty@mall.com',
    hours: '9:00 AM - 8:00 PM',
    rating: 4.3,
    isActive: true,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 'shop5',
    name: 'Sports Zone',
    category: 'Sports & Fitness',
    floor: 'Ground Floor',
    description: 'Sports equipment and fitness gear',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    contact: '+1-555-0127',
    email: 'sports@mall.com',
    hours: '9:00 AM - 9:00 PM',
    rating: 4.1,
    isActive: true,
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-01-30')
  }
];

export const mockProducts = [
  {
    id: 'prod1',
    shopId: 'shop1',
    name: 'iPhone 15 Pro',
    category: 'Electronics',
    price: 999,
    originalPrice: 1099,
    description: 'Latest iPhone with advanced features',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    brand: 'Apple',
    inStock: true,
    rating: 4.8,
    reviews: 156,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'prod2',
    shopId: 'shop1',
    name: 'Samsung Galaxy S24',
    category: 'Electronics',
    price: 899,
    originalPrice: 999,
    description: 'Powerful Android smartphone',
    image: 'https://images.unsplash.com/photo-1511707171631-9ed0c4b4a4c4?w=400',
    brand: 'Samsung',
    inStock: true,
    rating: 4.6,
    reviews: 89,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: 'prod3',
    shopId: 'shop2',
    name: 'Designer Jeans',
    category: 'Fashion',
    price: 79,
    originalPrice: 99,
    description: 'Premium quality denim jeans',
    image: 'https://images.unsplash.com/photo-1542272604-787c13755354?w=400',
    brand: 'Levi\'s',
    inStock: true,
    rating: 4.4,
    reviews: 234,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'prod4',
    shopId: 'shop2',
    name: 'Summer Dress',
    category: 'Fashion',
    price: 49,
    originalPrice: 69,
    description: 'Elegant summer dress',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    brand: 'Zara',
    inStock: true,
    rating: 4.2,
    reviews: 67,
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: 'prod5',
    shopId: 'shop3',
    name: 'Gourmet Pizza',
    category: 'Food',
    price: 15,
    originalPrice: 18,
    description: 'Delicious wood-fired pizza',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    brand: 'Pizza Palace',
    inStock: true,
    rating: 4.7,
    reviews: 189,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  }
];

export const mockOffers = [
  {
    id: 'offer1',
    shopId: 'shop1',
    title: 'Electronics Sale',
    description: 'Up to 30% off on all electronics',
    discount: 30,
    discountType: 'percentage',
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    isActive: true,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
    terms: 'Valid on selected items only',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'offer2',
    shopId: 'shop2',
    title: 'Fashion Week Special',
    description: 'Buy 2 Get 1 Free on all clothing',
    discount: 33,
    discountType: 'percentage',
    validFrom: new Date('2024-02-01'),
    validTo: new Date('2024-02-29'),
    isActive: true,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    terms: 'Valid on full-price items only',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'offer3',
    shopId: 'shop3',
    title: 'Happy Hour',
    description: '50% off on all beverages',
    discount: 50,
    discountType: 'percentage',
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    isActive: true,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    terms: 'Valid from 3 PM to 6 PM daily',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'offer4',
    shopId: 'shop4',
    title: 'Beauty Bundle',
    description: 'Get 3 beauty products for the price of 2',
    discount: 33,
    discountType: 'percentage',
    validFrom: new Date('2024-03-01'),
    validTo: new Date('2024-03-31'),
    isActive: true,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    terms: 'Mix and match any 3 products',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  }
];

export const mockCategories = [
  {
    id: 'cat1',
    name: 'Electronics',
    description: 'Latest gadgets and electronic devices',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'cat2',
    name: 'Fashion',
    description: 'Trendy clothing and accessories',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'cat3',
    name: 'Food & Beverage',
    description: 'Delicious food and drinks',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'cat4',
    name: 'Beauty & Health',
    description: 'Cosmetics and health products',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'cat5',
    name: 'Sports & Fitness',
    description: 'Sports equipment and fitness gear',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const mockFloors = [
  {
    id: 'floor1',
    name: 'Ground Floor',
    description: 'Main entrance and popular stores',
    level: 0,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'floor2',
    name: 'First Floor',
    description: 'Fashion and beauty stores',
    level: 1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'floor3',
    name: 'Second Floor',
    description: 'Food court and entertainment',
    level: 2,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'floor4',
    name: 'Third Floor',
    description: 'Office spaces and services',
    level: 3,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Mock API functions with delays to simulate real API calls
export const mockApi = {
  // Simulate API delay
  delay: (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms)),

  // Shops API
  getShops: async () => {
    await mockApi.delay(800);
    return { success: true, data: mockShops };
  },

  getShop: async (id) => {
    await mockApi.delay(500);
    const shop = mockShops.find(s => s.id === id);
    return { success: !!shop, data: shop };
  },

  createShop: async (shopData) => {
    await mockApi.delay(1000);
    const newShop = {
      id: `shop${Date.now()}`,
      ...shopData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockShops.push(newShop);
    return { success: true, data: newShop };
  },

  updateShop: async (id, shopData) => {
    await mockApi.delay(800);
    const index = mockShops.findIndex(s => s.id === id);
    if (index !== -1) {
      mockShops[index] = { ...mockShops[index], ...shopData, updatedAt: new Date() };
      return { success: true, data: mockShops[index] };
    }
    return { success: false, error: 'Shop not found' };
  },

  deleteShop: async (id) => {
    await mockApi.delay(600);
    const index = mockShops.findIndex(s => s.id === id);
    if (index !== -1) {
      mockShops.splice(index, 1);
      return { success: true };
    }
    return { success: false, error: 'Shop not found' };
  },

  // Products API
  getProducts: async () => {
    await mockApi.delay(700);
    return { success: true, data: mockProducts };
  },

  getProductsByShop: async (shopId) => {
    await mockApi.delay(600);
    const products = mockProducts.filter(p => p.shopId === shopId);
    return { success: true, data: products };
  },

  // Offers API
  getOffers: async () => {
    await mockApi.delay(600);
    return { success: true, data: mockOffers };
  },

  getOffersByShop: async (shopId) => {
    await mockApi.delay(500);
    const offers = mockOffers.filter(o => o.shopId === shopId);
    return { success: true, data: offers };
  },

  // Categories API
  getCategories: async () => {
    await mockApi.delay(400);
    return { success: true, data: mockCategories };
  },

  // Floors API
  getFloors: async () => {
    await mockApi.delay(300);
    return { success: true, data: mockFloors };
  },

  // Statistics API
  getStatistics: async () => {
    await mockApi.delay(500);
    return {
      success: true,
      data: {
        totalShops: mockShops.length,
        totalOffers: mockOffers.length,
        totalProducts: mockProducts.length,
        totalCategories: mockCategories.length,
        totalFloors: mockFloors.length
      }
    };
  }
};
