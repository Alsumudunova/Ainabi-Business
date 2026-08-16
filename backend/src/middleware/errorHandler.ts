import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { isProduction } from "../config/env";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} табылган жок.`,
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Киргизилген маалыматта ката бар.",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
  }

  console.error(err);
  return res.status(500).json({
    message: "Сервер тарабынан ката кетти. Кайра аракет кылыңыз.",
    stack: isProduction ? undefined : (err as Error)?.stack,
  });
}
