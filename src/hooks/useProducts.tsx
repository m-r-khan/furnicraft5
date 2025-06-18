import { useState, useCallback } from 'react';
import { Product, Category, ProductFilters, SearchResult, ProductReview } from '../types';
import { productAPI } from '../lib/api';
import { useToast } from './use-toast';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const { toast } = useToast();

  const fetchProducts = useCallback(async (filters?: ProductFilters, page = 1, limit = 12) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For now, use sample data since we don't have a backend
      const sampleProducts = JSON.parse(localStorage.getItem('furnicraft_products') || '[]');
      const sampleCategories = JSON.parse(localStorage.getItem('furnicraft_categories') || '[]');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProducts(sampleProducts);
      setCategories(sampleCategories);
      setSearchResult({
        products: sampleProducts,
        total: sampleProducts.length,
        page: 1,
        limit: sampleProducts.length,
        filters: filters || {}
      });
      
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || 'An error occurred while fetching products');
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    try {
      // For now, use sample data since we don't have a backend
      const sampleCategories = JSON.parse(localStorage.getItem('furnicraft_categories') || '[]');
      setCategories(sampleCategories);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  }, [toast]);

  const searchProducts = useCallback(async (query: string, filters?: ProductFilters, page = 1, limit = 12) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For now, use sample data and filter locally
      const sampleProducts = JSON.parse(localStorage.getItem('furnicraft_products') || '[]');
      const filteredProducts = sampleProducts.filter((product: Product) => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProducts(filteredProducts);
      setSearchResult({
        products: filteredProducts,
        total: filteredProducts.length,
        page: 1,
        limit: filteredProducts.length,
        filters: filters || {}
      });
      
    } catch (error: any) {
      console.error('Error searching products:', error);
      setError(error.response?.data?.message || 'An error occurred during search');
      toast({
        title: "Search Error",
        description: "Failed to search products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchProduct = useCallback(async (id: string): Promise<Product | null> => {
    try {
      // For now, use sample data
      const sampleProducts = JSON.parse(localStorage.getItem('furnicraft_products') || '[]');
      const product = sampleProducts.find((p: Product) => p.id === id);
      return product || null;
    } catch (error: any) {
      console.error('Error fetching product:', error);
      setError(error.response?.data?.message || 'An error occurred while fetching product');
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const fetchProductBySlug = useCallback(async (slug: string): Promise<Product | null> => {
    try {
      // For now, use sample data
      const sampleProducts = JSON.parse(localStorage.getItem('furnicraft_products') || '[]');
      const product = sampleProducts.find((p: Product) => p.slug === slug);
      return product || null;
    } catch (error: any) {
      console.error('Error fetching product by slug:', error);
      setError(error.response?.data?.message || 'An error occurred while fetching product');
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const fetchProductReviews = useCallback(async (productId: string, page = 1, limit = 10) => {
    try {
      // For now, return empty reviews
      return [];
    } catch (error: any) {
      console.error('Error fetching product reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load product reviews",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const addProductReview = useCallback(async (
    productId: string, 
    review: Omit<ProductReview, 'id' | 'productId' | 'userId' | 'isVerified' | 'isApproved' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      // For now, just show success message
      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully",
      });
      return {} as ProductReview;
    } catch (error: any) {
      console.error('Error adding product review:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const getFeaturedProducts = useCallback(() => {
    return products.filter(product => product.isFeatured);
  }, [products]);

  const getProductsByCategory = useCallback((categoryId: string) => {
    return products.filter(product => product.categoryId === categoryId);
  }, [products]);

  const getProductsInStock = useCallback(() => {
    return products.filter(product => product.stockQuantity > 0);
  }, [products]);

  const getProductsByPriceRange = useCallback((min: number, max: number) => {
    return products.filter(product => product.price >= min && product.price <= max);
  }, [products]);

  const sortProducts = useCallback((products: Product[], sortBy: 'name' | 'price' | 'rating' | 'createdAt', sortOrder: 'asc' | 'desc' = 'asc') => {
    return [...products].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, []);

  return {
    products,
    categories,
    isLoading,
    error,
    searchResult,
    fetchProducts,
    fetchCategories,
    searchProducts,
    fetchProduct,
    fetchProductBySlug,
    fetchProductReviews,
    addProductReview,
    getFeaturedProducts,
    getProductsByCategory,
    getProductsInStock,
    getProductsByPriceRange,
    sortProducts,
  };
};
