import { ObjectId } from "mongoose";

export type UserType = {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  wantToBeHotelManager: "Approved" | "Denied" | "Pending" | "None";
  verificationToken?: string;
  isVerified: boolean;
  status: "Active" | "Inactive" | "Banned"; // user status
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
};

// RoomType Schema
export type RoomType = {
  _id: string;
  roomNumber: string; // Số phòng, có thể là một chuỗi như "101", "202", v.v.
  hotelId: ObjectId;
  type: string; // Single, Double, Suite, etc.
  capacity: number; // Maximum capacity for people
  pricePerNight: number;
  imageUrls: string[];
  imageFiles: FileList;
  description?: string; // Optional description for each room type
  size: number;
  facilities: string[];
  status: "Booked" | "Available";
};

// HotelType Schema
export type HotelType = {
  _id: string;
  userId: ObjectId;
  name: string;
  address: string;
  country: string;
  city: string;
  description: string;
  type: string;
  maxAdultCount: number;
  maxChildCount: number;
  facilities: string[];
  starRating: number;
  imageUrls: string[]; // Array of hotel image URLs
  verify: string;
  rooms: RoomType[];
};

export type BookingType = {
  _id: string;
  userId: UserType; // User making the booking
  hotelId: HotelType; // Hotel being booked
  roomIds: RoomType[]; // Specific room type being booked
  adultCount: number;
  childCount: number;
  checkIn: Date;
  checkOut: Date;
  totalCost: number;
  status: string; // "canceled" | "success";
};

export type HotelSearchResponse = {
  data: HotelType[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};

export type PaymentIntentResponse = {
  paymentIntentId: string;
  clientSecret: string;
  totalCost: number;
};
export type FeedbackType = {
  _id: string; // The unique ID of the feedback
  userId: {
    _id: ObjectId;
    firstName: string;
    lastName: string;
  }; // Populated user information
  hotelId: {
    _id: ObjectId;
    name: string;
  }; // Populated hotel information
  rating: number; // Rating between 1 and 5
  comment: string; // User's comment
  createdAt: Date; // Auto-generated timestamp
  updatedAt: Date; // Auto-generated timestamp
};
