/**
 * Google Sheets Order Management Service
 * Handles all order operations using Google Apps Script
 */

const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwFLOoyBsDlJPBwJ3LES41P0U3dHeUHHcz14Q0aE5vi6fqGl1qdMAnw0EtKdDRPL2Re/exec';

export interface GoogleSheetsOrder {
  ID: string;
  UserID: string;
  OrderNumber: string;
  Status: string;
  Amount: number;
  Currency: string;
  PackageID: string;
  CreditsPurchased: number;
  PaymentIntentID: string;
  Created: string;
  Updated: string;
  CreditsAdded?: boolean | string; // Track if credits were added (prevents duplicates)
}

export interface CreateOrderData {
  userId: string;
  amount: number;
  packageId: string;
  credits: number;
}

export interface UpdateOrderStatusData {
  orderId: string;
  status: string;
  paymentId?: string;
  CreditsAdded?: boolean;
}

/**
 * Create a new order in Google Sheets with timeout handling
 */
export async function createOrder(data: CreateOrderData): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> {
  try {
    console.log('🛒 [GOOGLE SHEETS ORDERS] Creating order:', data);
    
    const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 5000); // 5 second timeout
    
    try {
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createOrder',
          apiKey: GOOGLE_SHEETS_API_KEY,
          userId: data.userId,
          amount: data.amount,
          packageId: data.packageId,
          credits: data.credits
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      const result = await response.json();
      console.log('🛒 [GOOGLE SHEETS ORDERS] Create order response:', result);
      
      if (result.success) {
        return {
          success: true,
          orderId: result.orderId,
          orderNumber: result.orderNumber
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to create order'
        };
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('❌ [GOOGLE SHEETS ORDERS] Request timeout');
        return {
          success: false,
          error: 'Google Sheets request timed out'
        };
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('❌ [GOOGLE SHEETS ORDERS] Create order error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create order'
    };
  }
}

/**
 * Get an order from Google Sheets
 */
export async function getOrder(orderId: string): Promise<{ success: boolean; order?: GoogleSheetsOrder; error?: string }> {
  try {
    console.log('🔍 [GOOGLE SHEETS ORDERS] Getting order:', orderId);
    
    const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
    
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getOrder',
        apiKey: GOOGLE_SHEETS_API_KEY,
        orderId: orderId
      })
    });

    const result = await response.json();
    console.log('🔍 [GOOGLE SHEETS ORDERS] Get order response:', result);
    
    if (result.success) {
      return {
        success: true,
        order: result.order
      };
    } else {
      return {
        success: false,
        error: result.error || 'Order not found'
      };
    }
  } catch (error: any) {
    console.error('❌ [GOOGLE SHEETS ORDERS] Get order error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get order'
    };
  }
}

/**
 * Update order status in Google Sheets
 */
export async function updateOrderStatus(data: UpdateOrderStatusData): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔄 [GOOGLE SHEETS ORDERS] Updating order status:', data);
    
    const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
    
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateOrderStatus',
        apiKey: GOOGLE_SHEETS_API_KEY,
        orderId: data.orderId,
        status: data.status,
        paymentId: data.paymentId
      })
    });

    const result = await response.json();
    console.log('🔄 [GOOGLE SHEETS ORDERS] Update order status response:', result);
    
    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to update order status'
      };
    }
  } catch (error: any) {
    console.error('❌ [GOOGLE SHEETS ORDERS] Update order status error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update order status'
    };
  }
}
