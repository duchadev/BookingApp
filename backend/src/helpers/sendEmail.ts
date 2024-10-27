import express from "express";
import nodemailer from "nodemailer";
// import { RegisterSuccessEmail } from "./RegisterSuccessEmail";

const BACKEND_URL = process.env.BACKEND_BASE_URL || "http://localhost:7000";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Store your credentials in .env
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(userEmail: string, token: string) {
  const verificationUrl = `${BACKEND_URL}/api/users/verify-email?token=${token}`;

  await transporter.sendMail({
    from: '"Hotel Haven" <yourapp@example.com>',
    to: userEmail,
    subject: "Email Verification",
    html: `<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">

    <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #333;">Welcome to Hotel Haven!</h1>
        <p style="color: #555; line-height: 1.5;">Thank you for registering an account on our website. We are excited to welcome you to the Hotel Haven community.</p>
        <p style="color: #555; line-height: 1.5;">To complete your registration, please confirm your account by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #28a745; text-decoration: none; border-radius: 5px;">Confirm Account</a>
        <p style="color: #555; line-height: 1.5;">If you have any questions, feel free to contact us.</p>
        <p style="color: #555; line-height: 1.5;">We hope you have a wonderful experience with Hotel Booking!</p>
        
        <div style="margin-top: 20px; font-size: 12px; color: #888;">
            <p>Best regards,</p>
            <p>The Customer Support Team at Hotel Booking</p>
        </div>
    </div>

</body>`,
  });
}