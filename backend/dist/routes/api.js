"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const expertController_1 = require("../controllers/expertController");
const bookingController_1 = require("../controllers/bookingController");
const paymentController_1 = require("../controllers/paymentController");
const questionController_1 = require("../controllers/questionController");
const mythFactController_1 = require("../controllers/mythFactController");
const webinarController_1 = require("../controllers/webinarController");
const aiController_1 = require("../controllers/aiController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// --- Auth Routes ---
router.post('/auth/request-otp', authController_1.requestOtp);
router.post('/auth/verify-otp', authController_1.verifyOtp);
router.post('/auth/login', authController_1.loginUser);
router.post('/auth/expert-login', authController_1.loginExpert);
// --- AI Health Assistant Route ---
router.post('/ai/chat', aiController_1.chatAiAssistant);
// --- Expert Profile & Slot Routes ---
router.get('/experts', expertController_1.getExperts);
router.get('/experts/:expertId/slots', expertController_1.getExpertSlots);
router.post('/experts/slots', auth_1.authenticateExpert, expertController_1.createSlot);
// --- Booking Routes ---
router.post('/bookings/wallet-book', auth_1.authenticateToken, bookingController_1.bookWithWallet);
router.get('/bookings/my-bookings', auth_1.authenticateToken, bookingController_1.getMyBookings);
router.get('/bookings/expert-bookings', auth_1.authenticateExpert, bookingController_1.getExpertBookings);
router.post('/bookings/notes', auth_1.authenticateExpert, bookingController_1.saveConsultationNotes);
// --- Payment Routes ---
router.post('/payments/initiate', paymentController_1.initiatePayment);
router.post('/payments/webhook', paymentController_1.paymentWebhook);
router.post('/payments/refund', paymentController_1.refundWalletCredit); // Admin override for refunds
// --- Anonymous Q&A Routes ---
router.post('/questions/submit', questionController_1.submitQuestion); // Public - discard identity logs
router.get('/questions/published', questionController_1.getPublishedQuestions); // Public FAQ
router.get('/questions/moderation-queue', auth_1.authenticateExpert, questionController_1.getModerationQueue); // Experts check incoming list
router.post('/questions/answer', auth_1.authenticateExpert, questionController_1.answerQuestion); // Expert answers question
router.post('/questions/publish', auth_1.authenticateExpert, questionController_1.publishQuestion); // Expert publishes question
// --- Myth vs Fact Routes ---
router.get('/mythfacts', mythFactController_1.getMythFacts); // Public Hub cards
router.post('/mythfacts/submit-claim', mythFactController_1.submitClaim); // Public form: "where did you hear this?"
router.get('/mythfacts/submissions', auth_1.authenticateExpert, mythFactController_1.getDraftClaims); // Expert lists claims
router.post('/mythfacts/publish', auth_1.authenticateExpert, mythFactController_1.publishMythFact); // Expert reviews and publishes cards
router.post('/mythfacts/:id/stats', mythFactController_1.incrementStats); // Track clicks/shares
// --- Webinar Routes ---
router.get('/webinars', webinarController_1.getWebinars); // Public webinar list
router.post('/webinars/:webinarId/register', webinarController_1.registerForWebinar); // Register RSVP
router.post('/webinars', auth_1.authenticateExpert, webinarController_1.createWebinar); // Admin schedules webinar
exports.default = router;
