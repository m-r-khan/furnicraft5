import { ReturnRequest, ReturnItem, ReturnReason, ReturnStatus, OrderStatus } from '../types';
import { ExtendedOrder, updateProductStock, updateOrderStatus, restoreStockForOrder } from './orderUtils';

export const getAllReturnRequests = (): ReturnRequest[] => {
  try {
    return JSON.parse(localStorage.getItem('furnicraft_return_requests') || '[]');
  } catch (error) {
    console.error('Error getting return requests:', error);
    return [];
  }
};

export const getReturnStatistics = () => {
  const allRequests = getAllReturnRequests();
  return {
    total: allRequests.length,
    pendingApproval: allRequests.filter(r => r.status === 'pending_approval').length,
    approved: allRequests.filter(r => r.status === 'approved').length,
    rejected: allRequests.filter(r => r.status === 'rejected').length,
    pickupScheduled: allRequests.filter(r => r.status === 'pickup_scheduled').length,
    pickedUp: allRequests.filter(r => r.status === 'picked_up').length,
    received: allRequests.filter(r => r.status === 'received').length,
    refunded: allRequests.filter(r => r.status === 'refunded').length,
    totalRefundAmount: allRequests.filter(r => r.status === 'refunded').reduce((total, r) => total + r.refundAmount, 0)
  };
};

export const approveReturnRequest = (requestId: string, adminUser: string, notes?: string): boolean => {
  try {
    const allRequests = getAllReturnRequests();
    const requestIndex = allRequests.findIndex(request => request.id === requestId);
    if (requestIndex === -1) return false;
    const request = allRequests[requestIndex];
    request.status = 'approved';
    request.approvedAt = new Date();
    request.approvedBy = adminUser;
    request.adminNotes = notes;
    request.updatedAt = new Date();
    console.log(`Approving return request ${requestId} for order ${request.orderId}`);
    updateOrderStatus(request.orderId, 'return_approved', { email: adminUser } as any, notes);
    localStorage.setItem('furnicraft_return_requests', JSON.stringify(allRequests));
    return true;
  } catch (error) {
    console.error('Error approving return request:', error);
    return false;
  }
};

export const rejectReturnRequest = (
  requestId: string, 
  adminUser: string, 
  rejectionReason: string,
  notes?: string
): boolean => {
  try {
    const allRequests = getAllReturnRequests();
    const requestIndex = allRequests.findIndex(request => request.id === requestId);
    if (requestIndex === -1) return false;
    const request = allRequests[requestIndex];
    request.status = 'rejected';
    request.rejectedAt = new Date();
    request.rejectedBy = adminUser;
    request.rejectionReason = rejectionReason;
    request.adminNotes = notes;
    request.updatedAt = new Date();
    updateOrderStatus(request.orderId, 'delivered', { email: adminUser } as any, notes);
    localStorage.setItem('furnicraft_return_requests', JSON.stringify(allRequests));
    return true;
  } catch (error) {
    console.error('Error rejecting return request:', error);
    return false;
  }
};

export const scheduleReturnPickup = (requestId: string, pickupDate: Date, adminUser: string): boolean => {
  try {
    const allRequests = getAllReturnRequests();
    const requestIndex = allRequests.findIndex(request => request.id === requestId);
    if (requestIndex === -1) return false;
    const request = allRequests[requestIndex];
    request.status = 'pickup_scheduled';
    request.pickupScheduledAt = pickupDate;
    request.updatedAt = new Date();
    updateOrderStatus(request.orderId, 'return_pickup_scheduled', { email: adminUser } as any);
    localStorage.setItem('furnicraft_return_requests', JSON.stringify(allRequests));
    return true;
  } catch (error) {
    console.error('Error scheduling return pickup:', error);
    return false;
  }
};

export const markReturnPickedUp = (requestId: string, adminUser: string): boolean => {
  try {
    const allRequests = getAllReturnRequests();
    const requestIndex = allRequests.findIndex(request => request.id === requestId);
    if (requestIndex === -1) return false;
    const request = allRequests[requestIndex];
    request.status = 'picked_up';
    request.pickedUpAt = new Date();
    request.updatedAt = new Date();
    updateOrderStatus(request.orderId, 'return_picked_up', { email: adminUser } as any);
    localStorage.setItem('furnicraft_return_requests', JSON.stringify(allRequests));
    return true;
  } catch (error) {
    console.error('Error marking return as picked up:', error);
    return false;
  }
};

export const markReturnReceived = (requestId: string, adminUser: string): boolean => {
  try {
    console.log(`=== Marking Return as Received ===`);
    console.log(`Request ID: ${requestId}`);
    console.log(`Admin User: ${adminUser}`);
    
    const allRequests = getAllReturnRequests();
    const requestIndex = allRequests.findIndex(request => request.id === requestId);
    if (requestIndex === -1) {
      console.error(`Return request ${requestId} not found`);
      return false;
    }
    
    const request = allRequests[requestIndex];
    console.log(`Found return request:`, request);
    
    request.status = 'received';
    request.receivedAt = new Date();
    request.updatedAt = new Date();
    console.log(`Marking return as received ${requestId} for order ${request.orderId} - stock will be restored`);
    
    // Update order status
    const orderStatusUpdated = updateOrderStatus(request.orderId, 'return_received', { email: adminUser } as any);
    console.log(`Order status update result: ${orderStatusUpdated}`);
    
    // Directly restore stock when items are received
    console.log(`Attempting direct stock restoration for order ${request.orderId}`);
    const stockRestored = restoreStockForOrder(request.orderId);
    if (stockRestored) {
      console.log(`✅ Stock successfully restored when return received ${requestId}`);
    } else {
      console.warn(`❌ Failed to restore stock when return received ${requestId}`);
    }
    
    localStorage.setItem('furnicraft_return_requests', JSON.stringify(allRequests));
    console.log(`=== Return Received Processing Complete ===`);
    return true;
  } catch (error) {
    console.error('Error marking return as received:', error);
    return false;
  }
};

export const processReturnRefund = (
  requestId: string, 
  adminUser: string, 
  refundMethod: 'original_payment' | 'store_credit' | 'bank_transfer'
): boolean => {
  try {
    console.log(`=== Processing Return Refund ===`);
    console.log(`Request ID: ${requestId}`);
    console.log(`Admin User: ${adminUser}`);
    console.log(`Refund Method: ${refundMethod}`);
    
    const allRequests = getAllReturnRequests();
    const requestIndex = allRequests.findIndex(request => request.id === requestId);
    if (requestIndex === -1) {
      console.error(`Return request ${requestId} not found`);
      return false;
    }
    
    const request = allRequests[requestIndex];
    console.log(`Found return request:`, request);
    
    request.status = 'refunded';
    request.refundedAt = new Date();
    request.refundMethod = refundMethod;
    request.updatedAt = new Date();
    console.log(`Processing return refund ${requestId} for order ${request.orderId} - stock will be restored`);
    
    // Update order status
    const orderStatusUpdated = updateOrderStatus(request.orderId, 'refunded', { email: adminUser } as any);
    console.log(`Order status update result: ${orderStatusUpdated}`);
    
    // Directly restore stock to ensure it happens
    console.log(`Attempting direct stock restoration for order ${request.orderId}`);
    const stockRestored = restoreStockForOrder(request.orderId);
    if (stockRestored) {
      console.log(`✅ Stock successfully restored for return refund ${requestId}`);
    } else {
      console.warn(`❌ Failed to restore stock for return refund ${requestId}`);
    }
    
    localStorage.setItem('furnicraft_return_requests', JSON.stringify(allRequests));
    console.log(`=== Return Refund Processing Complete ===`);
    return true;
  } catch (error) {
    console.error('Error processing return refund:', error);
    return false;
  }
};

export const getReturnStatusText = (status: ReturnStatus): string => {
  const statusMap: Record<ReturnStatus, string> = {
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected',
    pickup_scheduled: 'Pickup Scheduled',
    picked_up: 'Picked Up',
    received: 'Received',
    refunded: 'Refunded',
    cancelled: 'Cancelled'
  };
  return statusMap[status];
};

export const getReturnStatusColor = (status: ReturnStatus): string => {
  const colorMap: Record<ReturnStatus, string> = {
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    pickup_scheduled: 'bg-purple-100 text-purple-800',
    picked_up: 'bg-indigo-100 text-indigo-800',
    received: 'bg-green-100 text-green-800',
    refunded: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };
  return colorMap[status];
};

export const getReturnReasonText = (reason: ReturnReason): string => {
  const reasonMap: Record<ReturnReason, string> = {
    defective_product: 'Defective Product',
    wrong_item_received: 'Wrong Item Received',
    size_issue: 'Size Issue',
    quality_issue: 'Quality Issue',
    not_as_described: 'Not as Described',
    changed_mind: 'Changed Mind',
    duplicate_order: 'Duplicate Order',
    other: 'Other'
  };
  return reasonMap[reason];
};

/**
 * Check if an order is eligible for return (within 7 days of delivery)
 */
export const isOrderEligibleForReturn = (order: ExtendedOrder): boolean => {
  if (order.status !== 'delivered') {
    return false;
  }

  const deliveryDate = new Date(order.actualDelivery || order.updatedAt || order.createdAt);
  const currentDate = new Date();
  const daysSinceDelivery = Math.floor((currentDate.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));

  return daysSinceDelivery <= 7;
};

/**
 * Get remaining return days for an order
 */
export const getRemainingReturnDays = (order: ExtendedOrder): number => {
  if (!isOrderEligibleForReturn(order)) {
    return 0;
  }

  const deliveryDate = new Date(order.actualDelivery || order.updatedAt || order.createdAt);
  const currentDate = new Date();
  const daysSinceDelivery = Math.floor((currentDate.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));

  return Math.max(0, 7 - daysSinceDelivery);
};

/**
 * Create a return request
 */
export const createReturnRequest = (
  order: ExtendedOrder,
  items: ReturnItem[],
  reason: ReturnReason,
  description: string,
  userEmail: string
): ReturnRequest => {
  const returnRequest: ReturnRequest = {
    id: Date.now().toString(),
    orderId: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId || '',
    userEmail: userEmail,
    customerName: order.customer?.name || '',
    items: items,
    reason: reason,
    description: description,
    status: 'pending_approval',
    requestedAt: new Date(),
    refundAmount: items.reduce((total, item) => total + (item.originalPrice * item.returnQuantity), 0),
    refundMethod: 'original_payment',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Save return request
  const existingRequests = getAllReturnRequests();
  existingRequests.push(returnRequest);
  localStorage.setItem('furnicraft_return_requests', JSON.stringify(existingRequests));

  // Update order status
  updateOrderStatus(order.id, 'return_requested', { email: userEmail } as any, 'Return request created');

  return returnRequest;
};
 