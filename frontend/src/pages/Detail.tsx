import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import * as apiClient from "./../api-client";
import GuestInfoForm from "../forms/GuestInfoForm/GuestInfoForm";
import { Galleria } from "primereact/galleria";
import { useEffect, useRef, useState } from "react";
import { MenuItem } from "primereact/menuitem";
import { BreadCrumb } from "primereact/breadcrumb";
import { TieredMenu } from "primereact/tieredmenu";
import MapComponent from "./MapComponent";
import "../assets/css/demo.css";
import BookingTable from "../components/BookingTable";
import FeedbackComponent from "../../src/components/FeedbackComponent";
import FeedbackProperties from "../components/FeedbackProperties";
import { RoomType } from "../../src/shared/types";
import HotelFeedBackProperty from "../components/HotelFeedbackProperty";
import { Toast } from "primereact/toast";
const VITE_FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_BASE_URL;

interface Item {
  thumbnailImageSrc: string;
  alt: string;
  itemImageSrc: string;
}
interface CustomImageData {
  itemImageSrc: string;
  thumbnailImageSrc: string;
  alt: string;
}

const Detail = () => {
  const { hotelId } = useParams();
  const toast = useRef<Toast>(null);
  const [images, setImages] = useState<CustomImageData[]>([]); // Thay đổi giá trị khởi tạo thành mảng rỗng
  const menu = useRef<TieredMenu | null>(null);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [minPrice, setMinPrice] = useState(0);

  // Lấy dữ liệu khách sạn
  const {
    data: hotel,
    isLoading,
    isError,
  } = useQuery(
    "fetchHotelById",
    () => apiClient.fetchHotelById(hotelId || ""),
    {
      enabled: !!hotelId,
    }
  );

  const { data: rooms } = useQuery(
    "fetchRoomsByHotelId",
    () => apiClient.fetchRoomsByHotelId(hotelId || ""),
    {
      enabled: !!hotelId,
    }
  );

  // Cập nhật hình ảnh từ phản hồi của API
  useEffect(() => {
    if (hotel) {
      setImages(
        hotel.imageUrls.map((url: string) => ({
          itemImageSrc: url,
          thumbnailImageSrc: url, // Có thể thay đổi thumbnail nếu cần
          alt: hotel.name,
        }))
      );

      // Extract minPrice from roomPrices if it exists
      if (rooms && rooms?.length > 0) {
        const prices = rooms.map((room: RoomType) => room.pricePerNight);
        const minRoomPrice = Math.min(...prices);
        setMinPrice(minRoomPrice);
      }
    }

    // Geolocation search query
    const searchQuery = `${hotel?.name}, ${hotel?.city}, ${hotel?.country}`;
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setMapPosition([lat, lon]);
        }
      })
      .catch((error) => console.error("Lỗi khi tìm kiếm địa điểm:", error));
  }, [hotel]); // Chỉ gọi lại khi hotel thay đổi

  // Thực hiện kiểm tra trạng thái dữ liệu
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading hotel information.</p>;

  const responsiveOptions = [
    {
      breakpoint: "1024px",
      numVisible: 5,
    },
    {
      breakpoint: "960px",
      numVisible: 4,
    },
    {
      breakpoint: "768px",
      numVisible: 3,
    },
    {
      breakpoint: "560px",
      numVisible: 1,
    },
  ];

  const itemTemplate = (item: Item) => {
    return (
      <img
        src={item.itemImageSrc}
        alt={item.alt}
        style={{ width: "100%", display: "block" }}
      />
    );
  };

  const thumbnailTemplate = (item: Item) => {
    return (
      <img
        src={item.thumbnailImageSrc}
        alt={item.alt}
        style={{ display: "block" }}
      />
    );
  };

  // Hàm để sao chép URL
  const copyLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        toast.current?.show({
          severity: "info",
          summary: "Info",
          detail: "Link copied to clipboard!",
        });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const items2 = [
    {
      label: "Share this property", // Chỉ dùng string
    },
    {
      label: "Copy link", // Chỉ dùng string
      icon: "pi pi-clipboard",
      command: () => copyLink(),
    },
  ];

  const items: MenuItem[] = [
    { label: "Hotels" },
    {
      label: hotel?.name,
      template: () => (
        <>
          <Link to={`${VITE_FRONTEND_BASE_URL}/detail/${hotel?._id}`}>
            <a className="text-primary font-semibold text-blue-600">
              {hotel?.name}
            </a>
          </Link>
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
      <Toast ref={toast} />
      <div className="space-y-6">
        <BreadCrumb model={items} home={home} />

        <div className="flex space-x-4">
          <div className="flex-1 ">
            <span className="flex items-center space-x-1">
              {hotel &&
                Array.from({ length: 5 }).map((_, index) => {
                  if (index < hotel.starRating) {
                    return (
                      <i
                        key={index}
                        className="pi pi-star-fill text-yellow-400"
                      ></i>
                    );
                  }

                  return (
                    <i
                      key={index}
                      className="pi pi-star-fill text-gray-300"
                    ></i>
                  );
                })}
              {hotel && (
                <strong className="ml-2 text-yellow-600 font-bold text-lg flex items-center">
                  <i className="pi pi-crown mr-1 text-yellow-600"></i>
                  {hotel.starRating}/5
                </strong>
              )}
            </span>
            <h1 className="text-3xl font-bold">{hotel?.name}</h1>
            <i className="pi pi-map-marker" style={{ color: "blue" }}></i>{" "}
            {hotel?.address}, {hotel?.city}, {hotel?.country} -{" "}
            {mapPosition ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapPosition[0]},${mapPosition[1]}`}
                style={{ color: "blue" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Show map
              </a>
            ) : (
              <span>No map available</span>
            )}
          </div>
          <div className="flex flex-row items-center gap-6">
            <div className="flex ">
              <TieredMenu model={items2} popup ref={menu} breakpoint="767px" />
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  menu?.current?.toggle(e);
                }}
              >
                <i className="pi pi-share-alt text-blue-600 font-bold text-2xl"></i>
              </a>
            </div>
            <div className="flex justify-content-center">
              <FeedbackComponent hotel={hotel} />
            </div>
          </div>
        </div>

        {/* Sử dụng flexbox để đưa Galleria và bản đồ vào cùng hàng */}
        <div className="flex space-x-4">
          <div className="flex-2">
            <Galleria
              value={images}
              responsiveOptions={responsiveOptions}
              numVisible={7}
              circular
              style={{ maxWidth: "800px" }}
              showItemNavigators
              showItemNavigatorsOnHover
              item={itemTemplate}
              thumbnail={thumbnailTemplate}
            />
          </div>
          <div className="flex-1 flex flex-col space-x-4">
            <div className="flex-1 justify-center">
              <HotelFeedBackProperty hotelId={hotelId} />
            </div>
            <div className="flex-1">
              <MapComponent
                placeName={hotel?.name}
                city={hotel?.city}
                country={hotel?.country}
                mapPosition={mapPosition} // Pass the position to the MapComponent
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {hotel?.facilities.map((facility) => (
            <div
              className="border border-slate-300 rounded-sm p-3"
              key={facility}
            >
              {facility}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
          <div className="whitespace-pre-line pr-8">{hotel?.description}</div>
          <div className="h-fit">
            <GuestInfoForm pricePerNight={minPrice} hotelId={hotel?._id} />
          </div>
        </div>

        <BookingTable />
        <h1 className="text-2xl font-bold mt-9 pl-8 homeTitle">Feedback</h1>

        <FeedbackProperties hotelId={hotelId} />
      </div>
    </>
  );
};
export default Detail;
