import { Cart, CartItem, OrderStatus, OrderStatusHistory, User } from '../types';

// Extended Order interface to handle both structured and simplified formats
export interface ExtendedOrder {
  id: string;
  orderNumber: string;
  userId?: string;
  user?: User;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  status: OrderStatus;
  items: Array<{
    id?: string;
    productId?: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    unitPrice?: number;
    totalPrice?: number;
    product?: any;
  }>;
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  discount?: number;
  total: number;
  shippingAddress: {
    id?: string;
    userId?: string;
    addressLine1?: string;
    street?: string;
    city: string;
    state: string;
    postalCode?: string;
    pincode?: string;
    country?: string;
    isDefault?: boolean;
    label?: string;
  };
  billingAddress?: any;
  paymentMethod: 'cod' | 'card' | 'bank_transfer' | 'Credit Card' | 'UPI' | 'Net Banking' | 'Cash on Delivery';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'Pending' | 'Completed';
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  notes?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  statusHistory?: OrderStatusHistory[];
  appliedPromo?: {
    code: string;
    type: string;
    value: number;
    discount: number;
  };
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface CheckoutForm {
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  };
  paymentMethod: string;
  notes?: string;
}

/**
 * Generate a unique order number
 */
export const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

/**
 * Convert cart items to order items format
 */
export const convertCartItemsToOrderItems = (cartItems: any[]): any[] => {
  return cartItems.map(item => ({
    id: item.id,
    productId: item.productId,
    name: item.product.name,
    quantity: item.quantity,
    price: item.price,
    total: item.price * item.quantity
  }));
};

/**
 * Create a new order from checkout data
 */
export const createOrder = (
  cart: Cart,
  formData: CheckoutForm,
  userEmail: string,
  customerName: string,
  discount: number = 0,
  appliedPromo?: any
): ExtendedOrder => {
  const orderNumber = generateOrderNumber();
  const orderItems = convertCartItemsToOrderItems(cart.items);
  
  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1; // 10% tax
  const shippingCost = subtotal > 5000 ? 0 : 500; // Free shipping above ₹5000
  const finalDiscount = Math.min(discount, subtotal);
  const total = subtotal + tax + shippingCost - finalDiscount;
  
  // Track product purchases
  cart.items.forEach(item => {
    trackProductPurchase(item.productId, item.quantity);
  });
  
  const order: ExtendedOrder = {
    id: Date.now().toString(),
    orderNumber,
    userId: userEmail,
    user: { email: userEmail } as User,
    customer: {
      name: customerName,
      email: userEmail,
      phone: formData.shippingAddress.phone
    },
    status: 'pending',
    items: orderItems,
    subtotal,
    tax,
    shippingCost,
    discount: finalDiscount,
    total,
    shippingAddress: {
      street: formData.shippingAddress.addressLine1,
      city: formData.shippingAddress.city,
      state: formData.shippingAddress.state,
      postalCode: formData.shippingAddress.postalCode,
      country: 'India'
    },
    paymentMethod: formData.paymentMethod as any,
    paymentStatus: 'pending',
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    notes: formData.notes,
    createdAt: new Date(),
    updatedAt: new Date(),
    statusHistory: [{
      id: Date.now().toString(),
      orderId: Date.now().toString(),
      status: 'pending',
      changedAt: new Date()
    }],
    appliedPromo
  };
  
  return order;
};

/**
 * Get all orders from all users (for admin)
 */
export const getAllOrders = (): ExtendedOrder[] => {
  try {
    const allOrders: ExtendedOrder[] = [];
    
    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('furnicraft_orders_')) {
        const userOrders = JSON.parse(localStorage.getItem(key) || '[]');
        allOrders.push(...userOrders);
      }
    }
    
    // Sort by creation date (newest first)
    return allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error getting all orders:', error);
    return [];
  }
};

/**
 * Get orders by status (for admin)
 */
export const getOrdersByStatus = (status: OrderStatus): ExtendedOrder[] => {
  const allOrders = getAllOrders();
  return allOrders.filter(order => order.status === status);
};

/**
 * Get orders by user email (for admin)
 */
export const getOrdersByUser = (userEmail: string): ExtendedOrder[] => {
  try {
    const userOrdersKey = `furnicraft_orders_${userEmail}`;
    return JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
  } catch (error) {
    console.error('Error getting orders by user:', error);
    return [];
  }
};

/**
 * Update order status (for admin)
 */
export const updateOrderStatus = (
  orderId: string, 
  newStatus: OrderStatus, 
  adminUser: User,
  notes?: string
): boolean => {
  try {
    let orderFound = false;
    let order: ExtendedOrder | null = null;
    
    // Find the order in all user order lists
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('furnicraft_orders_')) {
        const userOrders = JSON.parse(localStorage.getItem(key) || '[]');
        const orderIndex = userOrders.findIndex((o: ExtendedOrder) => o.id === orderId);
        
        if (orderIndex !== -1) {
          order = userOrders[orderIndex];
          
          // Create status history entry
          const statusHistory: OrderStatusHistory = {
            id: Date.now().toString(),
            orderId: orderId,
            status: newStatus,
            notes: notes || '',
            changedBy: adminUser.email,
            changedAt: new Date()
          };
          
          // Update order
          const updatedOrder = {
            ...order,
            status: newStatus,
            updatedAt: new Date(),
            statusHistory: [...(order.statusHistory || []), statusHistory]
          };
          
          userOrders[orderIndex] = updatedOrder;
          localStorage.setItem(key, JSON.stringify(userOrders));
          orderFound = true;
          break;
        }
      }
    }
    
    // Handle stock management based on status change
    if (orderFound && order) {
      const oldStatus = order.status;
      
      console.log(`Order ${orderId} status change: ${oldStatus} → ${newStatus}`);
      
      // If order is being cancelled from pending/confirmed/processing, restore stock
      if (newStatus === 'cancelled' && ['pending', 'confirmed', 'processing', 'shipped'].includes(oldStatus)) {
        order.items.forEach(item => {
          if (item.productId) {
            // Restore stock by the quantity ordered
            updateProductStock(item.productId, -item.quantity);
          }
        });
        console.log(`Stock restored for order ${orderId} - cancelled`);
      }
      
      // If order is being returned, restore stock
      if (newStatus === 'returned' && oldStatus === 'delivered') {
        order.items.forEach(item => {
          if (item.productId) {
            // Restore stock by the quantity returned
            updateProductStock(item.productId, item.quantity);
          }
        });
        console.log(`Stock restored for order ${orderId} - returned`);
      }
      
      // If return is being processed and refunded, ensure stock is restored
      if (newStatus === 'refunded' && ['return_requested', 'return_approved', 'return_pickup_scheduled', 'return_picked_up', 'return_received', 'returned'].includes(oldStatus)) {
        order.items.forEach(item => {
          if (item.productId) {
            // Restore stock by the quantity returned (if not already restored)
            updateProductStock(item.productId, item.quantity);
          }
        });
        console.log(`Stock restored for order ${orderId} - return refunded`);
      }
      
      // Additional check: if order was delivered and is now in any return status, restore stock
      if (['return_requested', 'return_approved', 'return_pickup_scheduled', 'return_picked_up', 'return_received', 'returned', 'refunded'].includes(newStatus) && oldStatus === 'delivered') {
        order.items.forEach(item => {
          if (item.productId) {
            // Restore stock by the quantity returned
            updateProductStock(item.productId, item.quantity);
          }
        });
        console.log(`Stock restored for order ${orderId} - moved to return status: ${newStatus}`);
      }
    }
    
    return orderFound;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

/**
 * Get order status history
 */
export const getOrderStatusHistory = (orderId: string): OrderStatusHistory[] => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('furnicraft_orders_')) {
        const userOrders = JSON.parse(localStorage.getItem(key) || '[]');
        const order = userOrders.find((order: ExtendedOrder) => order.id === orderId);
        if (order) {
          return order.statusHistory || [];
        }
      }
    }
    return [];
  } catch (error) {
    console.error('Error getting order status history:', error);
    return [];
  }
};

/**
 * Get order statistics for admin dashboard
 */
export const getOrderStatistics = () => {
  const allOrders = getAllOrders();
  
  const stats = {
    total: allOrders.length,
    pending: allOrders.filter(order => order.status === 'pending').length,
    confirmed: allOrders.filter(order => order.status === 'confirmed').length,
    processing: allOrders.filter(order => order.status === 'processing').length,
    shipped: allOrders.filter(order => order.status === 'shipped').length,
    delivered: allOrders.filter(order => order.status === 'delivered').length,
    cancelled: allOrders.filter(order => order.status === 'cancelled').length,
    returned: allOrders.filter(order => order.status === 'returned').length,
    refunded: allOrders.filter(order => order.status === 'refunded').length,
    totalRevenue: allOrders
      .filter(order => ['delivered', 'shipped', 'processing', 'confirmed'].includes(order.status))
      .reduce((sum, order) => sum + (order.total || 0), 0)
  };
  
  return stats;
};

/**
 * Get recent orders for admin dashboard
 */
export const getRecentOrders = (limit: number = 10): ExtendedOrder[] => {
  const allOrders = getAllOrders();
  return allOrders.slice(0, limit);
};

/**
 * Search orders (for admin)
 */
export const searchOrders = (query: string): ExtendedOrder[] => {
  const allOrders = getAllOrders();
  const searchTerm = query.toLowerCase();
  
  return allOrders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm) ||
    order.customer?.name?.toLowerCase().includes(searchTerm) ||
    order.customer?.email?.toLowerCase().includes(searchTerm) ||
    order.items?.some(item => item.name.toLowerCase().includes(searchTerm))
  );
};

/**
 * Filter orders by date range (for admin)
 */
export const filterOrdersByDateRange = (startDate: Date, endDate: Date): ExtendedOrder[] => {
  const allOrders = getAllOrders();
  
  return allOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });
};

/**
 * Get next possible statuses for an order
 */
export const getNextPossibleStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
  const statusFlow: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'returned'],
    delivered: ['returned'],
    cancelled: [],
    returned: ['refunded'],
    refunded: [],
    return_requested: ['return_approved', 'return_rejected'],
    return_approved: ['return_pickup_scheduled'],
    return_rejected: [],
    return_pickup_scheduled: ['return_picked_up'],
    return_picked_up: ['return_received'],
    return_received: ['returned'],
  };
  
  return statusFlow[currentStatus] || [];
};

/**
 * Check if status transition is valid
 */
export const isValidStatusTransition = (fromStatus: OrderStatus, toStatus: OrderStatus): boolean => {
  const nextStatuses = getNextPossibleStatuses(fromStatus);
  return nextStatuses.includes(toStatus);
};

/**
 * Check if order can be cancelled by user
 */
export const canUserCancelOrder = (orderStatus: OrderStatus): boolean => {
  return ['pending', 'confirmed'].includes(orderStatus);
};

/**
 * Check if order can be cancelled by admin
 */
export const canAdminCancelOrder = (orderStatus: OrderStatus): boolean => {
  return ['pending', 'confirmed', 'processing'].includes(orderStatus);
};

/**
 * Add order to user's order history in localStorage
 */
export const addOrderToHistory = (userEmail: string, order: ExtendedOrder): void => {
  try {
    const userOrdersKey = `furnicraft_orders_${userEmail}`;
    const existingOrders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
    const updatedOrders = [order, ...existingOrders]; // Add new order at the beginning
    localStorage.setItem(userOrdersKey, JSON.stringify(updatedOrders));
  } catch (error) {
    console.error('Error adding order to history:', error);
    throw new Error('Failed to save order to history');
  }
};

/**
 * Get user's order history from localStorage
 */
export const getUserOrderHistory = (userEmail: string): ExtendedOrder[] => {
  try {
    const userOrdersKey = `furnicraft_orders_${userEmail}`;
    return JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
  } catch (error) {
    console.error('Error getting user order history:', error);
    return [];
  }
};

/**
 * Format a date string or Date object safely
 */
export function formatDate(date: string | Date | undefined | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-IN', opts || {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

/**
 * Update product stock by delta (positive or negative)
 */
export function updateProductStock(productId: string, delta: number) {
  const productsRaw = localStorage.getItem('furnicraft_products');
  if (!productsRaw) {
    console.warn('No products found in localStorage');
    return;
  }
  
  const products = JSON.parse(productsRaw);
  const idx = products.findIndex((p: any) => p.id === productId);
  if (idx === -1) {
    console.warn(`Product with ID ${productId} not found`);
    return;
  }
  
  const oldStock = products[idx].stockQuantity || 0;
  const newStock = Math.max(0, oldStock + delta);
  products[idx].stockQuantity = newStock;
  
  console.log(`Stock updated for product ${products[idx].name}: ${oldStock} → ${newStock} (${delta > 0 ? '+' : ''}${delta})`);
  
  localStorage.setItem('furnicraft_products', JSON.stringify(products));
}

/**
 * Check if there's sufficient stock for an order
 */
export function validateStockAvailability(cart: Cart): { isValid: boolean; errors: string[] } {
  const productsRaw = localStorage.getItem('furnicraft_products');
  if (!productsRaw) {
    return { isValid: false, errors: ['Products not found'] };
  }
  
  const products = JSON.parse(productsRaw);
  const errors: string[] = [];
  
  cart.items.forEach(item => {
    const product = products.find((p: any) => p.id === item.productId);
    if (!product) {
      errors.push(`Product ${item.product?.name || 'Unknown'} not found`);
    } else if ((product.stockQuantity || 0) < item.quantity) {
      errors.push(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get current stock levels for debugging
 */
export function getCurrentStockLevels(): { productId: string; name: string; stock: number }[] {
  const productsRaw = localStorage.getItem('furnicraft_products');
  if (!productsRaw) {
    return [];
  }
  
  const products = JSON.parse(productsRaw);
  return products.map((product: any) => ({
    productId: product.id,
    name: product.name,
    stock: product.stockQuantity || 0
  }));
}

/**
 * Restore stock for a specific order (for return processing)
 */
export function restoreStockForOrder(orderId: string): boolean {
  try {
    let order: ExtendedOrder | null = null;
    
    // Find the order in all user order lists
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('furnicraft_orders_')) {
        const userOrders = JSON.parse(localStorage.getItem(key) || '[]');
        const foundOrder = userOrders.find((o: ExtendedOrder) => o.id === orderId);
        if (foundOrder) {
          order = foundOrder;
          break;
        }
      }
    }
    
    if (!order) {
      console.warn(`Order ${orderId} not found for stock restoration`);
      return false;
    }
    
    console.log(`Restoring stock for order ${orderId} (${order.orderNumber})`);
    
    // Log current stock levels before restoration
    const beforeStock = getCurrentStockLevels();
    console.log('Stock levels before restoration:', beforeStock);
    
    // Restore stock for each item
    order.items.forEach(item => {
      if (item.productId) {
        console.log(`Restoring ${item.quantity} units for product ${item.productId} (${item.name})`);
        updateProductStock(item.productId, item.quantity);
      }
    });
    
    // Log stock levels after restoration
    const afterStock = getCurrentStockLevels();
    console.log('Stock levels after restoration:', afterStock);
    
    console.log(`Stock restoration completed for order ${orderId}`);
    return true;
  } catch (error) {
    console.error('Error restoring stock for order:', error);
    return false;
  }
}

/**
 * Debug function to check stock for a specific product
 */
export function debugProductStock(productId: string): { productId: string; name: string; stock: number } | null {
  const productsRaw = localStorage.getItem('furnicraft_products');
  if (!productsRaw) {
    console.warn('No products found in localStorage');
    return null;
  }
  
  const products = JSON.parse(productsRaw);
  const product = products.find((p: any) => p.id === productId);
  
  if (!product) {
    console.warn(`Product ${productId} not found`);
    return null;
  }
  
  const stockInfo = {
    productId: product.id,
    name: product.name,
    stock: product.stockQuantity || 0
  };
  
  console.log('Product stock info:', stockInfo);
  return stockInfo;
}

/**
 * Track product view
 */
export function trackProductView(productId: string): void {
  try {
    console.log(`Tracking view for product: ${productId}`);
    
    const productsRaw = localStorage.getItem('furnicraft_products');
    if (!productsRaw) {
      console.log('No products found in localStorage');
      return;
    }
    
    const products = JSON.parse(productsRaw);
    const productIndex = products.findIndex((p: any) => p.id === productId);
    
    if (productIndex !== -1) {
      const oldViewCount = products[productIndex].viewCount || 0;
      products[productIndex].viewCount = oldViewCount + 1;
      products[productIndex].lastViewedAt = new Date();
      products[productIndex].updatedAt = new Date();
      
      localStorage.setItem('furnicraft_products', JSON.stringify(products));
      
      console.log(`Updated view count for product ${productId}: ${oldViewCount} -> ${products[productIndex].viewCount}`);
    } else {
      console.log(`Product ${productId} not found in products array`);
    }
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
}

/**
 * Track product added to cart
 */
export function trackCartAddition(productId: string): void {
  try {
    console.log(`Tracking cart addition for product: ${productId}`);
    
    const productsRaw = localStorage.getItem('furnicraft_products');
    if (!productsRaw) {
      console.log('No products found in localStorage');
      return;
    }
    
    const products = JSON.parse(productsRaw);
    const productIndex = products.findIndex((p: any) => p.id === productId);
    
    if (productIndex !== -1) {
      const oldCartAdditions = products[productIndex].cartAdditions || 0;
      products[productIndex].cartAdditions = oldCartAdditions + 1;
      products[productIndex].updatedAt = new Date();
      
      localStorage.setItem('furnicraft_products', JSON.stringify(products));
      
      console.log(`Updated cart additions for product ${productId}: ${oldCartAdditions} -> ${products[productIndex].cartAdditions}`);
    } else {
      console.log(`Product ${productId} not found in products array`);
    }
  } catch (error) {
    console.error('Error tracking cart addition:', error);
  }
}

/**
 * Track product added to wishlist
 */
export function trackWishlistAddition(productId: string): void {
  try {
    console.log(`Tracking wishlist addition for product: ${productId}`);
    
    const productsRaw = localStorage.getItem('furnicraft_products');
    if (!productsRaw) {
      console.log('No products found in localStorage');
      return;
    }
    
    const products = JSON.parse(productsRaw);
    const productIndex = products.findIndex((p: any) => p.id === productId);
    
    if (productIndex !== -1) {
      const oldWishlistAdditions = products[productIndex].wishlistAdditions || 0;
      products[productIndex].wishlistAdditions = oldWishlistAdditions + 1;
      products[productIndex].updatedAt = new Date();
      
      localStorage.setItem('furnicraft_products', JSON.stringify(products));
      
      console.log(`Updated wishlist additions for product ${productId}: ${oldWishlistAdditions} -> ${products[productIndex].wishlistAdditions}`);
    } else {
      console.log(`Product ${productId} not found in products array`);
    }
  } catch (error) {
    console.error('Error tracking wishlist addition:', error);
  }
}

/**
 * Track product purchase (called when order is created)
 */
export function trackProductPurchase(productId: string, quantity: number = 1): void {
  try {
    console.log(`Tracking purchase for product: ${productId}, quantity: ${quantity}`);
    
    const productsRaw = localStorage.getItem('furnicraft_products');
    if (!productsRaw) {
      console.log('No products found in localStorage');
      return;
    }
    
    const products = JSON.parse(productsRaw);
    const productIndex = products.findIndex((p: any) => p.id === productId);
    
    if (productIndex !== -1) {
      const oldPurchaseCount = products[productIndex].purchaseCount || 0;
      products[productIndex].purchaseCount = oldPurchaseCount + quantity;
      products[productIndex].updatedAt = new Date();
      
      localStorage.setItem('furnicraft_products', JSON.stringify(products));
      
      console.log(`Updated purchase count for product ${productId}: ${oldPurchaseCount} -> ${products[productIndex].purchaseCount}`);
    } else {
      console.log(`Product ${productId} not found in products array`);
    }
  } catch (error) {
    console.error('Error tracking product purchase:', error);
  }
}

/**
 * Calculate total inventory value (current stock * purchase cost)
 */
export const getTotalInventoryValue = () => {
  try {
    const products = JSON.parse(localStorage.getItem('furnicraft_products') || '[]');
    let totalInventoryValue = 0;
    const inventoryBreakdown: { [key: string]: { name: string; stock: number; cost: number; value: number } } = {};
    
    products.forEach((product: any) => {
      if (product.purchaseCost && product.stockQuantity) {
        const itemValue = product.purchaseCost * product.stockQuantity;
        totalInventoryValue += itemValue;
        inventoryBreakdown[product.id] = {
          name: product.name,
          stock: product.stockQuantity,
          cost: product.purchaseCost,
          value: itemValue
        };
      }
    });
    
    return {
      totalValue: totalInventoryValue,
      breakdown: inventoryBreakdown,
      productCount: Object.keys(inventoryBreakdown).length
    };
  } catch (error) {
    console.error('Error calculating inventory value:', error);
    return {
      totalValue: 0,
      breakdown: {},
      productCount: 0
    };
  }
};

/**
 * Get comprehensive revenue analytics with real purchase costs
 */
export const getRevenueAnalytics = () => {
  const allOrders = getAllOrders();
  const products = JSON.parse(localStorage.getItem('furnicraft_products') || '[]');
  const categories = JSON.parse(localStorage.getItem('furnicraft_categories') || '[]');
  
  // Calculate total revenue from completed orders
  const completedOrders = allOrders.filter(order => 
    ['delivered', 'shipped', 'processing', 'confirmed'].includes(order.status)
  );
  
  const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  
  // Calculate tax collected (assuming 10% tax rate)
  const taxCollected = totalRevenue * 0.1;
  
  // Calculate net revenue (total - tax)
  const netRevenue = totalRevenue - taxCollected;
  
  // Calculate total inventory cost based on actual purchase costs
  let totalInventoryCost = 0;
  const productCosts: { [key: string]: number } = {};
  
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      const product = products.find((p: any) => p.id === item.productId);
      if (product && product.purchaseCost) {
        const itemCost = product.purchaseCost * (item.quantity || 1);
        totalInventoryCost += itemCost;
        productCosts[item.productId] = (productCosts[item.productId] || 0) + itemCost;
      }
    });
  });
  
  // Calculate current inventory value
  const inventoryValue = getTotalInventoryValue();
  
  // Calculate gross profit
  const grossProfit = netRevenue - totalInventoryCost;
  
  // Calculate profit margin
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  
  // Calculate average order value
  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  
  // Get recent sales (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSales = completedOrders.filter(order => 
    new Date(order.createdAt) >= thirtyDaysAgo
  );
  
  const recentRevenue = recentSales.reduce((sum, order) => sum + (order.total || 0), 0);
  
  // Calculate revenue by category with proper category names
  const revenueByCategory: { [key: string]: number } = {};
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      const product = products.find((p: any) => p.id === item.productId);
      if (product && product.categoryId) {
        const category = categories.find((c: any) => c.id === product.categoryId);
        const categoryName = category ? category.name : 'Uncategorized';
        revenueByCategory[categoryName] = (revenueByCategory[categoryName] || 0) + (item.total || 0);
      }
    });
  });
  
  // Get most selling items with real data
  const itemSales: { [key: string]: { name: string; quantity: number; revenue: number; productId: string } } = {};
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      if (item.productId) {
        if (!itemSales[item.productId]) {
          itemSales[item.productId] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            productId: item.productId
          };
        }
        itemSales[item.productId].quantity += item.quantity || 0;
        itemSales[item.productId].revenue += item.total || 0;
      }
    });
  });
  
  const mostSellingItems = Object.values(itemSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);
  
  // Get most viewed items with real view counts
  const mostViewedItems = products
    .map((product: any) => ({
      id: product.id,
      name: product.name,
      views: product.viewCount || 0,
      category: categories.find((c: any) => c.id === product.categoryId)?.name || 'Uncategorized'
    }))
    .sort((a: any, b: any) => b.views - a.views)
    .slice(0, 10);
  
  // Calculate monthly trends (last 6 months)
  const monthlyTrends = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    monthEnd.setHours(23, 59, 59, 999);
    
    const monthOrders = completedOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= monthStart && orderDate <= monthEnd;
    });
    
    const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    monthlyTrends.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: monthRevenue,
      orders: monthOrders.length,
      date: monthStart
    });
  }
  
  // Calculate return rate
  const returnedOrders = allOrders.filter(order => 
    ['returned', 'refunded'].includes(order.status)
  );
  const returnRate = completedOrders.length > 0 ? (returnedOrders.length / completedOrders.length) * 100 : 0;
  
  // Calculate refund amount
  const refundAmount = returnedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  
  return {
    totalRevenue,
    taxCollected,
    netRevenue,
    inventoryCost: totalInventoryCost,
    currentInventoryValue: inventoryValue.totalValue,
    inventoryBreakdown: inventoryValue.breakdown,
    grossProfit,
    profitMargin,
    averageOrderValue,
    recentRevenue,
    recentSales: recentSales.length,
    revenueByCategory,
    mostSellingItems,
    mostViewedItems,
    monthlyTrends,
    returnRate,
    refundAmount,
    totalOrders: completedOrders.length,
    returnedOrders: returnedOrders.length
  };
};

/**
 * Get sales performance metrics
 */
export const getSalesPerformance = () => {
  const allOrders = getAllOrders();
  const completedOrders = allOrders.filter(order => 
    ['delivered', 'shipped', 'processing', 'confirmed'].includes(order.status)
  );
  
  // Today's sales
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayOrders = completedOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= today && orderDate < tomorrow;
  });
  
  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  
  // This week's sales
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  
  const weekOrders = completedOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= weekStart && orderDate < weekEnd;
  });
  
  const weekRevenue = weekOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  
  // This month's sales
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const monthOrders = completedOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= monthStart && orderDate <= monthEnd;
  });
  
  const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  
  return {
    today: {
      revenue: todayRevenue,
      orders: todayOrders.length
    },
    week: {
      revenue: weekRevenue,
      orders: weekOrders.length
    },
    month: {
      revenue: monthRevenue,
      orders: monthOrders.length
    }
  };
}; 