import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { ProgressSpinner } from "primereact/progressspinner";
import { HotelType } from "../../../../backend/src/shared/types";

// Define Room interface
interface Room {
  _id: string | null;
  hotelId: string;
  hotelNumber: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  imageUrls: string[];
  description?: string;
  status: string; // "Booked" or "Available"
  count: number;
  // createdAt: string;
  // updatedAt: string;
}

export const HotelRoomTypes = () => {
  const emptyRoom: Room = {
    _id: null,
    hotelId: "",
    hotelNumber: "",
    type: "",
    capacity: 0,
    pricePerNight: 0,
    imageUrls: [],
    description: "",
    status: "Available",
    count: 0,
  };
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState<HotelType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useRef<Toast | null>(null);
  const dt = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roomTypes, setRoomTypes] = useState<Room[]>([]);
  const room = emptyRoom;
  // Delete room
  const [deleteRoomsDialog, setDeleteRoomsDialog] = useState(false);
  const [roomTypeToDelete, setRoomTypeToDelete] = useState<string | null>(null);
  // Search
  const [globalFilter, setGlobalFilter] = useState<string>("");

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

  // Fetch rooms from backend
  const fetchRooms = async () => {
    try {
      const { data }: { data: Room[] } = await axios.get(
        "http://localhost:7000/api/rooms",
        {
          params: { hotelId },
        }
      );

      // Group rooms by type
      const roomsByType = data.reduce<Record<string, Room>>((acc, room) => {
        const { type } = room;
        if (!acc[type]) {
          acc[type] = { ...room, count: 1 }; // Initialize with count 1
        } else {
          acc[type].count! += 1; // Increment count
        }
        return acc;
      }, {} as Record<string, Room>); // Đảm bảo acc được khởi tạo với đúng kiểu

      // Convert the grouped object into an array to make it compatible with the DataTable.
      const roomsGroupedByType = Object.values(roomsByType);

      setRoomTypes(roomsGroupedByType);
      setIsLoading(false);
      return data;
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Load room failed",
        life: 3000,
      });
      return { error: `Error fetching rooms: ${err.message}` };
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  if (isLoading) {
    return (
      <div>
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  const items: MenuItem[] = [
    {
      label: hotel?.name,
      template: () => (
        <>
          <Link to={`http://localhost:5174/my-hotels`}>
            <a className="text-primary">My Hotels</a>
          </Link>
        </>
      ),
    },
    {
      label: hotel?.name,
      template: () => (
        <>
          <Link to={`http://localhost:5174/detail/${hotel?._id}`}>
            <a className="text-primary">{hotel?.name}</a>
          </Link>
        </>
      ),
    },
    {
      label: "Rooms",
      template: () => (
        <>
          <Link to={`http://localhost:5174/hotel/${hotel?._id}/rooms/types`}>
            <a className="text-primary font-semibold text-blue-600">Rooms</a>
          </Link>
        </>
      ),
    },
  ];

  const home: MenuItem = { icon: "pi pi-home", url: "http://localhost:5174/" };

  const openNew = () => {
    // hoặc dùng thẻ Link thay vì button và dùng event của hàm này
    navigate(`/hotel/${hotel?._id}/rooms/add`);
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          className="bg-green-500 pr-3 pl-3 pt-2 pb-2 text-white hover:bg-green-600"
          label="New"
          icon="pi pi-plus"
          severity="success"
          onClick={openNew}
        />
      </div>
    );
  };

  // Delete Room deleteRoomsDialogFooter
  const hideDeleteRoomsDialog = () => {
    setDeleteRoomsDialog(false);
  };

  const confirmDeleteRoomsOfType = (type: string) => {
    setRoomTypeToDelete(type);
    setDeleteRoomsDialog(true);
  };

  const deleteRoomsOfType = async () => {
    try {
      // Call backend API to delete rooms of a specific type
      await axios.delete(
        `http://localhost:7000/api/rooms/type/${roomTypeToDelete}`,
        {
          params: { hotelId },
          withCredentials: true, // Include credentials (cookies or tokens), giống credentials: "include" bên fetch API thông thường
        }
      );

      // Update the rooms state
      setRoomTypes((prevRooms) =>
        prevRooms.filter((r) => r.type !== roomTypeToDelete)
      );
      setDeleteRoomsDialog(false);
      toast.current?.show({
        severity: "success",
        summary: "Successful",
        detail: "Rooms Deleted",
        life: 3000,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete rooms",
        life: 3000,
      });
    }
  };
  const deleteRoomsDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        className="pr-3 pl-3 pt-2 pb-2 text-purple-600 border border-purple-600 mr-2 hover:bg-gray-100"
        onClick={() => setDeleteRoomsDialog(false)}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        className="bg-red-500 pr-3 pl-3 pt-2 pb-2 text-white hover:bg-red-600"
        onClick={deleteRoomsOfType}
      />
    </React.Fragment>
  );
  const viewRoomsOfType = (type: string) => {
    navigate(`/hotel/${hotel?._id}/rooms/types/${type}`);
  };

  const actionBodyTemplate = (roomData: Room) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-eye"
          tooltip="View Rooms"
          rounded
          outlined
          className="mr-2 text-purple-600 border border-purple-600 hover:bg-purple-600 hover:text-white"
          onClick={() => viewRoomsOfType(roomData.type)}
        />
        <Button
          icon="pi pi-trash"
          tooltip="Delete Rooms"
          rounded
          outlined
          className="mr-2 text-red-600 border border-red-600 hover:bg-red-600 hover:text-white"
          severity="danger"
          onClick={() => confirmDeleteRoomsOfType(roomData.type)}
        />
      </React.Fragment>
    );
  };

  const header = (
    <div className="flex flex-wrap gap-2 items-center justify-between">
      <h4 className="m-0">Room Types</h4>
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

  return (
    <>
      <Toast ref={toast} />
      <BreadCrumb model={items} home={home} className="mb-3" />
      <div className=" p-fluid">
        <h1 className="text-3xl font-bold mb-3">Rooms</h1>

        <Toolbar className="mb-4" start={leftToolbarTemplate}></Toolbar>

        <DataTable
          value={roomTypes}
          ref={dt}
          editMode="row"
          dataKey="id"
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          showGridlines
          removableSort
          // search
          globalFilter={globalFilter}
          header={header}
        >
          <Column
            field="type"
            header="Type"
            style={{ width: "20%" }}
            sortable
          ></Column>
          <Column
            field="capacity"
            header="Capacity"
            style={{ width: "20%" }}
            sortable
          ></Column>
          <Column
            field="count"
            header="Number of Rooms"
            style={{ width: "20%" }}
            sortable
          ></Column>

          <Column
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: "12rem" }}
          ></Column>
        </DataTable>
      </div>

      <Dialog
        visible={deleteRoomsDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteRoomsDialogFooter}
        onHide={hideDeleteRoomsDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {room && <span>Are you sure you want to delete this room?</span>}
        </div>
      </Dialog>
    </>
  );
};
