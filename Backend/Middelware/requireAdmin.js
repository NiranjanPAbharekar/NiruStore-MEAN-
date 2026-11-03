
import jwt from 'jsonwebtoken';

export function requireAdmin(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required.'
    });
  }

  const token = authorization.slice(7);

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (
      typeof decoded !== 'object' ||
      !decoded.adminId ||
      decoded.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Admin access denied.'
      });
    }

    req.admin = {
      id: decoded.adminId,
      role: decoded.role
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired admin token.'
    });
  }
}