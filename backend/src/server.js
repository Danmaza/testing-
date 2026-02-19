import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/pool.js';
import errorHandler from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import vehicleRoutes from './routes/vehicles.js';
import workOrderRoutes from './routes/workorders.js';
import serviceLineRoutes from './routes/servicelines.js';
import partsRoutes from './routes/parts.js';
import invoiceRoutes from './routes/invoices.js';
import reportRoutes from './routes/reports.js';

// Load environment variables
dotenv.config();

const app = express();
// TODO: REQUIRED INFO HERE (fill this in): Set PORT in .env file
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  // TODO: REQUIRED INFO HERE (fill this in): Set CORS_ORIGIN in .env to your frontend URL
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/workorders', workOrderRoutes);
app.use('/api/servicelines', serviceLineRoutes);
app.use('/api/parts', partsRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'A-OK Transmissions API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      customers: '/api/customers',
      vehicles: '/api/vehicles',
      workorders: '/api/workorders',
      servicelines: '/api/servicelines',
      parts: '/api/parts',
      invoices: '/api/invoices',
      reports: '/api/reports'
    }
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('========================================');
  console.log('A-OK Transmissions API Server');
  console.log('========================================');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log(`✓ API docs: http://localhost:${PORT}/`);
  console.log('========================================');
});

export default app;
