import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const familyMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    relation: { type: String, trim: true }, // son, mother, etc.
    age: { type: Number, min: 0, max: 130 },
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["self", "caregiver"], default: "self" },
    phone: { type: String, trim: true },
    timezone: { type: String, default: "UTC" },
    accessibilityMode: { type: Boolean, default: false }, // elderly-friendly
    family: [familyMemberSchema],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
