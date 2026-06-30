import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

// Allowed frontend origins (add more as needed)
const allowedOrigins = [
  'http://localhost:5173',
  'https://client-bridge-ruddy.vercel.app',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // User joins their personal room (using their userId)
  socket.on('join_user', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
    }
  });

  // Typing indicators
  socket.on('typing', ({ senderId, recipientId }) => {
    io.to(recipientId).emit('typing_status', { senderId, isTyping: true });
  });

  socket.on('stop_typing', ({ senderId, recipientId }) => {
    io.to(recipientId).emit('typing_status', { senderId, isTyping: false });
  });

  // Message events (optional real-time sync, fallback to API response + direct socket broadcast)
  socket.on('new_message', (message) => {
    const { recipient } = message;
    const recipientId = typeof recipient === 'object' ? recipient._id : recipient;
    io.to(recipientId).emit('receive_message', message);
  });

  // Notifications
  socket.on('send_notification', ({ recipientId, notification }) => {
    io.to(recipientId).emit('receive_notification', notification);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Make socket io accessible in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Express Middlewares
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests
app.use(helmet({
  crossOriginResourcePolicy: false, // Essential to allow loading uploaded static assets
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files directory (uploads)
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('ClientBridge API is running...');
});

// Error handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
