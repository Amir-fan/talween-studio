/**
 * Payment Verification Service - Verify payment callbacks from MyFatoorah
 * 
 * Handles payment status verification and callback validation.
 * 
 * Single responsibility: Verify payments, don't update orders or add credits.
 */

import { checkPaymentStatus } from '@/lib/myfatoorah-service';

export interface PaymentVerificationResult {
  success: boolean;
  status: 'Paid' | 'Failed' | 'Pending' | 'Unknown';
  invoiceId?: string;
  transactionId?: string;
  error?: string;
}

export class PaymentVerificationService {
  /**
   * Verify MyFatoorah payment callback
   * 
   * @param invoiceId - MyFatoorah invoice ID
   * @param keyType - Type of key ('InvoiceId' or 'PaymentId')
   * @returns Verification result with payment status
   */
  async verifyPayment(
    invoiceId: string,
    keyType: 'InvoiceId' | 'PaymentId' = 'InvoiceId'
  ): Promise<PaymentVerificationResult> {
    try {
      console.log('💳 [PAYMENT VERIFICATION] Verifying payment:', { invoiceId, keyType });

      if (!invoiceId) {
        return {
          success: false,
          status: 'Unknown',
          error: 'Missing invoice ID'
        };
      }

      // Check payment status with MyFatoorah
      const statusResult = await checkPaymentStatus(invoiceId, keyType);

      if (!statusResult.success) {
        const errorMsg = 'error' in statusResult ? statusResult.error : 'Verification failed';
        console.error('💳 [PAYMENT VERIFICATION] ❌ Status check failed:', errorMsg);

        return {
          success: false,
          status: 'Unknown',
          error: errorMsg
        };
      }

      console.log('💳 [PAYMENT VERIFICATION] ✅ Payment status:', statusResult.status);

      return {
        success: true,
        status: statusResult.status,
        invoiceId: invoiceId
      };

    } catch (error) {
      console.error('💳 [PAYMENT VERIFICATION] ❌ Verification error:', error);

      return {
        success: false,
        status: 'Unknown',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate callback parameters
   * 
   * @param params - Callback parameters
   * @returns True if valid
   */
  validateCallbackParams(params: {
    orderId?: string | null;
    paymentId?: string | null;
    invoiceId?: string | null;
  }): boolean {
    const hasOrderId = Boolean(params.orderId);
    const hasPaymentIdentifier = Boolean(params.paymentId || params.invoiceId);

    if (!hasOrderId) {
      console.error('💳 [PAYMENT VERIFICATION] Missing orderId');
      return false;
    }

    if (!hasPaymentIdentifier) {
      console.error('💳 [PAYMENT VERIFICATION] Missing payment identifier');
      return false;
    }

    return true;
  }

  /**
   * Check if payment is in terminal state (Paid or Failed)
   * 
   * @param status - Payment status
   * @returns True if terminal state
   */
  isTerminalState(status: string): boolean {
    return status === 'Paid' || status === 'Failed';
  }
}

// Export singleton instance
export const paymentVerificationService = new PaymentVerificationService();

