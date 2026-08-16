import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { createHandler, listHandler, summaryHandler } from "../controllers/stock.controller";

const router = Router();

router.use(requireAuth);
router.get("/", listHandler);
router.get("/summary", summaryHandler);
router.post("/", requireRole("OWNER", "ADMIN"), createHandler);

export default router;
