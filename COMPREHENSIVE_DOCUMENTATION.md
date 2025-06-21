# FurniCraft E-Commerce Application - Comprehensive Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture Overview](#architecture-overview)
5. [Core Dependencies](#core-dependencies)
6. [Type Definitions](#type-definitions)
7. [State Management](#state-management)
8. [Component Documentation](#component-documentation)
9. [Page Documentation](#page-documentation)
10. [Hook Documentation](#hook-documentation)
11. [Utility Functions](#utility-functions)
12. [API Layer](#api-layer)
13. [Styling System](#styling-system)
14. [Development Setup](#development-setup)
15. [Deployment](#deployment)
16. [Best Practices](#best-practices)

## Project Overview

**FurniCraft** is a modern, full-featured e-commerce application built with React, TypeScript, and Vite. It's designed to sell furniture and home decor items with a focus on user experience, performance, and scalability.

### Key Features
- **User Authentication & Authorization**: Complete user management system with role-based access
- **Product Catalog**: Comprehensive product browsing with filtering, search, and pagination
- **Shopping Cart**: Persistent cart functionality with guest and authenticated user support
- **Wishlist**: Save favorite products for later
- **Order Management**: Complete order lifecycle from cart to delivery
- **Admin Dashboard**: Comprehensive admin interface for managing products, orders, and users
- **Responsive Design**: Mobile-first design with modern UI components
- **Real-time Updates**: Live cart updates and notifications

### Business Logic
- **Multi-role System**: Customer, Premium, Admin, Manager roles
- **Inventory Management**: Stock tracking and low stock alerts
- **Pricing System**: Support for discounts, original prices, and promotional offers
- **Analytics Tracking**: Product views, cart additions, wishlist additions, and purchases
- **Return Management**: Complete return and refund workflow

## Technology Stack

### Frontend Framework
- **React 18.3.1**: Modern React with hooks and functional components
- **TypeScript 5.5.3**: Type-safe development with strict type checking
- **Vite 5.4.1**: Fast build tool and development server

### UI & Styling
- **Tailwind CSS 3.4.11**: Utility-first CSS framework
- **Shadcn/ui**: High-quality, accessible UI components
- **Radix UI**: Headless UI primitives for complex components
- **Lucide React**: Beautiful, customizable icons
- **Tailwind CSS Animate**: Smooth animations and transitions

### State Management
- **React Context API**: For global state management
- **React Query (TanStack Query)**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation

### Routing & Navigation
- **React Router DOM 6.26.2**: Client-side routing
- **React Hook Form**: Form state management

### Development Tools
- **ESLint**: Code linting and formatting
- **TypeScript ESLint**: TypeScript-specific linting rules
- **SWC**: Fast JavaScript/TypeScript compiler
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## Project Structure

```
furnicraft5/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Shadcn/ui components
│   │   ├── Navbar.tsx     # Main navigation
│   │   ├── Footer.tsx     # Site footer
│   │   ├── Hero.tsx       # Landing page hero
│   │   ├── ProductCard.tsx # Individual product display
│   │   └── ProductGrid.tsx # Product listing grid
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.tsx    # Authentication logic
│   │   ├── useCart.tsx    # Shopping cart management
│   │   ├── useProducts.tsx # Product data management
│   │   ├── useWishlist.tsx # Wishlist functionality
│   │   └── use-mobile.tsx # Mobile detection
│   ├── pages/             # Route components
│   │   ├── Index.tsx      # Home page
│   │   ├── Products.tsx   # Product catalog
│   │   ├── ProductDetail.tsx # Single product view
│   │   ├── Cart.tsx       # Shopping cart
│   │   ├── Checkout.tsx   # Checkout process
│   │   ├── Login.tsx      # User authentication
│   │   ├── Signup.tsx     # User registration
│   │   ├── Profile.tsx    # User profile management
│   │   ├── Admin.tsx      # Admin dashboard
│   │   ├── Wishlist.tsx   # User wishlist
│   │   ├── OrderHistory.tsx # Order tracking
│   │   └── NotFound.tsx   # 404 page
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # All application types
│   ├── lib/               # Utility libraries
│   │   ├── api.ts         # API client and endpoints
│   │   └── utils.ts       # General utilities
│   ├── utils/             # Business logic utilities
│   │   ├── initializeData.ts # Sample data initialization
│   │   ├── orderUtils.ts  # Order-related utilities
│   │   ├── promoUtils.ts  # Promotional logic
│   │   └── returnUtils.ts # Return management
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

## Architecture Overview

### Application Architecture

The application follows a **Component-Based Architecture** with the following layers:

1. **Presentation Layer**: React components and pages
2. **Business Logic Layer**: Custom hooks and utility functions
3. **Data Layer**: API client and local storage management
4. **State Management Layer**: React Context and React Query

### State Management Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Application State                        │
├─────────────────────────────────────────────────────────────┤
│  Global State (Context API)                                 │
│  ├── Authentication State (useAuth)                        │
│  ├── Shopping Cart State (useCart)                         │
│  └── Wishlist State (useWishlist)                          │
├─────────────────────────────────────────────────────────────┤
│  Server State (React Query)                                 │
│  ├── Products Data                                          │
│  ├── User Profile Data                                      │
│  └── Order History Data                                     │
├─────────────────────────────────────────────────────────────┤
│  Local State (useState/useReducer)                         │
│  ├── Form States                                            │
│  ├── UI States (modals, loading)                           │
│  └── Component-specific States                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Actions** → Components → Hooks → State Updates
2. **State Changes** → Context Updates → Component Re-renders
3. **API Calls** → React Query → Cache Updates → UI Updates
4. **Local Storage** → Persistence → State Restoration

## Core Dependencies

### Production Dependencies

#### React Ecosystem
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.2",
  "react-hook-form": "^7.53.0",
  "@hookform/resolvers": "^3.9.0"
}
```

#### UI Components
```json
{
  "@radix-ui/react-*": "^1.1.0-2.2.1", // 20+ Radix UI components
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.5.2",
  "lucide-react": "^0.462.0"
}
```

#### State Management
```json
{
  "@tanstack/react-query": "^5.56.2",
  "sonner": "^1.5.0"
}
```

#### Utilities
```json
{
  "axios": "^1.10.0",
  "zod": "^3.23.8",
  "date-fns": "^3.6.0",
  "cmdk": "^1.0.0"
}
```

### Development Dependencies

```json
{
  "@vitejs/plugin-react-swc": "^3.5.0",
  "typescript": "^5.5.3",
  "tailwindcss": "^3.4.11",
  "eslint": "^9.9.0",
  "autoprefixer": "^10.4.20"
}
```

## Type Definitions

### Core Business Types

#### User Management
```typescript
interface User {
  id: string;
  email: string;
  password?: string;
  role: 'customer' | 'premium' | 'admin' | 'manager';
  isEmailVerified: boolean;
  isActive: boolean;
  failedLoginAttempts: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  preferences: {
    newsletter: boolean;
    marketingEmails: boolean;
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface UserAddress {
  id: string;
  userId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  label?: string; // e.g., "Home", "Office"
  createdAt: Date;
  updatedAt: Date;
}
```

#### Product Management
```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  purchaseCost: number; // Cost to purchase/manufacture the product
  categoryId: string;
  category?: Category;
  stockQuantity: number;
  sku: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  specifications: Record<string, string>;
  image?: string;
  images?: string[];
  // Analytics tracking fields
  viewCount: number; // Number of times product was viewed
  cartAdditions: number; // Number of times added to cart
  wishlistAdditions: number; // Number of times added to wishlist
  purchaseCount: number; // Number of times actually purchased
  lastViewedAt?: Date; // Last time product was viewed
  createdAt: Date;
  updatedAt: Date;
}

interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  user?: User;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Shopping Cart
```typescript
interface CartItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Order Management
```typescript
type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'return_approved'
  | 'return_rejected'
  | 'return_pickup_scheduled'
  | 'return_picked_up'
  | 'return_received'
  | 'returned'
  | 'refunded';

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  shippingAddress: UserAddress;
  billingAddress?: UserAddress;
  paymentMethod: 'cod' | 'card' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  notes?: string;
  changedBy?: string;
  changedAt: Date;
}
```

#### Wishlist
```typescript
interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  createdAt: Date;
}
```

#### Admin & Analytics
```typescript
interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: Order[];
  topProducts: Product[];
  salesChart: {
    labels: string[];
    data: number[];
  };
  userGrowth: {
    labels: string[];
    data: number[];
  };
}

interface AdminUser extends User {
  profile?: UserProfile;
  addresses?: UserAddress[];
  orders?: Order[];
  lastOrderAt?: Date;
  totalSpent: number;
  orderCount: number;
}
```

#### Search & Filtering
```typescript
interface ProductFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  inStock?: boolean;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  tags?: string[];
}

interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  filters: ProductFilters;
}
```

#### Notifications & Promotions
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'order_status' | 'product_restock' | 'promotion' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
  applicableCategories?: string[];
  applicableProducts?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### API Response Types
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### Form Types
```typescript
interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
}

interface CheckoutForm {
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  paymentMethod: 'cod';
  notes?: string;
}
```

#### Return Management
```typescript
interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  customerName: string;
  items: ReturnItem[];
  reason: ReturnReason;
  description: string;
  status: ReturnStatus;
  requestedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  pickupScheduledAt?: Date;
  pickedUpAt?: Date;
  receivedAt?: Date;
  refundedAt?: Date;
  refundAmount: number;
  refundMethod: 'original_payment' | 'store_credit' | 'bank_transfer';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ReturnItem {
  orderItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  originalPrice: number;
  returnQuantity: number;
  returnReason: string;
  condition: 'new' | 'used' | 'damaged';
}

type ReturnReason = 
  | 'defective_product'
  | 'wrong_item_received'
  | 'size_issue'
  | 'quality_issue'
  | 'not_as_described'
  | 'changed_mind'
  | 'duplicate_order'
  | 'other';

type ReturnStatus = 
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'received'
  | 'refunded'
  | 'cancelled';
```

## State Management

### Authentication Context (useAuth)

**Purpose**: Manages user authentication state and provides authentication methods.

**Key Features**:
- User login/logout functionality
- User registration
- Session persistence using localStorage
- Role-based access control
- Password management

**State Structure**:
```typescript
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  debugUsers: () => void;
  resetAuth: () => void;
}
```

**Implementation Details**:
- Uses React Context for global state
- Persists authentication data in localStorage
- Provides sample users for demo purposes
- Handles both sample and dynamic user accounts
- Includes password validation and security features

**Usage Example**:
```typescript
const { user, login, logout, isLoading } = useAuth();

// Login
const handleLogin = async () => {
  const success = await login(email, password);
  if (success) {
    // Redirect to dashboard
  }
};

// Check authentication
if (user) {
  // User is authenticated
}
```

### Shopping Cart Context (useCart)

**Purpose**: Manages shopping cart state and provides cart manipulation methods.

**Key Features**:
- Add/remove items from cart
- Update item quantities
- Calculate totals and item counts
- Persist cart data for both guests and authenticated users
- Stock validation

**State Structure**:
```typescript
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
```

**Implementation Details**:
- Separate cart storage for guests and authenticated users
- Automatic cart key generation for guest sessions
- Real-time total and item count calculations
- Stock validation before adding items
- Toast notifications for user feedback

**Usage Example**:
```typescript
const { cart, addToCart, removeFromCart, getItemCount } = useCart();

// Add item to cart
await addToCart(productId, 2);

// Get cart item count
const itemCount = getItemCount();

// Remove item from cart
removeFromCart(productId);
```

### Wishlist Context (useWishlist)

**Purpose**: Manages user wishlist functionality.

**Key Features**:
- Add/remove items from wishlist
- Check if item is in wishlist
- Persist wishlist data
- Wishlist count tracking

**State Structure**:
```typescript
interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  isLoading: boolean;
}
```

**Implementation Details**:
- Uses localStorage for persistence
- Provides real-time wishlist status
- Includes loading states for async operations
- Toast notifications for user feedback

**Usage Example**:
```typescript
const { wishlist, addToWishlist, isInWishlist, getWishlistCount } = useWishlist();

// Add to wishlist
await addToWishlist(productId);

// Check if in wishlist
const isWishlisted = isInWishlist(productId);

// Get wishlist count
const count = getWishlistCount();
```

### React Query Configuration

**Purpose**: Manages server state and provides caching, synchronization, and background updates.

**Configuration**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

**Key Features**:
- Automatic background refetching
- Cache invalidation
- Optimistic updates
- Error handling
- Loading states

**Usage Example**:
```typescript
const { data: products, isLoading, error } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => fetchProducts(filters),
  staleTime: 5 * 60 * 1000,
});
```

## Component Documentation

### Core Components

#### Navbar Component (`src/components/Navbar.tsx`)

**Purpose**: Main navigation component providing site-wide navigation and user actions.

**Features**:
- Responsive navigation menu
- User authentication status display
- Shopping cart and wishlist indicators
- User profile dropdown menu
- Settings modal with profile and password management
- Search functionality
- Mobile menu with hamburger navigation

**Key Props**: None (uses context for data)

**State Management**:
- `isMenuOpen`: Controls mobile menu visibility
- `showSettings`: Controls settings modal visibility
- `settingsTab`: Manages settings modal tabs
- `isLoading`: Loading states for various actions

**Key Functions**:
- `handleProfileUpdate()`: Updates user profile information
- `handlePasswordUpdate()`: Changes user password
- `handleDeleteAccount()`: Deletes user account
- `getDisplayName()`: Returns user's display name

**Styling**:
- Uses glass morphism effect with backdrop blur
- Sticky positioning with z-index management
- Responsive design with mobile-first approach
- Emerald color scheme with hover effects

**Implementation Details**:
```typescript
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { user, profile, logout } = useAuth();
  const { getItemCount } = useCart();
  const { getWishlistCount } = useWishlist();

  // Settings form handlers
  const handleProfileUpdate = async (e: React.FormEvent) => {
    // Updates profile in localStorage
    // Shows success/error notifications
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    // Validates password requirements
    // Updates password in localStorage
    // Shows success/error notifications
  };

  return (
    <nav className="glass shadow-lg sticky top-0 z-50">
      {/* Navigation content */}
    </nav>
  );
};
```

#### ProductCard Component (`src/components/ProductCard.tsx`)

**Purpose**: Displays individual product information in a card format.

**Features**:
- Product image with hover effects
- Product information (name, description, price)
- Rating display
- Discount badges and pricing
- Add to cart functionality
- Wishlist toggle
- Quick view option
- Stock status indicators

**Props**:
```typescript
interface ProductCardProps {
  product: Product;
  showActions?: boolean; // Default: true
}
```

**Key Functions**:
- `handleAddToCart()`: Adds product to shopping cart
- `handleWishlistToggle()`: Toggles product in wishlist
- `handleCardClick()`: Navigates to product detail page
- `handleQuickView()`: Opens product detail view

**Analytics Integration**:
- Tracks product views on component mount
- Tracks cart additions
- Tracks wishlist additions

**Styling**:
- Card elevation with hover effects
- Glass morphism background
- Responsive image handling
- Badge positioning for discounts and status

**Implementation Details**:
```typescript
const ProductCard = ({ product, showActions = true }: ProductCardProps) => {
  const { addToCart, cart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  // Track product view on mount
  React.useEffect(() => {
    trackProductView(product.id);
  }, [product.id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(product.id, 1);
    trackCartAddition(product.id);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
      trackWishlistAddition(product.id);
    }
  };

  return (
    <Card className="group card-elevated glass hover:shadow-xl">
      {/* Product card content */}
    </Card>
  );
};
```

#### ProductGrid Component (`src/components/ProductGrid.tsx`)

**Purpose**: Displays a grid of products with filtering, search, and pagination.

**Features**:
- Responsive product grid layout
- Product filtering by category, price, and rating
- Search functionality
- Pagination controls
- Loading states
- Empty state handling

**Props**:
```typescript
interface ProductGridProps {
  showFilters?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  itemsPerPage?: number;
  products?: Product[];
}
```

**State Management**:
- `products`: Current product list
- `filteredProducts`: Products after filtering
- `currentPage`: Current pagination page
- `searchQuery`: Current search term
- `selectedCategory`: Selected category filter
- `priceRange`: Selected price range
- `sortBy`: Current sort option

**Key Functions**:
- `handleSearch()`: Filters products by search query
- `handleCategoryFilter()`: Filters by category
- `handlePriceFilter()`: Filters by price range
- `handleSort()`: Sorts products by various criteria
- `handlePageChange()`: Changes pagination page

**Implementation Details**:
```typescript
const ProductGrid = ({ 
  showFilters = true, 
  showSearch = true, 
  showPagination = true,
  itemsPerPage = 12 
}: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating' | 'createdAt'>('name');

  // Filter and search logic
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Apply filters and search
  };

  return (
    <div className="space-y-6">
      {/* Filters and search */}
      {/* Product grid */}
      {/* Pagination */}
    </div>
  );
};
```

#### Hero Component (`src/components/Hero.tsx`)

**Purpose**: Landing page hero section with call-to-action.

**Features**:
- Hero image with overlay
- Compelling headline and description
- Call-to-action buttons
- Responsive design
- Animated elements

**Styling**:
- Full-width hero section
- Gradient overlays
- Typography hierarchy
- Button styling with hover effects

**Implementation Details**:
```typescript
const Hero = () => {
  return (
    <section className="relative h-[600px] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-blue-900/80" />
      <div className="relative z-10 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Transform Your Space
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Discover beautiful furniture that brings comfort and style to your home
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
            Shop Now
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};
```

#### Footer Component (`src/components/Footer.tsx`)

**Purpose**: Site footer with links and information.

**Features**:
- Navigation links
- Social media links
- Company information
- Newsletter signup
- Copyright notice

**Implementation Details**:
```typescript
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company info */}
          {/* Quick links */}
          {/* Contact info */}
          {/* Newsletter signup */}
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p>&copy; 2024 FurniCraft. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
```

### UI Components (Shadcn/ui)

The application uses a comprehensive set of Shadcn/ui components located in `src/components/ui/`. These include:

#### Form Components
- `Button`: Various button styles and states
- `Input`: Text input fields
- `Label`: Form labels
- `Textarea`: Multi-line text input
- `Select`: Dropdown selection
- `Checkbox`: Checkbox inputs
- `RadioGroup`: Radio button groups
- `Switch`: Toggle switches

#### Layout Components
- `Card`: Container with header, content, and footer
- `Dialog`: Modal dialogs
- `Sheet`: Slide-out panels
- `Tabs`: Tabbed interfaces
- `Accordion`: Collapsible content
- `Separator`: Visual dividers

#### Feedback Components
- `Toast`: Notification messages
- `Alert`: Alert messages
- `Badge`: Status indicators
- `Progress`: Progress bars
- `Skeleton`: Loading placeholders

#### Navigation Components
- `Breadcrumb`: Navigation breadcrumbs
- `NavigationMenu`: Complex navigation menus
- `DropdownMenu`: Dropdown menus
- `ContextMenu`: Right-click menus

#### Data Display Components
- `Table`: Data tables
- `Avatar`: User avatars
- `Calendar`: Date picker
- `Carousel`: Image carousels

### Component Usage Patterns

#### Glass Morphism Pattern
```typescript
// Used throughout the application for modern UI effects
<div className="glass shadow-lg backdrop-blur-md border border-emerald-100">
  {/* Content */}
</div>
```

#### Card Elevation Pattern
```typescript
// Used for interactive cards with hover effects
<div className="card-elevated glass hover:shadow-xl transition-all duration-300">
  {/* Card content */}
</div>
```

#### Responsive Design Pattern
```typescript
// Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Grid items */}
</div>
```

#### Loading State Pattern
```typescript
// Consistent loading states across components
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
  </div>
) : (
  // Actual content
)}
```

#### Error State Pattern
```typescript
// Consistent error handling
{error ? (
  <div className="text-center p-8">
    <p className="text-red-600 mb-4">{error}</p>
    <Button onClick={retry}>Try Again</Button>
  </div>
) : (
  // Success content
)}
```

### Component Best Practices

1. **Props Interface**: Always define TypeScript interfaces for component props
2. **Default Props**: Use default parameter values for optional props
3. **Event Handling**: Use proper event types and prevent default when needed
4. **State Management**: Use appropriate state location (local vs global)
5. **Error Boundaries**: Implement error boundaries for complex components
6. **Accessibility**: Include proper ARIA labels and keyboard navigation
7. **Performance**: Use React.memo for expensive components
8. **Styling**: Use consistent class naming and Tailwind utilities

## Page Documentation

### Index Page (`src/pages/Index.tsx`)

**Purpose**: Landing page with hero section, current offers, and featured products.

**Layout Structure**:
1. Navigation bar
2. Hero section with call-to-action
3. Current offers section with promotional cards
4. Featured products grid
5. Footer

**Key Features**:
- Promotional offer cards with countdown timers
- Featured product showcase
- Responsive design
- Call-to-action buttons

**Styling**:
- Stone background color
- Card elevation effects
- Gradient backgrounds for offer cards
- Emerald accent colors

**Implementation Details**:
```typescript
const Index = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <Hero />
      
      {/* Current Offers Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="card-elevated glass p-6 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 mb-4">
            🔥 Current Offers
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-2 hide-scrollbar">
            {/* Offer cards */}
          </div>
        </div>
      </section>
      
      <main className="container mx-auto px-4 py-8">
        <ProductGrid />
      </main>
      
      <Footer />
    </div>
  );
};
```

### Products Page (`src/pages/Products.tsx`)

**Purpose**: Product catalog with filtering and search capabilities.

**Layout Structure**:
1. Navigation bar
2. Page header with title
3. Product grid with filters
4. Footer

**Features**:
- Enhanced product grid with filters
- Search functionality
- Pagination
- Category filtering
- Price range filtering
- Sorting options

**Implementation Details**:
```typescript
const Products = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Our Products
        </h1>
        
        <ProductGrid 
          showFilters={true}
          showSearch={true}
          showPagination={true}
          itemsPerPage={12}
        />
      </div>
      
      <Footer />
    </div>
  );
};
```

### ProductDetail Page (`src/pages/ProductDetail.tsx`)

**Purpose**: Detailed view of individual products.

**Features**:
- Product image gallery
- Detailed product information
- Specifications table
- Add to cart functionality
- Wishlist toggle
- Product reviews
- Related products
- Stock status
- Price and discount display

**Route Parameters**:
- `id`: Product ID or slug

**State Management**:
- Product data loading
- Image gallery state
- Quantity selection
- Review submission

### Cart Page (`src/pages/Cart.tsx`)

**Purpose**: Shopping cart management and checkout initiation.

**Features**:
- Cart item list with quantity controls
- Price calculations (subtotal, tax, total)
- Remove items functionality
- Continue shopping link
- Proceed to checkout button
- Empty cart state
- Cart persistence

**Key Functions**:
- `updateQuantity()`: Updates item quantity
- `removeItem()`: Removes item from cart
- `calculateTotals()`: Calculates order totals
- `proceedToCheckout()`: Navigates to checkout

### Checkout Page (`src/pages/Checkout.tsx`)

**Purpose**: Order completion and payment processing.

**Features**:
- Shipping address form
- Billing address form
- Payment method selection
- Order summary
- Terms and conditions
- Order placement
- Form validation

**Form Validation**:
- Required field validation
- Email format validation
- Phone number validation
- Address validation

### Login Page (`src/pages/Login.tsx`)

**Purpose**: User authentication.

**Features**:
- Email and password form
- Remember me option
- Forgot password link
- Sign up link
- Form validation
- Error handling
- Loading states

**Form Schema**:
```typescript
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});
```

### Signup Page (`src/pages/Signup.tsx`)

**Purpose**: User registration.

**Features**:
- Registration form with validation
- Terms and conditions acceptance
- Password confirmation
- Email verification
- Success/error handling

**Form Schema**:
```typescript
const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val, 'You must accept the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

### Profile Page (`src/pages/Profile.tsx`)

**Purpose**: User profile management.

**Features**:
- Profile information editing
- Address management
- Order history
- Account settings
- Password change
- Account deletion

**Tabs/Sections**:
- Personal Information
- Addresses
- Order History
- Account Settings

### Admin Page (`src/pages/Admin.tsx`)

**Purpose**: Administrative dashboard for managing the e-commerce platform.

**Features**:
- Dashboard statistics
- User management
- Product management
- Order management
- Analytics overview
- Role-based access control

**Access Control**:
- Only accessible to admin users
- Role-based permissions
- Secure routing

### Wishlist Page (`src/pages/Wishlist.tsx`)

**Purpose**: User's saved products.

**Features**:
- Wishlist item display
- Add to cart from wishlist
- Remove from wishlist
- Empty wishlist state
- Product grid layout

### OrderHistory Page (`src/pages/OrderHistory.tsx`)

**Purpose**: User's order tracking and history.

**Features**:
- Order list with status
- Order details view
- Order tracking
- Return requests
- Order filtering

### NotFound Page (`src/pages/NotFound.tsx`)

**Purpose**: 404 error page.

**Features**:
- User-friendly error message
- Navigation back to home
- Search functionality
- Suggested products

## Hook Documentation

### useAuth Hook (`src/hooks/useAuth.tsx`)

**Purpose**: Manages user authentication state and provides authentication methods.

**Context Structure**:
```typescript
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  debugUsers: () => void;
  resetAuth: () => void;
}
```

**Key Functions**:

#### `login(email: string, password: string): Promise<boolean>`
- Validates user credentials
- Updates authentication state
- Persists user data to localStorage
- Returns success/failure status

#### `signup(name: string, email: string, password: string): Promise<boolean>`
- Creates new user account
- Validates email uniqueness
- Stores user data
- Returns success/failure status

#### `logout(): void`
- Clears authentication state
- Removes stored data
- Redirects to home page

#### `debugUsers(): void`
- Development utility
- Logs all available users
- Helps with testing

**Sample Data**:
- Pre-configured admin and test users
- Dynamic user storage in localStorage
- Password management system

### useCart Hook (`src/hooks/useCart.tsx`)

**Purpose**: Manages shopping cart state and operations.

**Context Structure**:
```typescript
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
```

**Key Functions**:

#### `addToCart(productId: string, quantity: number): Promise<void>`
- Validates product existence
- Checks stock availability
- Updates cart state
- Persists to localStorage
- Shows success/error notifications

#### `removeFromCart(productId: string): void`
- Removes item from cart
- Recalculates totals
- Updates localStorage

#### `updateQuantity(productId: string, quantity: number): void`
- Updates item quantity
- Validates stock limits
- Recalculates totals
- Removes item if quantity is 0

#### `clearCart(): void`
- Removes all items from cart
- Resets cart state
- Clears localStorage

**Storage Strategy**:
- Separate carts for guests and authenticated users
- Guest cart uses session-based storage
- Authenticated user cart uses user-specific storage

### useProducts Hook (`src/hooks/useProducts.tsx`)

**Purpose**: Manages product data and provides product-related operations.

**State Structure**:
```typescript
{
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  searchResult: SearchResult | null;
}
```

**Key Functions**:

#### `fetchProducts(filters?, page?, limit?): Promise<void>`
- Loads products from localStorage
- Applies filters
- Handles pagination
- Sets loading states

#### `searchProducts(query, filters?, page?, limit?): Promise<void>`
- Searches products by name and description
- Applies additional filters
- Returns filtered results

#### `fetchProduct(id): Promise<Product | null>`
- Retrieves single product by ID
- Returns null if not found

#### `fetchProductBySlug(slug): Promise<Product | null>`
- Retrieves product by slug
- Used for SEO-friendly URLs

#### `addProductReview(productId, review): Promise<ProductReview>`
- Adds product review
- Handles validation
- Returns review object

**Utility Functions**:
- `getFeaturedProducts()`: Returns featured products
- `getProductsByCategory()`: Filters by category
- `getProductsInStock()`: Returns in-stock products
- `sortProducts()`: Sorts products by various criteria

### useWishlist Hook (`src/hooks/useWishlist.tsx`)

**Purpose**: Manages user wishlist functionality.

**Context Structure**:
```typescript
interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  isLoading: boolean;
}
```

**Key Functions**:

#### `addToWishlist(productId: string): Promise<void>`
- Adds product to wishlist
- Validates product existence
- Persists to localStorage
- Shows success notification

#### `removeFromWishlist(productId: string): void`
- Removes product from wishlist
- Updates localStorage
- Shows success notification

#### `isInWishlist(productId: string): boolean`
- Checks if product is in wishlist
- Returns boolean result

#### `getWishlistCount(): number`
- Returns total number of wishlist items
- Used for badge display

### useMobile Hook (`src/hooks/use-mobile.tsx`)

**Purpose**: Detects mobile devices and provides responsive utilities.

**Returns**:
```typescript
{
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}
```

**Usage**:
- Conditional rendering based on device type
- Responsive component behavior
- Mobile-specific features

## Utility Functions

### Data Initialization (`src/utils/initializeData.ts`)

**Purpose**: Provides sample data for the application during development.

**Key Functions**:

#### `initializeSampleData(): void`
- Initializes sample products, categories, and users
- Stores data in localStorage
- Ensures consistent data structure

#### `getSampleData(): { products, categories, users }`
- Returns all sample data
- Used for data access and manipulation

#### `resetSampleData(): void`
- Clears all sample data
- Resets application to initial state

**Sample Data Structure**:
- **Products**: 20+ furniture items with complete details
- **Categories**: 5 main furniture categories
- **Users**: Admin and test user accounts
- **Pricing**: Realistic pricing with margins

### Order Utilities (`src/utils/orderUtils.ts`)

**Purpose**: Handles order-related business logic and analytics.

**Key Functions**:

#### `trackProductView(productId: string): void`
- Increments product view count
- Updates last viewed timestamp
- Persists analytics data

#### `trackCartAddition(productId: string): void`
- Increments cart addition count
- Updates product analytics

#### `trackWishlistAddition(productId: string): void`
- Increments wishlist addition count
- Updates product analytics

#### `calculateOrderTotals(items, shippingCost, taxRate): OrderTotals`
- Calculates order subtotal, tax, and total
- Handles discount calculations
- Returns structured totals object

### Promotional Utilities (`src/utils/promoUtils.ts`)

**Purpose**: Manages promotional offers and discount calculations.

**Key Functions**:

#### `calculateDiscount(originalPrice, discountPercentage): number`
- Calculates discount amount
- Returns discounted price

#### `validateCoupon(coupon, orderTotal): boolean`
- Validates coupon codes
- Checks expiration and usage limits
- Returns validation result

#### `applyPromotionalRules(order): Order`
- Applies promotional rules to orders
- Handles BOGO offers
- Calculates final pricing

### Return Utilities (`src/utils/returnUtils.ts`)

**Purpose**: Manages return and refund processes.

**Key Functions**:

#### `createReturnRequest(orderId, items, reason): ReturnRequest`
- Creates return request
- Validates return eligibility
- Returns request object

#### `calculateRefundAmount(returnItems): number`
- Calculates refund amount
- Handles partial returns
- Returns refund total

#### `processReturn(returnRequest): void`
- Processes return approval
- Updates order status
- Handles refund processing

## API Layer

### API Client (`src/lib/api.ts`)

**Purpose**: Provides centralized API communication layer.

**Structure**:
- Axios instance configuration
- Request/response interceptors
- Authentication token management
- Error handling

**API Modules**:

#### Authentication API
```typescript
export const authAPI = {
  login: (credentials: LoginForm) => Promise<ApiResponse>,
  register: (userData: RegisterForm) => Promise<ApiResponse>,
  logout: () => Promise<ApiResponse>,
  refreshToken: (token: string) => Promise<ApiResponse>,
  forgotPassword: (email: string) => Promise<ApiResponse>,
  resetPassword: (token: string, password: string) => Promise<ApiResponse>,
  verifyEmail: (token: string) => Promise<ApiResponse>
};
```

#### User API
```typescript
export const userAPI = {
  getProfile: () => Promise<ApiResponse>,
  updateProfile: (data: Partial<UserProfile>) => Promise<ApiResponse>,
  getAddresses: () => Promise<ApiResponse>,
  addAddress: (address: UserAddress) => Promise<ApiResponse>,
  updateAddress: (id: string, address: Partial<UserAddress>) => Promise<ApiResponse>,
  deleteAddress: (id: string) => Promise<ApiResponse>,
  getOrders: () => Promise<ApiResponse>,
  getOrder: (id: string) => Promise<ApiResponse>
};
```

#### Product API
```typescript
export const productAPI = {
  getProducts: (filters?, page?, limit?) => Promise<ApiResponse>,
  getProduct: (id: string) => Promise<ApiResponse>,
  getProductBySlug: (slug: string) => Promise<ApiResponse>,
  getCategories: () => Promise<ApiResponse>,
  getProductReviews: (productId: string, page?, limit?) => Promise<ApiResponse>,
  addProductReview: (productId: string, review: ProductReview) => Promise<ApiResponse>
};
```

#### Cart API
```typescript
export const cartAPI = {
  getCart: () => Promise<ApiResponse>,
  addToCart: (productId: string, quantity: number) => Promise<ApiResponse>,
  updateCartItem: (itemId: string, quantity: number) => Promise<ApiResponse>,
  removeFromCart: (itemId: string) => Promise<ApiResponse>,
  clearCart: () => Promise<ApiResponse>
};
```

#### Order API
```typescript
export const orderAPI = {
  createOrder: (orderData: CheckoutForm) => Promise<ApiResponse>,
  getOrders: (page?, limit?) => Promise<ApiResponse>,
  getOrder: (id: string) => Promise<ApiResponse>,
  cancelOrder: (id: string) => Promise<ApiResponse>,
  requestReturn: (orderId: string, returnData: ReturnRequest) => Promise<ApiResponse>
};
```

#### Admin API
```typescript
export const adminAPI = {
  getDashboardStats: () => Promise<ApiResponse>,
  getUsers: (page?, limit?) => Promise<ApiResponse>,
  updateUser: (id: string, data: Partial<User>) => Promise<ApiResponse>,
  deleteUser: (id: string) => Promise<ApiResponse>,
  getProducts: (filters?, page?, limit?) => Promise<ApiResponse>,
  createProduct: (product: Product) => Promise<ApiResponse>,
  updateProduct: (id: string, product: Partial<Product>) => Promise<ApiResponse>,
  deleteProduct: (id: string) => Promise<ApiResponse>,
  getOrders: (filters?, page?, limit?) => Promise<ApiResponse>,
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<ApiResponse>
};
```

### Response Types

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Styling System

### Tailwind CSS Configuration (`tailwind.config.ts`)

**Purpose**: Configures Tailwind CSS with custom design system.

**Key Features**:
- Custom color palette with CSS variables
- Extended border radius system
- Custom animations
- Container configuration
- Dark mode support

**Color System**:
```typescript
colors: {
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))'
  },
  // ... additional color definitions
}
```

**Custom Animations**:
```typescript
keyframes: {
  'accordion-down': {
    from: { height: '0' },
    to: { height: 'var(--radix-accordion-content-height)' }
  },
  'accordion-up': {
    from: { height: 'var(--radix-accordion-content-height)' },
    to: { height: '0' }
  }
}
```

### Global Styles (`src/index.css`)

**Purpose**: Defines global CSS variables and base styles.

**CSS Variables**:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 142.1 76.2% 36.3%;
  --primary-foreground: 355.7 100% 97.3%;
  /* ... additional variables */
}
```

**Custom Classes**:
- `.glass`: Glass morphism effect
- `.card-elevated`: Card elevation styling
- `.hide-scrollbar`: Hides scrollbars
- `.line-clamp-2`: Text truncation

### Component Styling Patterns

**Glass Morphism**:
```css
.glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
```

**Card Elevation**:
```css
.card-elevated {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-elevated:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
```

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Git for version control

### Installation Steps

1. **Clone the repository**:
```bash
git clone <repository-url>
cd furnicraft5
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open in browser**:
```
http://localhost:8080
```

### Available Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

### Environment Variables

Create `.env` file in root directory:
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=FurniCraft
VITE_APP_VERSION=1.0.0
```

### Development Workflow

1. **Feature Development**:
   - Create feature branch from main
   - Implement feature with TypeScript
   - Add proper error handling
   - Write component tests
   - Update documentation

2. **Code Quality**:
   - Run ESLint: `npm run lint`
   - Follow TypeScript strict mode
   - Use proper component structure
   - Implement error boundaries

3. **Testing**:
   - Unit tests for utilities
   - Component tests for UI
   - Integration tests for flows
   - E2E tests for critical paths

## Deployment

### Build Process

1. **Production Build**:
```bash
npm run build
```

2. **Development Build**:
```bash
npm run build:dev
```

### Deployment Options

#### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Configure build settings
3. Set environment variables
4. Deploy automatically on push

#### Netlify Deployment
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

#### Static Hosting
1. Build the application
2. Upload `dist` folder to hosting provider
3. Configure routing for SPA

### Environment Configuration

**Production Environment**:
```env
VITE_API_URL=https://api.furnicraft.com
VITE_APP_ENV=production
```

**Staging Environment**:
```env
VITE_API_URL=https://staging-api.furnicraft.com
VITE_APP_ENV=staging
```

## Best Practices

### Code Organization

1. **File Structure**:
   - Group related files together
   - Use consistent naming conventions
   - Separate concerns (UI, logic, data)

2. **Component Structure**:
   - One component per file
   - Export default components
   - Use TypeScript interfaces for props

3. **Import Organization**:
   - React imports first
   - Third-party libraries
   - Internal components
   - Utilities and types

### Performance Optimization

1. **React Optimization**:
   - Use React.memo for expensive components
   - Implement useCallback for event handlers
   - Use useMemo for expensive calculations
   - Lazy load components and routes

2. **Bundle Optimization**:
   - Code splitting with React.lazy
   - Tree shaking for unused code
   - Optimize images and assets
   - Use CDN for static assets

3. **State Management**:
   - Minimize re-renders
   - Use appropriate state location
   - Implement proper memoization
   - Avoid prop drilling

### Security Best Practices

1. **Authentication**:
   - Secure token storage
   - Implement token refresh
   - Validate user permissions
   - Sanitize user inputs

2. **Data Protection**:
   - Encrypt sensitive data
   - Validate API responses
   - Implement CSRF protection
   - Use HTTPS in production

3. **Error Handling**:
   - Graceful error handling
   - User-friendly error messages
   - Log errors for debugging
   - Implement error boundaries

### Accessibility

1. **ARIA Labels**:
   - Use proper ARIA attributes
   - Implement keyboard navigation
   - Provide alt text for images
   - Use semantic HTML elements

2. **Color Contrast**:
   - Ensure sufficient color contrast
   - Don't rely solely on color
   - Test with screen readers
   - Provide focus indicators

### Testing Strategy

1. **Unit Tests**:
   - Test utility functions
   - Test custom hooks
   - Test component logic
   - Mock external dependencies

2. **Integration Tests**:
   - Test component interactions
   - Test form submissions
   - Test API integrations
   - Test user flows

3. **E2E Tests**:
   - Test critical user journeys
   - Test checkout process
   - Test authentication flows
   - Test responsive design

### Documentation Standards

1. **Code Documentation**:
   - JSDoc comments for functions
   - TypeScript interfaces for data
   - README files for components
   - API documentation

2. **Component Documentation**:
   - Props interface
   - Usage examples
   - Styling guidelines
   - Accessibility notes

3. **Architecture Documentation**:
   - System overview
   - Data flow diagrams
   - Component hierarchy
   - State management patterns

---

## Conclusion

This comprehensive documentation provides everything a new developer needs to understand, develop, and maintain the FurniCraft e-commerce application. The documentation covers all aspects from architecture to deployment, ensuring a complete understanding of the codebase and development practices.

### Key Takeaways

1. **Modern Tech Stack**: React 18, TypeScript, Vite, and Tailwind CSS
2. **Component-Based Architecture**: Modular, reusable components
3. **State Management**: Context API for global state, React Query for server state
4. **Type Safety**: Comprehensive TypeScript interfaces
5. **Responsive Design**: Mobile-first approach with modern UI
6. **Performance**: Optimized for speed and user experience
7. **Scalability**: Designed for growth and feature expansion
8. **Maintainability**: Clean code structure and documentation

### Next Steps

1. **Set up development environment**
2. **Review component structure**
3. **Understand state management patterns**
4. **Implement new features following established patterns**
5. **Contribute to documentation updates**
6. **Follow best practices for code quality**

This documentation serves as a complete guide for developers to build, maintain, and extend the FurniCraft e-commerce platform successfully. 