import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import "../assets/css/home.css";
import Featured from "../components/Featured";
import PropertyList from "../components/PropertyList";
import FeaturedProperties from "../components/FeaturedProperties";
import { HotelType } from "../../src/shared/types";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import BookingSuccessEmail from "../components/BookingSuccessEmail";
import BookingCancellationEmail from "../components/BookingCancellationEmail";
import BookingPendingEmail from "../components/BookingPendingEmail";

const Home = () => {
  const location = useLocation();

  // Get the status from query parameters
  const query = new URLSearchParams(location.search);
  const status = query.get("status"); // CANCELLED or PAID
  const orderCode = query.get("orderCode");

  const { data: hotels, isLoading } = useQuery<HotelType[] | undefined>(
    "fetchQuery",
    () => apiClient.fetchHotels()
  );
  const bookingDetails = location.state; // Lấy dữ liệu từ state

  useEffect(() => {
    if (bookingDetails) {
      console.log("Booking Details:", bookingDetails);
      if (status === "PENDING") {
        const emailContent = BookingPendingEmail({
          orderCode: "orderCode",
          checkInDate: bookingDetails.checkIn,
          checkOutDate: bookingDetails.checkOut,
          totalAmount: (
            bookingDetails.pricePerNight * bookingDetails.numberOfNights
          ).toString(),
        });
        apiClient.sendEmail(
          bookingDetails.currentUser.email,
          "😘🤗 Okay! You have chosen offilen payment!",
          emailContent
        );
        console.log("Sending email because status is PENDING");
      }
    }
  }, [bookingDetails]);

  // Check status and send email if the status is PAID or CANCELLED
  useEffect(() => {
    const currentEmail = localStorage.getItem("email")?.toString();
    if (status === "PAID") {
      const emailContent = BookingSuccessEmail({ status, orderCode });
      apiClient.sendEmail(
        currentEmail,
        "🛄 Thanks! Your booking is confirmed",
        emailContent
      );
      console.log("Sending email because status is PAID");
    } else if (status === "CANCELLED") {
      const emailContent = BookingCancellationEmail({ status, orderCode });
      apiClient.sendEmail(currentEmail, "😥 Booking canceled", emailContent);
      // deleteBookingMutation.mutate(room._id);
      console.log("Sending email because status is CANCELLED");
    }
  }, [status, orderCode]);

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
