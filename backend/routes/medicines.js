import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  createMedicine,
  getMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
  markDose,
  getDashboard,
  getHistory,
} from "../controllers/medicineController.js";

const router = Router();
router.use(protect);

router.get("/dashboard", getDashboard);
router.get("/history", getHistory);

router.route("/").get(getMedicines).post(createMedicine);
router.route("/:id").get(getMedicine).put(updateMedicine).delete(deleteMedicine);

router.patch("/:id/dose/:logId", markDose);

export default router;
