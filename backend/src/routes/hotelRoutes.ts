import express, { Request, Response } from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import Hotel from "../models/Hotel";
import { verifyToken, authorizeRoles } from "../middleware/auth";
import { body } from "express-validator";
import { HotelType } from "../shared/types";
import { BookingType, HotelSearchResponse } from "../shared/types";
import { param, validationResult } from "express-validator";
import { uploadImages } from "../helpers/uploadFile";
import Room from "../models/Room";

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
    const query = constructSearchQuery(req.query);

    let sortOptions = {};
    switch (req.query.sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 }; // Sắp xếp theo xếp hạng sao
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 };
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 };
        break;
    }

    const pageSize = 5;
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    );
    const skip = (pageNumber - 1) * pageSize;

    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Hotel.countDocuments(query);

    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

  // Lọc theo name
  if (queryParams.name) {
    constructedQuery.name = new RegExp(queryParams.name, "i");
  }

  // Lọc theo country (quốc gia)
  if (queryParams.country) {
    constructedQuery.country = new RegExp(queryParams.destination, "i");
  }

  // Lọc theo số người lớn tối đa
  if (queryParams.maxAdultCount) {
    constructedQuery.maxAdultCount = {
      $gte: parseInt(queryParams.maxAdultCount),
    };
  }

  // Lọc theo số trẻ em tối đa
  if (queryParams.maxChildCount) {
    constructedQuery.maxChildCount = {
      $gte: parseInt(queryParams.maxChildCount),
    };
  }

  // Lọc theo tiện nghi
  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  // Lọc theo loại hình khách sạn (hotel, motel, resort)
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
      ? queryParams.stars.map((star: string) => parseInt(star))
      : [parseInt(queryParams.stars)];

    constructedQuery.starRating = { $in: starRatings };
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
      console.log(newHotel);
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
    res.json(hotelsWithRooms);

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
    res.json(hotelsWithRooms);
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
    const id = req.params.hotelId.toString();
    try {
      // Tìm và xóa hotel
      const deletedHotel = await Hotel.findOneAndDelete({
        _id: id,
        // userId: req.userId, // Có thể bỏ qua hoặc giữ lại nếu muốn xác thực người dùng xóa
      });

      if (!deletedHotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      res.status(200).json({ message: "Hotel deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting hotel", error: error.message });
    }
  }
);

// -------------------------------

// hotelRouter.get(
//   "/:id",
//   [param("id").notEmpty().withMessage("Hotel ID is required")],
//   async (req: Request, res: Response) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const id = req.params.id.toString();

//     try {
//       const hotel = await Hotel.findById(id);
//       res.json(hotel);
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: "Error fetching hotel" });
//     }
//   }
// );

// hotelRouter.post(
//   "/:hotelId/bookings/payment-intent",
//   verifyToken,
//   async (req: Request, res: Response) => {
//     const { numberOfNights } = req.body;
//     const hotelId = req.params.hotelId;

//     const hotel = await Hotel.findById(hotelId);
//     if (!hotel) {
//       return res.status(400).json({ message: "Hotel not found" });
//     }

//     // const totalCost = hotel.pricePerNight * numberOfNights;

//     // const paymentIntent = await stripe.paymentIntents.create({
//     //   amount: totalCost * 100,
//     //   currency: "gbp",
//     //   metadata: {
//     //     hotelId,
//     //     userId: req.userId,
//     //   },
//     // });

//     // if (!paymentIntent.client_secret) {
//     //   return res.status(500).json({ message: "Error creating payment intent" });
//     // }

//     // const response = {
//     //   paymentIntentId: paymentIntent.id,
//     //   clientSecret: paymentIntent.client_secret.toString(),
//     //   totalCost,
//     // };

//     // res.send(response);

//     res.status(200).json({ message: "Chưa update phần thanh toán..." });
//   }
// );

// hotelRouter.post(
//   "/:hotelId/bookings",
//   verifyToken,
//   async (req: Request, res: Response) => {
//     try {
//       // const paymentIntentId = req.body.paymentIntentId;

//       // const paymentIntent = await stripe.paymentIntents.retrieve(
//       //   paymentIntentId as string
//       // );

//       // if (!paymentIntent) {
//       //   return res.status(400).json({ message: "payment intent not found" });
//       // }

//       // if (
//       //   paymentIntent.metadata.hotelId !== req.params.hotelId ||
//       //   paymentIntent.metadata.userId !== req.userId
//       // ) {
//       //   return res.status(400).json({ message: "payment intent mismatch" });
//       // }

//       // if (paymentIntent.status !== "succeeded") {
//       //   return res.status(400).json({
//       //     message: `payment intent not succeeded. Status: ${paymentIntent.status}`,
//       //   });
//       // }

//       const newBooking: BookingType = {
//         ...req.body,
//         userId: req.userId,
//       };

//       const hotel = await Hotel.findOneAndUpdate(
//         { _id: req.params.hotelId },
//         {
//           $push: { bookings: newBooking },
//         }
//       );

//       if (!hotel) {
//         return res.status(400).json({ message: "hotel not found" });
//       }

//       await hotel.save();
//       res.status(200).send();
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: "something went wrong" });
//     }
//   }
// );

export default hotelRouter;
