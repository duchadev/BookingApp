import { useFormContext } from "react-hook-form";
import { RoomFormData } from "./ManageRoomForm";

const DetailsSection = () => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<RoomFormData>();

  const existingImageUrls = watch("imageUrls");

  const handleDelete = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    imageUrl: string
  ) => {
    event.preventDefault();
    setValue(
      "imageUrls",
      existingImageUrls.filter((url) => url !== imageUrl)
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <label className="text-gray-700 text-sm font-bold max-w-[50%]">
          Type
          <select
            {...register("type", {
              required: "This field is required",
            })}
            className="border rounded w-full p-2 text-gray-700 font-normal"
          >
            <option value="" className="text-sm font-bold">
              Select as type
            </option>
            {["Single", "Double", "Suite"].map((num) => (
              <option value={num}>{num}</option>
            ))}
          </select>
          {errors.type && (
            <span className="text-red-500">{errors.type.message}</span>
          )}
        </label>
        <label className="text-gray-700 text-sm font-bold max-w-[50%]">
          Capacity
          <input
            type="number"
            min={1}
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("capacity", {
              required: "This field is required",
            })}
          ></input>
          {errors.capacity && (
            <span className="text-red-500">{errors.capacity.message}</span>
          )}
        </label>
        <label className="text-gray-700 text-sm font-bold max-w-[50%]">
          Price Per Night
          <input
            type="number"
            min={1}
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("pricePerNight", {
              required: "This field is required",
            })}
          ></input>
          {errors.pricePerNight && (
            <span className="text-red-500">{errors.pricePerNight.message}</span>
          )}
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Description
          <textarea
            rows={10}
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("description", {
              required: "Description is required",
            })}
          />
          {errors.description && (
            <span className="text-red-500">{errors.description.message}</span>
          )}
        </label>
      </div>
      <h2 className="text-2xl font-bold mb-3">Images</h2>
      <div className="border rounded p-4 flex flex-col gap-4">
        {existingImageUrls && (
          <div className="grid grid-cols-6 gap-4">
            {existingImageUrls.map((url) => (
              <div className="relative group">
                <img src={url} className="min-h-full object-cover" />
                <button
                  onClick={(event) => handleDelete(event, url)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 text-white"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          multiple
          accept="image/*"
          className="w-full text-gray-700 font-normal"
          {...register("imageFiles", {
            validate: (imageFiles) => {
              const totalLength =
                imageFiles.length + (existingImageUrls?.length || 0);

              if (totalLength === 0) {
                return "At least one image should be added";
              }

              if (totalLength > 6) {
                return "Total number of images cannot be more than 6";
              }

              return true;
            },
          })}
        />
      </div>
      {errors.imageFiles && (
        <span className="text-red-500 text-sm font-bold">
          {errors.imageFiles.message}
        </span>
      )}
    </>
  );
};

export default DetailsSection;
