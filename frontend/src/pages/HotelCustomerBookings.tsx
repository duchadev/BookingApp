import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";
import { Toast } from "primereact/toast";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { HotelType } from "../shared/types";
import { BookingType } from "../shared/types";
import { Tag } from "primereact/tag";
import { format } from "date-fns";

const VITE_FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_BASE_URL;
const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const HotelCustomerBookings = () => {
  const { hotelId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [hotel, setHotel] = useState<HotelType | null>(null);
  const toast = useRef<Toast | null>(null);
  const dt = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  // Search
  const [globalFilter, setGlobalFilter] = useState<string>("");

  // Fetch hotel details
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const { data } = await axios.get(
          `${VITE_BACKEND_BASE_URL}/api/hotels/${hotelId}`,
          {
            params: { hotelId },
            withCredentials: true,
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
  const fetchBookingsByHotelId = async () => {
    try {
      const { data }: { data: BookingType[] } = await axios.get(
        `${VITE_BACKEND_BASE_URL}/api/bookings`,
        {
          params: { hotelId },
          withCredentials: true,
        }
      );

      setBookings(data);
      setIsLoading(false);
      return data;
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Load bookings failed",
        life: 3000,
      });
      return { error: `Error fetching rooms: ${err.message}` };
    }
  };

  useEffect(() => {
    fetchBookingsByHotelId();
  }, [hotelId]);

  const header = (
    <div className="flex flex-wrap gap-2 items-center justify-between">
      <h4 className="m-0">Customer Bookings</h4>
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

  if (error) {
    return <div>{error}</div>;
  }

  const items: MenuItem[] = [
    {
      label: hotel?.name,
      template: () => (
        <>
          <Link to={`${VITE_FRONTEND_BASE_URL}/my-hotels`}>
            <a className="text-primary">My Hotels</a>
          </Link>
        </>
      ),
    },
    {
      label: hotel?.name,
      template: () => (
        <>
          <Link to={`${VITE_FRONTEND_BASE_URL}/detail/${hotel?._id}`}>
            <a className="text-primary">{hotel?.name}</a>
          </Link>
        </>
      ),
    },
    {
      label: "Bookings",
      template: () => (
        <>
          <Link
            to={`${VITE_FRONTEND_BASE_URL}/hotel/${hotel?._id}/customer-bookings`}
          >
            <a className="text-primary font-semibold text-blue-600">Bookings</a>
          </Link>
        </>
      ),
    },
  ];

  const home: MenuItem = {
    icon: "pi pi-home",
    url: `${VITE_FRONTEND_BASE_URL}`,
  };

  const getSeverity = (value: string) => {
    switch (value) {
      case "success":
        return "success";
      case "booked":
        return "danger";
      default:
        return null;
    }
  };

  const statusBodyTemplate = (bookingData: BookingType) => {
    return (
      <Tag
        value={bookingData.status}
        severity={getSeverity(bookingData.status)}
      ></Tag>
    );
  };
  const priceBodyTemplate = (bookingData: BookingType) => {
    return new Intl.NumberFormat("vn-VN", {
      style: "currency",
      currency: "VND",
    }).format(bookingData.totalCost);
  };

  // Format checkIn and checkOut times
  const formatDate = (date: string) => {
    return format(new Date(date), "yyyy-MM-dd HH:mm:ss"); // Format the date as needed
  };

  return (
    <>
      <Toast ref={toast} />
      <BreadCrumb model={items} home={home} className="mb-3" />
      <div className=" p-fluid">
        <h1 className="text-3xl font-bold mb-3">Customer Bookings</h1>

        <DataTable
          value={bookings}
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
            field="_id"
            header="Booking ID"
            sortable
            style={{ width: "20%" }}
          />
          <Column
            field="userId.firstName"
            header="First Name"
            sortable
            style={{ width: "20%" }}
          />
          <Column
            field="userId.lastName"
            header="Last Name"
            sortable
            style={{ width: "20%" }}
          />
          <Column
            field="userId.email"
            header="Email"
            sortable
            style={{ width: "20%" }}
          />
          <Column
            field="hotelId.name"
            header="Hotel Name"
            sortable
            style={{ width: "20%" }}
          />
          <Column
            field="checkIn"
            header="Check-In"
            body={(rowData: any) => formatDate(rowData.checkIn)}
            sortable
            style={{ width: "20%" }}
          />
          <Column
            field="checkOut"
            header="Check-Out"
            body={(rowData: any) => formatDate(rowData.checkOut)}
            sortable
            style={{ width: "20%" }}
          />
          <Column
            field="totalCost"
            header="Total Cost"
            body={priceBodyTemplate}
            sortable
            style={{ width: "20%" }}
          />
          <Column
            field="status"
            header="Status"
            body={statusBodyTemplate}
            style={{ width: "20%" }}
            sortable
          ></Column>
        </DataTable>
      </div>
    </>
  );
};
