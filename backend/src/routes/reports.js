import express from 'express';
import * as reportService from '../services/reportService.js';
import authenticate from '../middleware/auth.js';
import { ownerOrAdvisor } from '../middleware/rbac.js';

const router = express.Router();

// All report routes require authentication
router.use(authenticate);

// GET /api/reports/revenue?startDate=&endDate=
router.get('/revenue', ownerOrAdvisor, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    
    const report = await reportService.getRevenueReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/expenses?startDate=&endDate=
router.get('/expenses', ownerOrAdvisor, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    
    const report = await reportService.getExpenseReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/labor?startDate=&endDate=
router.get('/labor', ownerOrAdvisor, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    
    const report = await reportService.getLaborEfficiencyReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/service-history/:vin
router.get('/service-history/:vin', async (req, res, next) => {
  try {
    const report = await reportService.getServiceHistoryByVIN(req.params.vin);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const summary = await reportService.getDashboardSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

export default router;
