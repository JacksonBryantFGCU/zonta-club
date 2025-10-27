import path from "path";
import { fileURLToPath } from "url";

import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import fs from "fs-extra";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

interface AdminUser {
  email: string;
  password: string; // hashed
}

interface AdminPayload extends JwtPayload {
  email: string;
  role: "admin";
}

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    // ✅ Load admins.json dynamically
    const adminsPath = path.resolve(__dirname, "../../config/admins.json");
    const admins: AdminUser[] = await fs.readJSON(adminsPath);

    // ✅ Find matching admin
    const admin = admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!admin) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // ✅ Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // ✅ Generate JWT
    const secret = (process.env.JWT_SECRET as Secret) || "fallback_secret";
    const token = jwt.sign(
      { email: admin.email, role: "admin" } as AdminPayload,
      secret,
      { expiresIn: process.env.TOKEN_EXPIRY || "1h" } as SignOptions
    );

    res.json({ token });
  } catch (err) {
    console.error("❌ Admin login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};