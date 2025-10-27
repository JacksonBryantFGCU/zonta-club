import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Validate incoming request bodies using a Zod schema.
 */
export const validateRequest = (schema: ZodSchema) => {
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