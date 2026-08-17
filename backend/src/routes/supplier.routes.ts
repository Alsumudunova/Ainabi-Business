import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import {
  addPaymentHandler,
  createDebtHandler,
  createHandler,
  deleteHandler,
  getHandler,
  listHandler,
  summaryHandler,
  updateHandler,
} from "../controllers/supplier.controller";

const router = Router();

router.use(requireAuth);
router.get("/", listHandler);
router.get("/summary", summaryHandler);
router.get("/:id", getHandler);
router.post("/", requireRole("OWNER", "ADMIN"), createHandler);
router.put("/:id", requireRole("OWNER", "ADMIN"), updateHandler);
router.delete("/:id", requireRole("OWNER", "ADMIN"), deleteHandler);
router.post("/:id/debts", requireRole("OWNER", "ADMIN"), createDebtHandler);
router.post("/debts/:debtId/payments", requireRole("OWNER", "ADMIN"), addPaymentHandler);

export default router;
