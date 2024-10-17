import express, { Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import { verifyToken } from "../middleware/auth";

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
      .withMessage("Số điện thoại không hợp lệ!"),
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
        email: req.body.email,
      });

      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      user = new User({
        ...req.body,
      });
      await user.save();

      const token = jwt.sign(
        { userId: user.id, role: user.role, email: user.email }, // đkí claims vào token khi register (phải giống vs claims bên login)
        process.env.JWT_SECRET_KEY as string,
        {
          expiresIn: "1d",
        }
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000,
      });
      return res.status(200).send({ message: "User registered OK" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Something went wrong", error: error.message });
    }
  }
);

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
