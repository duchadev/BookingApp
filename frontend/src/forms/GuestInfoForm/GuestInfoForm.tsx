import { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import { useSearchContext } from "../../contexts/SearchContext";
import { useAppContext } from "../../contexts/AppContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import {
  DataTable,
  DataTableExpandedRows,
  DataTableRowEvent,
  DataTableValueArray,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import axios from "axios";
import { Toast } from "primereact/toast";
import { RoomType } from "../../../src/shared/types";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

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
  roomCount: number;
};

const GuestInfoForm = ({ hotelId, pricePerNight }: Props) => {
  const search = useSearchContext();
  const { isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [visibleRight, setVisibleRight] = useState<boolean>(false);
  const [room, setRoom] = useState<RoomType>();
  const [selectedRooms, setSelectedRooms] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const dt = useRef(null);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [selectedRoomPrice, setSelectedRoomPrice] = useState<number | null>(
    null
  );
  const [expandedRows, setExpandedRows] = useState<
    DataTableExpandedRows | DataTableValueArray | undefined
  >(undefined);

  const toast = useRef<Toast>(null); // Reference for Toast component

  // Fetch rooms from backend
  const fetchRooms = async () => {
    try {
      const { data } = await axios.get(
        `${VITE_BACKEND_BASE_URL}/api/rooms/rooms-with-availability`,
        {
          params: { hotelId, checkIn, checkOut },
        }
      );
      const availableRooms = data.filter(
        (room: RoomType) => room.status === "Available"
      );
      setRooms(data);
      return data;
    } catch (err: any) {
      return { error: `Error fetching rooms: ${err.message}` };
    }
  };

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GuestInfoFormData>({
    defaultValues: {
      checkIn: new Date(Date.now()), // Default value for checkIn is today's date (search.checkIn)
      checkOut: search.checkOut,
      adultCount: 1, // search.adultCount
      childCount: 0, // search.childCount
      roomCount: 1, // Default to 1 room
    },
  });

  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");
  const roomCount = watch("roomCount");

  useEffect(() => {
    fetchRooms();
  }, [checkIn, checkOut]);

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  // Set the default check-in time to 12:00 PM
  const setDefaultCheckInTime = (date: Date) => {
    const newDate = new Date(date); // Create a new Date object to avoid mutating the original
    newDate.setHours(12, 0, 0, 0); // Set to 12:00 PM (noon)
    return newDate;
  };

  // Set the default check-out time to 13:30 PM
  const setDefaultCheckOutTime = (date: Date) => {
    const newDate = new Date(date); // Create a new Date object to avoid mutating the original
    newDate.setHours(13, 30, 0, 0); // Set to 13:30 PM
    return newDate;
  };

  // Thiết lập giá trị mặc định cho checkOut cách checkIn một ngày
  const setDefaultCheckOutDate = (checkInDate: Date) => {
    const newCheckOutDate = new Date(checkInDate);
    newCheckOutDate.setDate(newCheckOutDate.getDate() + 1); // Cộng thêm 1 ngày
    return newCheckOutDate;
  };

  useEffect(() => {
    if (checkIn) {
      console.log("checkIn: ", checkIn);
      // Set checkOut to one day at  after checkIn
      const newCheckOutDate = setDefaultCheckOutDate(checkIn);
      setValue("checkOut", setDefaultCheckOutTime(newCheckOutDate));
      console.log("checkOut: ", checkOut);
    }
  }, [checkIn]);

  useEffect(() => {
    if (checkIn && checkOut && room) {
      fetchRooms();
      // checkRoomAvailability();
    }
  }, [checkIn, checkOut]);

  const checkRoomAvailability = async () => {
    try {
      const { data } = await axios.post(
        `${VITE_BACKEND_BASE_URL}/api/bookings/check-room-availability`,
        {
          hotelId,
          roomId: room?._id,
          checkIn,
          checkOut,
          withCredentials: true,
        }
      );

      if (!data.available) {
        toast.current?.show({
          severity: "warn",
          summary: "Room Unavailable",
          detail: data.message,
          life: 3000,
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking room availability:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Could not check room availability. Please try again.",
        life: 3000,
      });
      return false;
    }
  };

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

  const onSubmit = async (data: GuestInfoFormData) => {
    const accept = () => {
      toast.current?.show({
        severity: "info",
        summary: "Confirmed",
        detail: "You have accepted",
        life: 3000,
      });

      navigate(`/hotel/${hotelId}/booking`, {
        state: {
          selectedRooms,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          adultCount: data.adultCount, // data.adultCount
          childCount: data.childCount, // data.childCount
        },
      });
    };

    const reject = () => {
      toast.current?.show({
        severity: "warn",
        summary: "Rejected",
        detail: "You have rejected",
        life: 3000,
      });
      return; // Stop the booking process if room is not available
    };

    // console.log("data: ", data);
    // Tính tổng số người (adults và children)
    const totalGuests = data.adultCount + data.childCount;

    // Tính sức chứa tối đa của tất cả các phòng đã chọn
    const totalRoomCapacity = selectedRooms.reduce(
      (total, room) => total + room.capacity,
      0
    );

    // Kiểm tra nếu tổng số khách lớn hơn sức chứa của các phòng
    if (totalGuests > totalRoomCapacity) {
      // Hiển thị thông báo lỗi hoặc cảnh báo
      toast.current?.show({
        severity: "error",
        summary: "Guest Count Exceeds Room Capacity",
        detail: `The total number of guests (adults + children) cannot exceed the capacity of the selected rooms. The maximum capacity is ${totalRoomCapacity} guests.`,
        life: 3000,
      });
    } else {
      if (selectedRooms.length < data.roomCount) {
        confirmDialog({
          message:
            "You have not selected enough rooms. Are you sure you want to book?",
          header: "Confirmation",
          icon: "pi pi-exclamation-triangle",
          defaultFocus: "accept",
          accept,
          reject,
          acceptClassName:
            "bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded ",
          rejectClassName:
            "mr-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded",
        });
      } else {
        navigate(`/hotel/${hotelId}/booking`, {
          state: {
            selectedRooms,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            adultCount: data.adultCount, // data.adultCount
            childCount: data.childCount, // data.childCount
          },
        });
      }
    }

    // const isAvailable = await checkRoomAvailability();
    // if (!isAvailable) {
    //   return; // Stop the booking process if room is not available
    // }
  };

  const getTotalSelectedRoomsPrice = () => {
    let total = 0;
    selectedRooms.forEach((room) => {
      total += room.pricePerNight;
    });
    return total;
  };

  const pickRoom = (roomData: RoomType) => {
    if (selectedRooms.length < roomCount) {
      setSelectedRooms((prevRooms) => [...prevRooms, roomData]);
      toast.current?.show({
        severity: "success",
        summary: "Room Selected",
        detail: `You have selected a room at VND ${roomData.pricePerNight}.`,
        life: 3000,
      });
    } else {
      toast.current?.show({
        severity: "warn",
        summary: "Limit Reached",
        detail: `You have already selected ${roomCount} rooms.`,
        life: 3000,
      });
    }
  };

  const header = (
    <div className="flex flex-wrap gap-2 items-center justify-between">
      <h2 className="text-3xl">Rooms Available</h2>
      <IconField
        className="w-1/3 p-4 flex items-center gap-9"
        iconPosition="left"
      >
        <div className="w-full flex items-center">
          <InputIcon className="pi pi-search text-xl mr-2" />
          <InputText
            type="search"
            className="w-full"
            onInput={(e) =>
              setGlobalFilter((e.target as HTMLInputElement).value)
            }
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

  const statusBodyTemplate = (roomData: RoomType) => {
    return (
      <Tag
        value={roomData.status}
        severity={getSeverity(roomData.status)}
      ></Tag>
    );
  };

  const priceBodyTemplate = (roomData: RoomType) => {
    return new Intl.NumberFormat("vn-VN", {
      style: "currency",
      currency: "VND",
    }).format(roomData.pricePerNight);
  };

  const actionBodyTemplate = (roomData: RoomType) => {
    return (
      <>
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

  const rowExpansionTemplate = (data) => {
    return (
      <div className="p-3">
        {/* <h5>List rooms available for {data.type}</h5> */}
        <DataTable
          value={data.availableRooms}
          ref={dt}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          showGridlines
        >
          <Column field="roomNumber" header="Room Number" sortable></Column>
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
      </div>
    );
  };

  const allowExpansion = (rowData: any) => {
    return rowData.availableCount > 0;
  };

  return (
    <>
      {/* Toast component to show notifications */}
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex flex-col p-4 bg-blue-200 gap-4">
        <h3 className="text-md font-bold">
          {selectedRooms.length > 0 ? (
            <>
              <p>
                VND {getTotalSelectedRoomsPrice()}{" "}
                <span
                  style={{
                    fontSize: "14px",
                    color: "gray",
                    fontWeight: "normal",
                    marginLeft: "5px",
                  }}
                >
                  *included taxes
                </span>
              </p>
            </>
          ) : null}
        </h3>

        {isLoggedIn ? (
          roomCount ? (
            <>
              <Button
                label="Pick rooms"
                className="bg-blue-500 pr-3 pl-3 pt-2 pb-2 text-white hover:bg-blue-600"
                icon="pi pi-arrow-left"
                onClick={() => setVisibleRight(true)}
              />
              <Button
                label="Clear rooms"
                className="bg-red-500 pr-3 pl-3 pt-2 pb-2 text-white hover:bg-red-600"
                icon="pi pi-trash"
                onClick={() => setSelectedRooms([])}
              />
            </>
          ) : null
        ) : null}

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
                onChange={(date) =>
                  setValue("checkIn", setDefaultCheckInTime(date as Date), {
                    shouldValidate: true,
                  })
                }
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
                onChange={(date) =>
                  setValue("checkOut", setDefaultCheckOutTime(date as Date), {
                    shouldValidate: true,
                  })
                }
                selectsEnd
                startDate={checkIn}
                endDate={checkOut}
                minDate={checkIn ? setDefaultCheckOutDate(checkIn) : minDate}
                maxDate={maxDate}
                placeholderText="Check-out Date"
                className="min-w-full bg-white p-2 focus:outline-none"
                wrapperClassName="min-w-full"
              />
            </div>
            {/* Room Count */}
            <div className="flex bg-white px-2 py-1 gap-2">
              <label className="items-center flex">
                Rooms:
                <input
                  className="w-full p-1 focus:outline-none font-bold"
                  type="number"
                  min={1}
                  max={10}
                  {...register("roomCount", {
                    required: "Please specify the number of rooms",
                    min: {
                      value: 1,
                      message: "At least one room must be booked",
                    },
                    valueAsNumber: true,
                  })}
                />
              </label>
              {errors.roomCount && (
                <span className="text-red-500 font-semibold text-sm">
                  {errors.roomCount.message}
                </span>
              )}
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
                  selectedRooms.length > 0 && roomCount
                    ? "bg-green-600 hover:bg-green-800"
                    : "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                }`}
                disabled={selectedRooms.length > 0 && roomCount ? false : true}
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
        <DataTable
          value={rooms}
          expandedRows={expandedRows}
          onRowToggle={(e) => {
            console.log("e: ", e);
            setExpandedRows(e.data);
          }}
          rowExpansionTemplate={rowExpansionTemplate}
          dataKey="id"
          tableStyle={{ minWidth: "60rem" }}
          ref={dt}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          showGridlines
          globalFilter={globalFilter}
          header={header}
        >
          <Column expander={allowExpansion} style={{ width: "5rem" }} />
          <Column field="type" header="Type" sortable></Column>
          <Column field="totalRooms" header="Total Rooms" sortable></Column>
          <Column field="bookedCount" header="Booked Rooms" sortable></Column>
          <Column
            field="availableCount"
            header="Available Rooms"
            sortable
          ></Column>
        </DataTable>
      </Sidebar>
    </>
  );
};

export default GuestInfoForm;
