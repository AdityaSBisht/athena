import { Router } from "express";
import {
  intakeConversationController,
  intakeInterpretController,
  intakeProfileController
} from "../controllers/intakeProfileController.js";

const router = Router();

router.post("/next", intakeConversationController);
router.post("/interpret", intakeInterpretController);
router.post("/", intakeProfileController);

export default router;
