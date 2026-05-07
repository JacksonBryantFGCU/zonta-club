// zonta-server/src/controllers/authController.ts

import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

dotenv.config();

interface AdminPayload extends JwtPayload {
  email: string;
  role: "admin";
}

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminPasswordHash) {
      console.error("ADMIN_EMAIL or ADMIN_PASSWORD_HASH not configured");
      res.status(500).json({ error: "Admin credentials not configured" });
      return;
    }

    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, adminPasswordHash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const secret = (process.env.JWT_SECRET as Secret) || "fallback_secret";
    const token = jwt.sign(
      { email: adminEmail, role: "admin" } as AdminPayload,
      secret,
      { expiresIn: process.env.TOKEN_EXPIRY || "1h" } as SignOptions
    );

    res.json({ token });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
