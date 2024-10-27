import { FormProvider, useForm } from "react-hook-form";

import { RoomType } from "../../../../backend/src/shared/types";
import { useEffect } from "react";
import DetailsSection from "./DetailsSection";
// import { ObjectId } from "mongoose";

export type RoomFormData = {
  hotelId?: string;
  roomNumber: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  imageFiles: FileList;
  imageUrls: string[];
  description?: string;
  facilities: string[];
  size: number;
};

type Props = {
  room?: RoomType;
  hotelId?: string;
  onSave: (roomFormData: FormData) => void;
  isLoading: boolean;
};

const ManageRoomForm = ({ onSave, isLoading, room, hotelId }: Props) => {
  const formMethods = useForm<RoomFormData>();
  const { handleSubmit, reset } = formMethods;

  useEffect(() => {
    if (room) {
      const roomData: RoomFormData = {
        hotelId: room.hotelId?.toString(), // Chuyển đổi ObjectId sang string nếu cần
        roomNumber: room.roomNumber,
        type: room.type,
        capacity: room.capacity,
        pricePerNight: room.pricePerNight,
        imageFiles: room?.imageFiles, // Chắc chắn rằng room có thuộc tính này nếu cần
        imageUrls: room.imageUrls,
        description: room.description,
        facilities: room.facilities,
        size: room.size,
      };
      reset(roomData);
    }
  }, [room, reset]);

  const onSubmit = handleSubmit((formDataJson: RoomFormData) => {
    const formData = new FormData();
    if (room) {
      // using when update
      formData.append("roomId", room._id);
    }

    // Kiểm tra hotelId có tồn tại không
    if (hotelId) {
      formDataJson.hotelId = hotelId;
      formData.append("hotelId", formDataJson.hotelId);
    } else {
      console.error("hotelId is undefined");
      // Xử lý trường hợp không có hotelId nếu cần
      return; // Dừng hàm nếu hotelId không tồn tại
    }
    formData.append("roomNumber", formDataJson.roomNumber);
    formData.append("type", formDataJson.type);
    formData.append("capacity", formDataJson.capacity.toString());
    formData.append("description", formDataJson.description || "");

    formData.append("pricePerNight", formDataJson.pricePerNight.toString());
    formData.append("size", formDataJson.size.toString());

    formDataJson.facilities.forEach((facility, index) => {
      formData.append(`facilities[${index}]`, facility);
    });

    if (formDataJson.imageUrls) {
      formDataJson.imageUrls.forEach((url, index) => {
        formData.append(`imageUrls[${index}]`, url);
      });
    }

    Array.from(formDataJson.imageFiles).forEach((imageFile) => {
      formData.append(`imageFiles`, imageFile);
    });

    // console.log(formDataJson);
    onSave(formData);
  });

  return (
    <FormProvider {...formMethods}>
      <form className="flex flex-col gap-10" onSubmit={onSubmit}>
        <DetailsSection />
        <span className="flex justify-end">
          <button
            disabled={isLoading}
            type="submit"
            className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-500 text-xl disabled:bg-gray-500"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </span>
      </form>
    </FormProvider>
  );
};

export default ManageRoomForm;
