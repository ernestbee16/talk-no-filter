"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuestion = submitQuestion;
exports.getPublishedQuestions = getPublishedQuestions;
exports.getModerationQueue = getModerationQueue;
exports.answerQuestion = answerQuestion;
exports.publishQuestion = publishQuestion;
const db_1 = __importDefault(require("../utils/db"));
const crypto_1 = require("../utils/crypto");
/**
 * Submit an anonymous question.
 * Crucial Privacy Control: No user identifier, IP, or browser metadata is stored or logged.
 */
async function submitQuestion(req, res) {
    try {
        const { content } = req.body;
        if (!content || typeof content !== 'string') {
            return res.status(400).json({ error: 'Question content cannot be empty' });
        }
        // Encrypt sensitive content at rest
        const encryptedContent = (0, crypto_1.encrypt)(content.trim());
        const question = await db_1.default.anonymousQuestion.create({
            data: {
                contentEnc: encryptedContent,
                status: 'pending',
            },
        });
        console.log(`[PRIVACY LOG] Anonymous question ${question.id} submitted. Submitter metadata discarded.`);
        return res.status(201).json({ message: 'Question submitted successfully and securely.' });
    }
    catch (error) {
        console.error('Anonymous Q&A submission error:', error);
        return res.status(500).json({ error: 'Failed to submit anonymous question' });
    }
}
/**
 * Fetch all published questions (FAQ feed)
 */
async function getPublishedQuestions(req, res) {
    try {
        const questions = await db_1.default.anonymousQuestion.findMany({
            where: { status: 'published' },
            orderBy: { publishedAt: 'desc' },
        });
        const decrypted = questions.map((q) => ({
            id: q.id,
            content: (0, crypto_1.decrypt)(q.contentEnc),
            answer: q.answerEnc ? (0, crypto_1.decrypt)(q.answerEnc) : '',
            publishedAt: q.publishedAt,
        }));
        return res.status(200).json(decrypted);
    }
    catch (error) {
        console.error('Fetch published Q&A error:', error);
        return res.status(500).json({ error: 'Failed to fetch public FAQs' });
    }
}
/**
 * Fetch the pending moderation queue (Expert Action)
 */
async function getModerationQueue(req, res) {
    try {
        const questions = await db_1.default.anonymousQuestion.findMany({
            where: {
                status: { in: ['pending', 'answered'] },
            },
            orderBy: { submittedAt: 'asc' },
        });
        const decrypted = questions.map((q) => ({
            id: q.id,
            content: (0, crypto_1.decrypt)(q.contentEnc),
            answer: q.answerEnc ? (0, crypto_1.decrypt)(q.answerEnc) : '',
            status: q.status,
            submittedAt: q.submittedAt,
        }));
        return res.status(200).json(decrypted);
    }
    catch (error) {
        console.error('Fetch moderation queue error:', error);
        return res.status(500).json({ error: 'Failed to fetch moderation queue' });
    }
}
/**
 * Answer/update an anonymous question (Expert Action)
 */
async function answerQuestion(req, res) {
    try {
        const { questionId, answer } = req.body;
        if (!questionId || !answer) {
            return res.status(400).json({ error: 'Question ID and answer text required' });
        }
        const question = await db_1.default.anonymousQuestion.findUnique({
            where: { id: questionId },
        });
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        const encryptedAnswer = (0, crypto_1.encrypt)(answer.trim());
        await db_1.default.anonymousQuestion.update({
            where: { id: questionId },
            data: {
                answerEnc: encryptedAnswer,
                status: 'answered',
            },
        });
        return res.status(200).json({ message: 'Answer saved. Question marked as answered.' });
    }
    catch (error) {
        console.error('Answer Q&A error:', error);
        return res.status(500).json({ error: 'Failed to save question answer' });
    }
}
/**
 * Generalize and publish an anonymous question (Expert/Admin Action)
 * Ensures any identifying details are modified before placing on public feed.
 */
async function publishQuestion(req, res) {
    try {
        const { questionId, content, answer } = req.body;
        if (!questionId || !content || !answer) {
            return res.status(400).json({ error: 'Question ID, generalized content, and answer required' });
        }
        // Encrypt generalized text
        const encryptedContent = (0, crypto_1.encrypt)(content.trim());
        const encryptedAnswer = (0, crypto_1.encrypt)(answer.trim());
        await db_1.default.anonymousQuestion.update({
            where: { id: questionId },
            data: {
                contentEnc: encryptedContent,
                answerEnc: encryptedAnswer,
                status: 'published',
                publishedAt: new Date(),
            },
        });
        console.log(`[Q&A PUBLISHED] Question ${questionId} published to public FAQ database.`);
        return res.status(200).json({ message: 'Question published to public FAQ board successfully.' });
    }
    catch (error) {
        console.error('Publish Q&A error:', error);
        return res.status(500).json({ error: 'Failed to publish Q&A item' });
    }
}
