import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import * as apiClient from "../api-client";
import { BsBuilding, BsMap } from "react-icons/bs";
import { BiHotel, BiMoney } from "react-icons/bi";
import { HotelType } from "../../src/shared/types";

const MyHotels = () => {
  const { data: hotelData } = useQuery(
    "fetchMyHotelsByUserId",
    apiClient.fetchMyHotelsByUserId,
    {
      onError: (error) => {
        console.log(error);
      },
      onSuccess: (data) => {
        console.log(data);
      },
    }
  );

  return (
    <div className="space-y-5">
      <span className="flex justify-between">
        <h1 className="text-3xl font-bold">My Hotels</h1>
        <Link
          to="/add-hotel"
          className="flex bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500"
        >
          Add Hotel
        </Link>
      </span>

      {/* Kiểm tra hotelData có danh sách hay không */}
      {hotelData ? (
        <div className="grid grid-cols-1 gap-8">
          {hotelData.map((hotel: HotelType) => {
            // Kiểm tra và tính toán minPrice và maxPrice cho từng khách sạn
            let minPrice, maxPrice;

            if (hotel.rooms && hotel.rooms.length > 0) {
              const prices = hotel.rooms.map((room) => room.pricePerNight);
              minPrice = Math.min(...prices);
              maxPrice = Math.max(...prices);
            } else {
              minPrice = maxPrice = "N/A"; // Giá trị mặc định nếu không có rooms
            }

            return (
              <Link
                to={`/detail/${hotel._id}`}
                key={hotel._id} // Luôn cần thêm key khi render danh sách
                // className="relative cursor-pointer overflow-hidden rounded-md"
              >
                <div
                  data-testid="hotel-card"
                  className="flex flex-col justify-between border border-slate-300 rounded-lg p-8 gap-5"
                >
                  <h2 className="text-2xl font-bold">{hotel.name}</h2>
                  <div className="whitespace-pre-line">{hotel.description}</div>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                      <BsMap className="mr-1" />
                      {hotel.city}, {hotel.country}
                    </div>
                    <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                      <BsBuilding className="mr-1" />
                      {hotel.type}
                    </div>
                    {/* Hiển thị minPrice và maxPrice */}
                    <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                      <BiMoney className="mr-1" />
                      {minPrice !== "N/A" ? (
                        <>
                          {minPrice.toLocaleString()} -{" "}
                          {maxPrice.toLocaleString()} VND
                        </>
                      ) : (
                        "N/A"
                      )}
                    </div>
                    <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                      <BiHotel className="mr-1" />
                      {hotel.maxAdultCount} adults, {hotel.maxChildCount}{" "}
                      children
                    </div>
                    <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                      <span className="flex">
                        {Array.from({ length: 5 }).map((_, index) => {
                          if (index < hotel.starRating) {
                            return (
                              <i
                                key={index}
                                className="pi pi-star-fill text-yellow-400"
                              ></i>
                            );
                          }
                          return (
                            <i
                              key={index}
                              className="pi pi-star-fill text-gray-300"
                            ></i>
                          );
                        })}
                      </span>
                    </div>
                  </div>
                  <span className="flex justify-end">
                    <Link
                      to={`/hotel/${hotel._id}/rooms/types`}
                      className="flex bg-green-600 text-white text-xl font-bold p-2 hover:bg-green-500 mr-3"
                    >
                      View Rooms
                    </Link>
                    <Link
                      to={`/edit/${hotel._id}`}
                      className="flex bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500"
                    >
                      View Details
                    </Link>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <span>No Hotels found</span>
      )}
    </div>
  );
};

export default MyHotels;
