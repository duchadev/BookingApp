import express, { Request, Response } from "express";
import multer from "multer";
import { check, validationResult } from "express-validator";
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

      const { hotelId, roomNumber } = req.body;

      // Check if a room with the same roomNumber exists in the same hotel
      const existingRoom = await Room.findOne({ hotelId, roomNumber });
      if (existingRoom) {
        return res
          .status(400)
          .json({ message: "Room number already exists in this hotel" });
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

// READ all rooms of a specific type
roomRoutes.get("/type/:roomType", async (req: Request, res: Response) => {
  try {
    const { roomType } = req.params; // Get room type from URL params
    const { hotelId } = req.query; // Optional: Get hotelId from query params if provided

    // Create a filter based on room type and optionally hotelId
    const filter: { [key: string]: any } = { type: roomType };
    if (hotelId) {
      filter.hotelId = hotelId;
    }

    // Find rooms based on the filter
    const rooms = await Room.find(filter);

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ message: "No rooms found for this type" });
    }

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
      const { roomNumber } = req.body;

      // Check if the room exists
      const existingRoom = await Room.findById(req.params.roomId);
      if (!existingRoom) {
        return res.status(404).json({ message: "Room not found" });
      }

      // If roomNumber is being updated, check if the new roomNumber already exists
      if (roomNumber && roomNumber !== existingRoom.roomNumber) {
        const roomWithSameNumber = await Room.findOne({ roomNumber });

        if (roomWithSameNumber) {
          return res.status(400).json({
            message:
              "Room number already exists. Please choose a different one.",
          });
        }
      }

      // Model.findByIdAndUpdate(id, update, options)
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
      console.log(error);
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

// DELETE all rooms of a specific type
roomRoutes.delete(
  "/type/:roomType",
  verifyToken,
  authorizeRoles("hotel_manager", "admin"),
  async (req: Request, res: Response) => {
    try {
      const { hotelId } = req.query; // Nhận hotelId từ query params
      const { roomType } = req.params; // Nhận roomType từ params

      if (!hotelId) {
        return res.status(400).json({ message: "Hotel ID is required" });
      }

      // Xóa tất cả các phòng có hotelId và roomType cụ thể
      const deletedRooms = await Room.deleteMany({ hotelId, type: roomType });

      if (deletedRooms.deletedCount === 0) {
        return res.status(404).json({ message: "No rooms of this type found" });
      }

      res.json({ message: `${deletedRooms.deletedCount} rooms deleted` });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

export default roomRoutes;
