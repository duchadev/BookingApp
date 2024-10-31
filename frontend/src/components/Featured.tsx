import { Skeleton } from "primereact/skeleton";
import { HotelType } from "../../src/shared/types";
import "../assets/css/featured.css";

// Define the props type
interface FeaturedProps {
  hotels: HotelType[] | undefined;
  isLoading: boolean;
}

const Featured: React.FC<FeaturedProps> = ({ hotels, isLoading }) => {
  // Loading skeleton template
  const loadingTemplate = () => {
    return (
      <>
        <Skeleton width="317px" height="250px" className="mb-2"></Skeleton>
        <Skeleton width="317px" height="250px" className="mb-2"></Skeleton>
        <Skeleton width="317px" height="250px" className="mb-2"></Skeleton>
      </>
    );
  };

  // Count the number of hotels for each city if hotels data is available
  const daNangHotelsCount =
    hotels?.filter((hotel) => hotel.city === "Da Nang").length ?? 0;
  const haNoiHotelsCount =
    hotels?.filter((hotel) => hotel.city === "Ha Noi").length ?? 0;
  const hcmcHotelsCount =
    hotels?.filter((hotel) => hotel.city === "Ho Chi Minh City").length ?? 0;

  return (
    <div className="featured pl-8">
      {isLoading ? (
        loadingTemplate()
      ) : (
        <>
          {/* Da Nang */}
          <div className="featuredItem">
            <img
              src="https://vietluxtour.com/Upload/images/2024/khamphatrongnuoc/C%E1%BA%A7u%20R%E1%BB%93ng%20%C4%90%C3%A0%20N%E1%BA%B5ng/cau-rong-da-nang%20(7)-min.jpg"
              alt="Da Nang"
              className="featuredImg"
            />
            <div className="featuredTitles">
              <h1>Da Nang</h1>
              <h2>{daNangHotelsCount} properties</h2>
            </div>
          </div>
          {/* Ha Noi */}
          <div className="featuredItem">
            <img
              src="https://lh3.googleusercontent.com/proxy/FiCcFsz2E6iy4_5opG-yoPKcBlRx8VfUlT4ZbhVN2ObCl61eZAMWUxU_JBY-nq_Obw7jj779XuVFdY_-xWQ-AJXqTaDD-tzCUj-htx_hfMmwEwmwozOIEH_aEQ"
              alt="Ha Noi"
              className="featuredImg"
            />
            <div className="featuredTitles">
              <h1>Ha Noi</h1>
              <h2>{haNoiHotelsCount} properties</h2>
            </div>
          </div>
          {/* Ho Chi Minh City */}
          <div className="featuredItem">
            <img
              src="https://acnoshotel.com/hotel/wp-content/uploads/2023/12/Acnos-cho-ben-thanh-04.jpg"
              alt="Ho Chi Minh City"
              className="featuredImg"
            />
            <div className="featuredTitles">
              <h1>Ho Chi Minh City</h1>
              <h2>{hcmcHotelsCount} properties</h2>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Featured;
