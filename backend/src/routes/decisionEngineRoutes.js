import { Router } from "express";
import { decisionEngineController } from "../controllers/decisionEngineController.js";

const router = Router();

router.post("/", decisionEngineController);

export default router;
