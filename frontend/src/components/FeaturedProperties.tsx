import { Carousel, CarouselResponsiveOption } from "primereact/carousel";
import "../assets/css/featuredProperties.css";
import { HotelType } from "../../src/shared/types";
import { Link } from "react-router-dom";

// Define the props type
interface FeaturedProps {
  hotels: HotelType[] | undefined;
}

const FeaturedProperties: React.FC<FeaturedProps> = ({ hotels }) => {
  const responsiveOptions: CarouselResponsiveOption[] = [
    {
      breakpoint: "1400px",
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: "1199px",
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: "767px",
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: "575px",
      numVisible: 1,
      numScroll: 1,
    },
  ];

  const hotelTemplate = (hotel: HotelType) => {
    // Tính toán minPrice và maxPrice cho từng khách sạn
    let minPrice;
    // console.log(hotel);
    if (hotel?.rooms && hotel?.rooms.length > 0) {
      const prices = hotel.rooms.map((room) => room.pricePerNight);
      minPrice = Math.min(...prices);
    } else {
      minPrice = "N/A"; // Giá trị mặc định nếu không có rooms
    }

    return (
      <Link
        to={`/detail/${hotel._id}`}
        key={hotel._id} // Luôn cần thêm key khi render danh sách
        className="relative cursor-pointer overflow-hidden rounded-md"
      >
        <div className="fpItem mr-4">
          <img
            src={hotel?.imageUrls[0]}
            alt=""
            className="fpImg w-full object-cover object-center rounded"
          />
          <span className="fpName">{hotel?.name}</span>
          <span className="fpCity">{hotel?.city}</span>
          <span className="fpPrice">Starting from {minPrice} VND</span>
          <div className="fpRating">
            <button>8.9</button>
            <span>Excellent</span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <>
      {hotels && (
        <Carousel
          value={hotels}
          numVisible={3}
          numScroll={3}
          responsiveOptions={responsiveOptions}
          itemTemplate={hotelTemplate}
          className="custom-carousel"
          circular
          autoplayInterval={3000}
        />
      )}
    </>
  );
};

export default FeaturedProperties;
