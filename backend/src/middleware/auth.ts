import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { AccessTokenPayload, verifyAccessToken } from "../utils/jwt";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AccessTokenPayload;
    }
  }
}

/** Verifies the access token and attaches { userId, businessId, employeeId, role } to req.auth. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw ApiError.unauthorized();
  }

  const token = header.slice("Bearer ".length);
  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    throw ApiError.unauthorized("Сессиянын мөөнөтү бүттү. Кайра кириңиз.");
  }
}
