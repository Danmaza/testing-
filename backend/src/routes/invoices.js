import express from 'express';
import * as invoiceService from '../services/invoiceService.js';
import * as paymentService from '../services/paymentService.js';
import authenticate from '../middleware/auth.js';
import { ownerOnly, ownerOrAdvisor } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Invoice Routes

// GET /api/invoices
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status
    };
    const invoices = await invoiceService.getAllInvoices(filters);
    res.json(invoices);
  } catch (error) {
    next(error);
  }
});

// GET /api/invoices/:id
router.get('/:id', async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    res.json(invoice);
  } catch (error) {
    next(error);
  }
});

// GET /api/invoices/workorder/:workOrderId
router.get('/workorder/:workOrderId', async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceByWorkOrder(req.params.workOrderId);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found for this work order' });
    }
    res.json(invoice);
  } catch (error) {
    next(error);
  }
});

// POST /api/invoices (Owner or ServiceAdvisor)
router.post('/', ownerOrAdvisor, async (req, res, next) => {
  try {
    const { workOrderId, ...invoiceData } = req.body;
    if (!workOrderId) {
      return res.status(400).json({ error: 'workOrderId is required' });
    }
    const invoice = await invoiceService.createInvoice(workOrderId, invoiceData);
    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
});

// PUT /api/invoices/:id/recalculate (Owner or ServiceAdvisor)
router.put('/:id/recalculate', ownerOrAdvisor, async (req, res, next) => {
  try {
    const invoice = await invoiceService.recalculateInvoice(req.params.id);
    res.json(invoice);
  } catch (error) {
    next(error);
  }
});

// POST /api/invoices/:id/void (Owner only)
router.post('/:id/void', ownerOnly, async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'Void reason is required' });
    }
    const invoice = await invoiceService.voidInvoice(req.params.id, req.user.id, reason);
    res.json(invoice);
  } catch (error) {
    next(error);
  }
});

// Payment Routes

// GET /api/invoices/:id/payments
router.get('/:id/payments', async (req, res, next) => {
  try {
    const payments = await paymentService.getPaymentsByInvoice(req.params.id);
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

// POST /api/invoices/:id/payments (Owner or ServiceAdvisor)
router.post('/:id/payments', ownerOrAdvisor, async (req, res, next) => {
  try {
    const payment = await paymentService.createPayment({
      ...req.body,
      invoiceId: req.params.id
    });
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/invoices/payments/:paymentId (Owner only)
router.delete('/payments/:paymentId', ownerOnly, async (req, res, next) => {
  try {
    const result = await paymentService.deletePayment(req.params.paymentId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
