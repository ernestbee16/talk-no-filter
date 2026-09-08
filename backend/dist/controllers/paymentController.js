"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiatePayment = initiatePayment;
exports.paymentWebhook = paymentWebhook;
exports.refundWalletCredit = refundWalletCredit;
const crypto_1 = __importDefault(require("crypto"));
const db_1 = __importDefault(require("../utils/db"));
const payments_1 = require("../utils/payments");
const PAYPACK_WEBHOOK_SECRET = process.env.PAYPACK_WEBHOOK_SECRET || 'paypack_sec_secret_key_8812';
/**
 * Initiates a Mobile Money payment intent via Paypack/MTN MoMo Gateway
 */
async function initiatePayment(req, res) {
    try {
        const { userId, amount, phone, provider, serviceType, slotId } = req.body;
        if (!userId || !amount || !phone || !provider || !serviceType) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        // Verify slot is still available if booking a slot
        if ((serviceType === 'quick_check' || serviceType === 'standard') && slotId) {
            const slot = await db_1.default.availabilitySlot.findUnique({ where: { id: slotId } });
            if (!slot || slot.isBooked) {
                return res.status(400).json({ error: 'Selected time slot is no longer available' });
            }
        }
        // Trigger Mobile Money push
        const momoResult = await payments_1.PaymentService.initiateMomoPush({
            userId,
            amount,
            phone,
            provider,
        });
        // Save initial pending payment record
        const payment = await db_1.default.payment.create({
            data: {
                userId,
                amount,
                provider,
                reference: momoResult.reference,
                status: 'pending',
                serviceType,
                slotId: slotId || null,
            },
        });
        return res.status(200).json({
            payment,
            message: momoResult.message,
        });
    }
    catch (error) {
        console.error('Initiate payment error:', error);
        return res.status(500).json({ error: 'Failed to initiate Mobile Money payment' });
    }
}
/**
 * Production Webhook Callback (Paypack Rwanda / MTN MoMo API) with HMAC SHA-256 Signature Verification
 */
async function paymentWebhook(req, res) {
    try {
        const { reference, status } = req.body;
        const signature = req.headers['x-paypack-signature'] || req.headers['x-webhook-signature'];
        if (!reference || !status) {
            return res.status(400).json({ error: 'Reference and status are required' });
        }
        // Optional HMAC Signature Verification in production
        if (signature && process.env.NODE_ENV === 'production') {
            const expectedSignature = crypto_1.default
                .createHmac('sha256', PAYPACK_WEBHOOK_SECRET)
                .update(JSON.stringify(req.body))
                .digest('hex');
            if (signature !== expectedSignature) {
                console.warn('[SECURITY ALERT] Paypack webhook signature verification failed!');
                return res.status(401).json({ error: 'Invalid HMAC webhook signature' });
            }
        }
        // Find the payment record
        const payment = await db_1.default.payment.findUnique({
            where: { reference },
        });
        if (!payment) {
            return res.status(404).json({ error: 'Payment record not found' });
        }
        // Prevent double-charging / double-crediting
        if (payment.status !== 'pending') {
            return res.status(200).json({ message: 'Payment already processed', payment });
        }
        if (status === 'success') {
            // Begin transaction to guarantee database consistency
            await db_1.default.$transaction(async (tx) => {
                // Update payment status
                await tx.payment.update({
                    where: { id: payment.id },
                    data: { status: 'success' },
                });
                const service = payment.serviceType;
                if (service === 'quick_check' || service === 'standard') {
                    if (!payment.slotId) {
                        throw new Error('Slot ID missing for booking payment');
                    }
                    // Create the booking
                    const booking = await tx.booking.create({
                        data: {
                            userId: payment.userId,
                            slotId: payment.slotId,
                            serviceType: service,
                            status: 'confirmed',
                            videoRoomUrl: `http://localhost:3000/room/${payment.slotId}`,
                        },
                    });
                    // Mark slot as booked
                    await tx.availabilitySlot.update({
                        where: { id: payment.slotId },
                        data: { isBooked: true },
                    });
                    console.log(`[PAYMENT SUCCESS] Confirmed booking ${booking.id} for user ${payment.userId}`);
                }
                else if (service === 'gold_bundle') {
                    // Increment Gold credits (3 session credits)
                    await tx.wallet.update({
                        where: { userId: payment.userId },
                        data: {
                            sessionCredits: { increment: 3 },
                        },
                    });
                    console.log(`[PAYMENT SUCCESS] Credited 3 session credits to user ${payment.userId}`);
                }
                else if (service === 'platinum_sub') {
                    const renewsAt = new Date();
                    renewsAt.setDate(renewsAt.getDate() + 30);
                    // Update Subscription and credit wallet minutes
                    await tx.subscription.upsert({
                        where: { userId: payment.userId },
                        update: {
                            status: 'active',
                            plan: 'platinum',
                            renewsAt,
                        },
                        create: {
                            userId: payment.userId,
                            status: 'active',
                            plan: 'platinum',
                            renewsAt,
                        },
                    });
                    await tx.wallet.update({
                        where: { userId: payment.userId },
                        data: {
                            minuteBalance: { increment: 120 },
                        },
                    });
                    console.log(`[PAYMENT SUCCESS] Activated Platinum subscription for user ${payment.userId}`);
                }
            });
            return res.status(200).json({ message: 'Payment success hook processed successfully' });
        }
        else {
            // Failed payment
            await db_1.default.payment.update({
                where: { id: payment.id },
                data: { status: 'failed' },
            });
            return res.status(200).json({ message: 'Payment marked as failed' });
        }
    }
    catch (error) {
        console.error('Payment webhook error:', error);
        return res.status(500).json({ error: 'Failed to process payment callback webhook' });
    }
}
/**
 * Admin action to refund / reverse wallet credits
 */
async function refundWalletCredit(req, res) {
    try {
        const { userId, credits, minutes } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const wallet = await db_1.default.wallet.findUnique({
            where: { userId },
        });
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found for this user' });
        }
        const updatedWallet = await db_1.default.wallet.update({
            where: { userId },
            data: {
                sessionCredits: {
                    set: Math.max(0, wallet.sessionCredits + (credits || 0)),
                },
                minuteBalance: {
                    set: Math.max(0, wallet.minuteBalance + (minutes || 0)),
                },
            },
        });
        console.log(`[REFUND] Admin manually adjusted wallet for ${userId}: credits=${credits || 0}, minutes=${minutes || 0}`);
        return res.status(200).json({ message: 'Wallet adjusted successfully', wallet: updatedWallet });
    }
    catch (error) {
        console.error('Refund credit error:', error);
        return res.status(500).json({ error: 'Failed to perform wallet refund adjustment' });
    }
}
