import { Router } from "express";
import {
  scenarioPresetController,
  scenarioPresetsController
} from "../controllers/scenarioController.js";

const router = Router();

router.get("/presets", scenarioPresetsController);
router.post("/presets", scenarioPresetsController);
router.post("/apply", scenarioPresetController);

export default router;
