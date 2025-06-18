import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem, Product } from '../types';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

interface CartContextType {
  cart: Cart;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart>({
    id: '1',
    items: [],
    total: 0,
    itemCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);

  // Generate or get guest session id
  const [guestId] = useState(() => {
    let id = localStorage.getItem('furnicraft_guest_id');
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('furnicraft_guest_id', id);
    }
    return id;
  });
  const cartKey = user ? `furnicraft_cart_${user.id}` : `furnicraft_cart_guest_${guestId}`;

  // Load cart from localStorage on mount or when cartKey changes
  useEffect(() => {
    const storedCart = localStorage.getItem(cartKey);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error parsing stored cart:', error);
        localStorage.removeItem(cartKey);
      }
    } else {
      setCart({
        id: '1',
        items: [],
        total: 0,
        itemCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }, [cartKey]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  const getSampleProducts = (): Product[] => {
    try {
      return JSON.parse(localStorage.getItem('furnicraft_products') || '[]');
    } catch (error) {
      console.error('Error parsing sample products:', error);
      return [];
    }
  };

  const addToCart = async (productId: string, quantity: number): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const sampleProducts = getSampleProducts();
      const product = sampleProducts.find(p => p.id === productId);
      
      if (!product) {
        toast.error('Product not found');
        return;
      }

      if (product.stockQuantity < quantity) {
        toast.error(`Only ${product.stockQuantity} items available in stock`);
        return;
      }

      setCart(prevCart => {
        const existingItem = prevCart.items.find(item => item.productId === productId);
        
        if (existingItem) {
          // Update existing item quantity
          const newQuantity = existingItem.quantity + quantity;
          if (newQuantity > product.stockQuantity) {
            toast.error(`Only ${product.stockQuantity} items available in stock`);
            return prevCart;
          }
          
          const updatedItems = prevCart.items.map(item =>
            item.productId === productId
              ? { ...item, quantity: newQuantity, updatedAt: new Date() }
              : item
          );
          
          const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          
          return {
            ...prevCart,
            items: updatedItems,
            total,
            itemCount,
            updatedAt: new Date(),
          };
        } else {
          // Add new item
          const newItem: CartItem = {
            id: Date.now().toString(),
            productId,
            product,
            quantity,
            price: product.price,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          const updatedItems = [...prevCart.items, newItem];
          const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          
          return {
            ...prevCart,
            items: updatedItems,
            total,
            itemCount,
            updatedAt: new Date(),
          };
        }
      });
      
      toast.success(`${product.name} added to cart!`);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const updatedItems = prevCart.items.filter(item => item.productId !== productId);
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...prevCart,
        items: updatedItems,
        total,
        itemCount,
        updatedAt: new Date(),
      };
    });
    
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const sampleProducts = getSampleProducts();
    const product = sampleProducts.find(p => p.id === productId);
    
    if (product && quantity > product.stockQuantity) {
      toast.error(`Only ${product.stockQuantity} items available in stock`);
      return;
    }

    setCart(prevCart => {
      const updatedItems = prevCart.items.map(item =>
        item.productId === productId
          ? { ...item, quantity, updatedAt: new Date() }
          : item
      );
      
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...prevCart,
        items: updatedItems,
        total,
        itemCount,
        updatedAt: new Date(),
      };
    });
  };

  const clearCart = () => {
    setCart({
      id: '1',
      items: [],
      total: 0,
      itemCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    toast.success('Cart cleared');
  };

  const getItemCount = () => {
    return cart.itemCount;
  };

  const getTotal = () => {
    return cart.total;
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    getTotal,
    isLoading,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
