// NOTE: This file is for future backend integration. All axios code is commented out for now.
// import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Product, 
  Cart, 
  Order, 
  Category, 
  ProductReview,
  UserProfile,
  UserAddress,
  WishlistItem,
  DashboardStats,
  SearchResult,
  ProductFilters,
  Notification,
  Coupon,
  ApiResponse,
  PaginatedResponse,
  LoginForm,
  RegisterForm,
  CheckoutForm
} from '@/types';

// Create axios instance with base configuration
// const api: AxiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// Request interceptor to add auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Response interceptor to handle token refresh
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       
//       try {
//         const refreshToken = localStorage.getItem('refreshToken');
//         const response = await axios.post('/api/auth/refresh', {
//           refreshToken,
//         });
//         
//         const { accessToken } = response.data;
//         localStorage.setItem('accessToken', accessToken);
//         
//         originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('refreshToken');
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }
//     
//     return Promise.reject(error);
//   }
// );

// Authentication API
export const authAPI = {
  login: async (credentials: LoginForm): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> => {
    // const response = await api.post('/auth/login', credentials);
    return { success: true, data: { user: {} as User, accessToken: '', refreshToken: '' } };
  },

  register: async (userData: RegisterForm): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> => {
    // const response = await api.post('/auth/register', userData);
    return { success: true, data: { user: {} as User, accessToken: '', refreshToken: '' } };
  },

  logout: async (): Promise<ApiResponse<void>> => {
    // const response = await api.post('/auth/logout');
    return { success: true, data: undefined };
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> => {
    // const response = await api.post('/auth/refresh', { refreshToken });
    return { success: true, data: { accessToken: '' } };
  },

  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    // const response = await api.post('/auth/forgot-password', { email });
    return { success: true, data: undefined };
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse<void>> => {
    // const response = await api.post('/auth/reset-password', { token, password });
    return { success: true, data: undefined };
  },

  verifyEmail: async (token: string): Promise<ApiResponse<void>> => {
    // const response = await api.post('/auth/verify-email', { token });
    return { success: true, data: undefined };
  },
};

// User API
export const userAPI = {
  getProfile: async (): Promise<ApiResponse<User & { profile: UserProfile }>> => {
    // const response = await api.get('/users/profile');
    return { success: true, data: { ...( {} as User ), profile: {} as UserProfile } };
  },

  updateProfile: async (profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> => {
    // const response = await api.put('/users/profile', profileData);
    return { success: true, data: {} as UserProfile };
  },

  getAddresses: async (): Promise<ApiResponse<UserAddress[]>> => {
    // const response = await api.get('/users/addresses');
    return { success: true, data: [] };
  },

  addAddress: async (address: Omit<UserAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<UserAddress>> => {
    // const response = await api.post('/users/addresses', address);
    return { success: true, data: {} as UserAddress };
  },

  updateAddress: async (id: string, address: Partial<UserAddress>): Promise<ApiResponse<UserAddress>> => {
    // const response = await api.put(`/users/addresses/${id}`, address);
    return { success: true, data: {} as UserAddress };
  },

  deleteAddress: async (id: string): Promise<ApiResponse<void>> => {
    // const response = await api.delete(`/users/addresses/${id}`);
    return { success: true, data: undefined };
  },

  getOrders: async (): Promise<ApiResponse<Order[]>> => {
    // const response = await api.get('/users/orders');
    return { success: true, data: [] };
  },

  getOrder: async (id: string): Promise<ApiResponse<Order>> => {
    // const response = await api.get(`/users/orders/${id}`);
    return { success: true, data: {} as Order };
  },
};

// Product API
export const productAPI = {
  getProducts: async (filters?: ProductFilters, page = 1, limit = 12): Promise<ApiResponse<SearchResult>> => {
    // const params = new URLSearchParams();
    // if (filters) {
    //   Object.entries(filters).forEach(([key, value]) => {
    //     if (value !== undefined && value !== null) {
    //       if (typeof value === 'object') {
    //         params.append(key, JSON.stringify(value));
    //       } else {
    //         params.append(key, String(value));
    //       }
    //     }
    //   });
    // }
    // params.append('page', String(page));
    // params.append('limit', String(limit));
    // 
    // const response = await api.get(`/products?${params.toString()}`);
    return { success: true, data: {} as SearchResult };
  },

  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    // const response = await api.get(`/products/${id}`);
    return { success: true, data: {} as Product };
  },

  getProductBySlug: async (slug: string): Promise<ApiResponse<Product>> => {
    // const response = await api.get(`/products/slug/${slug}`);
    return { success: true, data: {} as Product };
  },

  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    // const response = await api.get('/products/categories');
    return { success: true, data: [] };
  },

  getProductReviews: async (productId: string, page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<ProductReview>>> => {
    // const response = await api.get(`/products/${productId}/reviews?page=${page}&limit=${limit}`);
    return { success: true, data: {} as PaginatedResponse<ProductReview> };
  },

  addProductReview: async (productId: string, review: Omit<ProductReview, 'id' | 'productId' | 'userId' | 'isVerified' | 'isApproved' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ProductReview>> => {
    // const response = await api.post(`/products/${productId}/reviews`, review);
    return { success: true, data: {} as ProductReview };
  },

  searchProducts: async (query: string, filters?: ProductFilters, page = 1, limit = 12): Promise<ApiResponse<SearchResult>> => {
    // const params = new URLSearchParams({ query, page: String(page), limit: String(limit) });
    // if (filters) {
    //   Object.entries(filters).forEach(([key, value]) => {
    //     if (value !== undefined && value !== null) {
    //       if (typeof value === 'object') {
    //         params.append(key, JSON.stringify(value));
    //       } else {
    //         params.append(key, String(value));
    //       }
    //     }
    //   });
    // }
    // 
    // const response = await api.get(`/products/search?${params.toString()}`);
    return { success: true, data: {} as SearchResult };
  },
};

// Cart API
export const cartAPI = {
  getCart: async (): Promise<ApiResponse<Cart>> => {
    // const response = await api.get('/cart');
    return { success: true, data: {} as Cart };
  },

  addToCart: async (productId: string, quantity: number): Promise<ApiResponse<Cart>> => {
    // const response = await api.post('/cart/items', { productId, quantity });
    return { success: true, data: {} as Cart };
  },

  updateCartItem: async (itemId: string, quantity: number): Promise<ApiResponse<Cart>> => {
    // const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return { success: true, data: {} as Cart };
  },

  removeFromCart: async (itemId: string): Promise<ApiResponse<Cart>> => {
    // const response = await api.delete(`/cart/items/${itemId}`);
    return { success: true, data: {} as Cart };
  },

  clearCart: async (): Promise<ApiResponse<void>> => {
    // const response = await api.delete('/cart/clear');
    return { success: true, data: undefined };
  },
};

// Order API
export const orderAPI = {
  createOrder: async (orderData: CheckoutForm): Promise<ApiResponse<Order>> => {
    // const response = await api.post('/orders', orderData);
    return { success: true, data: {} as Order };
  },

  getOrders: async (page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    // const response = await api.get(`/orders?page=${page}&limit=${limit}`);
    return { success: true, data: {} as PaginatedResponse<Order> };
  },

  getOrder: async (id: string): Promise<ApiResponse<Order>> => {
    // const response = await api.get(`/orders/${id}`);
    return { success: true, data: {} as Order };
  },

  cancelOrder: async (id: string, reason?: string): Promise<ApiResponse<Order>> => {
    // const response = await api.put(`/orders/${id}/cancel`, { reason });
    return { success: true, data: {} as Order };
  },

  requestReturn: async (id: string, reason: string, items: string[]): Promise<ApiResponse<Order>> => {
    // const response = await api.post(`/orders/${id}/return`, { reason, items });
    return { success: true, data: {} as Order };
  },
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: async (): Promise<ApiResponse<WishlistItem[]>> => {
    // const response = await api.get('/wishlist');
    return { success: true, data: [] };
  },

  addToWishlist: async (productId: string): Promise<ApiResponse<WishlistItem>> => {
    // const response = await api.post('/wishlist', { productId });
    return { success: true, data: {} as WishlistItem };
  },

  removeFromWishlist: async (productId: string): Promise<ApiResponse<void>> => {
    // const response = await api.delete(`/wishlist/${productId}`);
    return { success: true, data: undefined };
  },
};

// Notification API
export const notificationAPI = {
  getNotifications: async (page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Notification>>> => {
    // const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return { success: true, data: {} as PaginatedResponse<Notification> };
  },

  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    // const response = await api.put(`/notifications/${id}/read`);
    return { success: true, data: {} as Notification };
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    // const response = await api.put('/notifications/read-all');
    return { success: true, data: undefined };
  },

  deleteNotification: async (id: string): Promise<ApiResponse<void>> => {
    // const response = await api.delete(`/notifications/${id}`);
    return { success: true, data: undefined };
  },
};

// Coupon API
export const couponAPI = {
  validateCoupon: async (code: string): Promise<ApiResponse<Coupon>> => {
    // const response = await api.post('/coupons/validate', { code });
    return { success: true, data: {} as Coupon };
  },
};

// Admin API
export const adminAPI = {
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    // const response = await api.get('/admin/dashboard/stats');
    return { success: true, data: {} as DashboardStats };
  },

  getUsers: async (page = 1, limit = 20, filters?: any): Promise<ApiResponse<PaginatedResponse<User>>> => {
    // const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    // if (filters) {
    //   Object.entries(filters).forEach(([key, value]) => {
    //     if (value !== undefined && value !== null) {
    //       params.append(key, String(value));
    //     }
    //   });
    // }
    // 
    // const response = await api.get(`/admin/users?${params.toString()}`);
    return { success: true, data: {} as PaginatedResponse<User> };
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    // const response = await api.put(`/admin/users/${id}`, userData);
    return { success: true, data: {} as User };
  },

  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    // const response = await api.delete(`/admin/users/${id}`);
    return { success: true, data: undefined };
  },

  getAdminOrders: async (page = 1, limit = 20, filters?: any): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    // const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    // if (filters) {
    //   Object.entries(filters).forEach(([key, value]) => {
    //     if (value !== undefined && value !== null) {
    //       params.append(key, String(value));
    //     }
    //   });
    // }
    // 
    // const response = await api.get(`/admin/orders?${params.toString()}`);
    return { success: true, data: {} as PaginatedResponse<Order> };
  },

  updateOrderStatus: async (id: string, status: string, notes?: string): Promise<ApiResponse<Order>> => {
    // const response = await api.put(`/admin/orders/${id}/status`, { status, notes });
    return { success: true, data: {} as Order };
  },

  createProduct: async (productData: FormData): Promise<ApiResponse<Product>> => {
    // const response = await api.post('/admin/products', productData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    // });
    return { success: true, data: {} as Product };
  },

  updateProduct: async (id: string, productData: FormData): Promise<ApiResponse<Product>> => {
    // const response = await api.put(`/admin/products/${id}`, productData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    // });
    return { success: true, data: {} as Product };
  },

  deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
    // const response = await api.delete(`/admin/products/${id}`);
    return { success: true, data: undefined };
  },

  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    // const response = await api.get('/admin/categories');
    return { success: true, data: [] };
  },

  createCategory: async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Category>> => {
    // const response = await api.post('/admin/categories', categoryData);
    return { success: true, data: {} as Category };
  },

  updateCategory: async (id: string, categoryData: Partial<Category>): Promise<ApiResponse<Category>> => {
    // const response = await api.put(`/admin/categories/${id}`, categoryData);
    return { success: true, data: {} as Category };
  },

  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    // const response = await api.delete(`/admin/categories/${id}`);
    return { success: true, data: undefined };
  },
};

// export default api; 