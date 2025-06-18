import { Coupon } from '../types';

// Reset promo codes (for development/testing)
export const resetPromoCodes = () => {
  localStorage.removeItem('promoCodes');
};

// Initialize promo codes in localStorage if not exists
const initializePromoCodes = () => {
  const existingPromos = localStorage.getItem('promoCodes');
  if (!existingPromos) {
    const samplePromos: Coupon[] = [
      {
        id: '1',
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minOrderAmount: 500,
        maxDiscount: 1000,
        usageLimit: 100,
        usedCount: 25,
        isActive: true,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        applicableCategories: [],
        applicableProducts: [],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '2',
        code: 'FLAT50',
        type: 'fixed',
        value: 50,
        minOrderAmount: 200,
        maxDiscount: 50,
        usageLimit: 200,
        usedCount: 75,
        isActive: true,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        applicableCategories: [],
        applicableProducts: [],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '3',
        code: 'FURNITURE20',
        type: 'percentage',
        value: 20,
        minOrderAmount: 1000,
        maxDiscount: 2000,
        usageLimit: 50,
        usedCount: 15,
        isActive: true,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        applicableCategories: ['furniture'],
        applicableProducts: [],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      }
    ];
    localStorage.setItem('promoCodes', JSON.stringify(samplePromos));
  } else {
    // Check if existing promo codes have old dates and reset them
    try {
      const promos = JSON.parse(existingPromos);
      const now = new Date();
      const hasExpiredPromos = promos.some((promo: Coupon) => {
        const validUntil = new Date(promo.validUntil);
        return validUntil < now;
      });
      
      if (hasExpiredPromos) {
        console.log('Found expired promo codes, resetting to current dates...');
        resetPromoCodes();
        // Re-initialize with current dates
        initializePromoCodes();
      }
    } catch (error) {
      console.error('Error checking promo codes, resetting...', error);
      resetPromoCodes();
      initializePromoCodes();
    }
  }
};

// Get all promo codes
export const getAllPromoCodes = (): Coupon[] => {
  initializePromoCodes();
  const promos = localStorage.getItem('promoCodes');
  return promos ? JSON.parse(promos) : [];
};

// Get active promo codes
export const getActivePromoCodes = (): Coupon[] => {
  const allPromos = getAllPromoCodes();
  const now = new Date();
  return allPromos.filter(promo => 
    promo.isActive && 
    new Date(promo.validFrom) <= now && 
    new Date(promo.validUntil) >= now
  );
};

// Get promo code by code
export const getPromoCodeByCode = (code: string): Coupon | null => {
  const allPromos = getAllPromoCodes();
  return allPromos.find(promo => promo.code.toUpperCase() === code.toUpperCase()) || null;
};

// Validate promo code
export const validatePromoCode = (
  code: string, 
  subtotal: number, 
  categoryIds: string[] = [], 
  productIds: string[] = []
): { isValid: boolean; message: string; promo?: Coupon } => {
  const promo = getPromoCodeByCode(code);
  
  if (!promo) {
    return { isValid: false, message: 'Invalid promo code' };
  }
  
  if (!promo.isActive) {
    return { isValid: false, message: 'This promo code is inactive' };
  }
  
  const now = new Date();
  if (new Date(promo.validFrom) > now) {
    return { isValid: false, message: 'This promo code is not yet valid' };
  }
  
  if (new Date(promo.validUntil) < now) {
    return { isValid: false, message: 'This promo code has expired' };
  }
  
  if (promo.usedCount >= promo.usageLimit) {
    return { isValid: false, message: 'This promo code usage limit has been reached' };
  }
  
  if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
    return { 
      isValid: false, 
      message: `Minimum order amount of ₹${promo.minOrderAmount} required` 
    };
  }
  
  // Check category restrictions
  if (promo.applicableCategories && promo.applicableCategories.length > 0) {
    const hasValidCategory = categoryIds.some(catId => 
      promo.applicableCategories!.includes(catId)
    );
    if (!hasValidCategory) {
      return { isValid: false, message: 'This promo code is not applicable to items in your cart' };
    }
  }
  
  // Check product restrictions
  if (promo.applicableProducts && promo.applicableProducts.length > 0) {
    const hasValidProduct = productIds.some(prodId => 
      promo.applicableProducts!.includes(prodId)
    );
    if (!hasValidProduct) {
      return { isValid: false, message: 'This promo code is not applicable to items in your cart' };
    }
  }
  
  return { isValid: true, message: 'Promo code applied successfully', promo };
};

// Calculate discount amount
export const calculateDiscount = (promo: Coupon, subtotal: number): number => {
  let discount = 0;
  
  if (promo.type === 'percentage') {
    discount = (subtotal * promo.value) / 100;
  } else {
    discount = promo.value;
  }
  
  // Apply max discount limit
  if (promo.maxDiscount && discount > promo.maxDiscount) {
    discount = promo.maxDiscount;
  }
  
  // Ensure discount doesn't exceed subtotal
  if (discount > subtotal) {
    discount = subtotal;
  }
  
  return Math.round(discount);
};

// Apply promo code and increment usage
export const applyPromoCode = (code: string): boolean => {
  const promos = getAllPromoCodes();
  const promoIndex = promos.findIndex(p => p.code.toUpperCase() === code.toUpperCase());
  
  if (promoIndex === -1) return false;
  
  promos[promoIndex].usedCount += 1;
  promos[promoIndex].updatedAt = new Date();
  
  localStorage.setItem('promoCodes', JSON.stringify(promos));
  return true;
};

// Create new promo code
export const createPromoCode = (promoData: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>): Coupon => {
  const promos = getAllPromoCodes();
  const newPromo: Coupon = {
    ...promoData,
    id: Date.now().toString(),
    usedCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  promos.push(newPromo);
  localStorage.setItem('promoCodes', JSON.stringify(promos));
  return newPromo;
};

// Update promo code
export const updatePromoCode = (id: string, updates: Partial<Coupon>): Coupon | null => {
  const promos = getAllPromoCodes();
  const promoIndex = promos.findIndex(p => p.id === id);
  
  if (promoIndex === -1) return null;
  
  promos[promoIndex] = {
    ...promos[promoIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  localStorage.setItem('promoCodes', JSON.stringify(promos));
  return promos[promoIndex];
};

// Delete promo code
export const deletePromoCode = (id: string): boolean => {
  const promos = getAllPromoCodes();
  const filteredPromos = promos.filter(p => p.id !== id);
  
  if (filteredPromos.length === promos.length) return false;
  
  localStorage.setItem('promoCodes', JSON.stringify(filteredPromos));
  return true;
};

// Get promo code statistics
export const getPromoCodeStats = () => {
  const promos = getAllPromoCodes();
  const activePromos = getActivePromoCodes();
  
  const totalUsage = promos.reduce((sum, promo) => sum + promo.usedCount, 0);
  const totalDiscount = promos.reduce((sum, promo) => {
    if (promo.type === 'fixed') {
      return sum + (promo.value * promo.usedCount);
    } else {
      // For percentage, we can't calculate exact discount without order data
      return sum;
    }
  }, 0);
  
  return {
    totalPromos: promos.length,
    activePromos: activePromos.length,
    totalUsage,
    totalDiscount,
    averageUsage: promos.length > 0 ? totalUsage / promos.length : 0
  };
};

// Search promo codes
export const searchPromoCodes = (query: string): Coupon[] => {
  const promos = getAllPromoCodes();
  const searchTerm = query.toLowerCase();
  
  return promos.filter(promo => 
    promo.code.toLowerCase().includes(searchTerm) ||
    (promo.applicableCategories && promo.applicableCategories.some(cat => 
      cat.toLowerCase().includes(searchTerm)
    ))
  );
};

// Filter promo codes
export const filterPromoCodes = (filters: {
  isActive?: boolean;
  type?: 'percentage' | 'fixed';
  dateFrom?: Date;
  dateTo?: Date;
}): Coupon[] => {
  let promos = getAllPromoCodes();
  
  if (filters.isActive !== undefined) {
    promos = promos.filter(promo => promo.isActive === filters.isActive);
  }
  
  if (filters.type) {
    promos = promos.filter(promo => promo.type === filters.type);
  }
  
  if (filters.dateFrom) {
    promos = promos.filter(promo => new Date(promo.validFrom) >= filters.dateFrom!);
  }
  
  if (filters.dateTo) {
    promos = promos.filter(promo => new Date(promo.validUntil) <= filters.dateTo!);
  }
  
  return promos;
}; 