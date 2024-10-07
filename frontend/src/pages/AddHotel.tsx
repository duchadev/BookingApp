import { useMutation } from "react-query";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import { useAppContext } from "../contexts/AppContext";
import * as apiClient from "../api-client";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";

const AddHotel = () => {
  const { showToast } = useAppContext();

  const { mutate, isLoading } = useMutation(apiClient.addMyHotel, {
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
    { label: "My Hotels" },
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
      <h1 className="text-3xl font-bold mb-3">Add Hotel</h1>
      <ManageHotelForm onSave={handleSave} isLoading={isLoading} />
    </>
  );
};

export default AddHotel;
