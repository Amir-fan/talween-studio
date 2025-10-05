// Mock MyFatoorah Payment Integration for testing
// This service provides a mock implementation when the real API is not working

export interface PaymentRequest {
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  orderId: string;
  packageId?: string;
  credits?: number;
  description: string;
  returnUrl: string;
  errorUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  invoiceId?: string;
  error?: string;
}

export interface PaymentStatus {
  success: boolean;
  status: 'Paid' | 'Pending' | 'Failed' | 'Cancelled';
  transactionId?: string;
  error?: string;
}

// Mock payment session creation
export async function createPaymentSession(paymentData: PaymentRequest): Promise<PaymentResponse> {
  try {
    console.log('Mock MyFatoorah: Creating payment session for', paymentData.customerEmail);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock invoice ID
    const invoiceId = `MOCK-${Date.now()}`;
    
    // Create mock payment URL (simulates external payment gateway)
  const base = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const mockPaymentUrl = `${base}/payment/mock-gateway?orderId=${paymentData.orderId}&amount=${paymentData.amount}&packageId=${paymentData.packageId || 'UNKNOWN'}&credits=${paymentData.credits || 0}`;
    
    return {
      success: true,
      paymentUrl: mockPaymentUrl,
      invoiceId: invoiceId,
    };
  } catch (error) {
    console.error('Mock MyFatoorah payment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Mock payment service error',
    };
  }
}

// Mock payment status check
export async function checkPaymentStatus(invoiceId: string): Promise<PaymentStatus> {
  try {
    console.log('Mock MyFatoorah: Checking payment status for', invoiceId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock successful payment
    return {
      success: true,
      status: 'Paid',
      transactionId: `MOCK-TXN-${Date.now()}`,
    };
  } catch (error) {
    console.error('Mock MyFatoorah status check error:', error);
    return {
      success: false,
      status: 'Failed',
      error: error instanceof Error ? error.message : 'Mock status check error',
    };
  }
}

// Mock payment methods
export async function getPaymentMethods(currency: string = 'USD') {
  try {
    console.log('Mock MyFatoorah: Getting payment methods for', currency);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock payment methods
    return {
      success: true,
      methods: [
        {
          id: 1,
          name: 'Credit Card',
          nameAr: 'بطاقة ائتمان',
          imageUrl: '/api/placeholder/100/50',
          isDirectPayment: true,
          serviceCharge: 0,
          totalAmount: 0,
          currencyIso: currency
        },
        {
          id: 2,
          name: 'Apple Pay',
          nameAr: 'أبل باي',
          imageUrl: '/api/placeholder/100/50',
          isDirectPayment: true,
          serviceCharge: 0,
          totalAmount: 0,
          currencyIso: currency
        },
        {
          id: 3,
          name: 'Stc Pay',
          nameAr: 'ستي باي',
          imageUrl: '/api/placeholder/100/50',
          isDirectPayment: true,
          serviceCharge: 0,
          totalAmount: 0,
          currencyIso: currency
        }
      ]
    };
  } catch (error) {
    console.error('Mock MyFatoorah payment methods error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Mock payment methods error',
    };
  }
}
