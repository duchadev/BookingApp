import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import "../assets/css/home.css";
import Featured from "../components/Featured";
import PropertyList from "../components/PropertyList";
import FeaturedProperties from "../components/FeaturedProperties";
import { HotelType } from "../../../backend/src/shared/types";

const Home = () => {
  const { data: hotels, isLoading } = useQuery<HotelType[] | undefined>(
    "fetchQuery",
    () => apiClient.fetchHotels()
  );

  return (
    <div className="space-y-3 mt-32 ">
      <h2 className="text-3xl font-bold pl-8">Treding Destinations</h2>
      <p className="pl-8">Travelers searching for Vietnam also booked these</p>
      <div className="grid gap-4">
        {/* ----- Featured ------ */}
        <Featured hotels={hotels} isLoading={isLoading} />

        {/* ----- PropertyList ------ */}
        <h1 className="text-2xl font-bold mt-9 pl-8 homeTitle">
          Browse by property type
        </h1>
        <PropertyList hotels={hotels} isLoading={isLoading}/>

        {/* ----- FeaturedProperties ------ */}
        <h1 className="text-2xl font-bold mt-9 pl-8 homeTitle">
          Homes guests love
        </h1>
        <FeaturedProperties hotels={hotels} />
      </div>
    </div>
  );
};

export default Home;
