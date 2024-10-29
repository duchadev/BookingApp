import express from "express";
import Hotel from "../models/Hotel"; // Adjust the path as necessary
import { verifyToken, authorizeRoles } from "../middleware/auth"; // Import your middleware
import nodemailer from "nodemailer";
const adminRouter = express.Router();

// Route to update hotel verification status (Only for admins)
adminRouter.patch(
  "/:hotelId/verify",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const { hotelId } = req.params;
    const { action } = req.body;

    try {
      // Determine the new verification status
      const status =
        action === "approve" ? "Success" : action === "reject" ? "Fail" : null;
        console.log("abc", status);
              if (!status) {
        return res
          .status(400)
          .json({ message: "Invalid action. Use 'approve' or 'reject'." });
      }

      // Find and update the hotel's verification status
      const hotel = await Hotel.findByIdAndUpdate(
        hotelId,
        { verify: status },
        { new: true }
      ).populate("userId"); // Populate userId to access the owner's email

      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found." });
      }

      // Get the owner's email from the populated user data
      const ownerEmail = (hotel.userId as any).email; // Adjust typing if needed

      // Configure nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false, // Use this option for testing if you face SSL errors
        },
    });
    
      console.log("email: ", ownerEmail);
      // Set up email options
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: ownerEmail,
        subject: `Your Hotel Verification Status: ${status}`,
        html: `<p>Your hotel <strong>${hotel.name}</strong> has been ${
          status === "Success" ? "approved" : "rejected"
        }.</p>`,
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      res.status(200).json({
        message: `Hotel verification status updated to ${status}. Email sent to owner.`,
        verify: status, 
      });
    } catch (error) {
      console.error("Error updating status or sending email:", error);
      res.status(500).json({ message: "Server error.", error });

    }
  }
);

adminRouter.get(
  "/verify",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const verify = req.query.verify as string; // Access `verify` from the query

    try {
      // Allow fetching all hotels if verify is not specified or is invalid
      const query = verify && ["Success", "Fail", "Pending"].includes(verify)
        ? { verify }
        : {};

      const hotels = await Hotel.find(query);
      res.status(200).json(hotels); // Directly return the hotels array
    } catch (error) {
      console.error("Error fetching hotels:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

export default adminRouter;