// zonta-server/src/middlewares/errorHandler.ts

import type { Request, Response, NextFunction } from "express";

/**
 * Global error handler middleware.
 * Logs the error and responds with a consistent JSON format.
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Error:", err.stack || err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};