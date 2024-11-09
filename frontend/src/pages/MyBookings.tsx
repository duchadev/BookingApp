import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import BookingItem from "../components/BookingItem";
import { BookingType } from "../../src/shared/types";
import { Link } from "react-router-dom";
import { Skeleton } from "primereact/skeleton";

const MyBookings = () => {
  const {
    data: myBookings,
    isLoading,
    refetch,
  } = useQuery<BookingType[] | undefined>(
    "fetchMyBookings",
    apiClient.fetchMyBookings
    // queryClient.invalidateQueries("rooms");
  );
  const loadNoBookings = () => {
    if (!myBookings || myBookings.length === 0) {
      return (
        <div className="no-feedback-message text-center p-4">
          <h4 className="text-xl font-bold">No Booking Available</h4>
          <p>You have not made any bookings.</p>
        </div>
      );
    }
  };

  const loadingSkeletonBookings = () => {
    return (
      <>
        <Skeleton className="max-w-screen-xl" height="100px"></Skeleton>
      </>
    );
  };

  return (
    <>
      <div className="space-y-5 mb-3">
        <h1 className="text-3xl font-bold">My Bookings</h1>
      </div>
      {isLoading ? (
        loadingSkeletonBookings()
      ) : myBookings?.length === 0 ? (
        loadNoBookings()
      ) : (
        <>
          {myBookings?.map((booking) => {
            const checkInDate = new Date(booking.checkIn);
            const checkOutDate = new Date(booking.checkOut);
            const formattedDates = `${checkInDate.toDateString()} - ${checkOutDate.toDateString()}`;

            return (
              <>
                {/* <h1>Image: {checkInDate.getUTCHours()}</h1> */}
                <BookingItem
                  key={booking._id}
                  bookingId={booking._id}
                  hotelImage={booking.hotelId.imageUrls[0]}
                  hotelName={booking.hotelId.name}
                  city={booking.hotelId.city}
                  country={booking.hotelId.country}
                  dates={formattedDates}
                  price={booking.totalCost}
                  status={booking.status}
                  refetchBookings={refetch}
                />
              </>
            );
          })}
        </>
      )}
    </>
  );
};

export default MyBookings;
