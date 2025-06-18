import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Truck, Shield, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    cart, 
    isLoading, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    getTotal, 
    getItemCount 
  } = useCart();

  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(productId);
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      removeFromCart(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    try {
      clearCart();
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-8 w-32 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-300 w-24 h-24 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                        <div className="bg-gray-300 h-4 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 h-64"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Empty cart state
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-md p-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">🛒</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
              <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
              <Button asChild className="w-full">
                <Link to="/products">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = getTotal();
  const shipping = subtotal > 5000 ? 0 : 500; // Free shipping over ₹5000
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
          <Badge variant="secondary" className="ml-2">
            {getItemCount()} items
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Shopping Cart</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-700"
                  >
                    Clear Cart
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map(item => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.product?.image ? (
                        <img 
                          src={item.product.image} 
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-gray-400 text-2xl">🪑</div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {item.product?.name || 'Product Name'}
                      </h3>
                      <p className="text-gray-600 text-sm truncate">
                        {item.product?.shortDescription || 'Product description'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-emerald-700 font-semibold">
                          ₹{item.price.toLocaleString()}
                        </span>
                        {item.product?.originalPrice && item.product.originalPrice > item.price && (
                          <span className="text-gray-500 text-sm line-through">
                            ₹{item.product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        disabled={updatingItems.has(item.productId) || item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="font-semibold px-3 py-1 bg-gray-100 rounded min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        disabled={updatingItems.has(item.productId) || (item.product && item.quantity >= item.product.stockQuantity)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                    
                    {/* Item Total */}
                    <div className="text-right min-w-[100px]">
                      <div className="font-semibold text-gray-800">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        ₹{item.price.toLocaleString()} each
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.productId)}
                      disabled={updatingItems.has(item.productId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({getItemCount()} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600' : ''}>
                      {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <div className="text-xs text-gray-500">
                      Free shipping on orders over ₹5,000
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-emerald-700">₹{total.toLocaleString()}</span>
                </div>
                
                {/* Shipping Info */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck size={16} className="text-emerald-600" />
                    <span>Free delivery within city limits</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={16} className="text-emerald-600" />
                    <span>3-5 business days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield size={16} className="text-emerald-600" />
                    <span>1 year warranty included</span>
                  </div>
                </div>
                
                {/* Checkout Button */}
                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-emerald-700 hover:bg-emerald-800"
                  size="lg"
                >
                  {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                </Button>
                
                {!user && (
                  <p className="text-xs text-gray-500 text-center">
                    You need to be logged in to complete your purchase
                  </p>
                )}
                
                {/* Continue Shopping */}
                <Button variant="outline" asChild className="w-full">
                  <Link to="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;
