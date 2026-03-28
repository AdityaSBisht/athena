import { Router } from "express";
import {
  investShiftMetaController,
  investShiftProjectionController
} from "../controllers/investShiftController.js";

const router = Router();

router.get("/meta", investShiftMetaController);
router.post("/project", investShiftProjectionController);

export default router;
