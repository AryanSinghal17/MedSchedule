import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import { sendWelcomeEmail } from "../services/emailService.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

export const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, phone } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already registered" });

  const user = await User.create({ name, email, password, phone });

  // best-effort welcome email
  sendWelcomeEmail({ to: email, name }).catch(() => {});

  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token: signToken(user._id),
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token: signToken(user._id),
  });
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};
