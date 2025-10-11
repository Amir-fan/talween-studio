/**
 * Order Manager Service - Manage order status and lifecycle
 * 
 * Handles order status updates and queries in Google Sheets.
 * 
 * Single responsibility: Manage orders, don't handle payments or credits.
 */

import { getOrder, updateOrderStatus, GoogleSheetsOrder } from '@/lib/google-sheets-orders';

export interface OrderResult {
  success: boolean;
  order?: GoogleSheetsOrder;
  error?: string;
}

export class OrderManagerService {
  /**
   * Find order by ID
   * 
   * @param orderId - Order ID
   * @returns Order result with order data
   */
  async findById(orderId: string): Promise<OrderResult> {
    try {
      console.log('📦 [ORDER MANAGER] Finding order:', orderId);

      if (!orderId) {
        return {
          success: false,
          error: 'Missing order ID'
        };
      }

      const result = await getOrder(orderId);

      if (!result.success || !result.order) {
        console.error('📦 [ORDER MANAGER] Order not found:', orderId);
        return {
          success: false,
          error: 'Order not found'
        };
      }

      console.log('📦 [ORDER MANAGER] ✅ Order found:', {
        orderId: result.order.ID,
        status: result.order.Status,
        amount: result.order.Amount,
        credits: result.order.CreditsPurchased
      });

      return {
        success: true,
        order: result.order
      };

    } catch (error) {
      console.error('📦 [ORDER MANAGER] ❌ Find error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Mark order as paid
   * 
   * @param orderId - Order ID
   * @param paymentId - Payment/Transaction ID from gateway
   * @returns Success status
   */
  async markAsPaid(orderId: string, paymentId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📦 [ORDER MANAGER] Marking order as paid:', { orderId, paymentId });

      const result = await updateOrderStatus({
        orderId,
        status: 'paid',
        paymentId
      });

      if (!result.success) {
        console.error('📦 [ORDER MANAGER] ❌ Update failed:', result.error);
        return {
          success: false,
          error: result.error
        };
      }

      console.log('📦 [ORDER MANAGER] ✅ Order marked as paid');
      return { success: true };

    } catch (error) {
      console.error('📦 [ORDER MANAGER] ❌ Mark paid error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Mark order as failed
   * 
   * @param orderId - Order ID
   * @returns Success status
   */
  async markAsFailed(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📦 [ORDER MANAGER] Marking order as failed:', orderId);

      const result = await updateOrderStatus({
        orderId,
        status: 'failed'
      });

      if (!result.success) {
        console.error('📦 [ORDER MANAGER] ❌ Update failed:', result.error);
        return {
          success: false,
          error: result.error
        };
      }

      console.log('📦 [ORDER MANAGER] ✅ Order marked as failed');
      return { success: true };

    } catch (error) {
      console.error('📦 [ORDER MANAGER] ❌ Mark failed error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if order was already processed
   * Prevents duplicate credit addition
   * 
   * @param order - Order object
   * @returns True if already processed
   */
  isAlreadyProcessed(order: GoogleSheetsOrder): boolean {
    const processed = order.Status === 'paid';

    if (processed) {
      console.log('📦 [ORDER MANAGER] ⚠️ Order already processed:', order.ID);
    }

    return processed;
  }

  /**
   * Validate order has required fields
   * 
   * @param order - Order object
   * @returns True if valid
   */
  isValid(order: GoogleSheetsOrder): boolean {
    const hasId = Boolean(order.ID);
    const hasUserId = Boolean(order.UserID);
    const hasAmount = Boolean(order.Amount);
    const hasCredits = Boolean(order.CreditsPurchased);

    const isValid = hasId && hasUserId && hasAmount && hasCredits;

    if (!isValid) {
      console.error('📦 [ORDER MANAGER] ❌ Invalid order:', {
        hasId,
        hasUserId,
        hasAmount,
        hasCredits
      });
    }

    return isValid;
  }
}

// Export singleton instance
export const orderManagerService = new OrderManagerService();

