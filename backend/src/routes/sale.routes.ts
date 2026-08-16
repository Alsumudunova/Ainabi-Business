import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createHandler, getHandler, listHandler } from "../controllers/sale.controller";

const router = Router();

router.use(requireAuth);
router.get("/", listHandler);
router.get("/:id", getHandler);
router.post("/", createHandler);

export default router;
