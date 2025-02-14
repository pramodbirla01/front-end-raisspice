import { NextApiRequest, NextApiResponse } from 'next';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Extend NextApiRequest to include user property
interface AuthenticatedRequest extends NextApiRequest {
  user?: JwtPayload;
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as JwtPayload;
      req.user = decoded;
      
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}
