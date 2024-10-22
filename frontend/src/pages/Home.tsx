import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import "../assets/css/home.css";
import Featured from "../components/Featured";
import PropertyList from "../components/PropertyList";
import FeaturedProperties from "../components/FeaturedProperties";
import { HotelType } from "../../../backend/src/shared/types";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const Home = () => {
  const location = useLocation();

  // Get the status from query parameters
  const query = new URLSearchParams(location.search);
  const status = query.get("status");
  const orderCode = query.get("orderCode");

  const { data: hotels, isLoading } = useQuery<HotelType[] | undefined>(
    "fetchQuery",
    () => apiClient.fetchHotels()
  );

  // Email sending function
  const sendEmail = async (to: string, subject: string, html: string) => {
    try {
      if (!to || !subject || !html) {
        throw new Error("Email parameters are missing");
      }

      const response = await fetch("http://localhost:7000/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, subject, html }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send email. Status: ${response.status}`);
      }

      console.log("Email sent successfully!");
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  // Check status and send email if the status is PAID or CANCELLED
  useEffect(() => {
    if (status === "PAID") {
      sendEmail(
        "huyngoc612@gmail.com", // change email to user's email
        "Payment Confirmation",
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center;">
            <h1 style="color: #4CAF50;">Payment Successful!</h1>
            <p style="font-size: 18px;">Thank you for completing your transaction.</p>
          </div>
    
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px;">
            <h2 style="color: #333;">Your Payment Details:</h2>
            <p style="font-size: 16px;">Payment Status: <strong style="color: #4CAF50;">${status}</strong></p>
            <p style="font-size: 16px;">Transaction ID: <strong>${orderCode}</strong></p>
            <p style="font-size: 16px;">Date: <strong>${new Date().toLocaleDateString()}</strong></p>
          </div>
    
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://yourwebsite.com" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px;">View your order</a>
          </div>
    
          <p style="text-align: center; font-size: 14px; color: #888; margin-top: 40px;">&copy; 2024 Your Company Name. All rights reserved.</p>
        </div>
        `
      );
      console.log("Sending email because status is PAID");
    }

    if (status === "CANCELLED") {
      sendEmail(
        "huyngoc612@gmail.com", // change email to user's email
        "Order Cancellation",
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center;">
            <h1 style="color: #e74c3c;">Booking Cancelled</h1>
            <p style="font-size: 18px;">We are sorry to inform you that your booking has been cancelled.</p>
          </div>
    
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px;">
            <h2 style="color: #333;">Booking Details:</h2>
            <p style="font-size: 16px;">Booking Status: <strong style="color: #e74c3c;">${status}</strong></p>
            <p style="font-size: 16px;">Booking ID: <strong>${orderCode}</strong></p>
            <p style="font-size: 16px;">Cancellation Date: <strong>${new Date().toLocaleDateString()}</strong></p>
          </div>
    
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://yourwebsite.com/contact-support" style="text-decoration: none; background-color: #e74c3c; color: white; padding: 10px 20px; border-radius: 5px;">Contact Support</a>
          </div>
    
          <p style="text-align: center; font-size: 14px; color: #888; margin-top: 40px;">&copy; 2024 Your Company Name. All rights reserved.</p>
        </div>
        `
      );
      console.log("Sending email because status is CANCELLED");
    }
  }, [status]);

  return (
    <div className="space-y-3 mt-32 ">
      <h2 className="text-3xl font-bold pl-8">Treding Destinations</h2>
      <p className="pl-8">Travelers searching for Vietnam also booked these</p>
      <div className="grid gap-4">
        {/* ----- Featured ------ */}
        <Featured hotels={hotels} isLoading={isLoading} />

        {/* ----- PropertyList ------ */}
        <h1 className="text-2xl font-bold mt-9 pl-8 homeTitle">
          Browse by property type
        </h1>
        <PropertyList hotels={hotels} isLoading={isLoading} />

        {/* ----- FeaturedProperties ------ */}
        <h1 className="text-2xl font-bold mt-9 pl-8 homeTitle">
          Homes guests love
        </h1>
        <FeaturedProperties hotels={hotels} />
      </div>
    </div>
  );
};

export default Home;
