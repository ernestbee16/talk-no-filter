import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/db';
import { encrypt, decrypt } from '../utils/crypto';

/**
 * Submit an anonymous question.
 * Crucial Privacy Control: No user identifier, IP, or browser metadata is stored or logged.
 */
export async function submitQuestion(req: Request, res: Response) {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Question content cannot be empty' });
    }

    // Encrypt sensitive content at rest
    const encryptedContent = encrypt(content.trim());

    const question = await prisma.anonymousQuestion.create({
      data: {
        contentEnc: encryptedContent,
        status: 'pending',
      },
    });

    console.log(`[PRIVACY LOG] Anonymous question ${question.id} submitted. Submitter metadata discarded.`);
    return res.status(201).json({ message: 'Question submitted successfully and securely.' });
  } catch (error) {
    console.error('Anonymous Q&A submission error:', error);
    return res.status(500).json({ error: 'Failed to submit anonymous question' });
  }
}

/**
 * Fetch all published questions (FAQ feed)
 */
export async function getPublishedQuestions(req: Request, res: Response) {
  try {
    const questions = await prisma.anonymousQuestion.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
    });

    const decrypted = questions.map((q) => ({
      id: q.id,
      content: decrypt(q.contentEnc),
      answer: q.answerEnc ? decrypt(q.answerEnc) : '',
      publishedAt: q.publishedAt,
    }));

    return res.status(200).json(decrypted);
  } catch (error) {
    console.error('Fetch published Q&A error:', error);
    return res.status(500).json({ error: 'Failed to fetch public FAQs' });
  }
}

/**
 * Fetch the pending moderation queue (Expert Action)
 */
export async function getModerationQueue(req: AuthRequest, res: Response) {
  try {
    const questions = await prisma.anonymousQuestion.findMany({
      where: {
        status: { in: ['pending', 'answered'] },
      },
      orderBy: { submittedAt: 'asc' },
    });

    const decrypted = questions.map((q) => ({
      id: q.id,
      content: decrypt(q.contentEnc),
      answer: q.answerEnc ? decrypt(q.answerEnc) : '',
      status: q.status,
      submittedAt: q.submittedAt,
    }));

    return res.status(200).json(decrypted);
  } catch (error) {
    console.error('Fetch moderation queue error:', error);
    return res.status(500).json({ error: 'Failed to fetch moderation queue' });
  }
}

/**
 * Answer/update an anonymous question (Expert Action)
 */
export async function answerQuestion(req: AuthRequest, res: Response) {
  try {
    const { questionId, answer } = req.body;
    if (!questionId || !answer) {
      return res.status(400).json({ error: 'Question ID and answer text required' });
    }

    const question = await prisma.anonymousQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const encryptedAnswer = encrypt(answer.trim());

    await prisma.anonymousQuestion.update({
      where: { id: questionId },
      data: {
        answerEnc: encryptedAnswer,
        status: 'answered',
      },
    });

    return res.status(200).json({ message: 'Answer saved. Question marked as answered.' });
  } catch (error) {
    console.error('Answer Q&A error:', error);
    return res.status(500).json({ error: 'Failed to save question answer' });
  }
}

/**
 * Generalize and publish an anonymous question (Expert/Admin Action)
 * Ensures any identifying details are modified before placing on public feed.
 */
export async function publishQuestion(req: AuthRequest, res: Response) {
  try {
    const { questionId, content, answer } = req.body;
    if (!questionId || !content || !answer) {
      return res.status(400).json({ error: 'Question ID, generalized content, and answer required' });
    }

    // Encrypt generalized text
    const encryptedContent = encrypt(content.trim());
    const encryptedAnswer = encrypt(answer.trim());

    await prisma.anonymousQuestion.update({
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
  } catch (error) {
    console.error('Publish Q&A error:', error);
    return res.status(500).json({ error: 'Failed to publish Q&A item' });
  }
}
