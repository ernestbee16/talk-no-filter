"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookWithWallet = bookWithWallet;
exports.getMyBookings = getMyBookings;
exports.getExpertBookings = getExpertBookings;
exports.saveConsultationNotes = saveConsultationNotes;
const db_1 = __importDefault(require("../utils/db"));
const crypto_1 = require("../utils/crypto");
/**
 * Books a session instantly using Wallet Credits or Subscription Minutes
 */
async function bookWithWallet(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { slotId, serviceType } = req.body; // serviceType: "gold_credit" or "platinum_credit"
        if (!slotId || !serviceType) {
            return res.status(400).json({ error: 'Slot ID and service credit type are required' });
        }
        const slot = await db_1.default.availabilitySlot.findUnique({ where: { id: slotId } });
        if (!slot || slot.isBooked) {
            return res.status(400).json({ error: 'Time slot is no longer available' });
        }
        const wallet = await db_1.default.wallet.findUnique({ where: { userId } });
        if (!wallet) {
            return res.status(404).json({ error: 'User wallet not found' });
        }
        // Deduct appropriate credit
        if (serviceType === 'gold_credit') {
            if (wallet.sessionCredits < 1) {
                return res.status(400).json({ error: 'Insufficient Gold package credits' });
            }
            await db_1.default.$transaction([
                db_1.default.wallet.update({
                    where: { userId },
                    data: { sessionCredits: { decrement: 1 } },
                }),
                db_1.default.booking.create({
                    data: {
                        userId,
                        slotId,
                        serviceType: 'gold_credit',
                        status: 'confirmed',
                        videoRoomUrl: `https://meet.daily.co/talk-no-filter-${slotId}`,
                    },
                }),
                db_1.default.availabilitySlot.update({
                    where: { id: slotId },
                    data: { isBooked: true },
                }),
            ]);
        }
        else if (serviceType === 'platinum_credit') {
            // Determine cost in minutes (Quick check = 15m, Standard = 30m)
            const durationMin = 30; // Default standard session
            if (wallet.minuteBalance < durationMin) {
                return res.status(400).json({ error: 'Insufficient Platinum subscription minutes' });
            }
            await db_1.default.$transaction([
                db_1.default.wallet.update({
                    where: { userId },
                    data: { minuteBalance: { decrement: durationMin } },
                }),
                db_1.default.booking.create({
                    data: {
                        userId,
                        slotId,
                        serviceType: 'platinum_credit',
                        status: 'confirmed',
                        videoRoomUrl: `https://meet.daily.co/talk-no-filter-${slotId}`,
                    },
                }),
                db_1.default.availabilitySlot.update({
                    where: { id: slotId },
                    data: { isBooked: true },
                }),
            ]);
        }
        else {
            return res.status(400).json({ error: 'Invalid wallet booking type' });
        }
        return res.status(200).json({ message: 'Booking confirmed using wallet credits' });
    }
    catch (error) {
        console.error('Wallet booking error:', error);
        return res.status(500).json({ error: 'Failed to process wallet booking' });
    }
}
/**
 * Fetch bookings for the logged-in User
 */
async function getMyBookings(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const bookings = await db_1.default.booking.findMany({
            where: { userId },
            include: {
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        // Populate slot and expert details
        const populatedBookings = await Promise.all(bookings.map(async (b) => {
            const slot = await db_1.default.availabilitySlot.findUnique({
                where: { id: b.slotId },
                include: { expert: true },
            });
            return {
                ...b,
                slot,
            };
        }));
        return res.status(200).json(populatedBookings);
    }
    catch (error) {
        console.error('Fetch user bookings error:', error);
        return res.status(500).json({ error: 'Failed to retrieve bookings list' });
    }
}
/**
 * Fetch bookings for the logged-in Expert
 */
async function getExpertBookings(req, res) {
    try {
        const expertId = req.expert?.id;
        if (!expertId)
            return res.status(401).json({ error: 'Unauthorized' });
        const slots = await db_1.default.availabilitySlot.findMany({
            where: { expertId },
            select: { id: true },
        });
        const slotIds = slots.map((s) => s.id);
        const bookings = await db_1.default.booking.findMany({
            where: {
                slotId: { in: slotIds },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        const populated = await Promise.all(bookings.map(async (b) => {
            const slot = await db_1.default.availabilitySlot.findUnique({ where: { id: b.slotId } });
            return {
                ...b,
                slot,
                notes: b.notesEnc ? (0, crypto_1.decrypt)(b.notesEnc) : '', // Decrypt notes on fetch
            };
        }));
        return res.status(200).json(populated);
    }
    catch (error) {
        console.error('Fetch expert bookings error:', error);
        return res.status(500).json({ error: 'Failed to retrieve expert consultations' });
    }
}
/**
 * Save encrypted consultation notes (Expert Action)
 */
async function saveConsultationNotes(req, res) {
    try {
        const expertId = req.expert?.id;
        if (!expertId)
            return res.status(403).json({ error: 'Only experts can save notes' });
        const { bookingId, notes } = req.body;
        if (!bookingId || notes === undefined) {
            return res.status(400).json({ error: 'Booking ID and notes string required' });
        }
        // Verify booking belongs to this expert
        const booking = await db_1.default.booking.findUnique({ where: { id: bookingId } });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        const slot = await db_1.default.availabilitySlot.findUnique({ where: { id: booking.slotId } });
        if (!slot || slot.expertId !== expertId) {
            return res.status(403).json({ error: 'Access restricted to assigned expert' });
        }
        // Encrypt notes at rest
        const encryptedNotes = (0, crypto_1.encrypt)(notes);
        await db_1.default.booking.update({
            where: { id: bookingId },
            data: {
                notesEnc: encryptedNotes,
            },
        });
        return res.status(200).json({ message: 'Consultation notes saved securely' });
    }
    catch (error) {
        console.error('Save notes error:', error);
        return res.status(500).json({ error: 'Failed to secure consultation notes' });
    }
}
