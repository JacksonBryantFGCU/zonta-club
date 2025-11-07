// zonta-server/src/middlewares/asyncHandler.ts

import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps async route handlers and forwards errors to Express error handler.
 */
export const asyncHandler =
  <T extends RequestHandler>(fn: T): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };