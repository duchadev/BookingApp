import mongoose from "mongoose";
import { HotelType } from "../shared/types";

const hotelSchema = new mongoose.Schema<HotelType>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    // address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true }, // e.g. Hotel, Motel, Resort
    // maxAdultCount: { type: Number, required: true },
    // maxChildCount: { type: Number, required: true },
    facilities: [{ type: String, required: true }],
    starRating: { type: Number, min: 0, max: 5, default: 0 },
    imageUrls: [{ type: String, required: true }],
    verify: {
      type: String,
      enum: ["Success", "Fail", "Pending"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Hotel = mongoose.model<HotelType>("Hotel", hotelSchema);
export default Hotel;
