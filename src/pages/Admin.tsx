import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import { toast } from 'sonner';
import { resetSampleData } from '../utils/initializeData';
import { 
  getAllOrders, 
  getOrderStatistics, 
  updateOrderStatus, 
  getOrderStatusHistory,
  getNextPossibleStatuses,
  isValidStatusTransition,
  searchOrders,
  ExtendedOrder,
  getUserOrderHistory,
  formatDate,
  updateProductStock,
  getCurrentStockLevels,
  restoreStockForOrder,
  debugProductStock,
  getRevenueAnalytics,
  getSalesPerformance
} from '../utils/orderUtils';
import { 
  getAllReturnRequests, 
  getReturnStatistics, 
  approveReturnRequest, 
  rejectReturnRequest,
  scheduleReturnPickup,
  markReturnPickedUp,
  markReturnReceived,
  processReturnRefund,
  getReturnStatusText,
  getReturnStatusColor,
  getReturnReasonText
} from '../utils/returnUtils';
import { 
  getAllPromoCodes, 
  createPromoCode, 
  updatePromoCode, 
  deletePromoCode, 
  getPromoCodeStats,
  searchPromoCodes,
  filterPromoCodes,
  resetPromoCodes
} from '../utils/promoUtils';
import { ensurePurchaseCosts } from '../utils/initializeData';
import { ReturnRequest, OrderStatus, Coupon } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  ArrowUp, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  TrendingUp,
  Calendar,
  ArrowDown,
  Search,
  Filter,
  MoreVertical,
  BarChart3,
  PieChart,
  Activity,
  X,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  Check,
  XCircle,
  PackageCheck,
  TruckIcon,
  Home,
  RotateCcw,
  CreditCard,
  Tag,
  Warehouse
} from 'lucide-react';
import { Calendar as CalendarComponent } from '../components/ui/calender';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { clearAllOrderData, hasExistingOrders, getOrderKeys } from '../utils/clearOrderData';

const Admin = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { products, categories, fetchProducts, fetchCategories } = useProducts();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentSales: [] as any[],
    returnRequests: 0,
    totalReturns: 0,
    refundedAmount: 0
  });

  // Revenue analytics
  const [revenueAnalytics, setRevenueAnalytics] = useState({
    totalRevenue: 0,
    taxCollected: 0,
    netRevenue: 0,
    inventoryCost: 0,
    grossProfit: 0,
    profitMargin: 0,
    averageOrderValue: 0,
    recentRevenue: 0,
    recentSales: 0,
    revenueByCategory: {} as { [key: string]: number },
    mostSellingItems: [] as any[],
    mostViewedItems: [] as any[],
    monthlyTrends: [] as any[],
    returnRate: 0,
    refundAmount: 0,
    totalOrders: 0,
    returnedOrders: 0,
    currentInventoryValue: 0
  });

  // Sales performance
  const [salesPerformance, setSalesPerformance] = useState({
    today: { revenue: 0, orders: 0 },
    week: { revenue: 0, orders: 0 },
    month: { revenue: 0, orders: 0 }
  });

  // Orders management
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ExtendedOrder[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [orderDateFrom, setOrderDateFrom] = useState<Date | null>(null);
  const [orderDateTo, setOrderDateTo] = useState<Date | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showOrderStatusModal, setShowOrderStatusModal] = useState(false);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus | ''>('');
  const [orderStatusNotes, setOrderStatusNotes] = useState('');
  const [orderStatusHistory, setOrderStatusHistory] = useState<any[]>([]);

  // Users management
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [selectedUserOrder, setSelectedUserOrder] = useState<any>(null);
  const [showUserOrderDetail, setShowUserOrderDetail] = useState(false);

  // Product management
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    price: '',
    originalPrice: '',
    purchaseCost: '',
    categoryId: '',
    stockQuantity: '',
    isFeatured: false,
    specifications: {
      name: '',
      value: '',
      dimensions: '',
      dimensionsValue: '',
      weight: '',
      weightValue: ''
    },
    image: '',
    images: [] as string[],
    newImageUrl: '',
  });

  // Modals
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [dashboardModalType, setDashboardModalType] = useState<string>('');
  const [dashboardModalData, setDashboardModalData] = useState<any>(null);

  // Return management
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [selectedReturnRequest, setSelectedReturnRequest] = useState<ReturnRequest | null>(null);
  const [showReturnDetail, setShowReturnDetail] = useState(false);
  const [returnStatusFilter, setReturnStatusFilter] = useState<string>('all');
  const [returnSearchQuery, setReturnSearchQuery] = useState('');
  const [showReturnActionModal, setShowReturnActionModal] = useState(false);
  const [returnActionType, setReturnActionType] = useState<'approve' | 'reject' | 'schedule_pickup' | 'mark_picked_up' | 'mark_received' | 'process_refund'>('approve');
  const [returnActionNotes, setReturnActionNotes] = useState('');
  const [returnRejectionReason, setReturnRejectionReason] = useState('');
  const [returnPickupDate, setReturnPickupDate] = useState('');
  const [returnRefundMethod, setReturnRefundMethod] = useState<'original_payment' | 'store_credit' | 'bank_transfer'>('original_payment');

  // Users filtering
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userDateFrom, setUserDateFrom] = useState<Date | null>(null);
  const [userDateTo, setUserDateTo] = useState<Date | null>(null);

  // Products filtering
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productPriceFrom, setProductPriceFrom] = useState<string>('');
  const [productPriceTo, setProductPriceTo] = useState<string>('');
  const [productStockFilter, setProductStockFilter] = useState<string>('all');
  const [productFeaturedFilter, setProductFeaturedFilter] = useState<string>('all');

  // Promo code management
  const [promoCodes, setPromoCodes] = useState<Coupon[]>([]);
  const [filteredPromoCodes, setFilteredPromoCodes] = useState<Coupon[]>([]);
  const [selectedPromoCode, setSelectedPromoCode] = useState<Coupon | null>(null);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<Coupon | null>(null);
  const [promoFormData, setPromoFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    isActive: true,
    validFrom: '',
    validUntil: '',
    applicableCategories: [] as string[],
    applicableProducts: [] as string[]
  });
  const [promoSearchQuery, setPromoSearchQuery] = useState('');
  const [promoStatusFilter, setPromoStatusFilter] = useState<string>('all');
  const [promoTypeFilter, setPromoTypeFilter] = useState<string>('all');
  const [showPromoDetail, setShowPromoDetail] = useState(false);

  // Load admin data
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        // Wait for authentication to finish loading before checking user state
        if (authLoading) return;
        
        if (!user || user.role !== 'admin') {
          navigate('/');
          toast.error('Access denied. Admin privileges required.');
          return;
        }

        setIsLoading(true);
        setError(null);
        
        // Add a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          if (isLoading) {
            console.warn('Admin data loading taking too long, forcing completion');
            setIsLoading(false);
          }
        }, 5000); // 5 second timeout
        
        console.log('Loading admin data from localStorage...');
        
        // Load data in parallel for better performance
        const [allOrders, orderStats, allReturnRequests, allPromoCodes] = await Promise.all([
          Promise.resolve(getAllOrders()),
          Promise.resolve(getOrderStatistics()),
          Promise.resolve(getAllReturnRequests()),
          Promise.resolve(getAllPromoCodes())
        ]);
        
        // Load products and categories in parallel
        await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);
        
        console.log(`Loaded ${allOrders.length} orders from all users`);
        console.log(`Loaded ${allReturnRequests.length} return requests`);
        console.log(`Loaded ${allPromoCodes.length} promo codes`);
        
        // Debug: Log order details to see customer names
        if (allOrders.length > 0) {
          console.log('Order details:');
          allOrders.forEach((order, index) => {
            console.log(`Order ${index + 1}:`, {
              orderNumber: order.orderNumber,
              customerName: order.customer?.name,
              customerEmail: order.customer?.email,
              total: order.total,
              status: order.status
            });
          });
        } else {
          console.log('No orders found in localStorage');
        }
        
        setOrders(allOrders);
        setFilteredOrders(allOrders);
        setReturnRequests(allReturnRequests);
        setPromoCodes(allPromoCodes);
        setFilteredPromoCodes(allPromoCodes);
        
        // Get return statistics
        const returnStats = getReturnStatistics();
        
        // Get promo code statistics
        const promoStats = getPromoCodeStats();
        
        // Set real stats from order data
        setStats({
          totalRevenue: orderStats.totalRevenue,
          totalOrders: orderStats.total,
          totalProducts: products.length,
          totalUsers: 23, // This will be updated when we load users
          recentSales: allOrders.slice(0, 5).map(order => ({
            id: order.id,
            amount: order.total,
            date: formatDate(order.createdAt)
          })),
          returnRequests: returnStats.pendingApproval,
          totalReturns: returnStats.total,
          refundedAmount: returnStats.totalRefundAmount
        });

        // Load all users from authentication system (admin, test, and real users)
        const getAllAuthUsers = () => {
          // Default admin and test users
          const defaultUsers = [
            {
              id: '1',
              email: 'admin@furnicraft.com',
              role: 'admin',
              isEmailVerified: true,
              isActive: true,
              failedLoginAttempts: 0,
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            },
            {
              id: '2',
              email: 'user@test.com',
              role: 'customer',
              isEmailVerified: true,
              isActive: true,
              failedLoginAttempts: 0,
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            },
          ];

          // Default admin and test profiles
          const defaultProfiles = [
            {
              id: '1',
              userId: '1',
              firstName: 'Admin',
              lastName: 'User',
              preferences: {
                newsletter: true,
                marketingEmails: false,
                notifications: true,
              },
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            },
            {
              id: '2',
              userId: '2',
              firstName: 'Test',
              lastName: 'User',
              preferences: {
                newsletter: true,
                marketingEmails: false,
                notifications: true,
              },
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            },
          ];

          // Get dynamic users from localStorage
          const storedDynamicUsers = localStorage.getItem('furnicraft_dynamic_users');
          const storedDynamicProfiles = localStorage.getItem('furnicraft_dynamic_profiles');
          
          let dynamicUsers: any[] = [];
          let dynamicProfiles: any[] = [];
          
          if (storedDynamicUsers) {
            try {
              dynamicUsers = JSON.parse(storedDynamicUsers);
            } catch (error) {
              console.error('Error parsing dynamic users:', error);
            }
          }
          
          if (storedDynamicProfiles) {
            try {
              dynamicProfiles = JSON.parse(storedDynamicProfiles);
            } catch (error) {
              console.error('Error parsing dynamic profiles:', error);
            }
          }
          
          // Combine default and dynamic users and profiles
          const allAuthUsers = [...defaultUsers, ...dynamicUsers];
          const allAuthProfiles = [...defaultProfiles, ...dynamicProfiles];
          
          return { allAuthUsers, allAuthProfiles };
        };

        // Get all registered users
        const { allAuthUsers, allAuthProfiles } = getAllAuthUsers();
        
        // Create users from actual orders (for order statistics)
        const orderUsers = new Map();
        allOrders.forEach(order => {
          if (order.customer && order.customer.email) {
            const [firstName, ...lastNameParts] = (order.customer.name || 'Unknown Customer').split(' ');
            const lastName = lastNameParts.join(' ') || '';
            
            orderUsers.set(order.customer.email, {
              id: order.customer.email,
              firstName: firstName,
              lastName: lastName,
              email: order.customer.email,
              role: 'customer',
              createdAt: order.createdAt,
              phone: order.customer.phone || '+91 98765 43210',
              totalOrders: 0,
              totalSpent: 0,
              lastOrder: null
            });
          }
        });

        // Calculate order statistics for each user
        allOrders.forEach(order => {
          if (order.customer && order.customer.email) {
            const user = orderUsers.get(order.customer.email);
            if (user) {
              user.totalOrders += 1;
              user.totalSpent += order.total || 0;
              if (!user.lastOrder || new Date(order.createdAt) > new Date(user.lastOrder)) {
                user.lastOrder = order.createdAt;
              }
            }
          }
        });

        // Combine all users: auth users + order users (with order statistics)
        const allUsersMap = new Map();
        
        // Add all registered users first
        allAuthUsers.forEach(authUser => {
          const profile = allAuthProfiles.find(p => p.userId === authUser.id);
          const orderUser = orderUsers.get(authUser.email);
          
          allUsersMap.set(authUser.email, {
            id: authUser.id,
            firstName: profile?.firstName || 'Unknown',
            lastName: profile?.lastName || 'User',
            email: authUser.email,
            role: authUser.role,
            createdAt: authUser.createdAt,
            phone: orderUser?.phone || '+91 98765 43210',
            totalOrders: orderUser?.totalOrders || 0,
            totalSpent: orderUser?.totalSpent || 0,
            lastOrder: orderUser?.lastOrder || null,
            isEmailVerified: authUser.isEmailVerified,
            isActive: authUser.isActive
          });
        });
        
        // Add any order users that don't have auth accounts (guest orders)
        orderUsers.forEach((orderUser, email) => {
          if (!allUsersMap.has(email)) {
            allUsersMap.set(email, orderUser);
          }
        });
        
        const allUsers = Array.from(allUsersMap.values());
        
        console.log(`Auth users: ${allAuthUsers.length}`);
        console.log(`Order users: ${orderUsers.size}`);
        console.log(`Total combined users: ${allUsers.length}`);
        
        setUsers(allUsers);
        
        // Update total users count
        setStats(prev => ({ ...prev, totalUsers: allUsers.length }));
        
        // Load revenue analytics
        const revenueData = getRevenueAnalytics();
        const salesData = getSalesPerformance();
        
        setRevenueAnalytics(revenueData);
        setSalesPerformance(salesData);
        
        console.log('Revenue analytics loaded:', revenueData);
        console.log('Sales performance loaded:', salesData);
        
        console.log(`Final users: ${allUsers.length}`);
        console.log('All users:', allUsers.map(u => ({ 
          email: u.email, 
          role: u.role, 
          totalOrders: u.totalOrders,
          totalSpent: u.totalSpent 
        })));
        
        clearTimeout(timeoutId);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading admin data:', error);
        setError('Failed to load admin data');
        setIsLoading(false);
        toast.error('Failed to load admin data');
      }
    };

    loadAdminData();
  }, [user, navigate, fetchProducts, fetchCategories, products.length, authLoading]);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        id: editingProduct ? editingProduct.id : Date.now().toString(),
        name: formData.name,
        shortDescription: formData.shortDescription,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        purchaseCost: formData.purchaseCost ? parseFloat(formData.purchaseCost) : 0,
        categoryId: formData.categoryId,
        stockQuantity: parseInt(formData.stockQuantity),
        isFeatured: formData.isFeatured,
        specifications: formData.specifications,
        image: formData.image,
        images: formData.images || [],
        slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        // Analytics tracking fields
        viewCount: editingProduct ? (editingProduct.viewCount || 0) : 0,
        cartAdditions: editingProduct ? (editingProduct.cartAdditions || 0) : 0,
        wishlistAdditions: editingProduct ? (editingProduct.wishlistAdditions || 0) : 0,
        purchaseCount: editingProduct ? (editingProduct.purchaseCount || 0) : 0,
        createdAt: editingProduct ? editingProduct.createdAt : new Date(),
        updatedAt: new Date(),
      };

      // Get existing products from localStorage
      const existingProducts = JSON.parse(localStorage.getItem('furnicraft_products') || '[]');

      if (editingProduct) {
        // Update existing product
        const updatedProducts = existingProducts.map((product: any) => 
          product.id === editingProduct.id ? { ...product, ...productData } : product
        );
        localStorage.setItem('furnicraft_products', JSON.stringify(updatedProducts));
        toast.success('Product updated successfully!');
      } else {
        // Create new product
        const newProducts = [...existingProducts, productData];
        localStorage.setItem('furnicraft_products', JSON.stringify(newProducts));
        toast.success('Product created successfully!');
      }
      
      setShowProductForm(false);
      setEditingProduct(null);
      resetForm();
      await fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleProductEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      shortDescription: product.shortDescription || '',
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      purchaseCost: product.purchaseCost?.toString() || '',
      categoryId: product.categoryId || '',
      stockQuantity: product.stockQuantity.toString(),
      isFeatured: product.isFeatured || false,
      specifications: {
        name: product.specifications?.name || '',
        value: product.specifications?.value || '',
        dimensions: product.specifications?.dimensions || '',
        dimensionsValue: product.specifications?.dimensionsValue || '',
        weight: product.specifications?.weight || '',
        weightValue: product.specifications?.weightValue || ''
      },
      image: product.image || '',
      images: product.images || [product.image || ''].filter(Boolean),
      newImageUrl: '',
    });
    setShowProductForm(true);
    
    // Auto-scroll to the form after a short delay
    setTimeout(() => {
      const formElement = document.querySelector('[data-product-form]');
      if (formElement) {
        formElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const handleProductDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Get existing products from localStorage
        const existingProducts = JSON.parse(localStorage.getItem('furnicraft_products') || '[]');
        
        // Remove the product
        const updatedProducts = existingProducts.filter((product: any) => product.id !== productId);
        localStorage.setItem('furnicraft_products', JSON.stringify(updatedProducts));
        
        toast.success('Product deleted successfully!');
        await fetchProducts();
      } catch (error: any) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleResetData = async () => {
    try {
      console.log('Current order keys before reset:', getOrderKeys());
      
      // Clear all order data
      const cleared = clearAllOrderData();
      
      if (cleared) {
        toast.success('All order data has been cleared. Only real orders will be displayed.');
        console.log('Order data cleared successfully');
      } else {
        toast.error('Failed to clear order data');
        return;
      }
      
      // Reload the page to refresh the admin dashboard
      window.location.reload();
    } catch (error) {
      console.error('Error resetting data:', error);
      toast.error('Failed to reset data');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      shortDescription: '',
      description: '',
      price: '',
      originalPrice: '',
      purchaseCost: '',
      categoryId: '',
      stockQuantity: '',
      isFeatured: false,
      specifications: {
        name: '',
        value: '',
        dimensions: '',
        dimensionsValue: '',
        weight: '',
        weightValue: ''
      },
      image: '',
      images: [],
      newImageUrl: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-orange-100 text-orange-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <Check className="h-4 w-4" />;
      case 'processing': return <PackageCheck className="h-4 w-4" />;
      case 'shipped': return <TruckIcon className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'returned': return <RotateCcw className="h-4 w-4" />;
      case 'refunded': return <CreditCard className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const handleOrderSearch = (query: string) => {
    setOrderSearchQuery(query);
    if (query.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const searchResults = searchOrders(query);
      setFilteredOrders(searchResults);
    }
  };

  const handleOrderStatusFilter = (status: string) => {
    setOrderStatusFilter(status);
    if (status === 'all') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => order.status === status);
      setFilteredOrders(filtered);
    }
  };

  const handleOrderClick = (order: ExtendedOrder) => {
    try {
      console.log('handleOrderClick called with order:', order);
      setSelectedOrder(order);
      setShowOrderDetail(true);
      console.log('Modal should now be open');
    } catch (error) {
      console.error('Error in handleOrderClick:', error);
      toast.error('Error opening order details');
    }
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !newOrderStatus || !user) return;

    try {
      const success = updateOrderStatus(
        selectedOrder.id,
        newOrderStatus,
        user,
        orderStatusNotes
      );

      if (success) {
        toast.success(`Order status updated to ${newOrderStatus}`);
        
        // Reload orders
        const updatedOrders = getAllOrders();
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
        
        // Update selected order
        const updatedOrder = updatedOrders.find(o => o.id === selectedOrder.id);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
        
        setShowOrderStatusModal(false);
        setNewOrderStatus('');
        setOrderStatusNotes('');
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const openOrderStatusModal = (order: ExtendedOrder) => {
    try {
      console.log('openOrderStatusModal called with order:', order);
      setSelectedOrder(order);
      setNewOrderStatus('');
      setOrderStatusNotes('');
      setOrderStatusHistory(getOrderStatusHistory(order.id));
      setShowOrderStatusModal(true);
      console.log('Status modal should now be open');
    } catch (error) {
      console.error('Error in openOrderStatusModal:', error);
      toast.error('Error opening status update modal');
    }
  };

  const handleUserClick = (user: any) => {
    try {
      console.log('handleUserClick called with user:', user);
      setSelectedUser(user);
      
      // Load user's order history for detailed view
      const userOrderHistory = getUserOrderHistory(user.email);
      setUserOrders(userOrderHistory);
      
      setShowUserDetail(true);
      console.log('User detail modal should now be open');
    } catch (error) {
      console.error('Error in handleUserClick:', error);
      toast.error('Error opening user details');
    }
  };

  // Promo code handlers
  const handlePromoCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPromoCode) {
        // Update existing promo code
        const updatedPromo = updatePromoCode(editingPromoCode.id, {
          code: promoFormData.code,
          type: promoFormData.type,
          value: parseFloat(promoFormData.value),
          minOrderAmount: promoFormData.minOrderAmount ? parseFloat(promoFormData.minOrderAmount) : undefined,
          maxDiscount: promoFormData.maxDiscount ? parseFloat(promoFormData.maxDiscount) : undefined,
          usageLimit: parseInt(promoFormData.usageLimit),
          isActive: promoFormData.isActive,
          validFrom: new Date(promoFormData.validFrom),
          validUntil: new Date(promoFormData.validUntil),
          applicableCategories: promoFormData.applicableCategories,
          applicableProducts: promoFormData.applicableProducts
        });
        
        if (updatedPromo) {
          toast.success('Promo code updated successfully');
          const updatedPromoCodes = getAllPromoCodes();
          setPromoCodes(updatedPromoCodes);
          setFilteredPromoCodes(updatedPromoCodes);
        }
      } else {
        // Create new promo code
        const newPromo = createPromoCode({
          code: promoFormData.code,
          type: promoFormData.type,
          value: parseFloat(promoFormData.value),
          minOrderAmount: promoFormData.minOrderAmount ? parseFloat(promoFormData.minOrderAmount) : undefined,
          maxDiscount: promoFormData.maxDiscount ? parseFloat(promoFormData.maxDiscount) : undefined,
          usageLimit: parseInt(promoFormData.usageLimit),
          isActive: promoFormData.isActive,
          validFrom: new Date(promoFormData.validFrom),
          validUntil: new Date(promoFormData.validUntil),
          applicableCategories: promoFormData.applicableCategories,
          applicableProducts: promoFormData.applicableProducts
        });
        
        toast.success('Promo code created successfully');
        const updatedPromoCodes = getAllPromoCodes();
        setPromoCodes(updatedPromoCodes);
        setFilteredPromoCodes(updatedPromoCodes);
      }
      
      setShowPromoForm(false);
      setEditingPromoCode(null);
      resetPromoForm();
    } catch (error) {
      console.error('Error saving promo code:', error);
      toast.error('Failed to save promo code');
    }
  };

  const handlePromoCodeEdit = (promoCode: Coupon) => {
    setEditingPromoCode(promoCode);
    setPromoFormData({
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value.toString(),
      minOrderAmount: promoCode.minOrderAmount?.toString() || '',
      maxDiscount: promoCode.maxDiscount?.toString() || '',
      usageLimit: promoCode.usageLimit.toString(),
      isActive: promoCode.isActive,
      validFrom: new Date(promoCode.validFrom).toISOString().split('T')[0],
      validUntil: new Date(promoCode.validUntil).toISOString().split('T')[0],
      applicableCategories: promoCode.applicableCategories || [],
      applicableProducts: promoCode.applicableProducts || []
    });
    setShowPromoForm(true);
  };

  const handlePromoCodeDelete = async (promoCodeId: string) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      try {
        const success = deletePromoCode(promoCodeId);
        if (success) {
          toast.success('Promo code deleted successfully');
          const updatedPromoCodes = getAllPromoCodes();
          setPromoCodes(updatedPromoCodes);
          setFilteredPromoCodes(updatedPromoCodes);
        } else {
          toast.error('Failed to delete promo code');
        }
      } catch (error) {
        console.error('Error deleting promo code:', error);
        toast.error('Failed to delete promo code');
      }
    }
  };

  const handlePromoCodeClick = (promoCode: Coupon) => {
    setSelectedPromoCode(promoCode);
    setShowPromoDetail(true);
  };

  const resetPromoForm = () => {
    setPromoFormData({
      code: '',
      type: 'percentage',
      value: '',
      minOrderAmount: '',
      maxDiscount: '',
      usageLimit: '',
      isActive: true,
      validFrom: '',
      validUntil: '',
      applicableCategories: [],
      applicableProducts: []
    });
  };

  const handlePromoSearch = (query: string) => {
    setPromoSearchQuery(query);
    if (query.trim()) {
      const searchResults = searchPromoCodes(query);
      setFilteredPromoCodes(searchResults);
    } else {
      setFilteredPromoCodes(promoCodes);
    }
  };

  const handlePromoStatusFilter = (status: string) => {
    setPromoStatusFilter(status);
    let filtered = promoCodes;
    
    if (status !== 'all') {
      const isActive = status === 'active';
      filtered = filterPromoCodes({ isActive });
    }
    
    setFilteredPromoCodes(filtered);
  };

  const handlePromoTypeFilter = (type: string) => {
    setPromoTypeFilter(type);
    let filtered = promoCodes;
    
    if (type !== 'all') {
      filtered = filterPromoCodes({ type: type as 'percentage' | 'fixed' });
    }
    
    setFilteredPromoCodes(filtered);
  };

  const handleResetPromoCodes = () => {
    if (window.confirm('Are you sure you want to reset all promo codes to sample data?')) {
      try {
        resetPromoCodes();
        toast.success('Promo codes reset successfully!');
        // Reload promo codes
        const allPromoCodes = getAllPromoCodes();
        setPromoCodes(allPromoCodes);
        setFilteredPromoCodes(allPromoCodes);
      } catch (error: any) {
        console.error('Error resetting promo codes:', error);
        toast.error('Failed to reset promo codes');
      }
    }
  };

  // Dashboard tile click handlers
  const handleDashboardTileClick = (type: string, data?: any) => {
    setDashboardModalType(type);
    setDashboardModalData(data);
    setShowDashboardModal(true);
  };

  const getDashboardModalContent = () => {
    switch (dashboardModalType) {
      case 'totalRevenue':
        return {
          title: 'Total Revenue Details',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800">Gross Revenue</h4>
                  <p className="text-2xl font-bold text-green-600">₹{revenueAnalytics.totalRevenue?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Net Revenue</h4>
                  <p className="text-2xl font-bold text-blue-600">₹{revenueAnalytics.netRevenue?.toLocaleString() || '0'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Revenue Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Sales:</span>
                    <span className="font-medium">₹{revenueAnalytics.totalRevenue?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Collected (10%):</span>
                    <span className="font-medium">₹{revenueAnalytics.taxCollected?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Revenue:</span>
                    <span className="font-medium">₹{revenueAnalytics.netRevenue?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        };

      case 'grossProfit':
        return {
          title: 'Gross Profit Details',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800">Gross Profit</h4>
                  <p className="text-2xl font-bold text-green-600">₹{revenueAnalytics.grossProfit?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Profit Margin</h4>
                  <p className="text-2xl font-bold text-blue-600">{revenueAnalytics.profitMargin?.toFixed(1) || '0'}%</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Profit Calculation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Net Revenue:</span>
                    <span className="font-medium">₹{revenueAnalytics.netRevenue?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inventory Cost:</span>
                    <span className="font-medium">₹{revenueAnalytics.inventoryCost?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Gross Profit:</span>
                    <span className="font-bold text-green-600">₹{revenueAnalytics.grossProfit?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        };

      case 'totalOrders':
        return {
          title: 'Total Orders Details',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-indigo-800">Total Orders</h4>
                  <p className="text-2xl font-bold text-indigo-600">{revenueAnalytics.totalOrders || '0'}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800">Average Order Value</h4>
                  <p className="text-2xl font-bold text-green-600">₹{revenueAnalytics.averageOrderValue?.toLocaleString() || '0'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Recent Orders</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {orders.slice(0, 10).map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">#{order.orderNumber}</span>
                        <span className="text-sm text-gray-500 ml-2">{order.customer?.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">₹{order.total?.toLocaleString() || '0'}</span>
                        <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        };

      case 'recentSales':
        return {
          title: 'Recent Sales Details (Last 30 Days)',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800">Recent Revenue</h4>
                  <p className="text-2xl font-bold text-green-600">₹{revenueAnalytics.recentRevenue?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Recent Orders</h4>
                  <p className="text-2xl font-bold text-blue-600">{revenueAnalytics.recentSales || '0'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Sales Performance</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Today</p>
                    <p className="text-lg font-bold text-blue-600">₹{salesPerformance.today.revenue?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-gray-500">{salesPerformance.today.orders} orders</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-lg font-bold text-green-600">₹{salesPerformance.week.revenue?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-gray-500">{salesPerformance.week.orders} orders</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-lg font-bold text-purple-600">₹{salesPerformance.month.revenue?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-gray-500">{salesPerformance.month.orders} orders</p>
                  </div>
                </div>
              </div>
            </div>
          )
        };

      case 'mostSellingItems':
        return {
          title: 'Most Selling Items Details',
          content: (
            <div className="space-y-4">
              <div className="space-y-3">
                {revenueAnalytics.mostSellingItems.map((item, index) => {
                  const product = products.find((p: any) => p.id === item.productId);
                  const profit = product ? (item.revenue - (product.purchaseCost * item.quantity)) : 0;
                  return (
                    <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.quantity} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">₹{item.revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Profit: ₹{profit.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        };

      case 'mostViewedItems':
        return {
          title: 'Most Viewed Items Details',
          content: (
            <div className="space-y-4">
              <div className="space-y-3">
                {revenueAnalytics.mostViewedItems.map((item, index) => {
                  const product = products.find((p: any) => p.id === item.id);
                  const conversionRate = product && product.viewCount > 0 
                    ? ((product.purchaseCount || 0) / product.viewCount * 100).toFixed(1)
                    : '0';
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-purple-600">{item.views} views</p>
                        <p className="text-xs text-gray-500">{conversionRate}% conversion</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        };

      case 'revenueByCategory':
        return {
          title: 'Revenue by Category Details',
          content: (
            <div className="space-y-4">
              <div className="space-y-3">
                {Object.entries(revenueAnalytics.revenueByCategory)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, revenue], index) => {
                    const percentage = revenueAnalytics.totalRevenue > 0 
                      ? ((revenue / revenueAnalytics.totalRevenue) * 100).toFixed(1)
                      : '0';
                    return (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{category}</p>
                            <p className="text-xs text-gray-500">{percentage}% of total</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-orange-600">₹{revenue.toLocaleString()}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )
        };

      case 'currentInventoryValue':
        return {
          title: 'Current Inventory Value',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800">Current Inventory Value</h4>
                  <p className="text-2xl font-bold text-purple-600">₹{revenueAnalytics.currentInventoryValue?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Total Inventory Cost</h4>
                  <p className="text-2xl font-bold text-blue-600">₹{revenueAnalytics.inventoryCost?.toLocaleString() || '0'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Inventory Value Calculation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Inventory Cost:</span>
                    <span className="font-medium">₹{revenueAnalytics.inventoryCost?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Inventory Value:</span>
                    <span className="font-medium">₹{revenueAnalytics.currentInventoryValue?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Inventory Value:</span>
                    <span className="font-bold text-purple-600">₹{revenueAnalytics.currentInventoryValue?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        };

      case 'taxCollected':
        return {
          title: 'Tax Collected Details',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Tax Collected</h4>
                  <p className="text-2xl font-bold text-blue-600">₹{revenueAnalytics.taxCollected?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800">Tax Rate</h4>
                  <p className="text-2xl font-bold text-green-600">10% GST</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Tax Calculation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Sales:</span>
                    <span className="font-medium">₹{revenueAnalytics.totalRevenue?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Rate:</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Tax Collected:</span>
                    <span className="font-bold text-blue-600">₹{revenueAnalytics.taxCollected?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        };

      case 'inventoryCost':
        return {
          title: 'Inventory Cost Details',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800">Inventory Cost</h4>
                  <p className="text-2xl font-bold text-red-600">₹{revenueAnalytics.inventoryCost?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800">Cost of Goods Sold</h4>
                  <p className="text-2xl font-bold text-orange-600">₹{revenueAnalytics.inventoryCost?.toLocaleString() || '0'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Cost Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Purchase Cost:</span>
                    <span className="font-medium">₹{revenueAnalytics.inventoryCost?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Products Sold:</span>
                    <span className="font-medium">{revenueAnalytics.totalOrders || '0'} orders</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Average Cost per Order:</span>
                    <span className="font-bold text-red-600">₹{revenueAnalytics.totalOrders > 0 ? (revenueAnalytics.inventoryCost / revenueAnalytics.totalOrders).toFixed(2) : '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        };

      case 'returnRate':
        return {
          title: 'Return Rate Details',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800">Return Rate</h4>
                  <p className="text-2xl font-bold text-orange-600">{revenueAnalytics.returnRate?.toFixed(1) || '0'}%</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800">Returned Orders</h4>
                  <p className="text-2xl font-bold text-red-600">{revenueAnalytics.returnedOrders || '0'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Return Statistics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Orders:</span>
                    <span className="font-medium">{revenueAnalytics.totalOrders || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Returned Orders:</span>
                    <span className="font-medium">{revenueAnalytics.returnedOrders || '0'}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Return Rate:</span>
                    <span className="font-bold text-orange-600">{revenueAnalytics.returnRate?.toFixed(1) || '0'}%</span>
                  </div>
                </div>
              </div>
            </div>
          )
        };

      case 'refundAmount':
        return {
          title: 'Refund Amount Details',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800">Total Refunds</h4>
                  <p className="text-2xl font-bold text-red-600">₹{revenueAnalytics.refundAmount?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800">Refund Rate</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    {revenueAnalytics.totalRevenue > 0 ? ((revenueAnalytics.refundAmount / revenueAnalytics.totalRevenue) * 100).toFixed(1) : '0'}%
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Refund Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Revenue:</span>
                    <span className="font-medium">₹{revenueAnalytics.totalRevenue?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Refunds:</span>
                    <span className="font-medium">₹{revenueAnalytics.refundAmount?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Net Revenue:</span>
                    <span className="font-bold text-green-600">₹{(revenueAnalytics.totalRevenue - revenueAnalytics.refundAmount)?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        };

      default:
        return {
          title: 'Dashboard Details',
          content: <div>No data available</div>
        };
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Admin Dashboard</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Tabs Skeleton */}
          <div className="flex space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 overflow-x-hidden">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 overflow-x-hidden">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleResetData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Sample Data
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Admin Dashboard Navigation Tabs */}
          <div className="overflow-x-auto overflow-y-hidden">
            <TabsList className="admin-tabs-list">
              <TabsTrigger value="dashboard" className="admin-tabs-trigger">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="products" className="admin-tabs-trigger">
                Products
              </TabsTrigger>
              <TabsTrigger value="orders" className="admin-tabs-trigger">
                Orders
              </TabsTrigger>
              <TabsTrigger value="users" className="admin-tabs-trigger">
                Users
              </TabsTrigger>
              <TabsTrigger value="returns" className="admin-tabs-trigger">
                Returns
              </TabsTrigger>
              <TabsTrigger value="promocodes" className="admin-tabs-trigger">
                Promo Codes
              </TabsTrigger>
              <TabsTrigger value="analytics" className="admin-tabs-trigger">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="debug" className="admin-tabs-trigger">
                Debug
              </TabsTrigger>
          </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Main Dashboard Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 admin-dashboard-grid">
              {/* Total Revenue */}
              <Card 
                className="admin-dashboard-tile card-elevated glass p-3 sm:p-4 shadow-xl border border-gray-100 cursor-pointer hover:shadow-2xl transition-all duration-300 bg-white"
                onClick={() => handleDashboardTileClick('totalRevenue')}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-800">Total Revenue</h3>
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">
                    ₹{revenueAnalytics.totalRevenue?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Gross revenue</p>
                </CardContent>
              </Card>

              {/* Gross Profit */}
              <Card 
                className="admin-dashboard-tile card-elevated glass p-3 sm:p-4 shadow-xl border border-gray-100 cursor-pointer hover:shadow-2xl transition-all duration-300 bg-white"
                onClick={() => handleDashboardTileClick('grossProfit')}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-800">Gross Profit</h3>
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
        </div>
                  <p className="text-lg sm:text-2xl font-bold text-emerald-600">
                    ₹{revenueAnalytics.grossProfit?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">{revenueAnalytics.profitMargin?.toFixed(1) || '0'}% margin</p>
                </CardContent>
              </Card>

              {/* Tax Collected */}
              <Card 
                className="admin-dashboard-tile card-elevated glass p-3 sm:p-4 shadow-xl border border-gray-100 cursor-pointer hover:shadow-2xl transition-all duration-300 bg-white"
                onClick={() => handleDashboardTileClick('taxCollected')}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-800">Tax Collected</h3>
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">
                    ₹{revenueAnalytics.taxCollected?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">10% GST collected</p>
                </CardContent>
              </Card>

              {/* Inventory Cost */}
              <Card 
                className="admin-dashboard-tile card-elevated glass p-3 sm:p-4 shadow-xl border border-gray-100 cursor-pointer hover:shadow-2xl transition-all duration-300 bg-white"
                onClick={() => handleDashboardTileClick('inventoryCost')}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-800">Inventory Cost</h3>
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-red-600">
                    ₹{revenueAnalytics.inventoryCost?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Cost of goods sold</p>
                </CardContent>
              </Card>

              {/* Current Inventory Value */}
              <Card 
                className="admin-dashboard-tile card-elevated glass p-3 sm:p-4 shadow-xl border border-gray-100 cursor-pointer hover:shadow-2xl transition-all duration-300 bg-white"
                onClick={() => handleDashboardTileClick('currentInventoryValue')}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-800">Current Inventory</h3>
                    <Warehouse className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">
                    ₹{revenueAnalytics.currentInventoryValue?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Current stock value</p>
                </CardContent>
              </Card>

              {/* Return Rate */}
              <Card 
                className="admin-dashboard-tile card-elevated glass p-3 sm:p-4 shadow-xl border border-gray-100 cursor-pointer hover:shadow-2xl transition-all duration-300 bg-white"
                onClick={() => handleDashboardTileClick('returnRate')}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-800">Return Rate</h3>
                    <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-orange-600">
                    {revenueAnalytics.returnRate?.toFixed(1) || '0'}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Of total orders</p>
                </CardContent>
              </Card>

              {/* Recent Sales (30 days) */}
              <Card 
                className="admin-dashboard-tile card-elevated glass p-4 shadow-xl border border-gray-100 cursor-pointer hover:shadow-2xl transition-all duration-300 bg-white"
                onClick={() => handleDashboardTileClick('recentSales')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Sales</h3>
                    <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{revenueAnalytics.recentRevenue?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
                </CardContent>
              </Card>

              {/* Total Orders */}
              <Card 
                className="admin-dashboard-tile card-elevated glass p-4 shadow-xl border border-gray-100 cursor-pointer hover:shadow-2xl transition-all duration-300 bg-white"
                onClick={() => handleDashboardTileClick('totalOrders')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Total Orders</h3>
                    <ShoppingBag className="h-5 w-5 text-indigo-600" />
                    </div>
                  <p className="text-2xl font-bold text-indigo-600">
                    {revenueAnalytics.totalOrders || '0'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Completed orders</p>
                </CardContent>
              </Card>

              {/* Refund Amount */}
              <Card 
                className="admin-dashboard-tile card-elevated glass p-4 shadow-xl border border-gray-100 cursor-pointer hover:shadow-2xl transition-all duration-300 bg-white"
                onClick={() => handleDashboardTileClick('refundAmount')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Refund Amount</h3>
                    <CreditCard className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    ₹{revenueAnalytics.refundAmount?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Total refunds</p>
                </CardContent>
              </Card>
            </div>

            {/* Sales Performance & Revenue Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Performance */}
              <Card className="card-elevated glass shadow-xl border border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Sales Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Today</p>
                      <p className="text-xl font-bold text-blue-600">₹{salesPerformance.today.revenue?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-gray-500">{salesPerformance.today.orders} orders</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">This Week</p>
                      <p className="text-xl font-bold text-green-600">₹{salesPerformance.week.revenue?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-gray-500">{salesPerformance.week.orders} orders</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-xl font-bold text-purple-600">₹{salesPerformance.month.revenue?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-gray-500">{salesPerformance.month.orders} orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue by Category */}
              <Card 
                className="card-elevated glass shadow-xl border border-gray-100 cursor-pointer hover:shadow-2xl transition-all duration-300"
                onClick={() => handleDashboardTileClick('revenueByCategory')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Revenue by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(revenueAnalytics.revenueByCategory)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([category, revenue]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{category}</span>
                          <span className="text-sm font-bold text-gray-900">₹{revenue.toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Most Selling Items & Most Viewed Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Most Selling Items */}
              <Card 
                className="card-elevated glass shadow-xl border border-gray-100 cursor-pointer hover:shadow-2xl transition-all duration-300"
                onClick={() => handleDashboardTileClick('mostSellingItems')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Most Selling Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {revenueAnalytics.mostSellingItems.slice(0, 5).map((item, index) => (
                      <div key={item.productId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                          </div>
              <div>
                            <p className="text-sm font-medium text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.quantity} units sold</p>
                    </div>
                    </div>
                        <span className="text-sm font-bold text-green-600">₹{item.revenue.toLocaleString()}</span>
                  </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Most Viewed Items */}
              <Card 
                className="card-elevated glass shadow-xl border border-gray-100 cursor-pointer hover:shadow-2xl transition-all duration-300"
                onClick={() => handleDashboardTileClick('mostViewedItems')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Most Viewed Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {revenueAnalytics.mostViewedItems.slice(0, 5).map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                          </div>
                    <div>
                            <p className="text-sm font-medium text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    </div>
                        <span className="text-sm font-bold text-purple-600">{item.views} views</span>
                  </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cart & Wishlist Analytics */}
              <Card className="card-elevated glass shadow-xl border border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Engagement Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products
                      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                      .slice(0, 5)
                      .map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{product.name}</p>
                          <div className="flex gap-4 mt-1">
                            <span className="text-xs text-blue-600">Cart: {product.cartAdditions || 0}</span>
                            <span className="text-xs text-red-600">Wishlist: {product.wishlistAdditions || 0}</span>
                            <span className="text-xs text-green-600">Purchases: {product.purchaseCount || 0}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{product.viewCount || 0}</p>
                          <p className="text-xs text-gray-500">views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Product Performance */}
              <Card className="card-elevated glass shadow-xl border border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Product Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products
                      .map((product) => {
                        const conversionRate = product.viewCount > 0 
                          ? ((product.purchaseCount || 0) / product.viewCount * 100)
                          : 0;
                        return { ...product, conversionRate };
                      })
                      .sort((a, b) => b.conversionRate - a.conversionRate)
                      .slice(0, 5)
                      .map((product) => {
                      const conversionRate = product.viewCount > 0 
                        ? ((product.purchaseCount || 0) / product.viewCount * 100).toFixed(1)
                        : '0';
                      
                      return (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{product.name}</p>
                            <div className="flex gap-4 mt-1">
                              <span className="text-xs text-gray-600">Stock: {product.stockQuantity}</span>
                              <span className="text-xs text-emerald-600">₹{product.price?.toLocaleString()}</span>
                              <span className="text-xs text-blue-600">{conversionRate}% conversion</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">₹{product.purchaseCost?.toLocaleString() || '0'}</p>
                            <p className="text-xs text-gray-500">cost</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Revenue Trends */}
            <Card className="card-elevated glass shadow-xl border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Revenue Trends (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-4">
                  {revenueAnalytics.monthlyTrends.map((trend, index) => (
                    <div key={index} className="text-center p-3 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">{trend.month}</p>
                      <p className="text-lg font-bold text-blue-600">₹{trend.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{trend.orders} orders</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="card-elevated glass shadow-xl border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleOrderClick(order)}
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">Order #{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">{order.customer?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{order.total ? order.total.toLocaleString() : '0'}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Product Management</h2>
                <p className="text-sm sm:text-base text-gray-500 mt-1">Manage your product inventory and catalog</p>
              </div>
              <Button 
                onClick={() => setShowProductForm(true)}
                className="w-full sm:w-auto"
                size="lg"
              >
                <Plus size={18} className="mr-2" />
                Add Product
              </Button>
            </div>

            {/* Product Form */}
            {showProductForm && (
              <Card className="shadow-lg border-0 bg-white" data-product-form>
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-gray-100">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    {editingProduct ? (
                      <>
                        <Edit size={20} className="text-emerald-600" />
                        Edit Product
                      </>
                    ) : (
                      <>
                        <Plus size={20} className="text-emerald-600" />
                        Add New Product
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleProductSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">Basic Information</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700">Product Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                            className="h-11"
                            placeholder="Enter product name"
                        />
                      </div>
                      
                        <div className="space-y-2">
                          <Label htmlFor="categoryId" className="text-sm font-medium text-gray-700">Category *</Label>
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                        >
                            <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                        <div className="space-y-2">
                          <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price (₹) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          required
                          min="0"
                          step="0.01"
                            className="h-11"
                            placeholder="0.00"
                        />
                      </div>
                      
                        <div className="space-y-2">
                          <Label htmlFor="originalPrice" className="text-sm font-medium text-gray-700">Original Price (₹)</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                          min="0"
                          step="0.01"
                            className="h-11"
                            placeholder="0.00"
                        />
                      </div>
                      
                        <div className="space-y-2">
                          <Label htmlFor="purchaseCost" className="text-sm font-medium text-gray-700">Purchase Cost (₹)</Label>
                        <Input
                          id="purchaseCost"
                          type="number"
                          value={formData.purchaseCost}
                          onChange={(e) => setFormData(prev => ({ ...prev, purchaseCost: e.target.value }))}
                          min="0"
                          step="0.01"
                            className="h-11"
                            placeholder="0.00"
                        />
                      </div>
                      
                        <div className="space-y-2">
                          <Label htmlFor="stockQuantity" className="text-sm font-medium text-gray-700">Stock Quantity *</Label>
                        <Input
                          id="stockQuantity"
                          type="number"
                          value={formData.stockQuantity}
                          onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                          required
                          min="0"
                            className="h-11"
                            placeholder="0"
                        />
                        </div>
                      </div>
                    </div>
                    
                    {/* Description Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">Description</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="shortDescription" className="text-sm font-medium text-gray-700">Short Description</Label>
                      <Input
                        id="shortDescription"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                            className="h-11"
                            placeholder="Brief product description"
                      />
                    </div>
                    
                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-medium text-gray-700">Full Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        required
                            rows={4}
                            className="resize-none"
                            placeholder="Detailed product description..."
                      />
                        </div>
                      </div>
                    </div>
                    
                    {/* Image Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">Product Images</h3>
                      <div className="space-y-4">
                        {/* Main Image */}
                        <div className="space-y-2">
                          <Label htmlFor="image" className="text-sm font-medium text-gray-700">Main Image URL</Label>
                          <Input
                            id="image"
                            type="url"
                            value={formData.image}
                            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                            className="h-11"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        
                        {/* Upload Main Image */}
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Label className="text-sm font-medium text-gray-700">Upload Main Image</Label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      image: event.target?.result as string 
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="mt-2 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                            />
                          </div>
                        </div>
                        
                        {/* Multiple Images */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Additional Images</Label>
                          <div className="space-y-2">
                            {/* Add Image URL */}
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add image URL"
                                value={formData.newImageUrl || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, newImageUrl: e.target.value }))}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  if (formData.newImageUrl?.trim()) {
                                    setFormData(prev => ({
                                      ...prev,
                                      images: [...(prev.images || []), prev.newImageUrl!.trim()],
                                      newImageUrl: ''
                                    }));
                                  }
                                }}
                                className="px-4"
                              >
                                Add URL
                              </Button>
                            </div>
                            
                            {/* Upload Multiple Images */}
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  files.forEach(file => {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      setFormData(prev => ({
                                        ...prev,
                                        images: [...(prev.images || []), event.target?.result as string]
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                }}
                                className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Image Previews */}
                        {(formData.image || (formData.images && formData.images.length > 0)) && (
                          <div className="space-y-4">
                            <Label className="text-sm font-medium text-gray-700">Image Previews</Label>
                            
                            {/* Main Image Preview */}
                            {formData.image && (
                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-600">Main Image</Label>
                                <div className="relative w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-emerald-200">
                                  <img 
                                    src={formData.image} 
                                    alt="Main product preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                  <div className="hidden text-gray-400 text-center p-4">
                                    <div className="text-2xl mb-2">🪑</div>
                                    <div className="text-xs">Invalid Image</div>
                                  </div>
                                  <Badge className="absolute top-1 right-1 bg-emerald-600 text-white text-xs">Main</Badge>
                                </div>
                              </div>
                            )}
                            
                            {/* Additional Images */}
                            {formData.images && formData.images.length > 0 && (
                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-600">Additional Images ({formData.images.length})</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                  {formData.images.map((image, index) => (
                                    <div key={index} className="relative w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200">
                                      <img 
                                        src={image} 
                                        alt={`Product image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.nextElementSibling?.classList.remove('hidden');
                                        }}
                                      />
                                      <div className="hidden text-gray-400 text-center p-2">
                                        <div className="text-lg mb-1">🪑</div>
                                        <div className="text-xs">Invalid</div>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                          setFormData(prev => ({
                                            ...prev,
                                            images: prev.images?.filter((_, i) => i !== index) || []
                                          }));
                                        }}
                                        className="absolute top-1 right-1 w-6 h-6 p-0 text-xs bg-red-500 hover:bg-red-600"
                                      >
                                        ×
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Settings Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">Settings</h3>
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                          className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                      />
                        <Label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">Featured Product</Label>
                      </div>
                    </div>
                    
                    {/* Specifications Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">Specifications</h3>
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Material</Label>
                            <Input
                              placeholder="e.g., Wood, Metal, Plastic"
                              value={formData.specifications.name}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                specifications: {
                                  ...prev.specifications,
                                  name: e.target.value
                                }
                              }))}
                              className="h-10"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Material Value</Label>
                            <Input
                              placeholder="e.g., Solid Oak, Stainless Steel"
                              value={formData.specifications.value}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                specifications: {
                                  ...prev.specifications,
                                  value: e.target.value
                                }
                              }))}
                              className="h-10"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Dimensions</Label>
                            <Input
                              placeholder="e.g., Length x Width x Height"
                              value={formData.specifications.dimensions}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                specifications: {
                                  ...prev.specifications,
                                  dimensions: e.target.value
                                }
                              }))}
                              className="h-10"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Dimensions Value</Label>
                            <Input
                              placeholder="e.g., 120 x 60 x 75 cm"
                              value={formData.specifications.dimensionsValue}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                specifications: {
                                  ...prev.specifications,
                                  dimensionsValue: e.target.value
                                }
                              }))}
                              className="h-10"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Weight</Label>
                            <Input
                              placeholder="e.g., Product Weight"
                              value={formData.specifications.weight}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                specifications: {
                                  ...prev.specifications,
                                  weight: e.target.value
                                }
                              }))}
                              className="h-10"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Weight Value</Label>
                            <Input
                              placeholder="e.g., 15 kg"
                              value={formData.specifications.weightValue}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                specifications: {
                                  ...prev.specifications,
                                  weightValue: e.target.value
                                }
                              }))}
                              className="h-10"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                      <Button 
                        type="submit"
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                        size="lg"
                      >
                        {editingProduct ? 'Update Product' : 'Create Product'}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => {
                          setShowProductForm(false);
                          setEditingProduct(null);
                          resetForm();
                        }}
                        className="w-full sm:w-auto"
                        size="lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Products List */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Package size={20} className="text-blue-600" />
                      All Products ({products.length})
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Manage your product catalog</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                      {products.filter(p => p.isFeatured).length} Featured
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {products.filter(p => p.stockQuantity > 0).length} In Stock
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                              <div className="text-gray-400 text-2xl">🪑</div>
                          )}
                        </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-800 text-lg truncate">{product.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{product.category?.name}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <Badge 
                                    variant={product.stockQuantity > 10 ? "default" : product.stockQuantity > 0 ? "secondary" : "destructive"}
                                    className="text-xs"
                                  >
                                    Stock: {product.stockQuantity}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Cost: ₹{product.purchaseCost?.toLocaleString() || '0'}
                                  </Badge>
                        {product.isFeatured && (
                                    <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                            Featured
                          </Badge>
                        )}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xl font-bold text-emerald-600">₹{product.price ? product.price.toLocaleString() : '0'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                            variant="outline"
                          size="sm"
                          onClick={() => handleProductEdit(product)}
                            className="h-9 px-3"
                        >
                            <Edit size={16} className="mr-1" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                          size="sm"
                          onClick={() => handleProductDelete(product.id)}
                            className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 size={16} className="mr-1" />
                            Delete
                        </Button>
                        </div>
                      </div>
                    </div>
                ))}
          </div>
                {products.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No products yet</h3>
                    <p className="text-gray-500 mb-4">Get started by adding your first product</p>
                    <Button onClick={() => setShowProductForm(true)}>
                      <Plus size={16} className="mr-2" />
                      Add Product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    console.log('Current order keys:', getOrderKeys());
                    console.log('Has existing orders:', hasExistingOrders());
                    toast.info('Check browser console for order details');
                  }}
                >
                  Debug Orders
                </Button>
                <Button variant="outline" onClick={handleResetData}>
                  <RefreshCw size={16} className="mr-2" />
                  Clear All Orders
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mb-4 items-end">
              <Input
                placeholder="Search by Order ID, Username, Email..."
                value={orderSearchQuery}
                onChange={e => setOrderSearchQuery(e.target.value)}
                className="w-64"
              />
              <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-48 justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {orderDateFrom ? format(orderDateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent selected={orderDateFrom} onSelect={setOrderDateFrom} />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-48 justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {orderDateTo ? format(orderDateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent selected={orderDateTo} onSelect={setOrderDateTo} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Filtered Orders Logic */}
            {(() => {
              const filteredOrders = orders.filter(order => {
                const search = orderSearchQuery.toLowerCase();
                const matchesSearch =
                  order.orderNumber.toLowerCase().includes(search) ||
                  order.customer?.name?.toLowerCase().includes(search) ||
                  order.customer?.email?.toLowerCase().includes(search);
                const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
                const matchesPayment = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter;
                const orderDate = new Date(order.createdAt);
                const matchesFrom = !orderDateFrom || orderDate >= orderDateFrom;
                const matchesTo = !orderDateTo || orderDate <= orderDateTo;
                return matchesSearch && matchesStatus && matchesPayment && matchesFrom && matchesTo;
              });
              return null;
            })()}

            {/* Order Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="card-elevated glass p-4 shadow-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </Card>
              <Card className="card-elevated glass p-4 shadow-lg border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {orders.filter(o => o.status === 'pending').length}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </Card>
              <Card className="card-elevated glass p-4 shadow-lg border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {orders.filter(o => o.status === 'delivered').length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </Card>
              <Card className="card-elevated glass p-4 shadow-lg border border-red-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {orders.filter(o => o.status === 'cancelled').length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </Card>
            </div>
            
            <Card className="card-elevated glass shadow-xl border border-emerald-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Orders ({filteredOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Orders Yet</h3>
                      <p className="text-gray-500 mb-4 max-w-md mx-auto">
                        Orders will appear here when customers place real orders through the website. 
                        The customer names will be taken from their user profiles or shipping addresses.
                      </p>
                      <div className="text-sm text-gray-400">
                        <p>To see orders:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Create a customer account</li>
                          <li>Add items to cart</li>
                          <li>Complete the checkout process</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    filteredOrders.map((order) => {
                      try {
                        return (
                          <div 
                            key={order.id} 
                            className="flex items-center justify-between p-6 rounded-xl bg-white/80 shadow border border-emerald-50 hover:shadow-lg transition-all duration-200 cursor-pointer"
                            onClick={() => handleOrderClick(order)}
                          >
                      <div className="flex items-center space-x-4">
                              <div className="p-3 bg-emerald-100 rounded-full">
                                <ShoppingBag className="h-6 w-6 text-emerald-600" />
                              </div>
                        <div>
                                <div className="flex items-center space-x-2">
                                  <p className="font-semibold text-lg">#{order.orderNumber}</p>
                                  <Badge className={getStatusColor(order.status)}>
                                    <div className="flex items-center gap-1">
                                      {getStatusIcon(order.status)}
                                      {order.status}
                                    </div>
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {order.customer?.name || 'Unknown Customer'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
        </div>
                      </div>
                            
                      <div className="text-right">
                              <p className="text-xl font-bold text-emerald-600">
                                ₹{order.total ? order.total.toLocaleString() : '0'}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openOrderStatusModal(order);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Update Status
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOrderClick(order);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                      </div>
                    </div>
                          </div>
                        );
                      } catch (error) {
                        console.error('Error rendering order:', error, order);
                        return (
                          <div key={order.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                            <p className="text-red-600">Error displaying order #{order.orderNumber}</p>
                          </div>
                        );
                      }
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
            
            <Card className="card-elevated glass p-6 shadow-xl border border-emerald-100">
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Users Yet</h3>
                      <p className="text-gray-500 mb-4 max-w-md mx-auto">
                        Users will appear here when customers create accounts and place orders. 
                        Only the admin user is shown by default.
                      </p>
                      <div className="text-sm text-gray-400">
                        <p>To see customer users:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Create a customer account</li>
                          <li>Complete the registration process</li>
                          <li>Place an order</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div 
                        key={user.id} 
                        className="flex items-center justify-between p-4 rounded-xl bg-white/80 shadow border border-emerald-50 hover:shadow-lg hover:border-emerald-200 transition-all duration-200 cursor-pointer"
                        onClick={() => handleUserClick(user)}
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12 ring-2 ring-emerald-100 shadow bg-white/90">
                            {user.avatar ? (
                              <AvatarImage src={user.avatar} alt={user.firstName + ' ' + user.lastName} />
                            ) : (
                              <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-sm text-gray-500">{user.phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                            {user.role}
                          </Badge>
                          <div className="mt-2 text-sm text-gray-500">
                            <p>Member since: {formatDate(user.createdAt)}</p>
                            {user.role === 'customer' && (
                              <>
                                <p>Orders: {user.totalOrders || 0}</p>
                                <p>Total spent: ₹{user.totalSpent ? user.totalSpent.toLocaleString() : '0'}</p>
                                {user.lastOrder && (
                                  <p>Last order: {formatDate(user.lastOrder)}</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Returns Tab */}
          <TabsContent value="returns" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Return Management</h2>
            
            {/* Return Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="card-elevated glass p-6 shadow-xl border border-emerald-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Returns</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalReturns || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full shadow-glow-blue">
                      <RotateCcw className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated glass p-6 shadow-xl border border-emerald-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.returnRequests || 0}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full shadow-glow-yellow">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated glass p-6 shadow-xl border border-emerald-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved Returns</p>
                      <p className="text-2xl font-bold text-green-600">
                        {returnRequests.filter(r => r.status === 'approved').length}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full shadow-glow-green">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated glass p-6 shadow-xl border border-emerald-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Refunded</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        ₹{stats.refundedAmount ? stats.refundedAmount.toLocaleString() : '0'}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-full shadow-glow-emerald">
                      <CreditCard className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Return Requests Management */}
            <Card className="card-elevated glass p-6 shadow-xl border border-emerald-100">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Return Requests</CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search returns..."
                        value={returnSearchQuery}
                        onChange={(e) => setReturnSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={returnStatusFilter} onValueChange={setReturnStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending_approval">Pending Approval</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="pickup_scheduled">Pickup Scheduled</SelectItem>
                        <SelectItem value="picked_up">Picked Up</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {returnRequests
                    .filter(request => 
                      returnStatusFilter === 'all' || request.status === returnStatusFilter
                    )
                    .filter(request =>
                      returnSearchQuery === '' || 
                      request.orderNumber.toLowerCase().includes(returnSearchQuery.toLowerCase()) ||
                      request.customerName.toLowerCase().includes(returnSearchQuery.toLowerCase()) ||
                      request.userEmail.toLowerCase().includes(returnSearchQuery.toLowerCase())
                    )
                    .map((request) => (
                      <div 
                        key={request.id} 
                        className="flex items-center justify-between p-4 rounded-xl bg-white/80 shadow border border-emerald-50 hover:shadow-lg hover:border-emerald-200 transition-all duration-200 cursor-pointer"
                        onClick={() => {
                          setSelectedReturnRequest(request);
                          setShowReturnDetail(true);
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-emerald-100 rounded-full">
                            <RotateCcw className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Return #{request.id.slice(-6)}</h3>
                            <p className="text-sm text-gray-500">Order: {request.orderNumber}</p>
                            <p className="text-sm text-gray-500">{request.customerName} ({request.userEmail})</p>
                            <p className="text-sm text-gray-500">
                              Reason: {getReturnReasonText(request.reason)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getReturnStatusColor(request.status)}>
                            {getReturnStatusText(request.status)}
                          </Badge>
                          <div className="mt-2 text-sm text-gray-500">
                            <p>Requested: {formatDate(request.requestedAt)}</p>
                            <p>Refund: ₹{request.refundAmount.toLocaleString()}</p>
                            <p>Items: {request.items.length}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {returnRequests.filter(request => 
                    returnStatusFilter === 'all' || request.status === returnStatusFilter
                  ).filter(request =>
                    returnSearchQuery === '' || 
                    request.orderNumber.toLowerCase().includes(returnSearchQuery.toLowerCase()) ||
                    request.customerName.toLowerCase().includes(returnSearchQuery.toLowerCase()) ||
                    request.userEmail.toLowerCase().includes(returnSearchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No return requests found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promo Codes Tab */}
          <TabsContent value="promocodes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Promo Code Management</h2>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleResetPromoCodes}>
                  <RefreshCw size={16} className="mr-2" />
                  Reset Promo Codes
                </Button>
                <Button onClick={() => setShowPromoForm(true)}>
                  <Plus size={16} className="mr-2" />
                  Add Promo Code
                </Button>
              </div>
            </div>

            {/* Promo Code Form */}
            {showPromoForm && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingPromoCode ? 'Edit Promo Code' : 'Add New Promo Code'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePromoCodeSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="code">Promo Code *</Label>
                        <Input
                          id="code"
                          value={promoFormData.code}
                          onChange={(e) => setPromoFormData(prev => ({ ...prev, code: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Type *</Label>
                        <Select
                          value={promoFormData.type}
                          onValueChange={(value: 'percentage' | 'fixed') => setPromoFormData(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="value">Value *</Label>
                        <Input
                          id="value"
                          type="number"
                          value={promoFormData.value}
                          onChange={(e) => setPromoFormData(prev => ({ ...prev, value: e.target.value }))}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label htmlFor="minOrderAmount">Minimum Order Amount *</Label>
                        <Input
                          id="minOrderAmount"
                          type="number"
                          value={promoFormData.minOrderAmount}
                          onChange={(e) => setPromoFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxDiscount">Maximum Discount *</Label>
                        <Input
                          id="maxDiscount"
                          type="number"
                          value={promoFormData.maxDiscount}
                          onChange={(e) => setPromoFormData(prev => ({ ...prev, maxDiscount: e.target.value }))}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label htmlFor="usageLimit">Usage Limit *</Label>
                        <Input
                          id="usageLimit"
                          type="number"
                          value={promoFormData.usageLimit}
                          onChange={(e) => setPromoFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                          required
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="isActive">Active *</Label>
                        <Switch
                          id="isActive"
                          checked={promoFormData.isActive}
                          onCheckedChange={(value) => setPromoFormData(prev => ({ ...prev, isActive: value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="validFrom">Valid From *</Label>
                        <Input
                          id="validFrom"
                          type="datetime-local"
                          value={promoFormData.validFrom}
                          onChange={(e) => setPromoFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="validUntil">Valid Until *</Label>
                        <Input
                          id="validUntil"
                          type="datetime-local"
                          value={promoFormData.validUntil}
                          onChange={(e) => setPromoFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="applicableCategories">Applicable Categories</Label>
                        <Input
                          id="applicableCategories"
                          placeholder="Enter category IDs (comma separated)"
                          value={promoFormData.applicableCategories.join(', ')}
                          onChange={(e) => setPromoFormData(prev => ({ 
                            ...prev, 
                            applicableCategories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="applicableProducts">Applicable Products</Label>
                        <Input
                          id="applicableProducts"
                          placeholder="Enter product IDs (comma separated)"
                          value={promoFormData.applicableProducts.join(', ')}
                          onChange={(e) => setPromoFormData(prev => ({ 
                            ...prev, 
                            applicableProducts: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          }))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button type="submit">
                        {editingPromoCode ? 'Update Promo Code' : 'Create Promo Code'}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => {
                          setShowPromoForm(false);
                          setEditingPromoCode(null);
                          resetPromoForm();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Promo Codes List */}
            <Card>
              <CardHeader>
                <CardTitle>All Promo Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPromoCodes.map((promoCode) => (
                    <div key={promoCode.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Tag className="h-8 w-8 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{promoCode.code}</h3>
                          <p className="text-sm text-gray-500">
                            {promoCode.type === 'percentage' ? `${promoCode.value}% off` : `₹${promoCode.value} off`}
                          </p>
                          <p className="text-sm text-gray-500">
                            Min Order: ₹{promoCode.minOrderAmount || '0'} | Max Discount: ₹{promoCode.maxDiscount || 'No limit'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Used: {promoCode.usedCount}/{promoCode.usageLimit}
                          </p>
                          <Badge className={promoCode.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {promoCode.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePromoCodeEdit(promoCode)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePromoCodeDelete(promoCode.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 size={20} />
                    Sales Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Chart placeholder
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart size={20} />
                    Category Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Chart placeholder
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Debug Tab */}
          <TabsContent value="debug" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Debug Tools</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stock Management Debug */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package size={20} />
                    Stock Management Debug
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Current Stock Levels</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {getCurrentStockLevels().map((item) => (
                        <div key={item.productId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{item.name}</span>
                          <Badge variant={item.stock > 10 ? 'default' : item.stock > 0 ? 'secondary' : 'destructive'}>
                            {item.stock} units
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        console.log('Current stock levels:', getCurrentStockLevels());
                        toast.success('Stock levels logged to console');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Log Stock Levels
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        const stockLevels = getCurrentStockLevels();
                        const lowStock = stockLevels.filter(item => item.stock <= 5);
                        if (lowStock.length > 0) {
                          toast.warning(`${lowStock.length} products have low stock`);
                          console.log('Low stock products:', lowStock);
                        } else {
                          toast.success('All products have sufficient stock');
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Check Low Stock
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Debug */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag size={20} />
                    Order Status Debug
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Recent Orders by Status</h4>
                    <div className="space-y-2">
                      {['delivered', 'returned', 'refunded'].map(status => {
                        const statusOrders = orders.filter(order => order.status === status).slice(0, 3);
                        return (
                          <div key={status} className="p-2 bg-gray-50 rounded">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium capitalize">{status}</span>
                              <Badge variant="outline">{statusOrders.length}</Badge>
                            </div>
                            {statusOrders.map(order => (
                              <div key={order.id} className="text-xs text-gray-600 ml-2">
                                #{order.orderNumber} - {formatDate(order.updatedAt || order.createdAt)}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        const deliveredOrders = orders.filter(order => order.status === 'delivered');
                        console.log('Delivered orders:', deliveredOrders);
                        toast.success(`${deliveredOrders.length} delivered orders logged`);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Log Delivered Orders
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        const returnRequests = getAllReturnRequests();
                        console.log('Return requests:', returnRequests);
                        toast.success(`${returnRequests.length} return requests logged`);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Log Return Requests
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Manual Stock Restoration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw size={20} />
                    Manual Stock Restoration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="orderId">Order ID for Stock Restoration</Label>
                    <Input
                      id="orderId"
                      placeholder="Enter order ID"
                      onChange={(e) => {
                        const orderId = e.target.value;
                        if (orderId) {
                          const success = restoreStockForOrder(orderId);
                          if (success) {
                            toast.success(`Stock restored for order ${orderId}`);
                          } else {
                            toast.error(`Failed to restore stock for order ${orderId}`);
                          }
                        }
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        const deliveredOrders = orders.filter(order => order.status === 'delivered');
                        deliveredOrders.forEach(order => {
                          restoreStockForOrder(order.id);
                        });
                        toast.success(`Stock restoration attempted for ${deliveredOrders.length} delivered orders`);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Restore All Delivered Orders
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        const returnRequests = getAllReturnRequests();
                        const refundedRequests = returnRequests.filter(req => req.status === 'refunded');
                        refundedRequests.forEach(req => {
                          restoreStockForOrder(req.orderId);
                        });
                        toast.success(`Stock restoration attempted for ${refundedRequests.length} refunded returns`);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Restore All Refunded Returns
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity size={20} />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Orders:</span>
                      <span className="text-sm font-medium">{orders.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Products:</span>
                      <span className="text-sm font-medium">{products.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Users:</span>
                      <span className="text-sm font-medium">{users.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Return Requests:</span>
                      <span className="text-sm font-medium">{returnRequests.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Promo Codes:</span>
                      <span className="text-sm font-medium">{promoCodes.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Cost Debug */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign size={20} />
                    Purchase Cost Debug
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Products with Missing Purchase Costs</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {products.filter(p => !p.purchaseCost || p.purchaseCost === 0).map((product) => (
                        <div key={product.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span className="text-sm font-medium">{product.name}</span>
                          <Badge variant="destructive">₹{product.purchaseCost || 0}</Badge>
                        </div>
                      ))}
                      {products.filter(p => !p.purchaseCost || p.purchaseCost === 0).length === 0 && (
                        <div className="text-sm text-green-600 p-2 bg-green-50 rounded">
                          All products have purchase costs set ✓
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        ensurePurchaseCosts();
                        toast.success('Purchase costs checked and updated');
                        // Refresh products
                        fetchProducts();
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Fix Missing Purchase Costs
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        const productsWithCosts = products.filter(p => p.purchaseCost && p.purchaseCost > 0);
                        console.log('Products with purchase costs:', productsWithCosts.map(p => ({
                          name: p.name,
                          price: p.price,
                          purchaseCost: p.purchaseCost,
                          margin: ((p.price - p.purchaseCost) / p.price * 100).toFixed(1) + '%'
                        })));
                        toast.success(`${productsWithCosts.length} products with costs logged`);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Log Purchase Costs
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        const totalInventoryValue = products.reduce((sum: number, p: any) => {
                          return sum + ((p.purchaseCost || 0) * (p.stockQuantity || 0));
                        }, 0);
                        console.log('Total inventory value:', totalInventoryValue);
                        toast.success(`Total inventory value: ₹${totalInventoryValue.toLocaleString()}`);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Calculate Inventory Value
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Orders Modal */}
      <Dialog open={showOrdersModal} onOpenChange={setShowOrdersModal}>
        <DialogContent className="p-6 rounded-xl bg-white shadow-xl max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBag size={20} />
              All Orders ({orders.length})
            </DialogTitle>
            <DialogDescription className="text-base text-gray-500">
              Detailed view of all orders with customer information and order status
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        ₹{order.total ? order.total.toLocaleString() : '0'}
                      </p>
                      <Badge className={`mt-2 ${getStatusColor(order.status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Customer Information</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Name:</span> {order.customer.name}</p>
                        <p><span className="font-medium">Email:</span> {order.customer.email}</p>
                        <p><span className="font-medium">Phone:</span> {order.customer.phone}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Shipping Address</h4>
                      <div className="space-y-1 text-sm">
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode || order.shippingAddress.pincode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{item.price?.toLocaleString() || '0'}</p>
                            <p className="text-sm text-gray-500">Total: ₹{((item.price || 0) * (item.quantity || 0)).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Payment Details</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Method:</span> {order.paymentMethod}</p>
                        <p><span className="font-medium">Status:</span> 
                          <Badge className={`ml-2 ${order.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {order.paymentStatus}
                          </Badge>
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Order Summary</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Subtotal:</span> ₹{(order.total * 0.9).toLocaleString()}</p>
                        <p><span className="font-medium">Tax:</span> ₹{(order.total * 0.1).toLocaleString()}</p>
                        <p className="font-bold"><span className="font-medium">Total:</span> ₹{order.total ? order.total.toLocaleString() : '0'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrdersModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Products Modal */}
      <Dialog open={showProductsModal} onOpenChange={setShowProductsModal}>
        <DialogContent className="p-6 rounded-xl bg-white shadow-xl max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package size={20} />
              All Products ({products.length})
            </DialogTitle>
            <DialogDescription className="text-base text-gray-500">
              Complete inventory with stock levels and product details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-gray-400 text-2xl">🪑</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{product.category?.name}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Price:</span>
                          <p className="text-green-600 font-semibold">₹{product.price ? product.price.toLocaleString() : '0'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Stock:</span>
                          <p className={product.stockQuantity > 10 ? 'text-green-600' : product.stockQuantity > 0 ? 'text-yellow-600' : 'text-red-600'}>
                            {product.stockQuantity} units
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>
                          <p>{product.category?.name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>
                          <Badge className={product.isFeatured ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}>
                            {product.isFeatured ? 'Featured' : 'Regular'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Users Modal */}
      <Dialog open={showUsersModal} onOpenChange={setShowUsersModal}>
        <DialogContent className="p-6 rounded-xl bg-white shadow-xl max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users size={20} />
              All Users ({users.length})
            </DialogTitle>
            <DialogDescription className="text-base text-gray-500">
              User management with detailed customer information and order history
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} alt={user.firstName + ' ' + user.lastName} />
                        ) : (
                          <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                        {user.role}
                      </Badge>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Member since: {formatDate(user.createdAt)}</p>
                        {user.role === 'customer' && (
                          <>
                            <p>Orders: {user.totalOrders || 0}</p>
                            <p>Total spent: ₹{user.totalSpent ? user.totalSpent.toLocaleString() : '0'}</p>
                            {user.lastOrder && (
                              <p>Last order: {formatDate(user.lastOrder)}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUsersModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revenue Modal */}
      <Dialog open={showRevenueModal} onOpenChange={setShowRevenueModal}>
        <DialogContent className="p-6 rounded-xl bg-white shadow-xl max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <DollarSign size={20} />
              Revenue Analytics
            </DialogTitle>
            <DialogDescription className="text-base text-gray-500">
              Detailed revenue breakdown and financial insights
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Revenue Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">₹{stats?.totalRevenue?.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">₹{(stats?.totalRevenue * 0.1).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Tax Collected</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">₹{(stats?.totalRevenue * 0.9).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Net Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.recentSales?.map((sale: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Sale #{sale.id}</p>
                        <p className="text-sm text-gray-500">{formatDate(sale.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{sale.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.random() * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{(Math.random() * 50000).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{Math.floor(Math.random() * 100)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevenueModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Modal */}
      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent className="p-6 rounded-xl bg-white shadow-xl max-w-4xl max-h-[80vh] overflow-y-auto sm:max-w-2xl lg:max-w-4xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2 text-lg sm:text-xl">
              <ShoppingBag className="h-5 w-5" />
              Order #{selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-500">
              Order placed on {selectedOrder ? formatDate(selectedOrder.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              {(() => {
                try {
                  return (
                    <>
                      {/* Order Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4">
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base">Current Status</h3>
                          <Badge className={`
                            ${getStatusColor(selectedOrder.status)}
                            flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium
                          `}>
                      {getStatusIcon(selectedOrder.status)}
                            {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                    </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOrderStatusModal(selectedOrder)}
                          className="flex items-center gap-2 w-full sm:w-auto"
                        >
                          <Edit className="h-4 w-4" />
                          Update Status
                        </Button>
                    </div>

                      {/* Order Items */}
                    <div>
                        <h3 className="font-semibold mb-3 text-sm sm:text-base">Order Items</h3>
                        <div className="space-y-3">
                          {selectedOrder.items?.map((item: any, index: number) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                    </div>
                    <div>
                                  <p className="font-medium text-sm sm:text-base">{item.name}</p>
                                  <p className="text-xs sm:text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                              <div className="text-right">
                                <p className="font-bold text-sm sm:text-base">₹{item.price?.toLocaleString() || '0'}</p>
                                <p className="text-xs sm:text-sm text-gray-500">Total: ₹{((item.price || 0) * (item.quantity || 0)).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-3 text-sm sm:text-base">Order Summary</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm sm:text-base">
                            <span>Subtotal:</span>
                            <span>₹{selectedOrder.subtotal?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex justify-between text-sm sm:text-base">
                            <span>Tax:</span>
                            <span>₹{selectedOrder.tax?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex justify-between text-sm sm:text-base">
                            <span>Shipping:</span>
                            <span>₹{selectedOrder.shippingCost?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>₹{selectedOrder.total?.toLocaleString() || '0'}</span>
                          </div>
                        </div>
                      </div>

              {/* Customer Information */}
                      <div>
                        <h3 className="font-semibold mb-3 text-sm sm:text-base">Customer Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                            <h4 className="font-medium text-gray-700 text-sm sm:text-base">Shipping Address</h4>
                            <p className="text-xs sm:text-sm">{selectedOrder.shippingAddress?.street || 'N/A'}</p>
                            <p className="text-xs sm:text-sm">{selectedOrder.shippingAddress?.city || 'N/A'}, {selectedOrder.shippingAddress?.state || 'N/A'} {selectedOrder.shippingAddress?.postalCode || selectedOrder.shippingAddress?.pincode || 'N/A'}</p>
                    </div>
                    <div>
                            <h4 className="font-medium text-gray-700 text-sm sm:text-base">Contact</h4>
                            <p className="text-xs sm:text-sm">{selectedOrder.customer?.email || 'N/A'}</p>
                            <p className="text-xs sm:text-sm">{selectedOrder.customer?.phone || 'N/A'}</p>
                    </div>
                    </div>
                  </div>

                      {/* Status History */}
                    <div>
                        <h3 className="font-semibold mb-3 text-sm sm:text-base">Status History</h3>
                        <div className="space-y-2">
                          {orderStatusHistory?.map((history, index) => (
                            <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(history.status).split(' ')[0]}`}></div>
                              <div className="flex-1">
                                <p className="font-medium text-sm sm:text-base">{history.status.charAt(0).toUpperCase() + history.status.slice(1)}</p>
                                <p className="text-xs sm:text-sm text-gray-500">{formatDate(history.timestamp)}</p>
                                {history.notes && <p className="text-xs sm:text-sm text-gray-600 mt-1">{history.notes}</p>}
                    </div>
                  </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                } catch (error) {
                  console.error('Error rendering order details:', error);
                  return (
                    <div className="text-center py-8">
                      <p className="text-red-600">Error loading order details</p>
                      <p className="text-sm text-gray-500 mt-2">Please try again or contact support</p>
                    </div>
                  );
                }
              })()}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDetail(false)} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Status Update Modal */}
      <Dialog open={showOrderStatusModal} onOpenChange={setShowOrderStatusModal}>
        <DialogContent className="p-6 rounded-xl bg-white shadow-xl max-w-md sm:max-w-lg">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg sm:text-xl">Update Order Status</DialogTitle>
            <DialogDescription className="text-sm">
              Update the status for Order #{selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          
                  <div className="space-y-4">
            <div>
              <Label htmlFor="status" className="text-sm">New Status</Label>
              <Select value={newOrderStatus} onValueChange={(value: OrderStatus) => setNewOrderStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {selectedOrder && getNextPossibleStatuses(selectedOrder.status).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                          </div>
            
                          <div>
              <Label htmlFor="notes" className="text-sm">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this status change..."
                value={orderStatusNotes}
                onChange={(e) => setOrderStatusNotes(e.target.value)}
                className="text-sm"
              />
                          </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderStatusModal(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleUpdateOrderStatus} disabled={!newOrderStatus} className="w-full sm:w-auto">
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Modal */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="p-6 rounded-xl bg-white shadow-xl max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Details - {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-500">
              Complete user information and order history
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="w-16 h-16 ring-2 ring-emerald-100 shadow">
                  {selectedUser.avatar ? (
                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.firstName + ' ' + selectedUser.lastName} />
                  ) : (
                    <AvatarFallback className="text-lg">{selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <p className="text-gray-600">{selectedUser.phone}</p>
                  <Badge className={`mt-2 ${selectedUser.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {selectedUser.role}
                  </Badge>
                        </div>
                        <div className="text-right">
                  <p className="text-sm text-gray-500">Member since</p>
                  <p className="font-semibold">{formatDate(selectedUser.createdAt)}</p>
                        </div>
                  </div>
                  
              {/* User Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedUser.totalOrders || 0}</div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                </CardContent>
              </Card>
              <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{selectedUser.totalSpent ? selectedUser.totalSpent.toLocaleString() : '0'}
                  </div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                </CardContent>
              </Card>
              <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedUser.lastOrder ? formatDate(selectedUser.lastOrder) : 'N/A'}
                  </div>
                    <div className="text-sm text-gray-600">Last Order</div>
                </CardContent>
              </Card>
              </div>

              {/* Order History */}
              <div>
                <h3 className="font-semibold mb-3">Order History</h3>
                {userOrders.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No orders found for this user</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userOrders.map((order) => (
                      <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedUserOrder(order); setShowUserOrderDetail(true); }}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                              <div className="p-2 bg-emerald-100 rounded-full">
                                <ShoppingBag className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                                <h4 className="font-semibold">Order #{order.orderNumber}</h4>
                        <p className="text-sm text-gray-500">
                                  {formatDate(order.createdAt)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {order.items?.length || 0} items
                                </p>
                          </div>
                        </div>
                        <div className="text-right">
                              <p className="font-bold text-lg text-emerald-600">
                                ₹{order.total?.toLocaleString() || '0'}
                              </p>
                              <Badge className={`mt-1 ${getStatusColor(order.status)}`}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(order.status)}
                                  {order.status}
                        </div>
                              </Badge>
                      </div>
                  </div>
                  
                          {/* Order Items Preview */}
                          <div className="mt-3 pt-3 border-t">
                            <div className="space-y-1">
                              {order.items?.slice(0, 2).map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{item.name} x{item.quantity}</span>
                                  <span>₹{item.total?.toLocaleString() || '0'}</span>
                        </div>
                              ))}
                              {order.items?.length > 2 && (
                          <p className="text-sm text-gray-500">
                                  +{order.items.length - 2} more items
                                </p>
                              )}
                    </div>
                  </div>
                </CardContent>
              </Card>
                    ))}
                      </div>
                    )}
              </div>

              {/* User Preferences */}
              {selectedUser.preferences && (
                <div>
                  <h3 className="font-semibold mb-3">Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${selectedUser.preferences.newsletter ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">Email Newsletter</span>
                      </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${selectedUser.preferences.marketingEmails ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">Marketing Emails</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${selectedUser.preferences.notifications ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">Order Notifications</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetail(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Order Detail Modal (inside User Detail Modal) */}
      <Dialog open={showUserOrderDetail} onOpenChange={setShowUserOrderDetail}>
        <DialogContent className="p-6 rounded-xl bg-white shadow-xl max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Details - #{selectedUserOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-500">
              Detailed information and status update for this order
            </DialogDescription>
          </DialogHeader>
          {selectedUserOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                  <h4 className="font-semibold">Order #{selectedUserOrder.orderNumber}</h4>
                  <p className="text-sm text-gray-500">{formatDate(selectedUserOrder.createdAt)}</p>
                  <Badge className={`mt-2 ${getStatusColor(selectedUserOrder.status)}`}>{selectedUserOrder.status}</Badge>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-emerald-600">₹{selectedUserOrder.total?.toLocaleString() || '0'}</p>
                </div>
              </div>
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedUserOrder.customer.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedUserOrder.customer.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedUserOrder.customer.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Shipping Address</h4>
                  <div className="space-y-1 text-sm">
                    <p>{selectedUserOrder.shippingAddress.street}</p>
                    <p>{selectedUserOrder.shippingAddress.city}, {selectedUserOrder.shippingAddress.state} {selectedUserOrder.shippingAddress.postalCode || selectedUserOrder.shippingAddress.pincode}</p>
                  </div>
                </div>
              </div>
              {/* Items */}
              <div>
                <h4 className="font-semibold mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedUserOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{item.price?.toLocaleString() || '0'}</p>
                        <p className="text-sm text-gray-500">Total: ₹{((item.price || 0) * (item.quantity || 0)).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Payment Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Method:</span> {selectedUserOrder.paymentMethod}</p>
                    <p><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${selectedUserOrder.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{selectedUserOrder.paymentStatus}</Badge>
                        </p>
                      </div>
                    </div>
                <div>
                  <h4 className="font-semibold mb-2">Order Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Subtotal:</span> ₹{(selectedUserOrder.total * 0.9).toLocaleString()}</p>
                    <p><span className="font-medium">Tax:</span> ₹{(selectedUserOrder.total * 0.1).toLocaleString()}</p>
                    <p className="font-bold"><span className="font-medium">Total:</span> ₹{selectedUserOrder.total ? selectedUserOrder.total.toLocaleString() : '0'}</p>
                        </div>
                </div>
              </div>
              {/* Status Update */}
                        <div>
                <Label htmlFor="status">Update Status</Label>
                <Select value={newOrderStatus || selectedUserOrder.status} onValueChange={(value: OrderStatus) => setNewOrderStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {getNextPossibleStatuses(selectedUserOrder.status).map((status) => (
                      <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this status change..."
                  value={orderStatusNotes}
                  onChange={(e) => setOrderStatusNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserOrderDetail(false)}>
              Close
            </Button>
            <Button onClick={async () => {
              if (!newOrderStatus || !selectedUserOrder) return;
              try {
                await updateOrderStatus(selectedUserOrder.id, newOrderStatus, user, orderStatusNotes);
                toast.success('Order status updated!');
                setShowUserOrderDetail(false);
                setNewOrderStatus('');
                setOrderStatusNotes('');
                // Refresh user orders and main orders
                const updatedOrders = getAllOrders();
                setOrders(updatedOrders);
                setFilteredOrders(updatedOrders);
                setUserOrders(getUserOrderHistory(selectedUserOrder.customer.email));
              } catch (error) {
                toast.error('Failed to update order status');
              }
            }} disabled={!newOrderStatus || newOrderStatus === selectedUserOrder?.status}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Detail Modal */}
      <Dialog open={showReturnDetail} onOpenChange={setShowReturnDetail}>
        <DialogContent className="p-6 rounded-xl bg-white shadow-xl max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Return Details - #{selectedReturnRequest?.id.slice(-6)}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-500">
              Detailed information and actions for this return request
            </DialogDescription>
          </DialogHeader>
          
          {selectedReturnRequest && (
            <div className="space-y-6">
              {/* Return Info */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">Return #{selectedReturnRequest.id.slice(-6)}</h4>
                  <p className="text-sm text-gray-500">Order: {selectedReturnRequest.orderNumber}</p>
                          <p className="text-sm text-gray-500">
                    Requested: {formatDate(selectedReturnRequest.requestedAt)}
                  </p>
                  <Badge className={`mt-2 ${getReturnStatusColor(selectedReturnRequest.status)}`}>
                    {getReturnStatusText(selectedReturnRequest.status)}
                  </Badge>
                        </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-emerald-600">
                    ₹{selectedReturnRequest.refundAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Refund Amount</p>
                      </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedReturnRequest.customerName}</p>
                    <p><span className="font-medium">Email:</span> {selectedReturnRequest.userEmail}</p>
                  </div>
                        </div>
                        <div>
                  <h4 className="font-semibold mb-2">Return Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Reason:</span> {getReturnReasonText(selectedReturnRequest.reason)}</p>
                    <p><span className="font-medium">Description:</span> {selectedReturnRequest.description}</p>
                  </div>
                </div>
              </div>

              {/* Return Items */}
              <div>
                <h4 className="font-semibold mb-2">Items to Return</h4>
                <div className="space-y-2">
                  {selectedReturnRequest.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500">
                          Return Qty: {item.returnQuantity} of {item.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Condition: {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                          </p>
                        </div>
                      <div className="text-right">
                        <p className="font-bold">₹{item.originalPrice.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          Total: ₹{(item.originalPrice * item.returnQuantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History */}
              <div>
                <h4 className="font-semibold mb-2">Status History</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Requested on {formatDate(selectedReturnRequest.requestedAt)}</span>
                  </div>
                  {selectedReturnRequest.approvedAt && (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Approved on {formatDate(selectedReturnRequest.approvedAt)}</span>
                      </div>
                    )}
                  {selectedReturnRequest.rejectedAt && (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Rejected on {formatDate(selectedReturnRequest.rejectedAt)}</span>
                  </div>
                  )}
                  {selectedReturnRequest.pickupScheduledAt && (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Pickup scheduled for {formatDate(selectedReturnRequest.pickupScheduledAt)}</span>
            </div>
          )}
                  {selectedReturnRequest.pickedUpAt && (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span>Picked up on {formatDate(selectedReturnRequest.pickedUpAt)}</span>
                    </div>
                  )}
                  {selectedReturnRequest.receivedAt && (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Received on {formatDate(selectedReturnRequest.receivedAt)}</span>
                    </div>
                  )}
                  {selectedReturnRequest.refundedAt && (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>Refunded on {formatDate(selectedReturnRequest.refundedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedReturnRequest.adminNotes && (
                <div>
                  <h4 className="font-semibold mb-2">Admin Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedReturnRequest.adminNotes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {selectedReturnRequest.status === 'pending_approval' && (
                  <>
                    <Button 
                      onClick={() => {
                        setReturnActionType('approve');
                        setShowReturnActionModal(true);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve Return
            </Button>
            <Button 
              onClick={() => {
                        setReturnActionType('reject');
                        setShowReturnActionModal(true);
                      }}
                      variant="destructive"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Return
                    </Button>
                  </>
                )}
                
                {selectedReturnRequest.status === 'approved' && (
                  <Button 
                    onClick={() => {
                      setReturnActionType('schedule_pickup');
                      setShowReturnActionModal(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Schedule Pickup
                  </Button>
                )}

                {selectedReturnRequest.status === 'pickup_scheduled' && (
                  <Button 
                    onClick={() => {
                      setReturnActionType('mark_picked_up');
                      setShowReturnActionModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Mark as Picked Up
                  </Button>
                )}

                {selectedReturnRequest.status === 'picked_up' && (
                  <Button 
                    onClick={() => {
                      setReturnActionType('mark_received');
                      setShowReturnActionModal(true);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <PackageCheck className="mr-2 h-4 w-4" />
                    Mark as Received
                  </Button>
                )}

                {selectedReturnRequest.status === 'received' && (
                  <Button 
                    onClick={() => {
                      setReturnActionType('process_refund');
                      setShowReturnActionModal(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Process Refund
                  </Button>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDetail(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Return Action Modal */}
      <Dialog open={showReturnActionModal} onOpenChange={setShowReturnActionModal}>
        <DialogContent className="p-6 rounded-xl bg-white shadow-xl max-w-md">
          <DialogHeader className="mb-4">
            <DialogTitle>
              {returnActionType === 'approve' && 'Approve Return Request'}
              {returnActionType === 'reject' && 'Reject Return Request'}
              {returnActionType === 'schedule_pickup' && 'Schedule Pickup'}
              {returnActionType === 'mark_picked_up' && 'Mark as Picked Up'}
              {returnActionType === 'mark_received' && 'Mark as Received'}
              {returnActionType === 'process_refund' && 'Process Refund'}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-500">
              {returnActionType === 'approve' && 'Are you sure you want to approve this return request?'}
              {returnActionType === 'reject' && 'Are you sure you want to reject this return request?'}
              {returnActionType === 'schedule_pickup' && 'Schedule pickup for this return'}
              {returnActionType === 'mark_picked_up' && 'Mark this return as picked up'}
              {returnActionType === 'mark_received' && 'Mark this return as received'}
              {returnActionType === 'process_refund' && 'Process refund for this return'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {returnActionType === 'reject' && (
              <div>
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Input
                  id="rejection-reason"
                  placeholder="Enter rejection reason..."
                  value={returnRejectionReason}
                  onChange={(e) => setReturnRejectionReason(e.target.value)}
                />
              </div>
            )}

            {returnActionType === 'schedule_pickup' && (
              <div>
                <Label htmlFor="pickup-date">Pickup Date</Label>
                <Input
                  id="pickup-date"
                  type="date"
                  value={returnPickupDate}
                  onChange={(e) => setReturnPickupDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}

            {returnActionType === 'process_refund' && (
              <div>
                <Label htmlFor="refund-method">Refund Method</Label>
                <Select value={returnRefundMethod} onValueChange={(value: any) => setReturnRefundMethod(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select refund method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original_payment">Original Payment Method</SelectItem>
                    <SelectItem value="store_credit">Store Credit</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="action-notes">Notes (Optional)</Label>
              <Textarea
                id="action-notes"
                placeholder="Add any notes..."
                value={returnActionNotes}
                onChange={(e) => setReturnActionNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnActionModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (!selectedReturnRequest) return;
                
                try {
                  let success = false;
                  
                  switch (returnActionType) {
                    case 'approve':
                      success = approveReturnRequest(selectedReturnRequest.id, user?.email || 'admin', returnActionNotes);
                      break;
                    case 'reject':
                      if (!returnRejectionReason.trim()) {
                        toast.error('Please provide a rejection reason');
                        return;
                      }
                      success = rejectReturnRequest(selectedReturnRequest.id, user?.email || 'admin', returnRejectionReason, returnActionNotes);
                      break;
                    case 'schedule_pickup':
                      if (!returnPickupDate) {
                        toast.error('Please select a pickup date');
                        return;
                      }
                      success = scheduleReturnPickup(selectedReturnRequest.id, new Date(returnPickupDate), user?.email || 'admin');
                      break;
                    case 'mark_picked_up':
                      success = markReturnPickedUp(selectedReturnRequest.id, user?.email || 'admin');
                      break;
                    case 'mark_received':
                      success = markReturnReceived(selectedReturnRequest.id, user?.email || 'admin');
                      break;
                    case 'process_refund':
                      success = processReturnRefund(selectedReturnRequest.id, user?.email || 'admin', returnRefundMethod);
                      break;
                  }
                  
                  if (success) {
                    toast.success('Return request updated successfully!');
                    setShowReturnActionModal(false);
                    setShowReturnDetail(false);
                    
                    // Refresh data
                    const updatedRequests = getAllReturnRequests();
                    setReturnRequests(updatedRequests);
                    const returnStats = getReturnStatistics();
                    setStats(prev => ({
                      ...prev,
                      returnRequests: returnStats.pendingApproval,
                      totalReturns: returnStats.total,
                      refundedAmount: returnStats.totalRefundAmount
                    }));
                    
                    // Clear form
                    setReturnActionNotes('');
                    setReturnRejectionReason('');
                    setReturnPickupDate('');
                    setReturnRefundMethod('original_payment');
                  } else {
                    toast.error('Failed to update return request');
                  }
                } catch (error) {
                  console.error('Error updating return request:', error);
                  toast.error('Failed to update return request');
                }
              }}
              className={
                returnActionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                returnActionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                returnActionType === 'schedule_pickup' ? 'bg-purple-600 hover:bg-purple-700' :
                returnActionType === 'mark_picked_up' ? 'bg-indigo-600 hover:bg-indigo-700' :
                returnActionType === 'mark_received' ? 'bg-green-600 hover:bg-green-700' :
                'bg-emerald-600 hover:bg-emerald-700'
              }
            >
              {returnActionType === 'approve' && 'Approve'}
              {returnActionType === 'reject' && 'Reject'}
              {returnActionType === 'schedule_pickup' && 'Schedule Pickup'}
              {returnActionType === 'mark_picked_up' && 'Mark as Picked Up'}
              {returnActionType === 'mark_received' && 'Mark as Received'}
              {returnActionType === 'process_refund' && 'Process Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Promo Code Detail Modal */}
      <Dialog open={showPromoDetail} onOpenChange={setShowPromoDetail}>
        <DialogContent className="p-6 rounded-xl bg-white shadow-xl max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg sm:text-xl">Promo Code Details</DialogTitle>
          </DialogHeader>
          
          {selectedPromoCode && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Code</Label>
                  <p className="text-base sm:text-lg font-semibold">{selectedPromoCode.code}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <p className="text-base sm:text-lg font-semibold capitalize">{selectedPromoCode.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Value</Label>
                  <p className="text-base sm:text-lg font-semibold">
                    {selectedPromoCode.type === 'percentage' ? `${selectedPromoCode.value}%` : `₹${selectedPromoCode.value}`}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={selectedPromoCode.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {selectedPromoCode.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Usage</Label>
                  <p className="text-base sm:text-lg font-semibold">{selectedPromoCode.usedCount}/{selectedPromoCode.usageLimit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Min Order Amount</Label>
                  <p className="text-base sm:text-lg font-semibold">₹{selectedPromoCode.minOrderAmount || '0'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Max Discount</Label>
                  <p className="text-base sm:text-lg font-semibold">₹{selectedPromoCode.maxDiscount || 'No limit'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Valid From</Label>
                  <p className="text-base sm:text-lg font-semibold">{formatDate(selectedPromoCode.validFrom)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Valid Until</Label>
                  <p className="text-base sm:text-lg font-semibold">{formatDate(selectedPromoCode.validUntil)}</p>
                </div>
              </div>

              {(selectedPromoCode.applicableCategories?.length > 0 || selectedPromoCode.applicableProducts?.length > 0) && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Restrictions</Label>
                  <div className="mt-2 space-y-2">
                    {selectedPromoCode.applicableCategories?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Applicable Categories:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPromoCode.applicableCategories.map((catId) => (
                            <Badge key={catId} variant="outline" className="text-xs">
                              {catId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedPromoCode.applicableProducts?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Applicable Products:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPromoCode.applicableProducts.map((prodId) => (
                            <Badge key={prodId} variant="outline" className="text-xs">
                              {prodId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button onClick={() => handlePromoCodeEdit(selectedPromoCode)} className="w-full sm:w-auto">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Promo Code
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handlePromoCodeDelete(selectedPromoCode.id)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Promo Code
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromoDetail(false)} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dashboard Analytics Modal */}
      <Dialog open={showDashboardModal} onOpenChange={setShowDashboardModal}>
        <DialogContent className="p-6 rounded-xl bg-white shadow-xl max-w-4xl max-h-[80vh] overflow-y-auto sm:max-w-2xl lg:max-w-4xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {getDashboardModalContent().title}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-500">
              Real-time analytics data from your store
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {getDashboardModalContent().content}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDashboardModal(false)} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Admin;