import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import BookingForm from "../forms/BookingForm/BookingForm";
import { useSearchContext } from "../contexts/SearchContext";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BookingDetailsSummary from "../components/BookingDetailsSummary";
import { Elements } from "@stripe/react-stripe-js";
import { useAppContext } from "../contexts/AppContext";

const Booking = () => {
  
  const { hotelId } = useParams();
  const location = useLocation();
  const { pricePerNight, checkIn, checkOut, adultCount, childCount } = location.state || {};

  const [numberOfNights, setNumberOfNights] = useState<number>(0);

  useEffect(() => {
    if (checkIn && checkOut) {
      const nights =
        Math.abs(checkOut.getTime() - checkIn.getTime()) /
        (1000 * 60 * 60 * 24);

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
        pricePerNight = {pricePerNight}
      />
      <div className="ml-7">
      {currentUser  && (
        <BookingForm
          currentUser={currentUser}
        />
      )}
      </div>
      
     
      
    </div>
  );
};

export default Booking;
