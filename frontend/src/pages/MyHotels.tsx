import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import * as apiClient from "../api-client";
import { BsBuilding, BsMap } from "react-icons/bs";
import { BiHotel, BiMoney } from "react-icons/bi";
import { HotelType } from "../../src/shared/types";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { useRef } from "react";

const MyHotels = () => {
  const toast = useRef<Toast>(null);
  const queryClient = useQueryClient();

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

  const deleteHotelMutation = useMutation(
    (hotelId: string) => apiClient.deleteHotel(hotelId),
    {
      onSuccess: () => {
        // Refresh hotel data after deletion
        queryClient.invalidateQueries("fetchMyHotelsByUserId");
        toast.current?.show({
          severity: "success",
          summary: "Hotel Deleted",
          detail: "The hotel has been successfully deleted.",
          life: 3000,
        });
      },
      onError: (error) => {
        console.log("Error deleting hotel: ", error);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "An error occurred while deleting the hotel.",
          life: 3000,
        });
      },
    }
  );

  const handleDeleteHotel = (hotelId: string) => {
    confirmDialog({
      message: "Do you want to delete this hotel?",
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      accept: () => deleteHotelMutation.mutate(hotelId),
      reject: () =>
        toast.current?.show({
          severity: "warn",
          summary: "Deletion Canceled",
          detail: "The hotel deletion was canceled.",
          life: 3000,
        }),
      acceptClassName:
        "bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded ml-2",
      rejectClassName:
        "bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded",
    });
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
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

        {/* Check if hotelData exists */}
        {hotelData ? (
          <div className="grid grid-cols-1 gap-8">
            {hotelData.map((hotel: HotelType) => {
              // Check and calculate minPrice and maxPrice for each hotel
              let minPrice, maxPrice;

              if (hotel.rooms && hotel.rooms.length > 0) {
                const prices = hotel.rooms.map((room) => room.pricePerNight);
                minPrice = Math.min(...prices);
                maxPrice = Math.max(...prices);
              } else {
                minPrice = maxPrice = "N/A"; // Default value if no rooms
              }

              return (
                <div
                  key={hotel._id}
                  data-testid="hotel-card"
                  className="flex flex-col justify-between border border-slate-300 rounded-lg p-8 gap-5"
                >
                  <Link to={`/detail/${hotel._id}`} key={hotel._id}>
                    <h2 className="text-2xl font-bold">{hotel.name}</h2>
                  </Link>
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
                      to={`/hotel/${hotel._id}/customer-bookings`}
                      className="flex bg-yellow-600 text-white text-xl font-bold p-2 hover:bg-yellow-500 mr-3"
                    >
                      View Bookings
                    </Link>
                    <Link
                      to={`/hotel/${hotel._id}/rooms/types`}
                      className="flex bg-green-600 text-white text-xl font-bold p-2 hover:bg-green-500 mr-3"
                    >
                      View Rooms
                    </Link>
                    <Link
                      to={`/edit/${hotel._id}`}
                      className="flex bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500 mr-3"
                    >
                      View Details
                    </Link>
                    <Button
                      onClick={() => handleDeleteHotel(hotel._id)}
                      label="Delete"
                      className="flex bg-red-600 text-white text-xl font-bold p-2 hover:bg-red-500"
                    />
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <span>No Hotels found</span>
        )}
      </div>
    </>
  );
};

export default MyHotels;
