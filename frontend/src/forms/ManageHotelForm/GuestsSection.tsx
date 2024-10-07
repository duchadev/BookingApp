import { useFormContext } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";

const GuestsSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<HotelFormData>();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Guests</h2>
      <div className="grid grid-cols-2 p-6 gap-5 bg-gray-300">
        <label className="text-gray-700 text-sm font-semibold">
          Maximum Adults
          <input
            className="border rounded w-full py-2 px-3 font-normal"
            type="number"
            min={1}
            {...register("maxAdultCount", {
              required: "Maximum Adults field is required",
            })}
          />
          {errors.maxAdultCount?.message && (
            <span className="text-red-500 text-sm fold-bold">
              {errors.maxAdultCount?.message}
            </span>
          )}
        </label>
        <label className="text-gray-700 text-sm font-semibold">
          Maximum Children
          <input
            className="border rounded w-full py-2 px-3 font-normal"
            type="number"
            min={0}
            {...register("maxChildCount", {
              required: "Maximum Children field is required",
            })}
          />
          {errors.maxChildCount?.message && (
            <span className="text-red-500 text-sm fold-bold">
              {errors.maxChildCount?.message}
            </span>
          )}
        </label>
      </div>
    </div>
  );
};

export default GuestsSection;
