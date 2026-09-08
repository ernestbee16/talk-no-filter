import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/db';

/**
 * Fetch all scheduled webinars and historical recordings
 */
export async function getWebinars(req: Request, res: Response) {
  try {
    const webinars = await prisma.webinar.findMany({
      orderBy: { scheduledAt: 'asc' },
    });
    return res.status(200).json(webinars);
  } catch (error) {
    console.error('Fetch webinars error:', error);
    return res.status(500).json({ error: 'Failed to retrieve webinars list' });
  }
}

/**
 * Register for a webinar (requires only phone number, low login barrier)
 */
export async function registerForWebinar(req: Request, res: Response) {
  try {
    const { webinarId } = req.params;
    const { phone } = req.body;

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ error: 'Phone number is required for webinar RSVP' });
    }

    const webinar = await prisma.webinar.findUnique({
      where: { id: webinarId },
    });

    if (!webinar) {
      return res.status(404).json({ error: 'Webinar not found' });
    }

    // Verify user is not already registered with this phone number
    const existingRegistration = await prisma.webinarRegistration.findFirst({
      where: {
        webinarId,
        phone: phone.trim(),
      },
    });

    if (existingRegistration) {
      return res.status(200).json({ message: 'You have already registered for this webinar!' });
    }

    const registration = await prisma.webinarRegistration.create({
      data: {
        webinarId,
        phone: phone.trim(),
      },
    });

    console.log(`[WEBINAR RSVP] RSVP confirmed for phone ${phone.trim()} to webinar ${webinarId}`);
    return res.status(201).json({
      message: 'RSVP confirmed. We will send you calendar alerts on SMS/WhatsApp before the session.',
      registration,
    });
  } catch (error) {
    console.error('Webinar registration error:', error);
    return res.status(500).json({ error: 'Failed to complete webinar registration' });
  }
}

/**
 * Schedule a new webinar (Admin / Expert action)
 */
export async function createWebinar(req: AuthRequest, res: Response) {
  try {
    const { title, description, scheduledAt, recordingUrl } = req.body;

    if (!title || !description || !scheduledAt) {
      return res.status(400).json({ error: 'Title, description, and scheduled start date are required' });
    }

    const scheduleDate = new Date(scheduledAt);
    if (isNaN(scheduleDate.getTime())) {
      return res.status(400).json({ error: 'Invalid scheduled date format' });
    }

    const webinar = await prisma.webinar.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        scheduledAt: scheduleDate,
        recordingUrl: recordingUrl || null,
      },
    });

    console.log(`[WEBINAR CREATED] Scheduled new live seminar: ${webinar.id}`);
    return res.status(201).json(webinar);
  } catch (error) {
    console.error('Create webinar error:', error);
    return res.status(500).json({ error: 'Failed to schedule new webinar' });
  }
}
