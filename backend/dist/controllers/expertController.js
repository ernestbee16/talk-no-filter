"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExperts = getExperts;
exports.getExpertSlots = getExpertSlots;
exports.createSlot = createSlot;
const db_1 = __importDefault(require("../utils/db"));
/**
 * Fetch all verified experts
 */
async function getExperts(req, res) {
    try {
        const experts = await db_1.default.expert.findMany({
            where: { verified: true },
        });
        return res.status(200).json(experts);
    }
    catch (error) {
        console.error('Fetch experts error:', error);
        return res.status(500).json({ error: 'Failed to fetch experts list' });
    }
}
/**
 * Get available slots for a specific expert
 */
async function getExpertSlots(req, res) {
    try {
        const { expertId } = req.params;
        const slots = await db_1.default.availabilitySlot.findMany({
            where: {
                expertId,
                isBooked: false,
                startTime: {
                    gte: new Date(), // Only slots starting in the future
                },
            },
            orderBy: {
                startTime: 'asc',
            },
        });
        return res.status(200).json(slots);
    }
    catch (error) {
        console.error('Fetch slots error:', error);
        return res.status(500).json({ error: 'Failed to fetch availability slots' });
    }
}
/**
 * Add a new availability slot (Expert Dashboard action)
 */
async function createSlot(req, res) {
    try {
        const expertId = req.expert?.id;
        if (!expertId) {
            return res.status(403).json({ error: 'Only logged-in experts can add slots' });
        }
        const { startTime, endTime } = req.body;
        if (!startTime || !endTime) {
            return res.status(400).json({ error: 'Start and end times are required' });
        }
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
            return res.status(400).json({ error: 'Invalid time intervals provided' });
        }
        const newSlot = await db_1.default.availabilitySlot.create({
            data: {
                expertId,
                startTime: start,
                endTime: end,
                isBooked: false,
            },
        });
        return res.status(201).json(newSlot);
    }
    catch (error) {
        console.error('Create slot error:', error);
        return res.status(500).json({ error: 'Failed to add availability slot' });
    }
}
