import { Router } from "express";
import { financeCoachController } from "../controllers/chatController.js";

const router = Router();

router.post("/", financeCoachController);

export default router;
