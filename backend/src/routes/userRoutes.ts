import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import { verifyToken } from "../middleware/auth";
import * as crypto from "crypto";
import { sendVerificationEmail } from "../helpers/sendEmail";
import User from "../models/user";

const FRONTEND_URL = process.env.FRONTEND_URL;
const usersRouter = express.Router();

usersRouter.get("/me", verifyToken, async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

usersRouter.post(
  "/register",
  [
    check("firstName", "First Name is required").isString(),
    check("lastName", "Last Name is required").isString(),
    check("phone", "Phone is required")
      .isString()
      .isMobilePhone("vi-VN")
      .withMessage("Phone is invalid!"),
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    if (!req.body) {
      return res.status(400).json({ message: "Invalid JSON input" });
    }

    try {
      let user = await User.findOne({
        $or: [{ email: req.body.email }, { phone: req.body.phone }],
      });

      if (user) {
        if (user.email === req.body.email) {
          return res.status(400).json({ message: "Email already registered" });
        }
        if (user.phone === req.body.phone) {
          return res
            .status(400)
            .json({ message: "Phone number already registered" });
        }
      }

      // Tạo mã xác thực
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // Tạo người dùng mới với mã xác thực
      user = new User({
        ...req.body,
        verificationToken,
      });
      await user.save();

      // Gửi email xác thực
      sendVerificationEmail(user.email, verificationToken);

      return res.status(200).send({
        message: "Please check your email to verify your account.",
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Something went wrong", error: error.message });
    }
  }
);

usersRouter.get("/verify-email", async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      // return res.status(400).json({ message: "Invalid or expired token" });

      // Redirect đến trang lỗi xác thực nếu token không hợp lệ
      return res.redirect(`${FRONTEND_URL}/email-verification-failed`);
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Xóa mã xác thực sau khi xác thực thành công
    await user.save();

    // res.status(200).json({ message: "Email verified successfully!" });
    // Redirect đến trang xác thực thành công trên frontend
    res.redirect(`${FRONTEND_URL}/sign-in`);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

usersRouter.put(
  "/:id",
  [
    check("firstName", "First Name is required").optional().isString(),
    check("lastName", "Last Name is required").optional().isString(),
    check("phone", "Phone is required")
      .optional()
      .isString()
      .isMobilePhone("vi-VN")
      .withMessage("Not valid phone (VN-vn)!"),
    check("email", "Email is required").optional().isEmail(),
    check("password", "Password with 6 or more characters required")
      .optional()
      .isLength({
        min: 6,
      }),
    check("role", "Role is invalid")
      .optional()
      .isIn(["user", "admin", "hotel_manager"]),
    check("status", "Status is invalid")
      .optional()
      .isIn(["active", "inactive", "banned"]),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    const userId = req.params.id;

    try {
      // Cập nhật toàn bộ thông tin người dùng
      const user = await User.findByIdAndUpdate(userId, req.body, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Something went wrong", error: error.message });
    }
  }
);

usersRouter.delete("/:id", async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

export default usersRouter;
