import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";
import { Link, useParams } from "react-router-dom";
import * as apiClient from "../api-client";
import { useQuery } from "react-query";
import { format } from "date-fns";
import MapComponent from "./MapComponent";
import { useEffect, useState } from "react";
import { Skeleton } from "primereact/skeleton";

const VITE_FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_BASE_URL;

const MyBookingDetails: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);

  const { data: booking, isLoading } = useQuery(
    "fetchRoomById",
    () => apiClient.getBookingById(bookingId || ""),
    {
      enabled: !!bookingId,
    }
  );

  // Cập nhật hình ảnh từ phản hồi của API
  useEffect(() => {
    // Geolocation search query
    const searchQuery = `${booking?.hotelId?.name}, ${booking?.hotelId?.city}, ${booking?.hotelId?.country}`;
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setMapPosition([lat, lon]);
        }
      })
      .catch((error) => console.error("Lỗi khi tìm kiếm địa điểm:", error));
  }, [booking]); // Chỉ gọi lại khi booking thay đổi

  const formatNumberOfNights = (checkIn?: Date, checkOut?: Date) => {
    if (checkIn && checkOut) {
      const msInADay = 1000 * 60 * 60 * 24;
      const nights = (checkOut.getTime() - checkIn.getTime()) / msInADay;
      // setNumberOfNights(Math.ceil(nights));

      // Lấy số nguyên phần nguyên (đếm số đêm)
      const numberOfNights = nights > 0 ? Math.floor(nights) : 0;

      return numberOfNights;
    }
  };

  const priceBodyTemplate = (totalPrice: number) => {
    // return new Intl.NumberFormat("vn-VN", {
    //   style: "currency",
    //   currency: "VND",
    // }).format(totalPrice);

    // Format the number without currency symbol
    const formattedPrice = new Intl.NumberFormat("vn-VN").format(totalPrice);
    // Add "VND" prefix
    return `VND ${formattedPrice}`;
  };

  const items: MenuItem[] = [
    {
      label: "My Bookings",
      template: () => (
        <>
          <Link to={`${VITE_FRONTEND_BASE_URL}/my-bookings`}>
            <a className="">My Bookings</a>
          </Link>
        </>
      ),
    },
    {
      label: "Details",
      template: () => (
        <>
          <h2 className="text-primary font-semibold text-blue-600">Details</h2>
        </>
      ),
    },
  ];
  const home: MenuItem = {
    icon: "pi pi-home",
    url: `${VITE_FRONTEND_BASE_URL}`,
  };

  const loadingTemplate = () => {
    return (
      <>
        <Skeleton className="max-w-screen-xl" height="500px"></Skeleton>
      </>
    );
  };
  // Status Badge Styles (can adjust color for each status)
  const statusStyles: Record<string, string> = {
    success: "bg-green-200 text-green-800",
    canceled: "bg-red-200 text-red-800",
    pending: "bg-yellow-200 text-yellow-800",
  };

  return (
    <>
      <BreadCrumb model={items} home={home} className="mb-3" />
      {isLoading ? (
        loadingTemplate()
      ) : (
        <>
          <div className="max-w-screen-xl mx-auto p-6 border border-gray-300 space-y-6">
            <div
              className={`px-4 py-2 rounded-lg font-bold text-center text-xl ${
                statusStyles[booking?.status || "pending"]
              }`}
            >
              Status: {booking?.status?.toUpperCase()}
            </div>
            {/* Property Information */}
            <div className="flex justify-between space-x-6">
              <div className="flex space-x-6">
                <img
                  src={`${booking?.hotelId?.imageUrls[0]}`}
                  alt="Kata Home"
                  className="w-36 h-auto object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold">
                    {booking?.hotelId?.name}
                  </h2>
                  <p>
                    <strong>City:</strong> {booking?.hotelId?.city}
                  </p>
                  <p>
                    <strong>Country:</strong> {booking?.hotelId?.country}
                  </p>
                  <p>
                    <strong>Phone:</strong> {booking?.hotelId?.userId?.phone}
                  </p>
                  <p>
                    <strong>Email:</strong> {booking?.hotelId?.userId?.email}
                  </p>
                </div>
              </div>
              <div className="items-end text-right">
                <h3 className="text-2xl font-semibold">Total cost</h3>
                <h2 className="text-orange-500 font-bold text-xl">
                  {priceBodyTemplate(booking?.totalCost)}
                </h2>
              </div>
            </div>

            {/* Check-in / Check-out Information */}
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <h3 className="font-semibold">Check In</h3>
                <p>
                  <p className="font-bold text-3xl">
                    {booking?.checkIn
                      ? format(new Date(booking.checkIn), "MMM dd, yyyy")
                      : "Date not available"}
                  </p>
                  <p className="font-bold text-3xl">
                    {booking?.checkIn
                      ? format(new Date(booking.checkIn), "EEE")
                      : "Date not available"}
                  </p>
                  {/* color: slateblue */}
                  <i className="pi pi-clock" style={{ color: "blue" }}></i>{" "}
                  {booking?.checkIn
                    ? format(new Date(booking.checkIn), "HH:mm a")
                    : "Date not available"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Check Out</h3>
                <p>
                  <p className="font-bold text-3xl">
                    {booking?.checkOut
                      ? format(new Date(booking.checkOut), "MMM dd, yyyy")
                      : "Date not available"}
                  </p>
                  <p className="font-bold text-3xl">
                    {booking?.checkOut
                      ? format(new Date(booking.checkOut), "EEE")
                      : "Date not available"}
                  </p>
                  {/* color: slateblue */}
                  <i className="pi pi-clock" style={{ color: "blue" }}></i>{" "}
                  {booking?.checkOut
                    ? format(new Date(booking.checkOut), "HH:mm a")
                    : "Date not available"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Number of booked rooms</h3>
                <p className="font-bold text-3xl">{booking?.roomIds?.length}</p>
              </div>
              <div>
                <h3 className="font-semibold">Number of nights</h3>
                <p className="font-bold text-3xl">
                  {formatNumberOfNights(
                    new Date(booking?.checkIn),
                    new Date(booking?.checkOut)
                  )}
                </p>
              </div>
            </div>
            {/* facilities maxAdultCount maxChildCount */}
            {/* Pricing Details */}
            <div className="space-y-2">
              <h3 className="font-semibold">
                The final price displayed is the amount you will pay for the
                accommodation.
              </h3>
              <p className="text-sm">
                HotelHaven.com does not charge guests for any bookings,
                administrative fees, or any other costs.
              </p>
            </div>

            {/* Payment Information */}
            <div className="space-y-2">
              <h3 className="font-semibold">Payment Information</h3>
              <p>
                {booking?.hotelId?.name} handles all payments. This
                accommodation accepts the following payment methods:{" "}
                <span className="font-bold" style={{ color: "slateblue" }}>
                  Offline
                </span>{" "}
                |{" "}
                <img
                  src="https://res.cloudinary.com/dsdhrcnep/image/upload/v1730448086/qvhlk1qxl9g9nuoqxtp0.png"
                  alt="pay os"
                  width={50}
                  style={{ display: "inline" }}
                />
              </p>
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              <h3 className="font-semibold">Additional Information</h3>
              <p className="text-sm">
                Please note: additional fees (e.g., extra beds) are not included
                in this total price.
              </p>
            </div>

            {/* Map Section */}
            <div>
              <MapComponent
                placeName={booking?.hotelId?.name}
                city={booking?.hotelId?.city}
                country={booking?.hotelId?.country}
                mapPosition={mapPosition} // Pass the position to the MapComponent
              />
            </div>

            {/* Room Information */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">
                {booking?.hotelId?.type}
              </h3>
              <p>
                <strong>Customer:</strong> {booking?.userId?.firstName}{" "}
                {booking?.userId?.lastName}
              </p>
              <p>
                <strong>Facilities in room:</strong>
              </p>
              <p>
                {booking?.hotelId?.facilities.map(
                  (facility: string, index: number) => {
                    if (index === booking?.hotelId?.facilities.length - 1) {
                      return (
                        <span className="" key={facility}>
                          {facility}
                        </span>
                      );
                    }

                    return (
                      <span className="" key={facility}>
                        {facility} •{" "}
                      </span>
                    );
                  }
                )}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MyBookingDetails;
