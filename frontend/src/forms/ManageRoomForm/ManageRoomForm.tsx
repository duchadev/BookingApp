import { FormProvider, useForm } from "react-hook-form";

import { RoomType } from "../../../../backend/src/shared/types";
import { useEffect } from "react";
import DetailsSection from "./DetailsSection";
import { ObjectId } from "mongoose";

export type RoomFormData = {
  hotelId: ObjectId;
  roomNumber: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  imageFiles: FileList;
  imageUrls: string[];
  description: string;
};

type Props = {
  room?: RoomType;
  hotelId: ObjectId;
  onSave: (roomFormData: FormData) => void;
  isLoading: boolean;
};

const ManageRoomForm = ({ onSave, isLoading, room, hotelId }: Props) => {
  const formMethods = useForm<RoomFormData>();
  const { handleSubmit, reset } = formMethods;

  useEffect(() => {
    reset(room);
  }, [room, reset]);

  const onSubmit = handleSubmit((formDataJson: RoomFormData) => {
    const formData = new FormData();
    if (room) {
      // using when update
      formData.append("roomId", room._id);
    }
    formDataJson.hotelId = hotelId;
    formData.append("hotelId", formDataJson.hotelId.toString());
    formData.append("roomNumber", formDataJson.roomNumber);
    formData.append("type", formDataJson.type);
    formData.append("capacity", formDataJson.capacity.toString());
    formData.append("description", formDataJson.description);
    formData.append("pricePerNight", formDataJson.pricePerNight.toString());

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
