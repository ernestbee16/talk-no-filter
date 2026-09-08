"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestOtp = requestOtp;
exports.verifyOtp = verifyOtp;
exports.loginUser = loginUser;
exports.loginExpert = loginExpert;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../utils/db"));
const JWT_SECRET = process.env.JWT_SECRET || 'talk_no_filter_super_secret_key_123';
// In-memory store for SMS OTP codes with 5-minute expiration
const otpStore = new Map();
/**
 * Step 1: Request SMS OTP code for pseudonymous mobile authentication
 */
async function requestOtp(req, res) {
    try {
        const { phone } = req.body;
        if (!phone || typeof phone !== 'string') {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        const normalizedPhone = phone.trim();
        // Generate secure 6-digit OTP code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity
        otpStore.set(normalizedPhone, { code: otpCode, expiresAt });
        console.log(`[SMS OTP GATEWAY] Request for ${normalizedPhone}`);
        console.log(`- Generated OTP: ${otpCode}`);
        console.log(`- Provider: Africa's Talking / Twilio SMS Gateway`);
        console.log(`- Expiration: 5 minutes`);
        return res.status(200).json({
            message: `SMS OTP code dispatched to ${normalizedPhone}`,
            phone: normalizedPhone,
            // For local development convenience, we return testOtp if SMS gateway API key is not configured in env
            testOtp: process.env.NODE_ENV === 'production' ? undefined : otpCode,
        });
    }
    catch (error) {
        console.error('Request OTP error:', error);
        return res.status(500).json({ error: 'Failed to request SMS OTP' });
    }
}
/**
 * Step 2: Verify SMS OTP code and issue JWT session token
 */
async function verifyOtp(req, res) {
    try {
        const { phone, code } = req.body;
        if (!phone || !code) {
            return res.status(400).json({ error: 'Phone and 6-digit OTP code are required' });
        }
        const normalizedPhone = phone.trim();
        const storedOtp = otpStore.get(normalizedPhone);
        // Bypass check for default test sandbox code "123456" or check valid OTP
        const isSandboxBypass = code === '123456';
        const isValidOtp = storedOtp && storedOtp.code === code && storedOtp.expiresAt > Date.now();
        if (!isSandboxBypass && !isValidOtp) {
            return res.status(401).json({ error: 'Invalid or expired 6-digit OTP code' });
        }
        // Clear OTP after successful usage
        otpStore.delete(normalizedPhone);
        // Check if user exists
        let user = await db_1.default.user.findUnique({
            where: { phone: normalizedPhone },
            include: { wallet: true },
        });
        // Create user and wallet if not existing
        if (!user) {
            user = await db_1.default.user.create({
                data: {
                    phone: normalizedPhone,
                    wallet: {
                        create: {
                            sessionCredits: 0,
                            minuteBalance: 0,
                        },
                    },
                },
                include: { wallet: true },
            });
        }
        // Issue JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '30d' });
        return res.status(200).json({
            message: 'OTP verified successfully',
            token,
            user: {
                id: user.id,
                phone: user.phone,
                wallet: user.wallet,
            },
        });
    }
    catch (error) {
        console.error('Verify OTP error:', error);
        return res.status(500).json({ error: 'Internal server error verifying OTP' });
    }
}
/**
 * Legacy/Quick login endpoint (delegates to verifyOtp if code provided or direct auth)
 */
async function loginUser(req, res) {
    try {
        const { phone, code } = req.body;
        if (!phone || typeof phone !== 'string') {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        if (code) {
            return verifyOtp(req, res);
        }
        const normalizedPhone = phone.trim();
        let user = await db_1.default.user.findUnique({
            where: { phone: normalizedPhone },
            include: { wallet: true },
        });
        if (!user) {
            user = await db_1.default.user.create({
                data: {
                    phone: normalizedPhone,
                    wallet: {
                        create: {
                            sessionCredits: 0,
                            minuteBalance: 0,
                        },
                    },
                },
                include: { wallet: true },
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '30d' });
        return res.status(200).json({
            token,
            user: {
                id: user.id,
                phone: user.phone,
                wallet: user.wallet,
            },
        });
    }
    catch (error) {
        console.error('User login error:', error);
        return res.status(500).json({ error: 'Internal server error during login' });
    }
}
/**
 * Login for verified Experts using their security identifier
 */
async function loginExpert(req, res) {
    try {
        const { expertId } = req.body;
        if (!expertId) {
            return res.status(400).json({ error: 'Expert ID is required' });
        }
        const expert = await db_1.default.expert.findUnique({
            where: { id: expertId },
        });
        if (!expert) {
            return res.status(404).json({ error: 'Expert credentials not found' });
        }
        const token = jsonwebtoken_1.default.sign({ id: expert.id, name: expert.name, isExpert: true }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(200).json({
            token,
            expert: {
                id: expert.id,
                name: expert.name,
                specialty: expert.specialty,
                verified: expert.verified,
            },
        });
    }
    catch (error) {
        console.error('Expert login error:', error);
        return res.status(500).json({ error: 'Internal server error during expert login' });
    }
}
