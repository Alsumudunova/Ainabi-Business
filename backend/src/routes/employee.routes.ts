import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { businessRateLimit } from "../middleware/businessRateLimit";
import { requireRole } from "../middleware/requireRole";
import { deleteHandler, inviteHandler, listHandler, updateHandler } from "../controllers/employee.controller";

const router = Router();

router.use(requireAuth, businessRateLimit, requireRole("OWNER", "ADMIN"));
router.get("/", listHandler);
router.post("/", inviteHandler);
router.put("/:id", updateHandler);
router.delete("/:id", deleteHandler);

export default router;
