import express from 'express';
import * as authService from '../services/authService.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await authService.login(username, password);
    res.json(result);
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: error.message });
    }
    next(error);
  }
});

// POST /api/auth/register (Owner only - create new users)
router.post('/register', authenticate, async (req, res, next) => {
  try {
    // Only Owner can create new users
    if (req.user.role !== 'Owner') {
      return res.status(403).json({ error: 'Only owners can create new users' });
    }

    const { username, password, email, fullName, role } = req.body;

    if (!username || !password || !fullName || !role) {
      return res.status(400).json({ 
        error: 'Username, password, fullName, and role are required' 
      });
    }

    const validRoles = ['Owner', 'ServiceAdvisor', 'Mechanic'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be Owner, ServiceAdvisor, or Mechanic' 
      });
    }

    const user = await authService.register(username, password, email, fullName, role);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me (get current user info)
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
