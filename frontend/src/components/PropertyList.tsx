import { Skeleton } from "primereact/skeleton";
import { HotelType } from "../../../backend/src/shared/types";
import "../assets/css/propertyList.css";

// Define the props type
interface FeaturedProps {
  hotels: HotelType[] | undefined;
  isLoading: boolean;
}

const PropertyList: React.FC<FeaturedProps> = ({ hotels, isLoading }) => {
  // Loading skeleton template
  const loadingTemplate = () => {
    return (
      <>
        <Skeleton width="233px" height="198px" className="mb-2"></Skeleton>
        <Skeleton width="233px" height="198px" className="mb-2"></Skeleton>
        <Skeleton width="233px" height="198px" className="mb-2"></Skeleton>
        <Skeleton width="233px" height="198px" className="mb-2"></Skeleton>
      </>
    );
  };

  // Count the number of hotels for each city
  const hotelsCount = hotels?.filter((hotel) => hotel.type === "Hotel").length;
  const apartmentsCount = hotels?.filter(
    (hotel) => hotel.type === "Apartment"
  ).length;
  const resortsCount = hotels?.filter(
    (hotel) => hotel.type === "Resort"
  ).length;
  const villasCount = hotels?.filter((hotel) => hotel.type === "Villa").length;

  return (
    <div className="pList pl-8">
      {isLoading ? (
        loadingTemplate()
      ) : (
        <>
          <div className="pListItem">
            <img
              src="https://cf.bstatic.com/xdata/images/xphoto/square300/57584488.webp?k=bf724e4e9b9b75480bbe7fc675460a089ba6414fe4693b83ea3fdd8e938832a6&o="
              alt=""
              className="pListImg"
            />
            <div className="pListTitles">
              <h1>Hotels</h1>
              <h2>{hotelsCount} available</h2>
            </div>
          </div>
          <div className="pListItem">
            <img
              src="https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-apartments_300/9f60235dc09a3ac3f0a93adbc901c61ecd1ce72e.jpg"
              alt=""
              className="pListImg"
            />
            <div className="pListTitles">
              <h1>Apartments</h1>
              <h2>{apartmentsCount} available</h2>
            </div>
          </div>
          <div className="pListItem">
            <img
              src="https://cf.bstatic.com/static/img/theme-index/carousel_320x240/bg_resorts/6f87c6143fbd51a0bb5d15ca3b9cf84211ab0884.jpg"
              alt=""
              className="pListImg"
            />
            <div className="pListTitles">
              <h1>Resorts</h1>
              <h2>{resortsCount} available</h2>
            </div>
          </div>
          <div className="pListItem">
            <img
              src="https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-villas_300/dd0d7f8202676306a661aa4f0cf1ffab31286211.jpg"
              alt=""
              className="pListImg"
            />
            <div className="pListTitles">
              <h1>Villas</h1>
              <h2>{villasCount} available</h2>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PropertyList;
