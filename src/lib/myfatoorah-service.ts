// MyFatoorah Payment Integration
// Professional payment processing for MENA region

const MYFATOORAH_API_KEY = process.env.MYFATOORAH_API_KEY;
const MYFATOORAH_BASE_URL = (process.env.MYFATOORAH_BASE_URL || 'https://api.myfatoorah.com').replace(/\/+$/, '');

export interface PaymentRequest {
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  orderId: string;
  packageId: string;
  credits: number;
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
  rawStatus?: string;
  error?: string;
}

// Create payment session
export async function createPaymentSession(paymentData: PaymentRequest): Promise<PaymentResponse> {
  try {
    if (!MYFATOORAH_API_KEY) {
      throw new Error('MyFatoorah API key not configured. Please set MYFATOORAH_API_KEY environment variable.');
    }

    console.log('MyFatoorah API Key (first 20 chars):', MYFATOORAH_API_KEY.substring(0, 20) + '...');
    console.log('MyFatoorah Base URL:', MYFATOORAH_BASE_URL);
    console.log('API Key length:', MYFATOORAH_API_KEY.length);
    console.log('API Key starts with:', MYFATOORAH_API_KEY.substring(0, 10));

    const payload = {
      InvoiceValue: paymentData.amount,
      CustomerName: paymentData.customerName,
      NotificationOption: 'LNK', // Just return the link, no email/SMS
      CustomerEmail: paymentData.customerEmail,
      CallBackUrl: paymentData.returnUrl,
      ErrorUrl: paymentData.errorUrl,
      DisplayCurrencyIso: paymentData.currency,
      Language: 'AR',
      UserDefinedField: paymentData.orderId,
      CustomerReference: paymentData.orderId,
      InvoiceItems: [
        {
          ItemName: paymentData.description,
          Quantity: 1,
          UnitPrice: paymentData.amount
        }
      ]
    };

    // MyFatoorah API call with proper authentication
    console.log('Making MyFatoorah API call to:', `${MYFATOORAH_BASE_URL}/v2/SendPayment`);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/SendPayment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MYFATOORAH_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('MyFatoorah API Response Status:', response.status);
    console.log('MyFatoorah API Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MyFatoorah API Error:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('MyFatoorah response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON response from payment service');
    }

    if (result.IsSuccess && result.Data) {
      return {
        success: true,
        paymentUrl: result.Data.InvoiceURL,
        invoiceId: result.Data.InvoiceId.toString(),
      };
    } else {
      return {
        success: false,
        error: result.Message || 'Payment creation failed',
      };
    }
  } catch (error) {
    console.error('MyFatoorah payment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment service error',
    };
  }
}

// Check payment status
export async function checkPaymentStatus(key: string, keyType: 'InvoiceId' | 'PaymentId' = 'InvoiceId'): Promise<PaymentStatus> {
  try {
    if (!MYFATOORAH_API_KEY) {
      throw new Error('MyFatoorah API key not configured. Please set MYFATOORAH_API_KEY environment variable.');
    }

    const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/GetPaymentStatus`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MYFATOORAH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Key: key,
        KeyType: keyType
      }),
    });

    const result = await response.json();

    if (result.IsSuccess) {
      const invoice = result.Data.InvoiceTransactions[0];
      const rawStatus = String(invoice.TransactionStatus || '').toLowerCase();
      let normalized: 'Paid' | 'Pending' | 'Failed' | 'Cancelled' = 'Pending';
      if (/(paid|success|succeed|captur)/i.test(rawStatus)) normalized = 'Paid';
      else if (/(pending|init|inprogress|process|authori)/i.test(rawStatus)) normalized = 'Pending';
      else if (/(fail|declin|reject|error)/i.test(rawStatus)) normalized = 'Failed';
      else if (/(cancel)/i.test(rawStatus)) normalized = 'Cancelled';
      return {
        success: true,
        status: normalized,
        transactionId: invoice.TransactionId,
        rawStatus: invoice.TransactionStatus,
      };
    } else {
      return {
        success: false,
        status: 'Failed',
        error: result.Message || 'Failed to check payment status',
      };
    }
  } catch (error) {
    console.error('MyFatoorah status check error:', error);
    return {
      success: false,
      status: 'Failed',
      error: error instanceof Error ? error.message : 'Status check error',
    };
  }
}

// Get available payment methods
export async function getPaymentMethods(): Promise<any> {
  try {
    if (!MYFATOORAH_API_KEY) {
      throw new Error('MyFatoorah API key not configured');
    }

    const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/InitiatePayment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MYFATOORAH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        InvoiceAmount: 1, // Dummy amount to get methods
        CurrencyIso: 'USD'
      }),
    });

    const result = await response.json();

    if (result.IsSuccess) {
      return {
        success: true,
        methods: result.Data.PaymentMethods,
      };
    } else {
      return {
        success: false,
        error: result.Message || 'Failed to get payment methods',
      };
    }
  } catch (error) {
    console.error('MyFatoorah methods error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Methods fetch error',
    };
  }
}
