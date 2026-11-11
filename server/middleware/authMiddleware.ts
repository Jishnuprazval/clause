import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { db } from '../config/db';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { name?: string };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ success: false, message: 'Invalid authentication token.' });
      return;
    }

    const decoded = verifyToken(token);
    const user = await db.users.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ success: false, message: 'User account not found or expired session.' });
      return;
    }

    req.user = {
      userId: user._id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Session expired or invalid token. Please log in again.' });
  }
}

export async function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = verifyToken(token);
        const user = await db.users.findById(decoded.userId);
        if (user) {
          req.user = {
            userId: user._id,
            email: user.email,
            name: user.name,
          };
        }
      }
    }
  } catch (e) {
    // Silent ignore for optional authentication
  }
  next();
}
