import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

type Role = "OWNER" | "ADMIN" | "CASHIER";

/**
 * Restricts a route to the given roles. Must run after `requireAuth`.
 * Usage: router.post("/", requireAuth, requireRole("OWNER", "ADMIN"), controller)
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      throw ApiError.unauthorized();
    }
    if (!roles.includes(req.auth.role)) {
      throw ApiError.forbidden();
    }
    next();
  };
}
