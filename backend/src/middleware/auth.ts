import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'talk_no_filter_super_secret_key_123';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phone: string;
  };
  expert?: {
    id: string;
    name: string;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = {
      id: decoded.id,
      phone: decoded.phone,
    };
    next();
  });
}

export function authenticateExpert(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err || !decoded.isExpert) {
      return res.status(403).json({ error: 'Access restricted to verified experts' });
    }
    req.expert = {
      id: decoded.id,
      name: decoded.name,
    };
    next();
  });
}

export function optionalAuthenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (!err) {
      req.user = {
        id: decoded.id,
        phone: decoded.phone,
      };
    }
    next();
  });
}
