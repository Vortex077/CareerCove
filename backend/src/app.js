const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5175',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/applications', require('./routes/application.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/companies', require('./routes/company.routes'));
app.use('/api/drives', require('./routes/drive.routes'));
app.use('/api/jobs', require('./routes/job.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/reports', require('./routes/report.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// Error handling
app.use(errorHandler);

module.exports = app;
