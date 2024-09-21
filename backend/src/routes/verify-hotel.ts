import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Hotel from "../models/hotel";
import User from "../models/user";
import verifyToken from "../middleware/auth";

const router = express.Router();

router.put("/verify-hotel/:hotelId/status", verifyToken, async (req, res) => {
  try {
    const { hotelId } = req.params;
    const user = await User.findById(req.userId);

    // Check if the user is an admin
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Find the hotel and update its status
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found." });
    }

    hotel.status = "ON";
    await hotel.save();

    res.status(200).json({ message: "Hotel status updated to ON", hotel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
