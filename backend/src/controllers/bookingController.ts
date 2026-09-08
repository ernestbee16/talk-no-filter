import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/db';
import { encrypt, decrypt } from '../utils/crypto';

/**
 * Books a session instantly using Wallet Credits or Subscription Minutes
 */
export async function bookWithWallet(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { slotId, serviceType } = req.body; // serviceType: "gold_credit" or "platinum_credit"
    if (!slotId || !serviceType) {
      return res.status(400).json({ error: 'Slot ID and service credit type are required' });
    }

    const slot = await prisma.availabilitySlot.findUnique({ where: { id: slotId } });
    if (!slot || slot.isBooked) {
      return res.status(400).json({ error: 'Time slot is no longer available' });
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      return res.status(404).json({ error: 'User wallet not found' });
    }

    // Deduct appropriate credit
    if (serviceType === 'gold_credit') {
      if (wallet.sessionCredits < 1) {
        return res.status(400).json({ error: 'Insufficient Gold package credits' });
      }
      
      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId },
          data: { sessionCredits: { decrement: 1 } },
        }),
        prisma.booking.create({
          data: {
            userId,
            slotId,
            serviceType: 'gold_credit',
            status: 'confirmed',
            videoRoomUrl: `https://meet.daily.co/talk-no-filter-${slotId}`,
          },
        }),
        prisma.availabilitySlot.update({
          where: { id: slotId },
          data: { isBooked: true },
        }),
      ]);
    } else if (serviceType === 'platinum_credit') {
      // Determine cost in minutes (Quick check = 15m, Standard = 30m)
      const durationMin = 30; // Default standard session
      if (wallet.minuteBalance < durationMin) {
        return res.status(400).json({ error: 'Insufficient Platinum subscription minutes' });
      }

      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId },
          data: { minuteBalance: { decrement: durationMin } },
        }),
        prisma.booking.create({
          data: {
            userId,
            slotId,
            serviceType: 'platinum_credit',
            status: 'confirmed',
            videoRoomUrl: `https://meet.daily.co/talk-no-filter-${slotId}`,
          },
        }),
        prisma.availabilitySlot.update({
          where: { id: slotId },
          data: { isBooked: true },
        }),
      ]);
    } else {
      return res.status(400).json({ error: 'Invalid wallet booking type' });
    }

    return res.status(200).json({ message: 'Booking confirmed using wallet credits' });
  } catch (error) {
    console.error('Wallet booking error:', error);
    return res.status(500).json({ error: 'Failed to process wallet booking' });
  }
}

/**
 * Fetch bookings for the logged-in User
 */
export async function getMyBookings(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Populate slot and expert details
    const populatedBookings = await Promise.all(
      bookings.map(async (b) => {
        const slot = await prisma.availabilitySlot.findUnique({
          where: { id: b.slotId },
          include: { expert: true },
        });
        return {
          ...b,
          slot,
        };
      })
    );

    return res.status(200).json(populatedBookings);
  } catch (error) {
    console.error('Fetch user bookings error:', error);
    return res.status(500).json({ error: 'Failed to retrieve bookings list' });
  }
}

/**
 * Fetch bookings for the logged-in Expert
 */
export async function getExpertBookings(req: AuthRequest, res: Response) {
  try {
    const expertId = req.expert?.id;
    if (!expertId) return res.status(401).json({ error: 'Unauthorized' });

    const slots = await prisma.availabilitySlot.findMany({
      where: { expertId },
      select: { id: true },
    });
    const slotIds = slots.map((s) => s.id);

    const bookings = await prisma.booking.findMany({
      where: {
        slotId: { in: slotIds },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const populated = await Promise.all(
      bookings.map(async (b) => {
        const slot = await prisma.availabilitySlot.findUnique({ where: { id: b.slotId } });
        return {
          ...b,
          slot,
          notes: b.notesEnc ? decrypt(b.notesEnc) : '', // Decrypt notes on fetch
        };
      })
    );

    return res.status(200).json(populated);
  } catch (error) {
    console.error('Fetch expert bookings error:', error);
    return res.status(500).json({ error: 'Failed to retrieve expert consultations' });
  }
}

/**
 * Save encrypted consultation notes (Expert Action)
 */
export async function saveConsultationNotes(req: AuthRequest, res: Response) {
  try {
    const expertId = req.expert?.id;
    if (!expertId) return res.status(403).json({ error: 'Only experts can save notes' });

    const { bookingId, notes } = req.body;
    if (!bookingId || notes === undefined) {
      return res.status(400).json({ error: 'Booking ID and notes string required' });
    }

    // Verify booking belongs to this expert
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const slot = await prisma.availabilitySlot.findUnique({ where: { id: booking.slotId } });
    if (!slot || slot.expertId !== expertId) {
      return res.status(403).json({ error: 'Access restricted to assigned expert' });
    }

    // Encrypt notes at rest
    const encryptedNotes = encrypt(notes);

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        notesEnc: encryptedNotes,
      },
    });

    return res.status(200).json({ message: 'Consultation notes saved securely' });
  } catch (error) {
    console.error('Save notes error:', error);
    return res.status(500).json({ error: 'Failed to secure consultation notes' });
  }
}
