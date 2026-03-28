import { Router } from "express";
import { simulateController } from "../controllers/simulateController.js";

const router = Router();

router.post("/", simulateController);

export default router;
