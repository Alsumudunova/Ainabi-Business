import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { businessRateLimit } from "../middleware/businessRateLimit";
import { exportCsvHandler, summaryHandler } from "../controllers/report.controller";

const router = Router();

router.use(requireAuth, businessRateLimit);
router.get("/", summaryHandler);
router.get("/export.csv", exportCsvHandler);

export default router;
