import React, { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import { useSearchContext } from "../../contexts/SearchContext";
import { useAppContext } from "../../contexts/AppContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import axios from "axios";
import { Toast } from "primereact/toast";

type Props = {
  hotelId?: string;
  pricePerNight: number;
};

type GuestInfoFormData = {
  pricePerNight: number;
  checkIn: Date;
  checkOut: Date;
  adultCount: number;
  childCount: number;
};

interface Room {
  _id: string | null;
  hotelId: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  imageUrls: string[];
  description?: string;
  status: string;
}

const GuestInfoForm = ({ hotelId, pricePerNight }: Props) => {
  const search = useSearchContext();
  const { isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [visibleRight, setVisibleRight] = useState<boolean>(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const dt = useRef(null);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [selectedRoomPrice, setSelectedRoomPrice] = useState<number | null>(
    null
  );

  const toast = useRef<Toast>(null); // Reference for Toast component

  // Fetch rooms from backend
  const fetchRooms = async () => {
    try {
      const { data } = await axios.get("http://localhost:7000/api/rooms", {
        params: { hotelId },
      });
      const availableRooms = data.filter(
        (room: Room) => room.status === "Available"
      );
      setRooms(availableRooms);
      return data;
    } catch (err: any) {
      return { error: `Error fetching rooms: ${err.message}` };
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GuestInfoFormData>({
    defaultValues: {
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      adultCount: search.adultCount,
      childCount: search.childCount,
    },
  });

  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const onSignInClick = (data: GuestInfoFormData) => {
    search.saveSearchValues(
      pricePerNight,
      "",
      data.checkIn,
      data.checkOut,
      data.adultCount,
      data.childCount
    );
    navigate("/sign-in", { state: { from: location } });
  };

  const onSubmit = (data: GuestInfoFormData) => {
    navigate(`/hotel/${hotelId}/booking`, {
      state: {
        pricePerNight,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        adultCount: data.adultCount,
        childCount: data.childCount,
      },
    });
  };

  const pickRoom = (roomData: Room) => {
    console.log(roomData);
    setSelectedRoomPrice(roomData.pricePerNight);
    toast.current?.show({
      severity: "success",
      summary: "Room Selected",
      detail: `You have selected a room at VND ${roomData.pricePerNight}.`,
      life: 3000,
    });
  };

  const header = (
    <div className="flex flex-wrap gap-2 items-center justify-between">
      <h4 className="m-0">Manage Rooms</h4>
      <IconField
        className="w-1/3 p-4 flex items-center gap-9"
        iconPosition="left"
      >
        <div className="w-full flex items-center">
          <InputIcon className="pi pi-search text-xl mr-2" />
          <InputText
            type="search"
            className="w-full"
            onInput={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
          />
        </div>
      </IconField>
    </div>
  );

  const getSeverity = (value: string) => {
    switch (value) {
      case "Available":
        return "success";
      case "Booked":
        return "danger";
      default:
        return null;
    }
  };

  const statusBodyTemplate = (roomData: Room) => {
    return (
      <Tag
        value={roomData.status}
        severity={getSeverity(roomData.status)}
      ></Tag>
    );
  };

  const priceBodyTemplate = (roomData: Room) => {
    return new Intl.NumberFormat("vn-VN", {
      style: "currency",
      currency: "VND",
    }).format(roomData.pricePerNight);
  };

  const actionBodyTemplate = (roomData: Room) => {
    return (
      <>
        <Button
          icon="pi pi-info-circle"
          rounded
          outlined
          className="mr-2 text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white"
        />
        <Button
          icon="pi pi-plus"
          rounded
          outlined
          className="mr-2 text-green-600 border border-green-600 hover:bg-green-600 hover:text-white"
          onClick={() => pickRoom(roomData)} // Call pickRoom function when clicked
        />
      </>
    );
  };

  return (
    <>
      {/* Toast component to show notifications */}
      <Toast ref={toast} />

      <div className="flex flex-col p-4 bg-blue-200 gap-4">
        <h3 className="text-md font-bold">
          {selectedRoomPrice ? `VND ${selectedRoomPrice}` : "VND"}
        </h3>
        <Button
          label="Pick rooms"
          className="bg-blue-500 pr-3 pl-3 pt-2 pb-2 text-white hover:bg-blue-600"
          icon="pi pi-arrow-left"
          onClick={() => setVisibleRight(true)}
        />
        <form
          onSubmit={
            isLoggedIn ? handleSubmit(onSubmit) : handleSubmit(onSignInClick)
          }
        >
          <div className="grid grid-cols-1 gap-4 items-center">
            <div>
              <DatePicker
                required
                selected={checkIn}
                onChange={(date) => setValue("checkIn", date as Date)}
                selectsStart
                startDate={checkIn}
                endDate={checkOut}
                minDate={minDate}
                maxDate={maxDate}
                placeholderText="Check-in Date"
                className="min-w-full bg-white p-2 focus:outline-none"
                wrapperClassName="min-w-full"
              />
            </div>
            <div>
              <DatePicker
                required
                selected={checkOut}
                onChange={(date) => setValue("checkOut", date as Date)}
                selectsEnd
                startDate={checkIn}
                endDate={checkOut}
                minDate={minDate}
                maxDate={maxDate}
                placeholderText="Check-out Date"
                className="min-w-full bg-white p-2 focus:outline-none"
                wrapperClassName="min-w-full"
              />
            </div>
            <div className="flex bg-white px-2 py-1 gap-2">
              <label className="items-center flex">
                Adults:
                <input
                  className="w-full p-1 focus:outline-none font-bold"
                  type="number"
                  min={0}
                  max={20}
                  {...register("adultCount", {
                    required: "This field is required",
                    min: {
                      value: 1,
                      message: "There must be at least one adult",
                    },
                    valueAsNumber: true,
                  })}
                />
              </label>
              <label className="items-center flex">
                Children:
                <input
                  className="w-full p-1 focus:outline-none font-bold"
                  type="number"
                  min={0}
                  max={20}
                  {...register("childCount", { valueAsNumber: true })}
                />
              </label>
              {errors.adultCount && (
                <span className="text-red-500 font-semibold text-sm">
                  {errors.adultCount.message}
                </span>
              )}
            </div>
            {isLoggedIn ? (
              <Button
                type="submit"
                label="Book Now!"
                className={`p-4 text-white font-bold ${
                  selectedRoomPrice
                    ? "bg-green-600 hover:bg-green-800"
                    : "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                }`}
                disabled={!selectedRoomPrice}
              />
            ) : (
              <Button
                type="submit"
                label="Sign in to Book"
                className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-500 text-xl"
              />
            )}
          </div>
        </form>
      </div>

      <Sidebar
        visible={visibleRight}
        position="right"
        onHide={() => setVisibleRight(false)}
        className="w-full"
      >
        <h2>Rooms Available</h2>
        <DataTable
          value={rooms}
          ref={dt}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          showGridlines
          globalFilter={globalFilter}
          header={header}
        >
          <Column field="type" header="Type" sortable></Column>
          <Column field="capacity" header="Capacity" sortable></Column>
          <Column
            field="status"
            header="Status"
            body={statusBodyTemplate}
            sortable
          ></Column>
          <Column
            field="pricePerNight"
            header="Price per Night"
            body={priceBodyTemplate}
            sortable
          ></Column>
          <Column body={actionBodyTemplate}></Column>
        </DataTable>
      </Sidebar>
    </>
  );
};

export default GuestInfoForm;
