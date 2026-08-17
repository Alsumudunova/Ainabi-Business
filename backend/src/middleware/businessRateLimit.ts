import rateLimit from "express-rate-limit";

/**
 * Keys by businessId instead of IP once a request is authenticated, so one
 * tenant hammering the API (a runaway script, a misbehaving integration)
 * can't eat into the request budget of every other business sharing the
 * same egress IP (common behind office NAT or a shared proxy). Falls back
 * to IP for the rare authenticated-but-no-business edge case.
 */
export const businessRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.auth?.businessId ?? req.ip ?? "unknown",
  message: { message: "Бул бизнес үчүн сурамдар лимити ашты. Бир аз күтүп, кайра аракет кылыңыз." },
});
