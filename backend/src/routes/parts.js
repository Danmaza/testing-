import express from 'express';
import * as partsService from '../services/partsService.js';
import authenticate from '../middleware/auth.js';
import { ownerOrAdvisor } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Parts Used Routes

// GET /api/parts?workOrderId=:id
router.get('/', async (req, res, next) => {
  try {
    const { workOrderId } = req.query;
    if (!workOrderId) {
      return res.status(400).json({ error: 'workOrderId is required' });
    }
    const parts = await partsService.getPartsByWorkOrder(workOrderId);
    res.json(parts);
  } catch (error) {
    next(error);
  }
});

// POST /api/parts
router.post('/', ownerOrAdvisor, async (req, res, next) => {
  try {
    const part = await partsService.createPart(req.body);
    res.status(201).json(part);
  } catch (error) {
    next(error);
  }
});

// PUT /api/parts/:id
router.put('/:id', ownerOrAdvisor, async (req, res, next) => {
  try {
    const part = await partsService.updatePart(req.params.id, req.body);
    res.json(part);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/parts/:id
router.delete('/:id', ownerOrAdvisor, async (req, res, next) => {
  try {
    const result = await partsService.deletePart(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Supplier Routes

// GET /api/suppliers
router.get('/suppliers', async (req, res, next) => {
  try {
    const suppliers = await partsService.getAllSuppliers();
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
});

// GET /api/suppliers/:id
router.get('/suppliers/:id', async (req, res, next) => {
  try {
    const supplier = await partsService.getSupplierById(req.params.id);
    res.json(supplier);
  } catch (error) {
    next(error);
  }
});

// POST /api/suppliers
router.post('/suppliers', ownerOrAdvisor, async (req, res, next) => {
  try {
    const supplier = await partsService.createSupplier(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
});

// PUT /api/suppliers/:id
router.put('/suppliers/:id', ownerOrAdvisor, async (req, res, next) => {
  try {
    const supplier = await partsService.updateSupplier(req.params.id, req.body);
    res.json(supplier);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/suppliers/:id
router.delete('/suppliers/:id', ownerOrAdvisor, async (req, res, next) => {
  try {
    const result = await partsService.deleteSupplier(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
