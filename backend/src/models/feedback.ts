import mongoose from "mongoose";

// Tạo schema cho feedback
const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến UserSchema
      required: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel", // Tham chiếu đến HotelSchema
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking", // Tham chiếu đến BookingSchema
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5, // Giới hạn đánh giá sao từ 1 đến 5
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Tạo model dựa trên schema
const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
