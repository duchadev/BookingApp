import React, { useRef } from "react";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { MenuItem } from "primereact/menuitem";
import { useMutation, useQueryClient } from "react-query";
import { Toast } from "primereact/toast";
import { deleteBookingById } from "../api-client";

interface BookingItemProps {
  bookingId: string;
  hotelImage: string;
  hotelName: string;
  city: string;
  country: string;
  dates: string;
  price: number;
  status: string;
  refetchBookings: () => void; // Thêm prop này
}

const BookingItem: React.FC<BookingItemProps> = ({
  bookingId,
  hotelImage,
  hotelName,
  city,
  country,
  dates,
  price,
  status,
  refetchBookings,
}) => {
  const queryClient = useQueryClient();

  const menuRight = useRef<Menu>(null);
  const toast = useRef<Toast>(null);

  const { mutate: deleteBooking } = useMutation(
    () => deleteBookingById(bookingId),
    {
      onSettled: () => {
        // Gọi lại refetchBookings sau khi mutation hoàn tất
        refetchBookings();
      },
      onSuccess: () => {
        // Thay vì chỉ gọi refetchBookings, ta có thể làm mới toàn bộ trang
        window.location.reload(); // Reload trang sau khi xóa thành công
        // Sử dụng invalidateQueries để tự động làm mới danh sách
        queryClient.invalidateQueries("fetchMyBookings");
        toast.current?.show({
          severity: "success",
          summary: "Delete booking",
          detail: "Booking removed successfully!",
          life: 3000,
        });
      },
      onError: () => {
        toast.current?.show({
          severity: "error",
          summary: "Room Unavailable",
          detail: "Failed to delete booking!",
          life: 3000,
        });
      },
    }
  );

  const items: MenuItem[] = [
    {
      label: "Options",
      items: [
        {
          label: "Remove booking",
          icon: "pi pi-trash",
          command: () => {
            if (
              window.confirm("Are you sure you want to remove this booking?")
            ) {
              deleteBooking(); // Call deleteBooking mutation
            }
          },
        },
      ],
    },
  ];

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="w-full p-4 bg-white rounded-lg shadow-md mx-auto">
        <h2 className="text-xl font-bold">{city}</h2>
        <p className="text-gray-500 mb-4">{dates}</p>

        <div className="flex items-center justify-between bg-white rounded-lg shadow p-4 relative">
          <div className="flex items-center space-x-4">
            <img
              src={hotelImage}
              alt="Hotel"
              className="w-16 h-16 rounded-lg"
            />
            <div>
              <h3 className="text-lg font-semibold">{hotelName}</h3>
              <p className="text-gray-500">
                {dates} · {city}, {country}
              </p>
              <p
                className={`text-${
                  status === "canceled"
                    ? "red"
                    : status === "success"
                    ? "green"
                    : status === "pending"
                    ? "yellow"
                    : "gray"
                }-600 `}
              >
                {capitalizeFirstLetter(status)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold">
              VND {price.toLocaleString()}
            </span>
            <Menu
              model={items}
              popup
              ref={menuRight}
              id="popup_menu_right"
              popupAlignment="right"
            />
            <Button
              icon="pi pi-ellipsis-v"
              className="mr-2"
              onClick={(event) => menuRight?.current?.toggle(event)}
              aria-controls="popup_menu_right"
              aria-haspopup
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingItem;
