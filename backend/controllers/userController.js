import User from "../models/User.js";

export const updateProfile = async (req, res) => {
  const allowed = ["name", "phone", "timezone", "accessibilityMode", "family"];
  const update = {};
  for (const k of allowed) if (k in req.body) update[k] = req.body[k];
  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
  res.json({ user });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both passwords required" });
  }
  const user = await User.findById(req.user._id).select("+password");
  const ok = await user.comparePassword(currentPassword);
  if (!ok) return res.status(401).json({ message: "Current password incorrect" });
  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated" });
};

export const addFamilyMember = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.family.push(req.body);
  await user.save();
  res.status(201).json({ user });
};

export const removeFamilyMember = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.family.id(req.params.memberId)?.deleteOne();
  await user.save();
  res.json({ user });
};
