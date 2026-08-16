import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createHandler, deleteHandler, getHandler, listHandler, updateHandler } from "../controllers/customer.controller";

const router = Router();

router.use(requireAuth);
router.get("/", listHandler);
router.get("/:id", getHandler);
router.post("/", createHandler);
router.put("/:id", updateHandler);
router.delete("/:id", deleteHandler);

export default router;
