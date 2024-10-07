import { useMutation, useQuery } from "react-query";
import { useParams } from "react-router-dom";
import * as apiClient from "../api-client";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import { useAppContext } from "../contexts/AppContext";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";

const EditHotel = () => {
  const { hotelId } = useParams();
  const { showToast } = useAppContext();

  const { data: hotel } = useQuery(
    "fetchMyHotelById",
    () => apiClient.fetchMyHotelById(hotelId || ""),
    {
      enabled: !!hotelId,
    }
  );

  const { mutate, isLoading } = useMutation(apiClient.updateMyHotelById, {
    onSuccess: () => {
      showToast({ message: "Hotel Saved!", type: "SUCCESS" });
    },
    onError: () => {
      showToast({ message: "Error Saving Hotel", type: "ERROR" });
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
          <a href="http://localhost:5174/my-hotels" className="text-primary">
            {hotel?.name}
          </a>
        </>
      ),
    },
    {
      label: "Edit",
      template: () => (
        <>
          <h2 className="text-primary font-semibold text-blue-600">Edit</h2>
        </>
      ),
    },
  ];
  const home: MenuItem = { icon: "pi pi-home", url: "http://localhost:5174/" };

  return (
    <>
      <BreadCrumb model={items} home={home} className="mb-3" />
      <h1 className="text-3xl font-bold mb-3">Edit Hotel</h1>
      <ManageHotelForm
        hotel={hotel}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </>
  );
};

export default EditHotel;
