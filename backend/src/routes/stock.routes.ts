import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { businessRateLimit } from "../middleware/businessRateLimit";
import { requireRole } from "../middleware/requireRole";
import { createHandler, listHandler, reorderSuggestionsHandler, summaryHandler } from "../controllers/stock.controller";

const router = Router();

router.use(requireAuth, businessRateLimit);
router.get("/", listHandler);
router.get("/summary", summaryHandler);
router.get("/reorder-suggestions", reorderSuggestionsHandler);
router.post("/", requireRole("OWNER", "ADMIN"), createHandler);

export default router;
