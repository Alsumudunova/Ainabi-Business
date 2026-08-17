import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { businessRateLimit } from "../middleware/businessRateLimit";
import { requireRole } from "../middleware/requireRole";
import { createHandler, deleteHandler, listHandler, updateHandler } from "../controllers/category.controller";

const router = Router();

router.use(requireAuth, businessRateLimit);
router.get("/", listHandler);
router.post("/", requireRole("OWNER", "ADMIN"), createHandler);
router.put("/:id", requireRole("OWNER", "ADMIN"), updateHandler);
router.delete("/:id", requireRole("OWNER", "ADMIN"), deleteHandler);

export default router;
