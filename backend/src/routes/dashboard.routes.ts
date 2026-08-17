import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { businessRateLimit } from "../middleware/businessRateLimit";
import { lowStockHandler, salesDynamicsHandler, summaryHandler, topProductsHandler } from "../controllers/dashboard.controller";

const router = Router();

router.use(requireAuth, businessRateLimit);
router.get("/summary", summaryHandler);
router.get("/sales-dynamics", salesDynamicsHandler);
router.get("/top-products", topProductsHandler);
router.get("/low-stock", lowStockHandler);

export default router;
