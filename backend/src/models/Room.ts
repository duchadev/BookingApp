import mongoose from "mongoose";
import { RoomType } from "../shared/types";

const roomSchema = new mongoose.Schema<RoomType>(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    roomNumber: { type: String, required: true }, // Số phòng, có thể là một chuỗi như "101", "202", v.v.
    type: { type: String, required: true }, // Single, Double, Suite
    capacity: { type: Number, required: true }, // Max capacity for people
    pricePerNight: { type: Number, required: true },
    imageUrls: { type: [String], required: true }, // Array of image URLs
    description: { type: String }, // Optional description
    status: {
      type: String,
      enum: ["Booked", "Available"],
      default: "Available",
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
