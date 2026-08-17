import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { businessRateLimit } from "../middleware/businessRateLimit";
import { addPaymentHandler, createHandler, listHandler, summaryHandler } from "../controllers/debt.controller";

const router = Router();

router.use(requireAuth, businessRateLimit);
router.get("/", listHandler);
router.get("/summary", summaryHandler);
router.post("/", createHandler);
router.post("/:id/payments", addPaymentHandler);

export default router;
