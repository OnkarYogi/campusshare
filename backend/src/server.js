const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching frontend
      if (!origin || origin === corsOrigin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/academic setup
      }
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    system: 'CampusShare API Server',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Route registration
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Lazy load upcoming routes if files exist
try {
  app.use('/api/resources', require('./routes/resourceRoutes'));
} catch (e) {
  // Module route loaded in next increment
}

try {
  app.use('/api/borrow', require('./routes/borrowRoutes'));
} catch (e) {
  // Module route loaded in next increment
}

try {
  app.use('/api/ratings', require('./routes/ratingRoutes'));
} catch (e) {
  // Module route loaded in next increment
}

try {
  app.use('/api/notifications', require('./routes/notificationRoutes'));
} catch (e) {
  // Module route loaded in next increment
}

try {
  app.use('/api/admin', require('./routes/adminRoutes'));
} catch (e) {
  // Module route loaded in next increment
}

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server if not imported by test runner
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[CampusShare Backend] Server listening on port ${PORT}`);
      console.log(`[CampusShare Backend] Ready for client requests on ${corsOrigin}`);
    });
  }).catch((err) => {
    console.error('Failed to initialize server:', err);
  });
}

module.exports = app;
