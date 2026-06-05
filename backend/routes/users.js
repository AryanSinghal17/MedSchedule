import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  updateProfile,
  changePassword,
  addFamilyMember,
  removeFamilyMember,
} from "../controllers/userController.js";

const router = Router();
router.use(protect);

router.put("/profile", updateProfile);
router.put("/password", changePassword);
router.post("/family", addFamilyMember);
router.delete("/family/:memberId", removeFamilyMember);

export default router;
