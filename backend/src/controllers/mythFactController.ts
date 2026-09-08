import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/db';

/**
 * Fetch all published Myth vs Fact cards
 */
export async function getMythFacts(req: Request, res: Response) {
  try {
    const cards = await prisma.mythFact.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
    });
    return res.status(200).json(cards);
  } catch (error) {
    console.error('Fetch myth-facts error:', error);
    return res.status(500).json({ error: 'Failed to retrieve Myth vs. Fact list' });
  }
}

/**
 * User submission: "Where did you hear this claim?"
 */
export async function submitClaim(req: Request, res: Response) {
  try {
    const { claim } = req.body;
    if (!claim || typeof claim !== 'string') {
      return res.status(400).json({ error: 'Claim content is required' });
    }

    const submission = await prisma.mythFact.create({
      data: {
        claim: claim.trim(),
        verifiedFact: '', // Empty until addressed by expert
        sourceName: '',   // Empty until addressed by expert
        status: 'draft',
      },
    });

    console.log(`[MYTH FACT SUBMIT] New claim submitted for review: ${submission.id}`);
    return res.status(201).json({ message: 'Claim submitted. Our experts will check it soon.' });
  } catch (error) {
    console.error('Submit claim error:', error);
    return res.status(500).json({ error: 'Failed to submit claim for review' });
  }
}

/**
 * Fetch all draft claims (Admin/Expert action)
 */
export async function getDraftClaims(req: AuthRequest, res: Response) {
  try {
    const claims = await prisma.mythFact.findMany({
      where: { status: 'draft' },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(claims);
  } catch (error) {
    console.error('Fetch drafts error:', error);
    return res.status(500).json({ error: 'Failed to fetch draft claims' });
  }
}

/**
 * Create or publish a Myth vs. Fact card (Admin/Expert action)
 * Requires source attribution.
 */
export async function publishMythFact(req: AuthRequest, res: Response) {
  try {
    const { claim, verifiedFact, sourceName, sourceUrl, draftId } = req.body;
    
    // Crucial rule check: source attribution required
    if (!claim || !verifiedFact || !sourceName) {
      return res.status(400).json({ error: 'Claim, verified fact, and credible source attribution are required' });
    }

    const expertId = req.expert?.id || null;

    let card;

    if (draftId) {
      // Update existing draft card to published status
      card = await prisma.mythFact.update({
        where: { id: draftId },
        data: {
          claim: claim.trim(),
          verifiedFact: verifiedFact.trim(),
          sourceName: sourceName.trim(),
          sourceUrl: sourceUrl ? sourceUrl.trim() : null,
          authorExpertId: expertId,
          status: 'published',
          publishedAt: new Date(),
        },
      });
    } else {
      // Create new published card from scratch
      card = await prisma.mythFact.create({
        data: {
          claim: claim.trim(),
          verifiedFact: verifiedFact.trim(),
          sourceName: sourceName.trim(),
          sourceUrl: sourceUrl ? sourceUrl.trim() : null,
          authorExpertId: expertId,
          status: 'published',
          publishedAt: new Date(),
        },
      });
    }

    console.log(`[MYTH FACT PUBLISHED] New fact check card: ${card.id}`);
    return res.status(200).json(card);
  } catch (error) {
    console.error('Publish myth-fact error:', error);
    return res.status(500).json({ error: 'Failed to publish Myth vs. Fact card' });
  }
}

/**
 * Track share or view click events (for trending analytics)
 */
export async function incrementStats(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { action } = req.body; // "view" or "share"

    if (action !== 'view' && action !== 'share') {
      return res.status(400).json({ error: 'Invalid stats action' });
    }

    const updated = await prisma.mythFact.update({
      where: { id },
      data: {
        viewCount: action === 'view' ? { increment: 1 } : undefined,
        shareCount: action === 'share' ? { increment: 1 } : undefined,
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Increment stats error:', error);
    return res.status(500).json({ error: 'Failed to record card statistics' });
  }
}
