import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Feedback from "../models/feedback";
import Hotel from "../models/Hotel";
import User from "../models/User";
import { verifyToken } from "../middleware/auth";
const feedbackRoutes = express.Router();
// add new feedback
feedbackRoutes.post(
  "/create",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { hotelId, rating, comment } = req.body;
      const userId = req.userId; // Get the userId from the verified token

      // Check if the hotel exists
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res
          .status(400)
          .json({ error: "Invalid hotel ID. Hotel not found." });
      }

      // Create new feedback
      const feedback = new Feedback({
        userId,
        hotelId,
        rating,
        comment,
      });

      // Save feedback
      await feedback.save();

      // Calculate average rating
      const feedbacks = await Feedback.find({ hotelId });
      const averageRating =
        feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length;
      const roundedAverageRating = Math.round(averageRating);

      // Update starRating for the hotel
      await Hotel.findByIdAndUpdate(hotelId, {
        starRating: roundedAverageRating,
      });

      res
        .status(201)
        .json({ message: "Feedback submitted successfully", feedback });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  }
);

//get feedback by hotel id
feedbackRoutes.get("/get/:hotelId", async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;

    // get all feedback by hotel ID
    const feedbacks = await Feedback.find({ hotelId })
      .populate("userId", "firstName lastName")
      .populate("hotelId", "name");

    if (feedbacks.length === 0) {
      return res
        .status(404)
        .json({ message: "No feedback found for this hotel." });
    }

    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve feedback" });
  }
});
feedbackRoutes.get("/feedback", async (req: Request, res: Response) => {
  try {
    // get all feedback
    const feedbacks = await Feedback.find()
      .populate("userId", "firstName lastName")
      .populate("hotelId", "name"); // get user info and hotel info

    if (feedbacks.length === 0) {
      return res.status(404).json({ message: "No feedback found." });
    }

    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve feedback" });
  }
});
//get feedback by ID
feedbackRoutes.get("/get/:feedbackId", async (req: Request, res: Response) => {
  try {
    const { feedbackId } = req.params;

    //find by ID
    const feedback = await Feedback.findById(feedbackId)
      .populate("userId", "firstName lastName")
      .populate("hotelId", "name");

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve feedback" });
  }
});
//delete feedback (hotel owner only)
feedbackRoutes.delete(
  "/delete/:feedbackId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { feedbackId } = req.params;
      const userId = req.userId; // Get the userId from the verified token

      // Find the feedback by ID
      const feedback = await Feedback.findById(feedbackId);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found." });
      }

      // Check if the hotel owner matches the feedback hotelId
      const hotel = await Hotel.findById(feedback.hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found." });
      }

      // Ensure the user is the owner of the hotel
      if (hotel.userId.toString() !== userId) {
        return res.status(403).json({
          message: "Access denied. You are not the owner of this hotel.",
        });
      }

      // Delete the feedback
      await Feedback.findByIdAndDelete(feedbackId);
      res.status(200).json({ message: "Feedback deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete feedback." });
    }
  }
);

export default feedbackRoutes;
