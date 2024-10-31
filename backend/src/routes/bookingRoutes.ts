import express, { Request, Response } from "express";
import Hotel from "../models/Hotel";
import { verifyToken, authorizeRoles } from "../middleware/auth";
import { body } from "express-validator";
import { HotelType } from "../shared/types";
import { BookingType, HotelSearchResponse } from "../shared/types";
import Room from "../models/Room";
import "dotenv/config";
import PayOS from "@payos/node";
import Booking from "../models/Booking";
import mongoose from "mongoose";

const payOs = new PayOS("client_id", "api-key", "checksum-key");

const bookingRouter = express.Router();

bookingRouter.post("/check-room-availability", async (req, res) => {
  const { roomId, checkIn, checkOut } = req.body;

  try {
    const overlappingBookings = await Booking.find({
      roomId,
      $or: [
        { checkIn: { $lt: checkOut, $gte: checkIn } }, // booking overlaps with the range
        { checkOut: { $gt: checkIn, $lte: checkOut } },
      ],
    });

    if (overlappingBookings.length > 0) {
      return res.json({
        available: false,
        message: "Room is already booked in this time frame.",
      });
    } else {
      return res.json({ available: true });
    }
  } catch (error) {
    console.error("Error checking room availability:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while checking room availability" });
  }
});

// Get bookings by various criteria
bookingRouter.get(
  "/search",
  verifyToken,
  authorizeRoles("user", "hotel_manager", "admin"),
  async (req: Request, res: Response) => {
    try {
      const filter: { [key: string]: any } = {};

      // Add optional filters based on query parameters
      if (req.query.hotelId) filter["hotelId"] = req.query.hotelId;
      if (req.query.roomId) filter["roomId"] = req.query.roomId;
      if (req.query.userId) filter["userId"] = req.query.userId;
      if (req.query.status) filter["status"] = req.query.status;
      if (req.query.adultCount) filter["adultCount"] = +req.query.adultCount;
      if (req.query.childCount) filter["childCount"] = +req.query.childCount;

      // Check-in and Check-out date range filtering
      if (req.query.checkIn) {
        filter["checkIn"] = { $gte: new Date(req.query.checkIn as string) };
      }
      if (req.query.checkOut) {
        filter["checkOut"] = { $lte: new Date(req.query.checkOut as string) };
      }

      const bookings = await Booking.find(filter)
        .populate("userId", "name email")
        .populate("hotelId", "name location")
        .populate("roomId", "type number")
        .sort({ createdAt: -1 });

      res.status(200).json(bookings);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to retrieve bookings", message: error.message });
    }
  }
);

// Create a booking
bookingRouter.post(
  "/",
  verifyToken,
  authorizeRoles("user", "hotel_manager", "admin"),
  async (req: Request, res: Response) => {
    try {
      const { hotelId, roomId, checkIn, checkOut } = req.body;
      console.log("req.body: ", req.body);

      // Chuyển đổi hotelId từ chuỗi thành ObjectId
      const hotelObjectId = new mongoose.Types.ObjectId(hotelId);
      const roomObjectId = new mongoose.Types.ObjectId(roomId);

      // Kiểm tra sự tồn tại của hotelId
      const hotelExists = await Hotel.exists({ _id: hotelObjectId });
      if (!hotelExists) {
        console.error("HotelId is not found!");
        return res.status(400).json({ error: "HotelId is not found!" });
      }

      // Kiểm tra sự tồn tại của roomId
      const roomExists = await Room.exists({ _id: roomObjectId });
      if (!roomExists) {
        console.error("RoomId is not found!");
        return res.status(400).json({ error: "RoomId is not found!" });
      }

      // Kiểm tra trùng lặp thời gian booking
      /**
       * Xác thực thời gian chồng chéo: Phần conflictingBooking tìm kiếm trong bảng Booking để xác định xem có booking nào cùng roomId và hotelId đã được đặt trong khoảng checkIn và checkOut yêu cầu của người dùng hay chưa.
       * Điều kiện $or với $lt, $gt, $gte, $lte: Điều này giúp tìm các khoảng thời gian có khả năng trùng nhau. Ví dụ, nếu người dùng A đã đặt phòng từ 10h - 12h, thì người dùng B sẽ không thể đặt trong bất kỳ khoảng nào từ 9h - 11h, 11h - 13h, hoặc 10h - 12h. Chỉ từ 12h->max
       */
      const conflictingBooking = await Booking.findOne({
        hotelId,
        roomId,
        $or: [
          {
            checkIn: { $lt: new Date(checkOut), $gte: new Date(checkIn) },
          },
          {
            checkOut: { $gt: new Date(checkIn), $lte: new Date(checkOut) },
          },
          {
            checkIn: { $lte: new Date(checkIn) },
            checkOut: { $gte: new Date(checkOut) },
          },
        ],
      });

      if (conflictingBooking) {
        console.error(
          "This room is already booked during the selected time slot."
        );
        return res.status(400).json({
          error: "This room is already booked during the selected time slot.",
        });
      }

      const newBooking: BookingType = {
        ...req.body,
        userId: req.userId,
      };
      const booking = new Booking(newBooking);
      const savedBooking = await booking.save();
      res.status(201).json(savedBooking);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to create booking", message: error.message });
    }
  }
);

// Get all my bookings
bookingRouter.get(
  "/my-bookings",
  verifyToken,
  authorizeRoles("user", "hotel_manager", "admin"),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId; // Get the userId from the verified token

      const myBookings = await Booking.find({ userId })
        .populate("userId", "name email")
        .populate("hotelId", "name city country imageUrls")
        .populate("roomId", "type number")
        .sort({ createdAt: -1 });

      res.status(200).json(myBookings);
    } catch (error) {
      console.error("error: ", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve bookings", message: error.message });
    }
  }
);

// Get a booking by ID
bookingRouter.get(
  "/:id",
  verifyToken,
  authorizeRoles("user", "hotel_manager", "admin"),
  async (req: Request, res: Response) => {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate("userId", "name email") // Populate user details
        .populate("hotelId", "name location") // Populate hotel details
        .populate("roomId", "type number"); // Populate room details
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.status(200).json(booking);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to retrieve booking", message: error.message });
    }
  }
);

// Update a booking by ID
bookingRouter.put(
  "/:id",
  verifyToken,
  authorizeRoles("user", "hotel_manager", "admin"),
  async (req: Request, res: Response) => {
    try {
      const updatedBooking = await Booking.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.status(200).json(updatedBooking);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to update booking", message: error.message });
    }
  }
);

// Delete a booking by ID
bookingRouter.delete(
  "/:id",
  verifyToken,
  authorizeRoles("user", "hotel_manager", "admin"),
  async (req: Request, res: Response) => {
    try {
      const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
      if (!deletedBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete booking", message: error.message });
    }
  }
);

// Get all bookings (with optional filters), (optional filter by hotel, user, or status)
bookingRouter.get(
  "/",
  verifyToken,
  authorizeRoles("user", "hotel_manager", "admin"),
  async (req: Request, res: Response) => {
    try {
      const filter = {};
      if (req.query.hotelId) filter["hotelId"] = req.query.hotelId;
      if (req.query.userId) filter["userId"] = req.query.userId;
      if (req.query.status) filter["status"] = req.query.status;

      const bookings = await Booking.find(filter)
        .populate("userId", "name email")
        .populate("hotelId", "name location")
        .populate("roomId", "type number")
        .sort({ createdAt: -1 });

      res.status(200).json(bookings);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to retrieve bookings", message: error.message });
    }
  }
);

export default bookingRouter;
