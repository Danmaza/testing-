import express from 'express';
import * as customerService from '../services/customerService.js';
import authenticate from '../middleware/auth.js';
import { ownerOrAdvisor } from '../middleware/rbac.js';

const router = express.Router();

// All customer routes require authentication
router.use(authenticate);

// GET /api/customers (search with optional query)
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    
    let customers;
    if (search) {
      customers = await customerService.searchCustomers(search);
    } else {
      customers = await customerService.getAllCustomers();
    }
    
    res.json(customers);
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// POST /api/customers (Owner or ServiceAdvisor)
router.post('/', ownerOrAdvisor, async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
});

// PUT /api/customers/:id (Owner or ServiceAdvisor)
router.put('/:id', ownerOrAdvisor, async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/customers/:id (Owner or ServiceAdvisor)
router.delete('/:id', ownerOrAdvisor, async (req, res, next) => {
  try {
    const result = await customerService.deleteCustomer(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
