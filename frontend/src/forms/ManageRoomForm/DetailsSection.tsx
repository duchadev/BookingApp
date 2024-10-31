import { useFormContext } from "react-hook-form";
import { RoomFormData } from "./ManageRoomForm";
import { useState, useEffect } from "react";
import { roomFacilities } from "../../config/room-options-config";

const typeOptions = {
  Single: "Single - 👤 x 1",
  Double: "Double - 👤 x 2",
  Suite: "Suite - 👤 x 3",
};

const DetailsSection = () => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useFormContext<RoomFormData>();

  const existingImageUrls = watch("imageUrls");
  const existingFacilities = watch("facilities") || []; // Nếu không có giá trị thì khởi tạo là một mảng rỗng
  // Theo dõi thay đổi của type và tự động cập nhật capacity
  const roomType = watch("type");

  useEffect(() => {
    switch (roomType) {
      case "Single":
        setValue("capacity", 1);
        break;
      case "Double":
        setValue("capacity", 2);
        break;
      case "Suite":
        setValue("capacity", 3);
        break;
      default:
        setValue("capacity", 0); // Giá trị mặc định nếu không chọn gì
    }
  }, [roomType, setValue]);

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

  // Handle setting initial facilities when updating the room
  useEffect(() => {
    if (existingFacilities && existingFacilities.length > 0) {
      setCustomFacilities(
        existingFacilities.filter(
          (facility: string) => !roomFacilities.includes(facility)
        )
      );
    }
  }, [existingFacilities]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <label className="text-gray-700 text-sm font-bold max-w-[50%]">
          Room Number
          <input
            type="text"
            min={1}
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("roomNumber", {
              required: "This field is required",
            })}
          ></input>
          {errors.roomNumber && (
            <span className="text-red-500">{errors.roomNumber.message}</span>
          )}
        </label>
        {/* Room Type */}
        <label className="text-gray-700 text-sm font-bold max-w-[50%]">
          Type
          <select
            {...register("type", {
              required: "This field is required",
            })}
            className="border rounded w-full p-2 text-gray-700 font-normal"
            onChange={(e) => setValue("type", e.target.value)}
          >
            <option value="" className="text-sm font-bold">
              Select a type
            </option>
            {Object.entries(typeOptions).map(([value, displayText]) => (
              <option key={value} value={value}>
                {displayText}
              </option>
            ))}
          </select>
          {errors.type && (
            <span className="text-red-500">{errors.type.message}</span>
          )}
        </label>

        {/* Capacity sẽ tự động cập nhật dựa trên type */}
        <label className=" text-gray-700 text-sm font-bold max-w-[50%]">
          Capacity
          <input
            type="number"
            min={1}
            className="bg-gray-200 border rounded w-full py-1 px-2 font-normal"
            {...register("capacity", {
              required: "This field is required",
            })}
            readOnly
          ></input>
          {errors.capacity && (
            <span className="text-red-500">{errors.capacity.message}</span>
          )}
        </label>
        <label className="text-gray-700 text-sm font-bold max-w-[50%]">
          Room Size
          <input
            type="number"
            min={1}
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("size", {
              required: "This field is required",
            })}
          ></input>
          {errors.size && (
            <span className="text-red-500">{errors.size.message}</span>
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

      <div>
        <h2 className="text-2xl font-bold mb-3">Facilities</h2>
        <div className="grid grid-cols-5 gap-3">
          {/* Map over predefined facilities */}
          {roomFacilities.map((facility) => (
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
                checked={existingFacilities.includes(facility)} // Thay vì defaultChecked, dùng checked để cập nhật dựa trên existingFacilities
                onChange={(e) => {
                  const updatedFacilities = e.target.checked
                    ? [...existingFacilities, facility]
                    : existingFacilities.filter((item) => item !== facility);
                  setValue("facilities", updatedFacilities);
                }}
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
                checked={existingFacilities.includes(facility)} // Kiểm tra trong existingFacilities để hiển thị đúng các custom facilities
                onChange={(e) => {
                  const updatedFacilities = e.target.checked
                    ? [...existingFacilities, facility]
                    : existingFacilities.filter((item) => item !== facility);
                  setValue("facilities", updatedFacilities);
                }}
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
      <h2 className="text-2xl font-bold">Images</h2>
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
