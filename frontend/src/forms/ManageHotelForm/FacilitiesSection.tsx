import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { hotelFacilities } from "../../config/hotel-options-config";
import { HotelFormData } from "./ManageHotelForm";

const FacilitiesSection = () => {
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext<HotelFormData>();
  const [customFacilities, setCustomFacilities] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [newFacility, setNewFacility] = useState("");

  // Handle adding custom facility
  const addCustomFacility = () => {
    if (newFacility && !customFacilities.includes(newFacility)) {
      setCustomFacilities((prev) => [...prev, newFacility]);
      setValue("facilities", [...getValues("facilities"), newFacility]); // Update form state
      setNewFacility("");
      setShowCustomInput(false); // Hide input after adding
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Facilities</h2>
      <div className="grid grid-cols-5 gap-3">
        {/* Map over predefined facilities */}
        {hotelFacilities.map((facility) => (
          <label key={facility} className="text-sm flex gap-1 text-gray-700">
            <input
              type="checkbox"
              value={facility}
              {...register("facilities", {
                validate: (facilities) => {
                  if (facilities && facilities.length > 0) {
                    return true;
                  } else {
                    return "At least one facility is required";
                  }
                },
              })}
            />
            {facility}
          </label>
        ))}

        {/* Map over custom facilities */}
        {customFacilities.map((facility) => (
          <label key={facility} className="text-sm flex gap-1 text-gray-700">
            <input
              type="checkbox"
              value={facility}
              {...register("facilities")}
              defaultChecked
            />
            {facility}
          </label>
        ))}

        {/* Button to show input for adding more facilities */}
        {!showCustomInput && (
          <button
            type="button"
            className="text-blue-500 text-sm"
            onClick={() => setShowCustomInput(true)}
          >
            More...
          </button>
        )}
      </div>

      {/* Input for custom facility */}
      {showCustomInput && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newFacility}
            onChange={(e) => setNewFacility(e.target.value)}
            placeholder="Add custom facility"
            className="border px-2 py-1 rounded"
          />
          <button
            type="button"
            onClick={addCustomFacility}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Add
          </button>
        </div>
      )}

      {/* Validation error */}
      {errors.facilities && (
        <span className="text-red-500 text-sm font-bold">
          {errors.facilities.message}
        </span>
      )}
    </div>
  );
};

export default FacilitiesSection;
