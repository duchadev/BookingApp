import express from "express";
import sendEmailRoutes from "../api/send-email/route"; // Adjust the path if necessary

const router = express.Router();

// Mount send-email route
router.use("/send-email", sendEmailRoutes);

export default router;
