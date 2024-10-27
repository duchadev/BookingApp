import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/auth";

const authRoutes = express.Router();

authRoutes.post(
  "/login",
  [
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

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      console.log("Fetched user:", user);

      if (!user) {
        return res.status(400).json({ message: "Email is not registered!" });
      }

      // Kiểm tra xem user đã xác thực email chưa
      if (!user.isVerified) {
        return res
          .status(400)
          .json({ message: "Please verify your email before logging in" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Password is incorrect!" });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
          email: user.email,
          firstName: user.firstName,
        }, // đkí claims vào token khi register (phải giống vs claims bên route /register)
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
      res.status(200).json({
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

authRoutes.get(
  "/validate-token",
  verifyToken,
  (req: Request, res: Response) => {
    res
      .status(200)
      .send({ userId: req.userId, role: req.role, email: req.email });
  }
);

authRoutes.post("/logout", (req: Request, res: Response) => {
  res.cookie("auth_token", "", {
    expires: new Date(0),
  });
  res.send();
});

export default authRoutes;
