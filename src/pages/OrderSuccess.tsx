import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ExtendedOrder } from '../utils/orderUtils';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Clock, 
  MapPin, 
  CreditCard, 
  Home, 
  ShoppingBag,
  Download,
  Share2,
  Heart,
  Star,
  ArrowRight,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<ExtendedOrder | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [estimatedDelivery, setEstimatedDelivery] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get order data from navigation state
    const orderData = location.state?.order as ExtendedOrder;
    const orderNum = location.state?.orderNumber as string;
    
    if (orderData && orderNum) {
      setOrder(orderData);
      setOrderNumber(orderNum);
      
      // Calculate estimated delivery (3-5 business days)
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 3 + Math.floor(Math.random() * 3));
      setEstimatedDelivery(deliveryDate);
    } else {
      // If no order data, redirect to home
      toast.error('Order information not found');
      navigate('/');
      return;
    }
    
    setIsLoading(false);
  }, [location.state, navigate]);

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleViewOrder = () => {
    navigate('/order-history');
  };

  const handleDownloadInvoice = () => {
    // Create a simple invoice download
    const invoiceContent = `
Order Invoice
=============

Order Number: ${orderNumber}
Date: ${order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
Customer: ${order?.customer?.name || 'N/A'}

Items:
${order?.items.map(item => `- ${item.name} x${item.quantity} - ₹${item.price.toLocaleString()}`).join('\n')}

Total: ₹${order?.total.toLocaleString() || 'N/A'}

Thank you for your purchase!
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Invoice downloaded successfully!');
  };

  const handleShareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Order Confirmation',
        text: `I just placed an order #${orderNumber} on FurniCraft!`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Order #${orderNumber} - ${window.location.href}`);
      toast.success('Order link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-8 w-64 rounded mb-8"></div>
            <div className="bg-gray-300 h-96 rounded-lg"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-xl text-gray-600 mb-4">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
              Order #{orderNumber}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
              ₹{order.total.toLocaleString()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🪑</span>
                        </div>
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{item.price.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">each</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{order.subtotal?.toLocaleString() || order.total.toLocaleString()}</span>
                  </div>
                  {order.shippingCost && (
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>₹{order.shippingCost.toLocaleString()}</span>
                    </div>
                  )}
                  {order.tax && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>₹{order.tax.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Shipping Address
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{order.shippingAddress.street}</p>
                      <p className="text-gray-600">
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </p>
                      <p className="text-gray-600">PIN: {order.shippingAddress.pincode}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Estimated Delivery
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-medium text-blue-800">
                        {estimatedDelivery?.toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        (3-5 business days)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-semibold">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <Badge className={order.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleContinueShopping}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
                
                <Button 
                  onClick={handleViewOrder}
                  variant="outline"
                  className="w-full"
                >
                  <Package className="h-4 w-4 mr-2" />
                  View Order History
                </Button>
                
                <Button 
                  onClick={handleDownloadInvoice}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                
                <Button 
                  onClick={handleShareOrder}
                  variant="outline"
                  className="w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Order
                </Button>
              </CardContent>
            </Card>

            {/* Customer Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Call Us</p>
                    <p className="text-sm text-gray-500">+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-gray-500">support@furnicraft.com</p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/contact')}
                  variant="outline"
                  className="w-full"
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Order Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Track Your Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Order Placed</p>
                      <p className="text-sm text-gray-500">Order confirmed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">Processing</p>
                      <p className="text-sm text-gray-500">Preparing your order</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Truck className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">Shipped</p>
                      <p className="text-sm text-gray-500">On its way to you</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">Delivered</p>
                      <p className="text-sm text-gray-500">Enjoy your purchase!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Love your new furniture?
            </h2>
            <p className="text-gray-600 mb-6">
              Share your experience and help others discover great products!
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => navigate('/products')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Star className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
              <Button 
                onClick={() => navigate('/products')}
                variant="outline"
              >
                <Heart className="h-4 w-4 mr-2" />
                Browse More
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderSuccess; 