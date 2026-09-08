import { Router } from 'express';
import { loginUser, loginExpert, requestOtp, verifyOtp } from '../controllers/authController';
import { getExperts, getExpertSlots, createSlot } from '../controllers/expertController';
import { bookWithWallet, getMyBookings, getExpertBookings, saveConsultationNotes } from '../controllers/bookingController';
import { initiatePayment, paymentWebhook, refundWalletCredit } from '../controllers/paymentController';
import { submitQuestion, getPublishedQuestions, getModerationQueue, answerQuestion, publishQuestion } from '../controllers/questionController';
import { getMythFacts, submitClaim, getDraftClaims, publishMythFact, incrementStats } from '../controllers/mythFactController';
import { getWebinars, registerForWebinar, createWebinar } from '../controllers/webinarController';
import { chatAiAssistant } from '../controllers/aiController';
import { authenticateToken, authenticateExpert, optionalAuthenticate } from '../middleware/auth';

const router = Router();

// --- Auth Routes ---
router.post('/auth/request-otp', requestOtp);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/login', loginUser);
router.post('/auth/expert-login', loginExpert);

// --- AI Health Assistant Route ---
router.post('/ai/chat', chatAiAssistant);

// --- Expert Profile & Slot Routes ---
router.get('/experts', getExperts);
router.get('/experts/:expertId/slots', getExpertSlots);
router.post('/experts/slots', authenticateExpert, createSlot);

// --- Booking Routes ---
router.post('/bookings/wallet-book', authenticateToken, bookWithWallet);
router.get('/bookings/my-bookings', authenticateToken, getMyBookings);
router.get('/bookings/expert-bookings', authenticateExpert, getExpertBookings);
router.post('/bookings/notes', authenticateExpert, saveConsultationNotes);

// --- Payment Routes ---
router.post('/payments/initiate', initiatePayment);
router.post('/payments/webhook', paymentWebhook);
router.post('/payments/refund', refundWalletCredit); // Admin override for refunds

// --- Anonymous Q&A Routes ---
router.post('/questions/submit', submitQuestion); // Public - discard identity logs
router.get('/questions/published', getPublishedQuestions); // Public FAQ
router.get('/questions/moderation-queue', authenticateExpert, getModerationQueue); // Experts check incoming list
router.post('/questions/answer', authenticateExpert, answerQuestion); // Expert answers question
router.post('/questions/publish', authenticateExpert, publishQuestion); // Expert publishes question

// --- Myth vs Fact Routes ---
router.get('/mythfacts', getMythFacts); // Public Hub cards
router.post('/mythfacts/submit-claim', submitClaim); // Public form: "where did you hear this?"
router.get('/mythfacts/submissions', authenticateExpert, getDraftClaims); // Expert lists claims
router.post('/mythfacts/publish', authenticateExpert, publishMythFact); // Expert reviews and publishes cards
router.post('/mythfacts/:id/stats', incrementStats); // Track clicks/shares

// --- Webinar Routes ---
router.get('/webinars', getWebinars); // Public webinar list
router.post('/webinars/:webinarId/register', registerForWebinar); // Register RSVP
router.post('/webinars', authenticateExpert, createWebinar); // Admin schedules webinar

export default router;
