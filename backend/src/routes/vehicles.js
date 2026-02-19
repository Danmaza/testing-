import express from 'express';
import * as vehicleService from '../services/vehicleService.js';
import authenticate from '../middleware/auth.js';
import { ownerOrAdvisor } from '../middleware/rbac.js';

const router = express.Router();

// All vehicle routes require authentication
router.use(authenticate);

// GET /api/vehicles (with optional customerId or search query)
router.get('/', async (req, res, next) => {
  try {
    const { customerId, search } = req.query;
    
    let vehicles;
    if (search) {
      vehicles = await vehicleService.searchVehicles(search);
    } else {
      vehicles = await vehicleService.getAllVehicles(customerId);
    }
    
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
});

// GET /api/vehicles/:id
router.get('/:id', async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});

// POST /api/vehicles (Owner or ServiceAdvisor)
router.post('/', ownerOrAdvisor, async (req, res, next) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
});

// PUT /api/vehicles/:id (Owner or ServiceAdvisor)
router.put('/:id', ownerOrAdvisor, async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/vehicles/:id (Owner or ServiceAdvisor)
router.delete('/:id', ownerOrAdvisor, async (req, res, next) => {
  try {
    const result = await vehicleService.deleteVehicle(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
