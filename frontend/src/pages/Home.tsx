import { useMutation, useQuery } from "react-query";
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

  const mutation = useMutation(apiClient.addBooking);

  const { data: hotels, isLoading } = useQuery<HotelType[] | undefined>(
    "fetchQuery",
    () => apiClient.fetchHotels()
  );

  useEffect(() => {
    const currentEmail = localStorage.getItem("email")?.toString();
    if (status === "PENDING") {
      // const emailContent = BookingPendingEmail({
      //   orderCode: "orderCode",
      //   checkInDate: bookingDetails.checkIn,
      //   checkOutDate: bookingDetails.checkOut,
      //   totalAmount: (
      //     bookingDetails.pricePerNight * bookingDetails.numberOfNights
      //   ).toString(),
      // });
      // apiClient.sendEmail(
      //   currentEmail,
      //   "😘🤗 Okay! You have chosen offilen payment!",
      //   emailContent
      // );
      console.log("Sending email because status is PENDING");
    }
  }, []);

  // Check status and send email if the status is PAID or CANCELLED
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      const currentEmail = localStorage.getItem("email")?.toString();
      const pendingBooking = JSON.parse(
        localStorage.getItem("pendingBooking") || "{}"
      );

      if (status === "PAID" && pendingBooking) {
        // Gọi API thêm booking vào MongoDB với trạng thái "success"
        mutation.mutate(
          {
            ...pendingBooking,
            status: "success", // Cập nhật trạng thái thành công cho booking
          },
          {
            onSuccess: (res: any) => {
              const bookingId = res._id;
              console.log(res);
              // Gửi email xác nhận
              const emailContent = BookingSuccessEmail({ bookingId, status });
              apiClient.sendEmail(
                currentEmail,
                "🛄 Thanks! Your booking is confirmed",
                emailContent
              );
              console.log("Sending email because status is PAID");

              // Xóa booking tạm thời khỏi localStorage
              localStorage.removeItem("pendingBooking");
            },
          }
        );
      } else if (status === "CANCELLED") {
        // Gọi API thêm booking vào MongoDB với trạng thái "success"
        mutation.mutate(
          {
            ...pendingBooking,
            status: "canceled", // Cập nhật trạng thái thành công cho booking
          },
          {
            onSuccess: (res: any) => {
              const bookingId = res._id;
              console.log(res);
              // Gửi email hủy
              const emailContent = BookingCancellationEmail({ bookingId, status });
              apiClient.sendEmail(
                currentEmail,
                "😥 Booking canceled",
                emailContent
              );
              console.log("Sending email because status is CANCELLED");

              // Xóa booking tạm thời khỏi localStorage
              localStorage.removeItem("pendingBooking");
            },
          }
        );
      }
    }, 1000); // Adjust timeout as needed

    return () => clearTimeout(debounceTimeout);
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
