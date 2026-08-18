import { NextFunction, Request, Response } from "express";
import { Lang, normalizeLang } from "../i18n/messages";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      lang: Lang;
    }
  }
}

/**
 * Reads the frontend's chosen UI language off a custom header (set by the
 * axios instance from the user's i18next language) and attaches it to every
 * request as `req.lang`, defaulting to Kyrgyz. Mounted before `cors()` so
 * `req.lang` is available even when a request is rejected by the CORS check
 * itself. `errorHandler` and the rate limiters read `req.lang` to translate
 * their response message — nothing else in the app needs to care about it.
 */
export function detectLanguage(req: Request, _res: Response, next: NextFunction) {
  req.lang = normalizeLang(req.headers["x-app-language"]);
  next();
}
