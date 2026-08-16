import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { createHandler, deleteHandler, listHandler } from "../controllers/expense.controller";

const router = Router();

router.use(requireAuth);
router.get("/", listHandler);
router.post("/", createHandler);
router.delete("/:id", requireRole("OWNER", "ADMIN"), deleteHandler);

export default router;
