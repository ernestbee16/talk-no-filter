import crypto from 'crypto';

interface InitiatePaymentArgs {
  userId: string;
  amount: number;
  phone: string;
  provider: 'mtn_momo' | 'airtel_money' | 'card';
}

interface PaymentResult {
  reference: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
}

/**
 * Simulates mobile money provider operations.
 * In production, this would communicate with MTN MoMo Partner APIs or an aggregator (Flutterwave/Paystack).
 */
export class PaymentService {
  /**
   * Initiates a Mobile Money USSD push transaction (STK Push).
   */
  static async initiateMomoPush({
    userId,
    amount,
    phone,
    provider,
  }: InitiatePaymentArgs): Promise<PaymentResult> {
    // Generate a unique transactional reference
    const reference = `TNF-${provider.toUpperCase()}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    
    console.log(`[PAYMENT INITIATED]`);
    console.log(`- User ID: ${userId}`);
    console.log(`- Phone: ${phone}`);
    console.log(`- Amount: ${amount} RWF`);
    console.log(`- Provider: ${provider}`);
    console.log(`- Reference: ${reference}`);
    console.log(`- Action: Sending USSD STK-Push notification request to ${phone}...`);

    // In local development, we return a mock successful initiation status
    return {
      reference,
      status: 'pending',
      message: `Simulated STK Push sent to ${phone}. Enter PIN on your handset.`,
    };
  }

  /**
   * Simulates verification check if webhook fails or is not received.
   */
  static async verifyTransaction(reference: string): Promise<'success' | 'failed' | 'pending'> {
    console.log(`[PAYMENT VERIFY] Checking status for ${reference}...`);
    // Returns success by default in sandbox mode
    return 'success';
  }
}
