import express, { Request, Response } from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import Hotel from "../models/hotel";
import { verifyToken, authorizeRoles } from "../middleware/auth";
import { body } from "express-validator";
import { HotelType } from "../shared/types";
import { BookingType, HotelSearchResponse } from "../shared/types";
import { param, validationResult } from "express-validator";
import { uploadImages } from "../helpers/uploadFile";
import Room from "../models/Room";
import Booking from "../models/Booking";
import Feedback from "../models/feedback";

const hotelRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

hotelRouter.get("/search", async (req: Request, res: Response) => {
  try {
    // Xây dựng truy vấn từ các query params
    const query = constructSearchQuery(req.query);

    let sortOptions: any = {};
    switch (req.query.sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 }; // Sắp xếp theo sao giảm dần
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 }; // Sắp xếp giá tăng dần
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 }; // Sắp xếp giá giảm dần
        break;
    }

    const pageSize = 5; // Số lượng khách sạn trên mỗi trang
    const pageNumber = parseInt(req.query.page as string) || 1; // Trang hiện tại
    const skip = (pageNumber - 1) * pageSize; // Tính số bản ghi bỏ qua cho phân trang

    // Lấy danh sách các khách sạn dựa trên userId của người dùng đăng nhập
    // Thực hiện truy vấn trong MongoDB với query và bộ lọc
    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize)
      .lean();

    // Sử dụng map để tìm tất cả các phòng liên quan đến từng khách sạn
    const hotelsWithRooms = await Promise.all(
      hotels.map(async (hotel) => {
        const rooms = await Room.find({ hotelId: hotel._id }).lean();
        return {
          ...hotel, // Thêm các trường của hotel vào kết quả trả về
          rooms, // Thêm danh sách rooms vào mỗi hotel
        };
      })
    );

    const total = await Hotel.countDocuments(query); // Đếm tổng số khách sạn tìm thấy

    const response: HotelSearchResponse = {
      data: hotelsWithRooms, // Trả về danh sách hotels kèm theo rooms cho từng hotel
      // data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.status(200).json(response); // Trả về kết quả tìm kiếm
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ message: "Something went wrong" }); // Trả về lỗi nếu có
  }
});

const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

  // Tìm kiếm theo name hoặc destination (không phân biệt hoa thường)
  if (queryParams.destination) {
    constructedQuery.$or = [
      { name: { $regex: new RegExp(queryParams.destination, "i") } },
      { destination: { $regex: new RegExp(queryParams.destination, "i") } },
    ];
  }
  console.log("Received adultCount:", queryParams.checkIn);
  console.log("Received childCount:", queryParams.checkOut);

  if (queryParams.childCount) {
    constructedQuery.maxChildCount = {
      $gte: parseInt(queryParams.childCount, 10),
    };
  }
  if (queryParams.adultCount) {
    constructedQuery.maxAdultCount = {
      $gte: parseInt(queryParams.adultCount, 10),
    };
  }

  // Lọc theo tiện nghi yêu cầu
  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  // Lọc theo loại hình khách sạn
  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  // Lọc theo xếp hạng sao
  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star, 10))
      : [parseInt(queryParams.stars, 10)];

    constructedQuery.starRating = { $in: starRatings };
  }

  if (queryParams.checkIn && queryParams.checkOut) {
    const checkInDate = new Date(queryParams.checkIn);
    const checkOutDate = new Date(queryParams.checkOut);

    // Tìm phòng không bị xung đột với khoảng thời gian đã đặt
    constructedQuery["status"] = {
      $not: {
        $elemMatch: {
          checkIn: { $lt: checkOutDate }, // Ngày bắt đầu trước ngày người dùng check-out
          checkOut: { $gt: checkInDate }, // Ngày kết thúc sau ngày người dùng check-in
        },
      },
    };
  }

  return constructedQuery;
};

// --------------------------------

hotelRouter.post(
  "/",
  verifyToken,
  authorizeRoles("hotel_manager", "admin"),
  [
    // body("name").notEmpty().withMessage("Name is required"),
    // body("country").notEmpty().withMessage("Country is required"),
    // body("description").notEmpty().withMessage("Description is required"),
    // body("location").notEmpty().withMessage("Location is required"),
    // body("type").notEmpty().withMessage("Hotel type is required"),
    // body("maxAdultCount")
    //   .notEmpty()
    //   .isNumeric()
    //   .withMessage("Max adult count is required and must be a number"),
    // body("maxChildCount")
    //   .notEmpty()
    //   .isNumeric()
    //   .withMessage("Max child count is required and must be a number"),
    // body("facilities")
    //   .notEmpty()
    //   .isArray()
    //   .withMessage("Facilities are required"),
    // body("starRating")
    //   .notEmpty()
    //   .isNumeric()
    //   .withMessage("Star rating is required and must be a number")
    //   .isInt({ min: 1, max: 5 })
    //   .withMessage("Star rating must be between 1 and 5"),
    // body("imageUrls")
    //   .notEmpty()
    //   .isArray()
    //   .withMessage("ImageUrls are required"),
  ],
  upload.array("imageFiles", 6),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
      }
      if (!req.body) {
        return res.status(400).json({ message: "Invalid JSON input" });
      }

      const imageFiles = req.files as Express.Multer.File[];
      // const newHotel: HotelType = req.body;
      const newHotel: HotelType = {
        ...req.body,
        userId: req.userId, // req.userId được xác định bởi middleware verifyToken
        imageUrls: [],
      };

      if (imageFiles || imageFiles.length > 0) {
        const imageUrls = await uploadImages(imageFiles);
        newHotel.imageUrls = imageUrls;
      }

      const hotel = new Hotel(newHotel);
      const savedHotel = await hotel.save();

      res.status(201).json(savedHotel);
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .json({ message: "Something went wrong", error: e.message });
    }
  }
);

// Get all hotels (not by userID)
hotelRouter.get("/", async (req: Request, res: Response) => {
  try {
    // const hotels = await Hotel.find();

    // Lấy danh sách các khách sạn dựa trên userId của người dùng đăng nhập
    const hotels = await Hotel.find().lean();

    // Sử dụng map để tìm tất cả các phòng liên quan đến từng khách sạn
    const hotelsWithRooms = await Promise.all(
      hotels.map(async (hotel) => {
        const rooms = await Room.find({ hotelId: hotel._id }).lean();
        return {
          ...hotel, // Thêm các trường của hotel vào kết quả trả về
          rooms, // Thêm danh sách rooms vào mỗi hotel
        };
      })
    );

    // Trả về danh sách hotels kèm theo rooms cho từng hotel
    res.status(200).json(hotelsWithRooms);

    // res.json(hotels);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

// Get all hotels by userId
hotelRouter.get("/users", verifyToken, async (req: Request, res: Response) => {
  try {
    // Lấy danh sách các khách sạn dựa trên userId của người dùng đăng nhập
    const hotels = await Hotel.find({ userId: req.userId }).lean();

    // Sử dụng map để tìm tất cả các phòng liên quan đến từng khách sạn
    const hotelsWithRooms = await Promise.all(
      hotels.map(async (hotel) => {
        const rooms = await Room.find({ hotelId: hotel._id }).lean();
        return {
          ...hotel, // Thêm các trường của hotel vào kết quả trả về
          rooms, // Thêm danh sách rooms vào mỗi hotel
        };
      })
    );

    // Trả về danh sách hotels kèm theo rooms cho từng hotel
    res.status(200).json(hotelsWithRooms);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

hotelRouter.get("/:hotelId", async (req: Request, res: Response) => {
  const id = req.params.hotelId.toString();
  try {
    const hotel = await Hotel.findOne({
      _id: id,
      // userId: req.userId,
    })
      .populate("userId", "firstName lastName email")
      .lean(); // vì dùng ObjectId nên dùng populate để tham chiếu user
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    const rooms = await Room.find({ hotelId: id }).lean();
    const hotelWithRooms = {
      hotel: hotel, // Thêm các trường của hotel vào kết quả trả về
      rooms: rooms, // Thêm danh sách rooms vào mỗi hotel
    };
    // Trả về 1 hotel kèm theo rooms
    // res.json(hotelWithRooms);
    res.json(hotel);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching hotels", error: error.message });
  }
});

hotelRouter.put(
  "/:hotelId",
  verifyToken,
  authorizeRoles("hotel_manager"),
  upload.array("imageFiles"),
  async (req: Request, res: Response) => {
    try {
      const updatedHotel: HotelType = req.body;

      const hotel = await Hotel.findOneAndUpdate(
        {
          _id: req.params.hotelId,
          // userId: req.userId,
        },
        updatedHotel,
        { new: true }
      );

      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      const imageFiles = req.files as Express.Multer.File[];

      if (imageFiles || imageFiles.length > 0) {
        const updatedImageUrls = await uploadImages(imageFiles);

        hotel.imageUrls = [
          ...updatedImageUrls,
          ...(updatedHotel.imageUrls || []),
        ];
      }

      // const files = req.files as Express.Multer.File[];
      // const updatedImageUrls = await uploadImages(files);

      await hotel.save();
      res.status(200).json(hotel);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Something went throw", error: error.message });
    }
  }
);

hotelRouter.delete(
  "/:hotelId",
  verifyToken,
  authorizeRoles("hotel_manager", "admin"),
  async (req: Request, res: Response) => {
    const hotelId = req.params.hotelId.toString();

    try {
      // Step 1: Delete related rooms
      await Room.deleteMany({ hotelId });

      // Step 2: Delete related bookings
      await Booking.deleteMany({ hotelId });

      // Step 3: Delete related feedbacks
      await Feedback.deleteMany({ hotelId });

      // Step 4: Delete the hotel
      const deletedHotel = await Hotel.findOneAndDelete({
        _id: hotelId,
        // Optionally, you can also validate the user who is deleting this hotel
        // userId: req.userId,
      });

      if (!deletedHotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      res
        .status(200)
        .json({ message: "Hotel and all related data deleted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({
          message: "Error deleting hotel and related data",
          error: error.message,
        });
    }
  }
);

export default hotelRouter;
