import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import BookingForm from "../forms/BookingForm/BookingForm";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BookingDetailsSummary from "../components/BookingDetailsSummary";

const Booking = () => {
  const { hotelId } = useParams();
  const location = useLocation();
  const { room, pricePerNight, checkIn, checkOut, adultCount, childCount } =
    location.state || {};

  const [numberOfNights, setNumberOfNights] = useState<number>(0);

  useEffect(() => {
    if (checkIn && checkOut) {
      const msInADay = 1000 * 60 * 60 * 24;
      const nights = (checkOut.getTime() - checkIn.getTime()) / msInADay;
      setNumberOfNights(Math.ceil(nights));
    }
  }, [checkIn, checkOut]);

  const { data: hotel } = useQuery(
    "fetchHotelByID",
    () => apiClient.fetchHotelById(hotelId as string),
    {
      enabled: !!hotelId,
    }
  );

  const { data: currentUser } = useQuery(
    "fetchCurrentUser",
    apiClient.fetchCurrentUser
  );

  if (!hotel) {
    return <></>;
  }

  return (
    <div className="grid md:grid-cols-[1fr_2fr]">
      <BookingDetailsSummary
        checkIn={checkIn}
        checkOut={checkOut}
        adultCount={adultCount}
        childCount={childCount}
        numberOfNights={numberOfNights}
        hotel={hotel}
        roomSeleted={room}
        pricePerNight={pricePerNight}
        currentUser={currentUser}
      />
      <div className="ml-7">
        {currentUser && <BookingForm currentUser={currentUser} />}
      </div>
    </div>
  );
};

export default Booking;
