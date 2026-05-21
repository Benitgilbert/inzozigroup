import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'inzozi_group_super_secret_jwt_key_12345';

// Authenticate user token
export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // Contains id, email, role, name
      next();
    } catch (error) {
      console.error('[AuthMiddleware] Token verification failed:', error.message);
      return res.status(401).json({ error: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }
};

// Check if user has permission (Role-based authorization)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized, login required' });
    }

    if (!roles.includes(req.user.role)) {
      console.warn(`[AuthMiddleware] Access denied for role: ${req.user.role} to endpoint: ${req.originalUrl}`);
      return res.status(403).json({
        error: `Access Denied: Role '${req.user.role}' is not authorized to access this resource`
      });
    }

    next();
  };
};
