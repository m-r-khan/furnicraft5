# FurniCraft E-Commerce Application - Complete Documentation

## Project Overview

**FurniCraft** is a modern, full-featured e-commerce application built with React, TypeScript, and Vite. It's designed to sell furniture and home decor items with comprehensive user management, product catalog, shopping cart, and admin functionality.

### Key Features
- **User Authentication & Authorization**: Complete user management with role-based access (Customer, Premium, Admin, Manager)
- **Product Catalog**: Comprehensive product browsing with filtering, search, and pagination
- **Shopping Cart**: Persistent cart functionality for both guests and authenticated users
- **Wishlist**: Save favorite products for later
- **Order Management**: Complete order lifecycle from cart to delivery
- **Admin Dashboard**: Comprehensive admin interface for managing products, orders, and users
- **Responsive Design**: Mobile-first design with modern UI components
- **Analytics Tracking**: Product views, cart additions, wishlist additions, and purchases

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

### State Management
- **React Context API**: For global state management
- **React Query (TanStack Query)**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation

### Development Tools
- **ESLint**: Code linting and formatting
- **TypeScript ESLint**: TypeScript-specific linting rules
- **SWC**: Fast JavaScript/TypeScript compiler

## Project Structure

```
furnicraft5/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Shadcn/ui components (40+ components)
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
│   ├── pages/             # Route components (12 pages)
│   ├── types/             # TypeScript type definitions
│   ├── lib/               # Utility libraries
│   ├── utils/             # Business logic utilities
│   └── App.tsx            # Main application component
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Core Components

### 1. Navbar Component (`src/components/Navbar.tsx`)
**Purpose**: Main navigation with user authentication, cart, wishlist, and settings
**Features**:
- Responsive navigation menu
- User authentication status display
- Shopping cart and wishlist indicators
- User profile dropdown with settings modal
- Mobile hamburger menu
- Search functionality

**Key Functions**:
- `handleProfileUpdate()`: Updates user profile
- `handlePasswordUpdate()`: Changes user password
- `handleDeleteAccount()`: Deletes user account
- `getDisplayName()`: Returns user's display name

### 2. ProductCard Component (`src/components/ProductCard.tsx`)
**Purpose**: Displays individual product information in a card format
**Features**:
- Product image with hover effects
- Product information (name, description, price)
- Rating display and discount badges
- Add to cart and wishlist functionality
- Quick view option
- Stock status indicators
- Analytics tracking (views, cart additions, wishlist additions)

**Props**:
```typescript
interface ProductCardProps {
  product: Product;
  showActions?: boolean; // Default: true
}
```

### 3. ProductGrid Component (`src/components/ProductGrid.tsx`)
**Purpose**: Displays a grid of products with filtering, search, and pagination
**Features**:
- Responsive product grid layout
- Product filtering by category, price, and rating
- Search functionality
- Pagination controls
- Loading states and empty state handling

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

### 4. Hero Component (`src/components/Hero.tsx`)
**Purpose**: Landing page hero section with call-to-action
**Features**:
- Hero image with gradient overlay
- Compelling headline and description
- Call-to-action buttons
- Responsive design with animations

### 5. Footer Component (`src/components/Footer.tsx`)
**Purpose**: Site footer with links and information
**Features**:
- Navigation links and social media
- Company information
- Newsletter signup
- Copyright notice

## State Management

### 1. Authentication Context (useAuth)
**Purpose**: Manages user authentication state and provides authentication methods

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

**Key Features**:
- User login/logout functionality
- User registration with validation
- Session persistence using localStorage
- Role-based access control (Customer, Premium, Admin, Manager)
- Password management and security features
- Sample users for demo purposes

### 2. Shopping Cart Context (useCart)
**Purpose**: Manages shopping cart state and operations

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

**Key Features**:
- Add/remove items from cart
- Update item quantities with stock validation
- Calculate totals and item counts in real-time
- Persist cart data for both guests and authenticated users
- Separate cart storage for different user types
- Toast notifications for user feedback

### 3. Wishlist Context (useWishlist)
**Purpose**: Manages user wishlist functionality

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

**Key Features**:
- Add/remove items from wishlist
- Check if item is in wishlist
- Persist wishlist data in localStorage
- Wishlist count tracking for badges
- Loading states and user feedback

### 4. Products Hook (useProducts)
**Purpose**: Manages product data and provides product-related operations

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
- `fetchProducts()`: Loads products with filtering and pagination
- `searchProducts()`: Searches products by name and description
- `fetchProduct()`: Retrieves single product by ID
- `fetchProductBySlug()`: Retrieves product by slug for SEO
- `addProductReview()`: Adds product reviews
- Utility functions for filtering and sorting

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
```

#### Product Management
```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  purchaseCost: number;
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
  // Analytics tracking
  viewCount: number;
  cartAdditions: number;
  wishlistAdditions: number;
  purchaseCount: number;
  lastViewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Shopping Cart
```typescript
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

interface CartItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Order Management
```typescript
type OrderStatus = 
  | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered'
  | 'cancelled' | 'return_requested' | 'return_approved' | 'return_rejected'
  | 'return_pickup_scheduled' | 'return_picked_up' | 'return_received'
  | 'returned' | 'refunded';

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
```

## Pages

### 1. Index Page (`src/pages/Index.tsx`)
**Purpose**: Landing page with hero section, current offers, and featured products
**Features**:
- Hero section with call-to-action
- Current offers section with promotional cards
- Featured products grid
- Responsive design with stone background

### 2. Products Page (`src/pages/Products.tsx`)
**Purpose**: Product catalog with filtering and search capabilities
**Features**:
- Enhanced product grid with filters
- Search functionality and pagination
- Category and price range filtering
- Sorting options

### 3. ProductDetail Page (`src/pages/ProductDetail.tsx`)
**Purpose**: Detailed view of individual products
**Features**:
- Product image gallery
- Detailed product information and specifications
- Add to cart and wishlist functionality
- Product reviews and related products
- Stock status and pricing display

### 4. Cart Page (`src/pages/Cart.tsx`)
**Purpose**: Shopping cart management and checkout initiation
**Features**:
- Cart item list with quantity controls
- Price calculations (subtotal, tax, total)
- Remove items functionality
- Continue shopping and checkout buttons
- Empty cart state

### 5. Checkout Page (`src/pages/Checkout.tsx`)
**Purpose**: Order completion and payment processing
**Features**:
- Shipping and billing address forms
- Payment method selection
- Order summary and terms acceptance
- Form validation and order placement

### 6. Login Page (`src/pages/Login.tsx`)
**Purpose**: User authentication
**Features**:
- Email and password form with validation
- Remember me option
- Forgot password and sign up links
- Error handling and loading states

### 7. Signup Page (`src/pages/Signup.tsx`)
**Purpose**: User registration
**Features**:
- Registration form with comprehensive validation
- Terms and conditions acceptance
- Password confirmation
- Email verification process

### 8. Profile Page (`src/pages/Profile.tsx`)
**Purpose**: User profile management
**Features**:
- Profile information editing
- Address management
- Order history and tracking
- Account settings and password change

### 9. Admin Page (`src/pages/Admin.tsx`)
**Purpose**: Administrative dashboard
**Features**:
- Dashboard statistics and analytics
- User management
- Product management
- Order management
- Role-based access control

### 10. Wishlist Page (`src/pages/Wishlist.tsx`)
**Purpose**: User's saved products
**Features**:
- Wishlist item display
- Add to cart from wishlist
- Remove from wishlist
- Empty wishlist state

### 11. OrderHistory Page (`src/pages/OrderHistory.tsx`)
**Purpose**: User's order tracking and history
**Features**:
- Order list with status
- Order details view
- Order tracking
- Return requests

### 12. NotFound Page (`src/pages/NotFound.tsx`)
**Purpose**: 404 error page
**Features**:
- User-friendly error message
- Navigation back to home
- Search functionality
- Suggested products

## Utility Functions

### 1. Data Initialization (`src/utils/initializeData.ts`)
**Purpose**: Provides sample data for development
**Key Functions**:
- `initializeSampleData()`: Initializes sample products, categories, and users
- `getSampleData()`: Returns all sample data
- `resetSampleData()`: Clears all sample data

**Sample Data**:
- 20+ furniture products with complete details
- 5 main furniture categories
- Admin and test user accounts
- Realistic pricing with margins

### 2. Order Utilities (`src/utils/orderUtils.ts`)
**Purpose**: Handles order-related business logic and analytics
**Key Functions**:
- `trackProductView()`: Increments product view count
- `trackCartAddition()`: Tracks cart additions
- `trackWishlistAddition()`: Tracks wishlist additions
- `calculateOrderTotals()`: Calculates order totals

### 3. Promotional Utilities (`src/utils/promoUtils.ts`)
**Purpose**: Manages promotional offers and discount calculations
**Key Functions**:
- `calculateDiscount()`: Calculates discount amounts
- `validateCoupon()`: Validates coupon codes
- `applyPromotionalRules()`: Applies promotional rules

### 4. Return Utilities (`src/utils/returnUtils.ts`)
**Purpose**: Manages return and refund processes
**Key Functions**:
- `createReturnRequest()`: Creates return requests
- `calculateRefundAmount()`: Calculates refund amounts
- `processReturn()`: Processes return approvals

## API Layer

### API Client (`src/lib/api.ts`)
**Purpose**: Provides centralized API communication layer
**Structure**:
- Axios instance configuration
- Request/response interceptors
- Authentication token management
- Error handling

**API Modules**:
- **Authentication API**: Login, register, logout, password management
- **User API**: Profile management, addresses, orders
- **Product API**: Products, categories, reviews
- **Cart API**: Cart management operations
- **Order API**: Order creation, management, returns
- **Admin API**: Dashboard, user management, product management

**Response Types**:
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

## Styling System

### Tailwind CSS Configuration
**Purpose**: Configures Tailwind CSS with custom design system
**Features**:
- Custom color palette with CSS variables
- Extended border radius system
- Custom animations (accordion, etc.)
- Container configuration
- Dark mode support

### Global Styles (`src/index.css`)
**Purpose**: Defines global CSS variables and base styles
**Custom Classes**:
- `.glass`: Glass morphism effect
- `.card-elevated`: Card elevation styling
- `.hide-scrollbar`: Hides scrollbars
- `.line-clamp-2`: Text truncation

### Component Styling Patterns
- **Glass Morphism**: Modern UI effects with backdrop blur
- **Card Elevation**: Interactive cards with hover effects
- **Responsive Design**: Mobile-first approach
- **Loading States**: Consistent loading indicators
- **Error States**: User-friendly error handling

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn package manager
- Git for version control

### Installation Steps
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open in browser: `http://localhost:8080`

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
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=FurniCraft
VITE_APP_VERSION=1.0.0
```

## Deployment

### Build Process
1. **Production Build**: `npm run build`
2. **Development Build**: `npm run build:dev`

### Deployment Options
- **Vercel**: Connect GitHub repository, configure build settings
- **Netlify**: Set build command and publish directory
- **Static Hosting**: Upload `dist` folder to hosting provider

### Environment Configuration
- **Production**: `VITE_API_URL=https://api.furnicraft.com`
- **Staging**: `VITE_API_URL=https://staging-api.furnicraft.com`

## Best Practices

### Code Organization
1. **File Structure**: Group related files, use consistent naming
2. **Component Structure**: One component per file, TypeScript interfaces
3. **Import Organization**: React first, then third-party, internal, utilities

### Performance Optimization
1. **React Optimization**: React.memo, useCallback, useMemo, lazy loading
2. **Bundle Optimization**: Code splitting, tree shaking, asset optimization
3. **State Management**: Minimize re-renders, appropriate state location

### Security Best Practices
1. **Authentication**: Secure token storage, token refresh, permission validation
2. **Data Protection**: Encrypt sensitive data, validate API responses
3. **Error Handling**: Graceful error handling, user-friendly messages

### Accessibility
1. **ARIA Labels**: Proper ARIA attributes, keyboard navigation
2. **Color Contrast**: Sufficient contrast, don't rely solely on color
3. **Screen Readers**: Test with screen readers, provide focus indicators

### Testing Strategy
1. **Unit Tests**: Utility functions, custom hooks, component logic
2. **Integration Tests**: Component interactions, form submissions, API integration
3. **E2E Tests**: Critical user journeys, checkout process, authentication flows

### Documentation Standards
1. **Code Documentation**: JSDoc comments, TypeScript interfaces, README files
2. **Component Documentation**: Props interface, usage examples, styling guidelines
3. **Architecture Documentation**: System overview, data flow diagrams, component hierarchy

## Key Features Summary

### User Management
- **Multi-role System**: Customer, Premium, Admin, Manager roles
- **Authentication**: Login, registration, password management
- **Profile Management**: Personal information, addresses, preferences
- **Session Management**: Persistent sessions with localStorage

### Product Management
- **Product Catalog**: Comprehensive product browsing
- **Search & Filtering**: Advanced search with multiple filters
- **Categories**: Organized product categorization
- **Inventory Management**: Stock tracking and alerts
- **Analytics**: Product views, cart additions, wishlist additions

### Shopping Experience
- **Shopping Cart**: Persistent cart for guests and users
- **Wishlist**: Save favorite products
- **Product Reviews**: User-generated reviews and ratings
- **Pricing System**: Support for discounts and promotional offers

### Order Management
- **Order Processing**: Complete order lifecycle
- **Payment Methods**: COD, card, bank transfer support
- **Order Tracking**: Real-time order status updates
- **Return Management**: Complete return and refund workflow

### Admin Features
- **Dashboard**: Analytics and statistics
- **User Management**: User administration and role management
- **Product Management**: Add, edit, delete products
- **Order Management**: Process orders and manage returns

### Technical Features
- **Responsive Design**: Mobile-first approach
- **Performance**: Optimized for speed and user experience
- **Type Safety**: Comprehensive TypeScript implementation
- **Modern UI**: Glass morphism, animations, modern design patterns
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## Conclusion

This comprehensive documentation provides everything a new developer needs to understand, develop, and maintain the FurniCraft e-commerce application. The application is built with modern technologies, follows best practices, and is designed for scalability and maintainability.

### Key Strengths
1. **Modern Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS
2. **Component-Based Architecture**: Modular, reusable components
3. **Comprehensive State Management**: Context API and React Query
4. **Type Safety**: Full TypeScript implementation
5. **Responsive Design**: Mobile-first approach
6. **Performance Optimized**: Fast loading and smooth interactions
7. **Scalable Architecture**: Designed for growth and feature expansion
8. **Well-Documented**: Comprehensive documentation and code comments

### Development Guidelines
1. Follow established patterns and conventions
2. Use TypeScript for all new code
3. Implement proper error handling
4. Write tests for critical functionality
5. Maintain accessibility standards
6. Follow performance best practices
7. Update documentation as needed

This documentation serves as a complete guide for developers to successfully build, maintain, and extend the FurniCraft e-commerce platform. 