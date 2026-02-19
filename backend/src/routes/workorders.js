import express from 'express';
import * as workOrderService from '../services/workOrderService.js';
import authenticate from '../middleware/auth.js';
import { ownerOrAdvisor } from '../middleware/rbac.js';

const router = express.Router();

// All work order routes require authentication
router.use(authenticate);

// GET /api/workorders
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      vehicleId: req.query.vehicleId,
      customerId: req.query.customerId,
      status: req.query.status
    };
    
    const workOrders = await workOrderService.getAllWorkOrders(filters);
    res.json(workOrders);
  } catch (error) {
    next(error);
  }
});

// GET /api/workorders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const workOrder = await workOrderService.getWorkOrderById(req.params.id);
    res.json(workOrder);
  } catch (error) {
    next(error);
  }
});

// POST /api/workorders (Owner or ServiceAdvisor)
router.post('/', ownerOrAdvisor, async (req, res, next) => {
  try {
    const workOrder = await workOrderService.createWorkOrder(req.body, req.user.id);
    res.status(201).json(workOrder);
  } catch (error) {
    next(error);
  }
});

// PUT /api/workorders/:id (Owner or ServiceAdvisor)
router.put('/:id', ownerOrAdvisor, async (req, res, next) => {
  try {
    const workOrder = await workOrderService.updateWorkOrder(req.params.id, req.body);
    res.json(workOrder);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/workorders/:id/status (Owner or ServiceAdvisor)
router.patch('/:id/status', ownerOrAdvisor, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const workOrder = await workOrderService.updateWorkOrderStatus(req.params.id, status);
    res.json(workOrder);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/workorders/:id (Owner or ServiceAdvisor)
router.delete('/:id', ownerOrAdvisor, async (req, res, next) => {
  try {
    const result = await workOrderService.deleteWorkOrder(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/workorders/:id/mechanics (assign mechanic)
router.post('/:id/mechanics', ownerOrAdvisor, async (req, res, next) => {
  try {
    const { mechanicUserId } = req.body;
    if (!mechanicUserId) {
      return res.status(400).json({ error: 'mechanicUserId is required' });
    }
    const result = await workOrderService.assignMechanic(req.params.id, mechanicUserId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/workorders/:id/mechanics/:mechanicId (unassign mechanic)
router.delete('/:id/mechanics/:mechanicId', ownerOrAdvisor, async (req, res, next) => {
  try {
    const result = await workOrderService.unassignMechanic(req.params.id, req.params.mechanicId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
