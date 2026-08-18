import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { isProduction } from "../config/env";
import { translate } from "../i18n/messages";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    message: translate(`Route ${req.method} ${req.originalUrl} табылган жок.`, req.lang),
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: translate("Киргизилген маалыматта ката бар.", req.lang),
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: translate(issue.message, req.lang),
      })),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: translate(err.message, req.lang),
      details: err.details,
    });
  }

  console.error(err);
  return res.status(500).json({
    message: translate("Сервер тарабынан ката кетти. Кайра аракет кылыңыз.", req.lang),
    stack: isProduction ? undefined : (err as Error)?.stack,
  });
}
