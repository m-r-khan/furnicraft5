/**
 * Clear all order data from localStorage
 * This ensures we start fresh with only real orders from actual users
 */
export const clearAllOrderData = () => {
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Remove all order-related data
    keys.forEach(key => {
      if (key.startsWith('furnicraft_orders_') || key.includes('order')) {
        localStorage.removeItem(key);
        console.log(`Removed: ${key}`);
      }
    });
    
    // Also remove sample order data if it exists
    localStorage.removeItem('furnicraft_orders_sample');
    
    console.log('All order data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing order data:', error);
    return false;
  }
};

/**
 * Check if there are any existing orders
 */
export const hasExistingOrders = (): boolean => {
  try {
    const keys = Object.keys(localStorage);
    return keys.some(key => key.startsWith('furnicraft_orders_') && key !== 'furnicraft_orders_sample');
  } catch (error) {
    console.error('Error checking existing orders:', error);
    return false;
  }
};

/**
 * Get all order keys for debugging
 */
export const getOrderKeys = (): string[] => {
  try {
    const keys = Object.keys(localStorage);
    return keys.filter(key => key.startsWith('furnicraft_orders_') || key.includes('order'));
  } catch (error) {
    console.error('Error getting order keys:', error);
    return [];
  }
}; 