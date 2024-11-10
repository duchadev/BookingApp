import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserType } from "../shared/types";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["user", "admin", "hotel_manager"],
      default: "user",
    },
    wantToBeHotelManager: {
      type: String,
      enum: ["Approved", "Denied", "Pending", "None"],
      default: "None",
    },
    verificationToken: { type: String },
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Banned"],
      default: "Active",
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = mongoose.model<UserType>("User", userSchema);

export default User;
