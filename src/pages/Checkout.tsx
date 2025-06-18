import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, CreditCard, Truck, Shield, Clock, Tag, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { CheckoutForm } from '../types';
import { createOrder, addOrderToHistory, updateProductStock, validateStockAvailability } from '../utils/orderUtils';
import { validatePromoCode, calculateDiscount, applyPromoCode } from '../utils/promoUtils';
import { Coupon } from '../types';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, profile } = useAuth();
  const { cart, getTotal, getItemCount, clearCart } = useCart();
  
  const [formData, setFormData] = useState<CheckoutForm>({
    shippingAddress: {
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
    phone: '',
    },
    paymentMethod: 'cod',
    notes: '',
  });
  
  const [useBillingAddress, setUseBillingAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Coupon | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Load user addresses
  useEffect(() => {
    const loadAddresses = async () => {
      if (user) {
        try {
          // Set sample addresses
          const sampleAddresses = [
            {
              id: '1',
              firstName: 'John',
              lastName: 'Doe',
              addressLine1: '123 Main Street',
              addressLine2: 'Apt 4B',
              city: 'Mumbai',
              state: 'Maharashtra',
              postalCode: '400001',
              phone: '+91 98765 43210',
              isDefault: true
            },
            {
              id: '2',
              firstName: 'John',
              lastName: 'Doe',
              addressLine1: '456 Office Complex',
              addressLine2: 'Floor 2',
              city: 'Mumbai',
              state: 'Maharashtra',
              postalCode: '400002',
              phone: '+91 98765 43211',
              isDefault: false
            }
          ];
          
          setUserAddresses(sampleAddresses);
          const defaultAddress = sampleAddresses.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            setFormData(prev => ({
              ...prev,
              shippingAddress: {
                firstName: defaultAddress.firstName || '',
                lastName: defaultAddress.lastName || '',
                addressLine1: defaultAddress.addressLine1,
                addressLine2: defaultAddress.addressLine2 || '',
                city: defaultAddress.city,
                state: defaultAddress.state,
                postalCode: defaultAddress.postalCode,
                phone: defaultAddress.phone || '',
              }
            }));
          }
        } catch (error) {
          console.error('Error loading addresses:', error);
        }
      }
    };

    loadAddresses();
  }, [user]);

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    // Wait for authentication to finish loading before checking user state
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
      return;
    }
  }, [user, cart, navigate, authLoading]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [field]: value
      }
    }));
  };

  const handleBillingAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value
      }
    }));
  };

  const handleAddressSelect = (address: any) => {
    setSelectedAddressId(address.id);
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        firstName: address.firstName || '',
        lastName: address.lastName || '',
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        phone: address.phone || '',
      }
    }));
  };

  // Promo code handlers
  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setIsApplyingPromo(true);
    setPromoError('');

    try {
      const subtotal = getTotal();
      const categoryIds = cart.items.map(item => item.product?.categoryId).filter(Boolean);
      const productIds = cart.items.map(item => item.productId);

      const validation = validatePromoCode(promoCode, subtotal, categoryIds, productIds);

      if (validation.isValid && validation.promo) {
        setAppliedPromo(validation.promo);
        setPromoCode('');
        toast.success('Promo code applied successfully!');
      } else {
        setPromoError(validation.message);
        toast.error(validation.message);
      }
    } catch (error) {
      setPromoError('Failed to apply promo code');
      toast.error('Failed to apply promo code');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedPromo(null);
    setPromoError('');
    toast.success('Promo code removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Validate stock availability
    const stockValidation = validateStockAvailability(cart);
    if (!stockValidation.isValid) {
      toast.error('Stock validation failed');
      stockValidation.errors.forEach(error => {
        toast.error(error);
      });
      return;
    }

    setIsLoading(true);

    try {
      // Apply promo code if available
      let discount = 0;
      if (appliedPromo) {
        const subtotal = getTotal();
        discount = calculateDiscount(appliedPromo, subtotal);
        applyPromoCode(appliedPromo.code);
      }

      // Create order
      const orderFormData = {
        ...formData,
        shippingAddress: {
          ...formData.shippingAddress,
          addressLine2: formData.shippingAddress.addressLine2 || ''
        }
      };
      
      // Use user's profile name if available, otherwise use shipping address name
      const customerName = profile && profile.firstName && profile.lastName 
        ? `${profile.firstName} ${profile.lastName}`
        : `${formData.shippingAddress.firstName} ${formData.shippingAddress.lastName}`;
      
      const order = createOrder(cart, orderFormData, user.email, customerName, discount, appliedPromo);
      
      // Add order to user's history
      addOrderToHistory(user.email, order);
      
      // Clear cart
      clearCart();
      
      // Show success message
      toast.success('Order placed successfully!');
      
      // Navigate to order success page with order details
      navigate('/order-success', { 
        state: { 
          order: order,
          orderNumber: order.orderNumber 
        } 
      });
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !cart || cart.items.length === 0) {
    return null;
  }

  const subtotal = getTotal();
  const shipping = subtotal > 5000 ? 0 : 500;
  const discount = appliedPromo ? calculateDiscount(appliedPromo, subtotal) : 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="ghost" onClick={() => navigate('/cart')}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
        </div>
        
        <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Saved Addresses */}
              {userAddresses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Addresses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {userAddresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAddressId === address.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleAddressSelect(address)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">
                              {address.firstName} {address.lastName}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {address.addressLine1}
                              {address.addressLine2 && <>, {address.addressLine2}</>}
                            </div>
                            <div className="text-sm text-gray-600">
                              {address.city}, {address.state} {address.postalCode}
                            </div>
                            {address.phone && (
                              <div className="text-sm text-gray-600">
                                {address.phone}
                              </div>
                            )}
                          </div>
                          {address.isDefault && (
                            <Badge variant="secondary" className="ml-2">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin size={20} />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.shippingAddress.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
              <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.shippingAddress.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
                    </div>
              </div>
              
              <div>
                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                    <Input
                      id="addressLine1"
                      value={formData.shippingAddress.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  required
                />
              </div>
              
              <div>
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={formData.shippingAddress.addressLine2}
                      onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                />
              </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.shippingAddress.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.shippingAddress.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        value={formData.shippingAddress.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        required
                      />
                    </div>
                  </div>
              
              <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.shippingAddress.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} />
                    Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="useBilling"
                      checked={useBillingAddress}
                      onCheckedChange={(checked) => setUseBillingAddress(checked as boolean)}
                    />
                    <Label htmlFor="useBilling">Use different billing address</Label>
                  </div>
                  
                  {useBillingAddress && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billingFirstName">First Name *</Label>
                          <Input
                            id="billingFirstName"
                            value={formData.billingAddress?.firstName || ''}
                            onChange={(e) => handleBillingAddressChange('firstName', e.target.value)}
                            required={useBillingAddress}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingLastName">Last Name *</Label>
                          <Input
                            id="billingLastName"
                            value={formData.billingAddress?.lastName || ''}
                            onChange={(e) => handleBillingAddressChange('lastName', e.target.value)}
                            required={useBillingAddress}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="billingAddressLine1">Address Line 1 *</Label>
                        <Input
                          id="billingAddressLine1"
                          value={formData.billingAddress?.addressLine1 || ''}
                          onChange={(e) => handleBillingAddressChange('addressLine1', e.target.value)}
                          required={useBillingAddress}
                />
              </div>
              
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="billingCity">City *</Label>
                          <Input
                            id="billingCity"
                            value={formData.billingAddress?.city || ''}
                            onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                            required={useBillingAddress}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingState">State *</Label>
                          <Input
                            id="billingState"
                            value={formData.billingAddress?.state || ''}
                            onChange={(e) => handleBillingAddressChange('state', e.target.value)}
                            required={useBillingAddress}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingPostalCode">Postal Code *</Label>
                          <Input
                            id="billingPostalCode"
                            value={formData.billingAddress?.postalCode || ''}
                            onChange={(e) => handleBillingAddressChange('postalCode', e.target.value)}
                            required={useBillingAddress}
                          />
                        </div>
                </div>
              </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Any special instructions for delivery..."
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </CardContent>
              </Card>
          </div>
          
          {/* Order Summary */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.product?.image ? (
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                            <div className="text-gray-400 text-sm">🪑</div>
                    )}
                  </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 truncate">
                            {item.product?.name || 'Product Name'}
                          </h4>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                          <p className="font-medium text-gray-800">
                            ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator />

            {/* Promo Code Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-emerald-600" />
                <span className="font-medium text-gray-800">Promo Code</span>
              </div>
              
              {appliedPromo ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                        {appliedPromo.code}
                      </Badge>
                      <span className="text-sm text-emerald-700">
                        {appliedPromo.type === 'percentage' ? `${appliedPromo.value}% off` : `₹${appliedPromo.value} off`}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePromoCode}
                      className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-800"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">
                    Discount: ₹{discount.toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleApplyPromoCode}
                      disabled={isApplyingPromo || !promoCode.trim()}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isApplyingPromo ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-red-600">{promoError}</p>
                  )}
                </div>
              )}
            </div>
            
            <Separator />

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
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>Discount ({appliedPromo?.code})</span>
                        <span>-₹{discount.toLocaleString()}</span>
                      </div>
                    )}
                    {shipping > 0 && (
                      <p className="text-xs text-gray-500">
                        Free shipping on orders over ₹5,000
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-emerald-700">₹{total.toLocaleString()}</span>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard size={16} className="text-blue-600" />
                      <span className="font-medium text-blue-800">Cash on Delivery (COD)</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      Pay when your order is delivered to your doorstep.
                    </p>
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
              
                  {/* Place Order Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-700 hover:bg-emerald-800"
                    size="lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Placing Order...
              </div>
                    ) : (
                      `Place Order - ₹${total.toLocaleString()}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;
