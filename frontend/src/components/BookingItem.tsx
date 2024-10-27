// BookingItem.tsx
import React, { useRef, useState } from "react";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "tailwindcss/tailwind.css";
import { MenuItem } from "primereact/menuitem";

interface BookingItemProps {
  bookingId: string;
  hotelImage: string;
  hotelName: string;
  city: string;
  country: string;
  dates: string;
  price: number;
  status: string;
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
}) => {
  const menuRight = useRef<Menu>(null);
  const items: MenuItem[] = [
    {
      label: "Options",
      items: [
        {
          label: "Remove booking",
          icon: "pi pi-trash",
          command: () => {
            alert("Booking removed");
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
    <div className="w-full p-4 bg-white rounded-lg shadow-md mx-auto">
      <h2 className="text-xl font-bold">{city}</h2>
      <p className="text-gray-500 mb-4">{dates}</p>

      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4 relative">
        <div className="flex items-center space-x-4">
          <img src={hotelImage} alt="Hotel" className="w-16 h-16 rounded-lg" />
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
                  : "gray" // mặc định nếu không trùng khớp
              }-500 `}
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
  );
};

export default BookingItem;
