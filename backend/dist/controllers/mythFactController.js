"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMythFacts = getMythFacts;
exports.submitClaim = submitClaim;
exports.getDraftClaims = getDraftClaims;
exports.publishMythFact = publishMythFact;
exports.incrementStats = incrementStats;
const db_1 = __importDefault(require("../utils/db"));
/**
 * Fetch all published Myth vs Fact cards
 */
async function getMythFacts(req, res) {
    try {
        const cards = await db_1.default.mythFact.findMany({
            where: { status: 'published' },
            orderBy: { publishedAt: 'desc' },
        });
        return res.status(200).json(cards);
    }
    catch (error) {
        console.error('Fetch myth-facts error:', error);
        return res.status(500).json({ error: 'Failed to retrieve Myth vs. Fact list' });
    }
}
/**
 * User submission: "Where did you hear this claim?"
 */
async function submitClaim(req, res) {
    try {
        const { claim } = req.body;
        if (!claim || typeof claim !== 'string') {
            return res.status(400).json({ error: 'Claim content is required' });
        }
        const submission = await db_1.default.mythFact.create({
            data: {
                claim: claim.trim(),
                verifiedFact: '', // Empty until addressed by expert
                sourceName: '', // Empty until addressed by expert
                status: 'draft',
            },
        });
        console.log(`[MYTH FACT SUBMIT] New claim submitted for review: ${submission.id}`);
        return res.status(201).json({ message: 'Claim submitted. Our experts will check it soon.' });
    }
    catch (error) {
        console.error('Submit claim error:', error);
        return res.status(500).json({ error: 'Failed to submit claim for review' });
    }
}
/**
 * Fetch all draft claims (Admin/Expert action)
 */
async function getDraftClaims(req, res) {
    try {
        const claims = await db_1.default.mythFact.findMany({
            where: { status: 'draft' },
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json(claims);
    }
    catch (error) {
        console.error('Fetch drafts error:', error);
        return res.status(500).json({ error: 'Failed to fetch draft claims' });
    }
}
/**
 * Create or publish a Myth vs. Fact card (Admin/Expert action)
 * Requires source attribution.
 */
async function publishMythFact(req, res) {
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
            card = await db_1.default.mythFact.update({
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
        }
        else {
            // Create new published card from scratch
            card = await db_1.default.mythFact.create({
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
    }
    catch (error) {
        console.error('Publish myth-fact error:', error);
        return res.status(500).json({ error: 'Failed to publish Myth vs. Fact card' });
    }
}
/**
 * Track share or view click events (for trending analytics)
 */
async function incrementStats(req, res) {
    try {
        const { id } = req.params;
        const { action } = req.body; // "view" or "share"
        if (action !== 'view' && action !== 'share') {
            return res.status(400).json({ error: 'Invalid stats action' });
        }
        const updated = await db_1.default.mythFact.update({
            where: { id },
            data: {
                viewCount: action === 'view' ? { increment: 1 } : undefined,
                shareCount: action === 'share' ? { increment: 1 } : undefined,
            },
        });
        return res.status(200).json(updated);
    }
    catch (error) {
        console.error('Increment stats error:', error);
        return res.status(500).json({ error: 'Failed to record card statistics' });
    }
}
