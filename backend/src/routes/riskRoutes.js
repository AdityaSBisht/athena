import { Router } from "express";
import { riskController } from "../controllers/riskController.js";

const router = Router();

router.post("/", riskController);

export default router;
