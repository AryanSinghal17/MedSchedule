import { Router } from "express";
import { body } from "express-validator";
import { signup, login, me } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Min 6 characters"),
  ],
  signup
);
router.post("/login", [body("email").isEmail(), body("password").notEmpty()], login);
router.get("/me", protect, me);

export default router;
