// Role-Based Access Control Middleware
// Ensures backend enforcement of permissions

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Owner-only actions
export const ownerOnly = requireRole('Owner');

// Owner or Service Advisor
export const ownerOrAdvisor = requireRole('Owner', 'ServiceAdvisor');

// All authenticated users
export const anyAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};
