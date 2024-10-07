import express, { Request, Response } from "express";
import Hotel from "../models/Hotel";
import { verifyToken, authorizeRoles } from "../middleware/auth";
import { body } from "express-validator";
import { HotelType } from "../shared/types";
import { BookingType, HotelSearchResponse } from "../shared/types";
import Room from "../models/Room";
import "dotenv/config";
import PayOS from "@payos/node";

const payOs = new PayOS("client_id", "api-key", "checksum-key");

const bookingRouter = express.Router();

// Get all hotels (not by userID)
bookingRouter.post(
  "/create-payment-link",
  async (req: Request, res: Response) => {
    try {
      const order = {
        amount: 5000,
        description: "Customer Order",
        orderCode: 10,
        returnUrl: process.env.FRONTEND_URL + "/success.html",
        cancelUrl: process.env.FRONTEND_URL + "/cancel.html",
      };

      const paymentLink = await payOs.createPaymentLink(order);
      res.redirect(303, paymentLink.checkoutUrl);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Something went wrong", error: error.message });
    }
  }
);

export default bookingRouter;
