import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { businessRateLimit } from "../middleware/businessRateLimit";
import { createHandler, getHandler, listHandler } from "../controllers/sale.controller";

const router = Router();

router.use(requireAuth, businessRateLimit);
router.get("/", listHandler);
router.get("/:id", getHandler);
router.post("/", createHandler);

export default router;
