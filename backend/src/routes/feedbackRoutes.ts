import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Feedback from "../models/feedback";
import Hotel from "../models/hotel";
import User from "../models/user";
import { verifyToken } from "../middleware/auth";
import Booking from "../models/Booking";
const feedbackRoutes = express.Router();
// add new feedback
feedbackRoutes.post(
  "/create",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { hotelId, bookingId, rating, comment } = req.body;
      const userId = req.userId; // Get the userId from the verified token
      console.log(req.body);
      // Check if the bookings exists
      const bookingSuccessOfHotel = await Booking.findOne({
        hotelId: hotelId,
        _id: bookingId,
      });
      console.log("booking: ", bookingSuccessOfHotel);
      if (!bookingSuccessOfHotel) {
        return res
          .status(404)
          .json({ error: "Invalid BookingID. BookingID not found." });
      }
      if (bookingSuccessOfHotel.status === "pending") {
        return res.status(400).json({
          error: "You must pay the booking fee and experience the room first.",
        });
      } else if (bookingSuccessOfHotel.status === "canceled") {
        return res.status(400).json({
          error: "Your booking has been cancelled.",
        });
      }

      // Create new feedback
      const feedback = new Feedback({
        userId,
        hotelId,
        bookingId,
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
      console.error(error);
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  }
);

//get feedback by hotel id
feedbackRoutes.get("/get/:hotelId", async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;

    // Get all feedback by hotel ID and sort by newest to oldest
    const feedbacks = await Feedback.find({ hotelId })
      .populate("userId", "firstName lastName")
      .populate("hotelId", "name")
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order (newest first)

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
feedbackRoutes.get(
  "/top-feedback/:hotelId",
  async (req: Request, res: Response) => {
    try {
      const { hotelId } = req.params;

      // Fetch top 5 feedbacks by hotel ID with rating 5, sorted by createdAt (newest first)
      const topFeedbacks = await Feedback.find({ hotelId, rating: 5 })
        .populate("userId", "firstName lastName")
        .populate("hotelId", "name")
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order (newest first)
        .limit(5); // Limit the results to top 5 feedbacks

      // If no feedback found, return 404
      if (topFeedbacks.length === 0) {
        return res.status(404).json({
          message: "No feedback with a 5-star rating found for this hotel.",
        });
      }

      // Return the top 5 feedbacks with rating 5
      res.status(200).json(topFeedbacks);
    } catch (error) {
      // Handle error
      res.status(500).json({ error: "Failed to retrieve feedback" });
    }
  }
);

export default feedbackRoutes;

/**
 * - Hiện danh sách trong My-Booking
 * - Làm sao có thể tự động đổi status của Booking khi user ko thanh toán
 * - Làm sao có thể tự load Feedback khi add new
 * - Xong phần search cơ bản
 * - Deploy
 *
 */
