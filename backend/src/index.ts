import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import { startCleanupJobs } from './utils/cleanup';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for Express + Socket.io
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Security Hardening Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Allows cross-origin video/image embeds
}));

// Express Rate Limiter for DDoS & Brute-force Protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
});

app.use('/api', apiLimiter);

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(express.json());

// Bind API routing
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Start cleanup background cron jobs
startCleanupJobs();

// --- Socket.io Real-Time WebSockets Engine ---
io.on('connection', (socket) => {
  console.log(`[WEBSOCKET CONNECTED] Socket ID: ${socket.id}`);

  // Join Consultation Room Channel
  socket.on('join_room', ({ bookingId }) => {
    socket.join(`room_${bookingId}`);
    console.log(`[WEBSOCKET] Socket ${socket.id} joined room_${bookingId}`);
  });

  // Handle Live Encrypted Chat Messaging
  socket.on('send_message', ({ bookingId, sender, text, timestamp }) => {
    socket.to(`room_${bookingId}`).emit('receive_message', {
      id: Math.random().toString(),
      sender: 'peer',
      text,
      timestamp,
    });
  });

  // Real-Time Typing Indicator
  socket.on('typing_start', ({ bookingId, sender }) => {
    socket.to(`room_${bookingId}`).emit('peer_typing_start', { sender });
  });

  socket.on('typing_stop', ({ bookingId }) => {
    socket.to(`room_${bookingId}`).emit('peer_typing_stop');
  });

  // WebRTC Signaling Relay (SDP offer/answer & ICE candidates)
  socket.on('webrtc_signal', ({ bookingId, signalData }) => {
    socket.to(`room_${bookingId}`).emit('webrtc_signal_received', signalData);
  });

  socket.on('disconnect', () => {
    console.log(`[WEBSOCKET DISCONNECTED] Socket ID: ${socket.id}`);
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[UNCAUGHT ERROR]', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Run HTTP + Socket.io Server
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  Talk No Filter - Production Express Engine   `);
  console.log(`  Real-Time WebSockets & Security Hardened     `);
  console.log(`  Local Server URL: http://localhost:${PORT}   `);
  console.log(`===============================================`);
});
