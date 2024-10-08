import express, { Request, Response } from "express";
import multer from "multer";
import { check, validationResult } from "express-validator";
import User from "../models/User";
import { authorizeRoles, verifyToken } from "../middleware/auth";
import Room from "../models/Room";
import { RoomType } from "../shared/types";
import { uploadImages } from "../helpers/uploadFile";

const roomRoutes = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// CREATE a new room
roomRoutes.post(
  "/",
  verifyToken,
  authorizeRoles("hotel_manager", "admin"),
  [
    // check("hotelId").not().isEmpty().withMessage("Hotel ID is required"),
    // check("type").not().isEmpty().withMessage("Room type is required"),
    // check("capacity").isNumeric().withMessage("Capacity must be a number"),
    // check("pricePerNight").isNumeric().withMessage("Price must be a number"),
    // check("imageUrls")
    //   .isArray()
    //   .withMessage("Image URLs must be an array of strings"),
  ],
  upload.array("imageFiles", 6), // đặt tên field theo imageFiles này
  async (req: Request, res: Response) => {
    // console.log(req.files); // Log uploaded files
    // console.log(req.body); // Log other fields
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const imageFiles = req.files as Express.Multer.File[];
      // const newHotel: HotelType = req.body;
      const newRoom: RoomType = {
        ...req.body,
        imageUrls: [],
      };
      if (imageFiles || imageFiles.length > 0) {
        const imageUrls = await uploadImages(imageFiles);
        newRoom.imageUrls = imageUrls;
      }

      const room = new Room(newRoom);
      const savedRoom = await room.save();

      res.status(201).json(savedRoom);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// READ all rooms
roomRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const hotelId = req.query.hotelId || req.headers.hotelid; // có thể lấy từ body hoặc headers

    if (!hotelId) {
      return res.status(400).json({ message: "Hotel ID is required" });
    }

    const rooms = await Room.find({ hotelId });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// READ a specific room by ID
roomRoutes.get("/:roomId", async (req: Request, res: Response) => {
  try {
    const room = await Room.findById(req.params.roomId).populate(
      "hotelId", // nếu để mỗi riêng ObjectId thì nó query toàn bộ document của Hotel lun
      "name"
    );
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// UPDATE a room by ID
roomRoutes.put(
  "/:roomId",
  verifyToken,
  authorizeRoles("hotel_manager"),
  [
    // check("type")
    //   .optional()
    //   .not()
    //   .isEmpty()
    //   .withMessage("Room type is required"),
    // check("capacity")
    //   .optional()
    //   .isNumeric()
    //   .withMessage("Capacity must be a number"),
    // check("pricePerNight")
    //   .optional()
    //   .isNumeric()
    //   .withMessage("Price must be a number"),
    // check("availableRooms")
    //   .optional()
    //   .isNumeric()
    //   .withMessage("Available rooms must be a number"),
  ],
  upload.array("imageFiles"),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedRoom = await Room.findByIdAndUpdate(
        req.params.roomId,
        req.body,
        { new: true }
      );
      if (!updatedRoom) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(updatedRoom);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// DELETE a room by ID
roomRoutes.delete(
  "/:roomId",
  verifyToken,
  authorizeRoles("hotel_manager", "admin"),
  async (req: Request, res: Response) => {
    try {
      const deletedRoom = await Room.findByIdAndDelete(req.params.roomId);
      if (!deletedRoom) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json({ message: "Room deleted" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

export default roomRoutes;
