import { useMutation } from "react-query";
import { useAppContext } from "../../contexts/AppContext";
import * as apiClient from "../../api-client";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import ManageRoomForm from "../../forms/ManageRoomForm/ManageRoomForm";
import { HotelType } from "../../../src/shared/types";

const VITE_FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_BASE_URL;
const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const AddRoom = () => {
  const { showToast } = useAppContext();
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState<HotelType | null>(null);

  // Fetch hotel details
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const { data } = await axios.get(
          `${VITE_BACKEND_BASE_URL}/api/hotels/${hotelId}`,
          {
            params: { hotelId },
          }
        );
        setHotel(data);
      } catch (err: any) {
        console.log(`Error fetching hotel: ${err.message}`);
      }
    };
    fetchHotel();
  }, [hotelId]);

  const { mutate, isLoading } = useMutation(apiClient.addRoom, {
    onSuccess: () => {
      showToast({ message: "Room Saved!", type: "SUCCESS" });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { message?: string })?.message || "Error Add Room"; // Fallback cho thông báo lỗi
      showToast({ message: errorMessage, type: "ERROR" });
    },
  });

  const handleSave = (hotelFormData: FormData) => {
    mutate(hotelFormData);
  };

  const items: MenuItem[] = [
    {
      label: "My Hotels",
      template: () => (
        <>
          <a
            href={`${VITE_FRONTEND_BASE_URL}/my-hotels`}
            className="text-primary"
          >
            My Hotels
          </a>
        </>
      ),
    },
    {
      label: hotel?.name,
      template: () => (
        <>
          <Link
            to={`${VITE_FRONTEND_BASE_URL}/my-hotels`}
            className="text-primary"
          >
            {hotel?.name}
          </Link>
        </>
      ),
    },
    {
      label: "Rooms",
      template: () => (
        <>
          <Link
            to={`${VITE_FRONTEND_BASE_URL}/hotel/${hotel?._id}/rooms/types`}
          >
            <a className="text-primary">Rooms</a>
          </Link>
        </>
      ),
    },
    {
      label: "Add",
      template: () => (
        <>
          <h2 className="text-primary font-semibold text-blue-600">Add</h2>
        </>
      ),
    },
  ];
  const home: MenuItem = {
    icon: "pi pi-home",
    url: `${VITE_FRONTEND_BASE_URL}`,
  };

  return (
    <>
      <BreadCrumb model={items} home={home} className="mb-3" />
      <h1 className="text-3xl font-bold mb-3">Add Room</h1>
      <ManageRoomForm
        onSave={handleSave}
        isLoading={isLoading}
        hotelId={hotelId}
      />
    </>
  );
};

export default AddRoom;
