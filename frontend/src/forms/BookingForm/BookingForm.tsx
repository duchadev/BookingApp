import { useForm } from "react-hook-form";
import { UserType } from "../../../../backend/src/shared/types";
import { useSearchContext } from "../../contexts/SearchContext";
import { useParams } from "react-router-dom";
import * as apiClient from "../../api-client";
import { useEffect, useState } from "react";

type Props = {
  currentUser: UserType;
};

export type BookingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  adultCount: number;
  childCount: number;
  checkIn: string;
  checkOut: string;
  hotelId: string;
  paymentIntentId: string;
  totalCost: number;
  imageUrls: string[];
};

const BookingForm = ({ currentUser }: Props) => {
  const search = useSearchContext();
  const { hotelId } = useParams();
  const [hotelData, setHotelData] = useState<any>(null);

  // Gọi API để lấy dữ liệu khách sạn dựa trên hotelId
  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        const response = await apiClient.fetchHotelById(hotelId as string);
        setHotelData(response);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu khách sạn:", error);
      }
    };

    if (hotelId) fetchHotelData();
  }, [hotelId]);

  const { handleSubmit, register } = useForm<BookingFormData>({
    defaultValues: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      phone: currentUser.phone,
      adultCount: search.adultCount,
      childCount: search.childCount,
      checkIn: search.checkIn.toISOString(),
      checkOut: search.checkOut.toISOString(),
      hotelId: hotelId || "",
      imageUrls: hotelData?.imageUrls || [],
    },
  });

  const onSubmit = async (formData: BookingFormData) => {
    console.log("Form data submitted:", formData);
    // Thực hiện các logic tiếp theo khi submit
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-5 rounded-lg border border-slate-300 p-5"
    >
      <span className="text-3xl font-bold">Confirm Your Details</span>

      <div className="grid grid-cols-2 gap-6">
        <label className="text-gray-700 text-sm font-bold flex-1">
          First Name
          <input
            className="mt-1 border rounded w-full py-2 px-3 text-gray-700 bg-gray-200 font-normal"
            type="text"
            readOnly
            disabled
            {...register("firstName")}
          />
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Last Name
          <input
            className="mt-1 border rounded w-full py-2 px-3 text-gray-700 bg-gray-200 font-normal"
            type="text"
            readOnly
            disabled
            {...register("lastName")}
          />
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Email
          <input
            className="mt-1 border rounded w-full py-2 px-3 text-gray-700 bg-gray-200 font-normal"
            type="text"
            readOnly
            disabled
            {...register("email")}
          />
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Phone Number
          <input
            className="mt-1 border rounded w-full py-2 px-3 text-gray-700 bg-gray-200 font-normal"
            type="text"
            readOnly
            disabled
            {...register("phone")}
          />
        </label>
      </div>
      <div className="">
        <span className="text-lg font-bold">Hotel Images</span>
        <div className="flex flex-wrap mt-2">
          {hotelData?.imageUrls?.map((url: string, index: number) => (
            <img
              key={index}
              src={url}
              alt={`Hotel Image ${index + 1}`}
              className="w-1/4 h-auto m-2 rounded-lg border"
            />
          ))}
        </div>
      </div>
      <div className="">
        <span className="text-lg font-bold"></span>
        <div className="flex flex-wrap mt-4">
          <p>
            Khi nhận phòng, khách phải cung cấp giấy tờ tùy thân có tên trùng
            với tên này.{" "}
          </p>
        </div>
      </div>
    </form>
  );
};

export default BookingForm;
