import { useMutation } from "react-query";
import { useAppContext } from "../../contexts/AppContext";
import * as apiClient from "../../api-client";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import ManageRoomForm from "../../forms/ManageRoomForm/ManageRoomForm";

const AddRoom = () => {
  const { showToast } = useAppContext();
  const { hotelId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [hotel, setHotel] = useState(null);

  // Fetch hotel details
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:7000/api/hotels/${hotelId}`,
          {
            params: { hotelId },
          }
        );
        setHotel(data);
      } catch (err: any) {
        setError(`Error fetching hotel: ${err.message}`);
      }
    };
    fetchHotel();
  }, [hotelId]);

  const { mutate, isLoading } = useMutation(apiClient.addRoom, {
    onSuccess: () => {
      showToast({ message: "Room Saved!", type: "SUCCESS" });
    },
    onError: () => {
      // showToast({ message: "Error Saving Room", type: "ERROR" });
      showToast({ message: error.message, type: "ERROR" });
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
          <a href="http://localhost:5174/my-hotels" className="text-primary">
            My Hotels
          </a>
        </>
      ),
    },
    {
      label: hotel?.name,
      template: () => (
        <>
          <Link to="http://localhost:5174/my-hotels" className="text-primary">
            {hotel?.name}
          </Link>
        </>
      ),
    },
    {
      label: "Rooms",
      template: () => (
        <>
          <Link to={`http://localhost:5174/hotel/${hotel?._id}/rooms/types`}>
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
  const home: MenuItem = { icon: "pi pi-home", url: "http://localhost:5174/" };

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
