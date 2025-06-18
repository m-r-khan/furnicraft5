import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WishlistItem, Product } from '../types';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate or get guest session id
  const [guestId] = useState(() => {
    let id = localStorage.getItem('furnicraft_guest_wishlist_id');
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('furnicraft_guest_wishlist_id', id);
    }
    return id;
  });
  
  const wishlistKey = user ? `furnicraft_wishlist_${user.id}` : `furnicraft_wishlist_guest_${guestId}`;

  // Load wishlist from localStorage on mount or when wishlistKey changes
  useEffect(() => {
    const storedWishlist = localStorage.getItem(wishlistKey);
    if (storedWishlist) {
      try {
        const parsedWishlist = JSON.parse(storedWishlist);
        setWishlist(parsedWishlist);
      } catch (error) {
        console.error('Error parsing stored wishlist:', error);
        localStorage.removeItem(wishlistKey);
      }
    }
  }, [wishlistKey]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
  }, [wishlist, wishlistKey]);

  const getSampleProducts = (): Product[] => {
    try {
      return JSON.parse(localStorage.getItem('furnicraft_products') || '[]');
    } catch (error) {
      console.error('Error parsing sample products:', error);
      return [];
    }
  };

  const addToWishlist = async (productId: string): Promise<void> => {
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

      // Check if already in wishlist
      if (wishlist.some(item => item.productId === productId)) {
        toast.info('Product is already in your wishlist');
        return;
      }

      const newWishlistItem: WishlistItem = {
        id: Date.now().toString(),
        userId: user?.id || guestId,
        productId,
        product,
        createdAt: new Date(),
      };

      setWishlist(prev => [...prev, newWishlistItem]);
      toast.success(`${product.name} added to wishlist!`);
      
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add item to wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => {
      const updatedWishlist = prev.filter(item => item.productId !== productId);
      const removedItem = prev.find(item => item.productId === productId);
      
      if (removedItem?.product) {
        toast.success(`${removedItem.product.name} removed from wishlist`);
      }
      
      return updatedWishlist;
    });
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some(item => item.productId === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
    toast.success('Wishlist cleared');
  };

  const getWishlistCount = (): number => {
    return wishlist.length;
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
    isLoading,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 