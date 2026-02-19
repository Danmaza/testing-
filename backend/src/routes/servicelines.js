import express from 'express';
import * as serviceLineService from '../services/serviceLineService.js';
import authenticate from '../middleware/auth.js';
import { ownerOrAdvisor } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/servicelines?workOrderId=:id
router.get('/', async (req, res, next) => {
  try {
    const { workOrderId } = req.query;
    if (!workOrderId) {
      return res.status(400).json({ error: 'workOrderId is required' });
    }
    const serviceLines = await serviceLineService.getServiceLinesByWorkOrder(workOrderId);
    res.json(serviceLines);
  } catch (error) {
    next(error);
  }
});

// POST /api/servicelines (Owner or ServiceAdvisor)
router.post('/', ownerOrAdvisor, async (req, res, next) => {
  try {
    const serviceLine = await serviceLineService.createServiceLine(req.body);
    res.status(201).json(serviceLine);
  } catch (error) {
    next(error);
  }
});

// PUT /api/servicelines/:id (Owner or ServiceAdvisor)
router.put('/:id', ownerOrAdvisor, async (req, res, next) => {
  try {
    const serviceLine = await serviceLineService.updateServiceLine(req.params.id, req.body);
    res.json(serviceLine);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/servicelines/:id (Owner or ServiceAdvisor)
router.delete('/:id', ownerOrAdvisor, async (req, res, next) => {
  try {
    const result = await serviceLineService.deleteServiceLine(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Labor Time Entries

// GET /api/servicelines/:id/labor
router.get('/:id/labor', async (req, res, next) => {
  try {
    const entries = await serviceLineService.getLaborEntriesByServiceLine(req.params.id);
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

// POST /api/servicelines/:id/labor (mechanics can add their own entries)
router.post('/:id/labor', async (req, res, next) => {
  try {
    const laborEntry = await serviceLineService.createLaborEntry({
      ...req.body,
      serviceLineId: req.params.id
    });
    res.status(201).json(laborEntry);
  } catch (error) {
    next(error);
  }
});

// PUT /api/servicelines/labor/:laborId (mechanics can update their own entries)
router.put('/labor/:laborId', async (req, res, next) => {
  try {
    const laborEntry = await serviceLineService.updateLaborEntry(
      req.params.laborId, 
      req.body,
      req.user.id
    );
    res.json(laborEntry);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/servicelines/labor/:laborId (mechanics can delete their own entries)
router.delete('/labor/:laborId', async (req, res, next) => {
  try {
    const result = await serviceLineService.deleteLaborEntry(req.params.laborId, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
