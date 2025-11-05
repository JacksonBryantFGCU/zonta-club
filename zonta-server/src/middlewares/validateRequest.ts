import type { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

/**
 * Validate incoming request bodies using a Zod schema.
 */
export const validateRequest = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: "Invalid request data",
        details: err.errors,
      });
    }
  };
};