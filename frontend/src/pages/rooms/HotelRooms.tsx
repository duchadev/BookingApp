import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { DataTable, DataTableRowEditCompleteEvent } from "primereact/datatable";
import { Column, ColumnEditorOptions } from "primereact/column";
import { InputText } from "primereact/inputtext";
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { deleteRoomById } from "../../api-client";
import { RoomType } from "../../../../backend/src/shared/types";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";

// Define Room interface
interface Room {
  _id: string | null;
  hotelId: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  imageUrls: string[];
  description?: string;
  status: string; // "Booked" or "Available"
  // createdAt: string;
  // updatedAt: string;
}

export const HotelRooms = () => {
  const emptyRoom: Room = {
    _id: null,
    hotelId: "",
    type: "",
    capacity: 0,
    pricePerNight: 0,
    imageUrls: [],
    description: "",
    status: "Available",
  };
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const queryClient = useQueryClient();
  const [hotel, setHotel] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useRef(null);
  const dt = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [room, setRoom] = useState(emptyRoom);
  // Delete room
  const [deleteRoomDialog, setDeleteRoomDialog] = useState(false);
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
      const { data } = await axios.get("http://localhost:7000/api/rooms", {
        params: { hotelId },
      });
      setRooms(data);
      setIsLoading(false);
      return data;
    } catch (err: any) {
      toast.current.show({
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

  // Mutation for deleting a room
  const deleteRoomMutation = useMutation(deleteRoomById, {
    onSuccess: () => {
      // Invalidate and refetch rooms after deletion
      queryClient.invalidateQueries("rooms");
      toast.current?.show({
        severity: "success",
        summary: "Successful",
        detail: "Room Deleted",
        life: 3000,
      });
    },
    onError: () => {
      // Handle error
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete the room",
        life: 3000,
      });
    },
  });

  const [statuses] = React.useState<string[]>(["Booked", "Available"]);

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

  if (isLoading) {
    return <div>Loading...</div>;
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
          <Link to={`http://localhost:5174/hotel/${hotel?._id}/rooms`}>
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
  const exportCSV = () => {
    dt.current.exportCSV();
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

  const rightToolbarTemplate = () => {
    return (
      <Button
        label="Export"
        icon="pi pi-upload"
        className="p-button-help bg-purple-500 pr-3 pl-3 pt-2 pb-2 text-white hover:bg-purple-600"
        onClick={exportCSV}
        // onClick={() => exportCSV(false)}
      />
    );
  };

  // Delete Room deleteRoomsDialogFooter
  const hideDeleteRoomDialog = () => {
    setDeleteRoomDialog(false);
  };
  const confirmDeleteRoom = (room) => {
    console.log(room);
    setRoom(room);
    setDeleteRoomDialog(true);
  };

  const deleteRoom = () => {
    deleteRoomMutation.mutate(room._id);
    // Update the room list by removing the deleted room
    setRooms((prevRooms) => prevRooms.filter((r) => r._id !== room._id));
    setDeleteRoomDialog(false);
  };
  const deleteRoomDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        className="pr-3 pl-3 pt-2 pb-2 text-purple-600 border border-purple-600 mr-2 hover:bg-gray-100"
        onClick={hideDeleteRoomDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        className="bg-red-500 pr-3 pl-3 pt-2 pb-2 text-white hover:bg-red-600"
        onClick={deleteRoom}
      />
    </React.Fragment>
  );
  const editProduct = (room) => {
    navigate(`/hotel/${hotel?._id}/rooms/edit/${room._id}`);
  };

  const actionBodyTemplate = (roomData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2 text-purple-600 border border-purple-600 hover:bg-purple-600 hover:text-white"
          onClick={() => editProduct(roomData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          className="mr-2 text-red-600 border border-red-600 hover:bg-red-600 hover:text-white"
          severity="danger"
          onClick={() => confirmDeleteRoom(roomData)}
        />
        {roomData.status === "Booked" && (
          <Button
            icon="pi pi-info-circle"
            rounded
            outlined
            className="mr-2 text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white"
            severity="danger"
            onClick={() => confirmDeleteRoom(roomData)}
          />
        )}
      </React.Fragment>
    );
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

  return (
    <>
      <Toast ref={toast} />
      <BreadCrumb model={items} home={home} className="mb-3" />
      <div className="card p-fluid">
        <h1 className="text-3xl font-bold mb-3">Rooms</h1>

        <Toolbar
          className="mb-4"
          start={leftToolbarTemplate}
          end={rightToolbarTemplate}
        ></Toolbar>

        <DataTable
          value={rooms}
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
            field="status"
            header="Status"
            body={statusBodyTemplate}
            style={{ width: "20%" }}
            sortable
          ></Column>
          <Column
            field="pricePerNight"
            header="Price per Night"
            body={priceBodyTemplate}
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
        visible={deleteRoomDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteRoomDialogFooter}
        onHide={hideDeleteRoomDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {room && <span>Are you sure you want to delete this room?</span>}
        </div>
      </Dialog>
      <Dialog
        visible={deleteRoomDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteRoomDialogFooter}
        onHide={hideDeleteRoomDialog}
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
