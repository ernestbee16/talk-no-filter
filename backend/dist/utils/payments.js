"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Simulates mobile money provider operations.
 * In production, this would communicate with MTN MoMo Partner APIs or an aggregator (Flutterwave/Paystack).
 */
class PaymentService {
    /**
     * Initiates a Mobile Money USSD push transaction (STK Push).
     */
    static async initiateMomoPush({ userId, amount, phone, provider, }) {
        // Generate a unique transactional reference
        const reference = `TNF-${provider.toUpperCase()}-${crypto_1.default.randomBytes(6).toString('hex').toUpperCase()}`;
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
    static async verifyTransaction(reference) {
        console.log(`[PAYMENT VERIFY] Checking status for ${reference}...`);
        // Returns success by default in sandbox mode
        return 'success';
    }
}
exports.PaymentService = PaymentService;
