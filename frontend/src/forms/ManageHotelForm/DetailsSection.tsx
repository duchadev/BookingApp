import { useFormContext } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";
import { useState } from "react";
import MapComponent from "../../pages/MapComponent";

const DetailsSection = () => {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext<HotelFormData>();

  const name = watch("name");
  const city = watch("city");
  const country = watch("country");

  const [showMap, setShowMap] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);

  const canShowMapButton = name && city && country;

  const handleTurnOnMap = (e) => {
    e.preventDefault();
    searchLocation(); // Call searchLocation when the button is clicked
    setShowMap(true);
  };
  const handleTurnOffMap = (e) => {
    e.preventDefault();
    setShowMap(false);
  };

  const searchLocation = () => {
    const searchQuery = `${name}, ${city}, ${country}`;
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
        } else {
          alert("Không tìm thấy địa điểm.");
        }
      })
      .catch((error) => console.error("Lỗi khi tìm kiếm địa điểm:", error));
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="text-gray-700 text-sm font-bold flex-1">
        Name
        <input
          type="text"
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && (
          <span className="text-red-500">{errors.name.message}</span>
        )}
      </label>

      <div className="flex gap-4">
        <label className="text-gray-700 text-sm font-bold flex-1">
          Address
          <input
            type="text"
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("address", { required: "Address is required" })}
          />
          {errors.address && (
            <span className="text-red-500">{errors.address.message}</span>
          )}
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          City
          <input
            type="text"
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("city", { required: "City is required" })}
          />
          {errors.city && (
            <span className="text-red-500">{errors.city.message}</span>
          )}
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Country
          <input
            type="text"
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("country", { required: "Country is required" })}
          />
          {errors.country && (
            <span className="text-red-500">{errors.country.message}</span>
          )}
        </label>
      </div>

      <label className="text-gray-700 text-sm font-bold flex-1">
        {canShowMapButton && (
          <>
            <button
              onClick={handleTurnOnMap}
              className="mt-4 mr-4 mb-4 bg-blue-500 text-white py-2 px-4 rounded"
            >
              Find location
            </button>
          </>
        )}

        {showMap && mapPosition && (
          <>
            <button
              onClick={handleTurnOffMap}
              className="mt-4 bg-orange-500 text-white py-2 px-4 rounded"
            >
              Close
            </button>
            <MapComponent
              placeName={name}
              city={city}
              country={country}
              mapPosition={mapPosition} // Pass the position to the MapComponent
            />
          </>
        )}
      </label>
      <label className="text-gray-700 text-sm font-bold flex-1">
        Description
        <textarea
          rows={10}
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("description", { required: "Description is required" })}
        />
        {errors.description && (
          <span className="text-red-500">{errors.description.message}</span>
        )}
      </label>
    </div>
  );
};

export default DetailsSection;
