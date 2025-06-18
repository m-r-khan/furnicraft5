import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Users, Truck, Clock, CheckCircle, AlertCircle, 
  ShoppingBag, Calendar, MapPin, CreditCard, Eye, ArrowLeft, X, XCircle, RotateCcw, DollarSign
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { getUserOrderHistory, ExtendedOrder, OrderItem, updateOrderStatus, formatDate } from '../utils/orderUtils';
import { Order } from '../types';
import { isOrderEligibleForReturn, createReturnRequest } from '../utils/returnUtils';
import { ReturnItem, ReturnReason } from '../types';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [orderToCancel, setOrderToCancel] = useState<ExtendedOrder | null>(null);

  // Return request state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<ExtendedOrder | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [returnReason, setReturnReason] = useState<ReturnReason>('defective_product');
  const [returnDescription, setReturnDescription] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return user?.email.split('@')[0] || 'User';
  };

  const loadOrderHistory = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const userOrders = await getUserOrderHistory(user.email);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading order history:', error);
      toast.error('Failed to load order history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Wait for authentication to finish loading before checking user state
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
      toast.error('Please login to view your order history');
      return;
    }
    loadOrderHistory();
  }, [user, navigate, authLoading]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleOrderClick = (order: ExtendedOrder) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel || !cancelReason) return;
    
    try {
      const success = await updateOrderStatus(orderToCancel.id, 'cancelled', user, cancelReason);
      if (success) {
        toast.success('Order cancelled successfully');
        await loadOrderHistory();
        setShowCancelModal(false);
        setCancelReason('');
        setOrderToCancel(null);
      } else {
        toast.error('Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  const handleReturnRequest = (order: ExtendedOrder) => {
    setSelectedOrderForReturn(order);
    // Initialize return items with all order items
    const items: ReturnItem[] = order.items.map(item => ({
      orderItemId: item.id || '',
      productId: item.productId || '',
      productName: item.name,
      quantity: item.quantity,
      returnQuantity: 0, // User will select how many to return
      originalPrice: item.price,
      condition: 'new' as const,
      returnReason: 'defective_product'
    }));
    setReturnItems(items);
    setReturnReason('defective_product');
    setReturnDescription('');
    setShowReturnModal(true);
  };

  const handleSubmitReturnRequest = async () => {
    if (!selectedOrderForReturn || !user) return;
    
    // Check if at least one item is selected for return
    const selectedItems = returnItems.filter(item => item.returnQuantity > 0);
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    if (!returnDescription.trim()) {
      toast.error('Please provide a description for the return request');
      return;
    }

    setIsSubmittingReturn(true);
    
    try {
      const returnRequest = await createReturnRequest(
        selectedOrderForReturn,
        selectedItems,
        returnReason,
        returnDescription,
        user.email
      );
      
      toast.success('Return request submitted successfully! We will review and get back to you soon.');
      setShowReturnModal(false);
      setSelectedOrderForReturn(null);
      setReturnItems([]);
      setReturnReason('defective_product');
      setReturnDescription('');
      await loadOrderHistory(); // Refresh orders to show updated status
    } catch (error) {
      console.error('Error submitting return request:', error);
      toast.error('Failed to submit return request');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const updateReturnItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...returnItems];
    updatedItems[index].returnQuantity = Math.max(0, Math.min(quantity, updatedItems[index].quantity));
    setReturnItems(updatedItems);
  };

  const updateReturnItemCondition = (index: number, condition: 'new' | 'used' | 'damaged') => {
    const updatedItems = [...returnItems];
    updatedItems[index].condition = condition;
    setReturnItems(updatedItems);
  };

  const canCancelOrder = (order: ExtendedOrder) => {
    // Users can only cancel orders that are pending or confirmed
    return ['pending', 'confirmed'].includes(order.status);
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-8 w-32 rounded mb-8"></div>
            <div className="space-y-4">
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
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
              <p className="text-gray-600 mt-1">View and track your past orders</p>
            </div>
          </div>
        </div>

        {/* Order List */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your order history here.</p>
              <Button onClick={() => navigate('/products')}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">
                        ₹{order.total.toLocaleString()}
                      </p>
                      <Badge className={`mt-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOrderClick(order)}
                          className="flex items-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </Button>
                        
                        {canCancelOrder(order) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setOrderToCancel(order);
                              setCancelReason('');
                              setShowCancelModal(true);
                            }}
                            className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                            <span>Cancel Order</span>
                          </Button>
                        )}
                        
                        {isOrderEligibleForReturn(order) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReturnRequest(order)}
                            className="flex items-center space-x-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span>Return Items</span>
                          </Button>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <p>Payment: {order.paymentStatus}</p>
                        <p>Method: {order.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package size={20} />
              Order Details - {selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Complete order information and tracking details
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Order Summary</span>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-1">{selectedOrder.status}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order Number</p>
                      <p className="font-semibold">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="font-semibold">
                        {formatDate(selectedOrder.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-semibold">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Status</p>
                      <Badge className={selectedOrder.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {selectedOrder.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin size={16} />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold">{selectedOrder.shippingAddress.street}</p>
                    <p className="text-gray-600">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                    </p>
                    <p className="text-gray-600">PIN: {selectedOrder.shippingAddress.pincode}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag size={16} />
                    Order Items ({selectedOrder.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🪑</span>
                          </div>
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                            <p className="text-sm text-gray-500">₹{item.price.toLocaleString()} each</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹{item.total.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order Total */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Order Total</span>
                      <span className="text-2xl font-bold text-green-600">₹{selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock size={16} />
                    Order Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Order Placed</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(selectedOrder.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    {selectedOrder.status !== 'pending' && (
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Order Confirmed</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(new Date(new Date(selectedOrder.createdAt).getTime() + 2 * 60 * 60 * 1000))}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {selectedOrder.status === 'shipped' && (
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Truck className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Order Shipped</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(new Date(new Date(selectedOrder.createdAt).getTime() + 24 * 60 * 60 * 1000))}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedOrder.status === 'delivered' && (
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Order Delivered</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(new Date(new Date(selectedOrder.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000))}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDetail(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                // Here you could add functionality to reorder or contact support
                toast.success('Support ticket created for this order');
              }}
            >
              Contact Support
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cancel Order Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              Cancel Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order #{orderToCancel?.orderNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancelReason">Reason for cancellation *</Label>
              <Textarea
                id="cancelReason"
                placeholder="Please provide a reason for cancelling this order..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>
            
            {orderToCancel && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Order Summary</h4>
                <p className="text-sm text-gray-600">Order #{orderToCancel.orderNumber}</p>
                <p className="text-sm text-gray-600">{orderToCancel.items.length} items</p>
                <p className="text-sm text-gray-600">Total: ₹{orderToCancel.total.toLocaleString()}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Keep Order
            </Button>
            <Button 
              onClick={handleCancelOrder}
              disabled={!cancelReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Request Modal */}
      <Dialog open={showReturnModal} onOpenChange={setShowReturnModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-blue-600" />
              Return Request
            </DialogTitle>
            <DialogDescription>
              Describe the reason for returning the items
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrderForReturn && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="returnReason">Reason for return *</Label>
                <Select
                  value={returnReason}
                  onValueChange={(value) => setReturnReason(value as ReturnReason)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defective_product">Defective Product</SelectItem>
                    <SelectItem value="wrong_item_received">Wrong Item Received</SelectItem>
                    <SelectItem value="not_as_described">Not as Described</SelectItem>
                    <SelectItem value="changed_mind">Changed Mind</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="returnDescription">Description *</Label>
                <Textarea
                  id="returnDescription"
                  placeholder="Please provide a detailed description of the issue..."
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Items to Return</Label>
                <div className="space-y-4">
                  {returnItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🪑</span>
                        </div>
                        <div>
                          <p className="font-semibold">{item.productName}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-500">₹{item.originalPrice.toLocaleString()} each</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div>
                          <Label className="text-sm">Return Qty:</Label>
                          <Input
                            type="number"
                            value={item.returnQuantity}
                            onChange={(e) => updateReturnItemQuantity(index, Number(e.target.value))}
                            min={0}
                            max={item.quantity}
                            className="w-20"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Condition:</Label>
                          <Select
                            value={item.condition}
                            onValueChange={(value) => updateReturnItemCondition(index, value as 'new' | 'used' | 'damaged')}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="used">Used</SelectItem>
                              <SelectItem value="damaged">Damaged</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReturnRequest}
              disabled={!returnReason.trim() || !returnDescription || returnItems.filter(item => item.returnQuantity > 0).length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Return Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default OrderHistory; 