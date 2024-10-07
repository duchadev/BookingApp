import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import LatestDestinationCard from "../components/LastestDestinationCard";
import "../assets/css/home.css";
import Featured from "../components/Featured";
import PropertyList from "../components/PropertyList";
import FeaturedProperties from "../components/FeaturedProperties";

const Home = () => {
  const { data: hotels } = useQuery("fetchQuery", () =>
    apiClient.fetchHotels()
  );
  console.log(hotels);
  const topRowHotels = hotels?.slice(0, 2) || [];
  const bottomRowHotels = hotels?.slice(2) || [];

  return (
    <div className="space-y-3 mt-32">
      <h2 className="text-3xl font-bold">Treding Destinations</h2>
      <p>Travelers searching for Vietnam also booked these</p>
      <div className="grid gap-4">
        {/* ----- Featured ------ */}
        <Featured />

        {/* ----- PropertyList ------ */}
        <h1 className="text-2xl font-bold mt-9 homeTitle">
          Browse by property type
        </h1>
        <PropertyList />

        {/* ----- FeaturedProperties ------ */}
        <h1 className="text-2xl font-bold mt-9 homeTitle">Homes guests love</h1>
        <FeaturedProperties />

        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          {topRowHotels.map((hotel) => (
            <LatestDestinationCard hotel={hotel} />
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {bottomRowHotels.map((hotel) => (
            <LatestDestinationCard hotel={hotel} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
