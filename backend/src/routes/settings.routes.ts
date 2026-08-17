import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { businessRateLimit } from "../middleware/businessRateLimit";
import { requireRole } from "../middleware/requireRole";
import { getBusinessHandler, updateBusinessHandler } from "../controllers/settings.controller";

const router = Router();

router.use(requireAuth, businessRateLimit);
router.get("/business", getBusinessHandler);
router.put("/business", requireRole("OWNER"), updateBusinessHandler);

export default router;
