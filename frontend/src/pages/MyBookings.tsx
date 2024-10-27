import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import BookingItem from "../components/BookingItem";
import { BookingType } from "../../../backend/src/shared/types";

const MyBookings = () => {
  const { data: myBookings, isLoading } = useQuery<BookingType[] | undefined>(
    "fetchMyBookings",
    apiClient.fetchMyBookings
  );

  if (!myBookings || myBookings.length === 0) {
    return (
      <div className="no-feedback-message text-center p-4">
        <h4 className="text-xl font-bold">No Booking Available</h4>
        <p>You have not made any bookings.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <h1 className="text-3xl font-bold">My Bookings</h1>
      </div>
      {myBookings.map((booking) => {
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        const formattedDates = `${checkInDate.toDateString()} - ${checkOutDate.toDateString()}`;

        return (
          <div key={booking._id}>
            {/* <h1>Image: {checkInDate.getUTCHours()}</h1> */}
            <BookingItem
              bookingId={booking._id}
              hotelImage={booking.hotelId.imageUrls[0]}
              hotelName={booking.hotelId.name}
              city={booking.hotelId.city}
              country={booking.hotelId.country}
              dates={formattedDates}
              price={booking.totalCost}
              status={booking.status}
            />
          </div>
        );
      })}
    </>
  );
};

export default MyBookings;
