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

const Detail = () => {
  const { hotelId } = useParams();
  const [images, setImages] = useState([]); // Thay đổi giá trị khởi tạo thành mảng rỗng
  const menu = useRef(null);
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
        hotel?.imageUrls.map((url) => ({
          itemImageSrc: url,
          thumbnailImageSrc: url, // Có thể thay đổi thumbnail nếu cần
          alt: hotel.name,
        }))
      );

      // Extract minPrice from roomPrices if it exists
      if (rooms && rooms.length > 0) {
        const prices = rooms.map((room) => room.pricePerNight);
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

  const itemTemplate = (item) => {
    return (
      <img
        src={item.itemImageSrc}
        alt={item.alt}
        style={{ width: "100%", display: "block" }}
      />
    );
  };

  const thumbnailTemplate = (item) => {
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
        alert("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const items2 = [
    {
      label: (
        <>
          <h2 className="font-bold">Share this property</h2>
        </>
      ),
    },
    {
      label: (
        <>
          <p>Copy link</p>
        </>
      ),
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
          <Link to={`http://localhost:5174/detail/${hotel?._id}`}>
            <a className="text-primary font-semibold text-blue-600">
              {hotel?.name}
            </a>
          </Link>
        </>
      ),
    },
  ];
  const home: MenuItem = { icon: "pi pi-home", url: "http://localhost:5174/" };

  return (
    <>
      <div className="space-y-6">
        <BreadCrumb model={items} home={home} />

        <div className="flex space-x-4">
          <div className="flex-1 ">
            <span className="flex">
              {Array.from({ length: 5 }).map((_, index) => {
                if (index < hotel.starRating) {
                  return (
                    <i
                      key={index}
                      className="pi pi-star-fill text-yellow-400"
                    ></i>
                    // <i key={index} className="pi pi-star-half-fill text-yellow-300"></i>
                  );
                }
                return (
                  <i key={index} className="pi pi-star-fill text-gray-300"></i>
                );
              })}
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
          <div className="flex ">
            <TieredMenu model={items2} popup ref={menu} breakpoint="767px" />
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                menu.current.toggle(e);
              }}
            >
              <i className="pi pi-share-alt text-blue-600 font-bold text-2xl"></i>
            </a>
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
            <div className="flex-1">
              {/* <div>Feedback</div> */}
              <div className="feedback-card ml-3">
                <h2>How are you feeling this Hotel ?</h2>
                <p>
                  Your input is valuable in helping us better understand your
                  needs and tailor our service accordingly.
                </p>
                <div className="emojis">
                  <span className="emoji">😢</span>
                  <span className="emoji">😞</span>
                  <span className="emoji">😐</span>
                  <span className="emoji">🙂</span>
                  <span className="emoji">🥰</span>
                </div>
                <textarea
                  className="comment-box"
                  placeholder="Add a Comment..."
                ></textarea>
                <button className="submit-btn">Submit Now</button>
              </div>
            </div>
            <div className="flex-1">
              <MapComponent
                placeName={hotel.name}
                city={hotel.city}
                country={hotel.country}
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
          <div className="whitespace-pre-line">{hotel?.description}</div>
          <div className="h-fit">
            <GuestInfoForm pricePerNight={minPrice} hotelId={hotel?._id} />
          </div>
        </div>
      </div>
    </>
  );
};
export default Detail;
