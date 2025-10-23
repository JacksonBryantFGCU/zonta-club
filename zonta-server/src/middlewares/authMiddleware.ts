import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
dotenv.config();

interface DecodedUser extends JwtPayload {
  email: string;
  role: string;
}

// Extend Express Request to include `user`
declare module "express-serve-static-core" {
  interface Request {
    user?: DecodedUser;
  }
}

/**
 * Protect middleware — verifies JWT token and attaches user payload to req.user.
 */
export const protect = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authorized, no token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, secret) as DecodedUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    console.error("❌ Invalid token:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};