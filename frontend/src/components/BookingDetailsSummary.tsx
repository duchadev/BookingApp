import { ConfirmPopup } from "primereact/confirmpopup";
import {
  HotelType,
  RoomType,
  UserType,
} from "../../../backend/src/shared/types";
import { useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import * as apiClient from "../api-client";
const FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_BASE_URL || "";

type Props = {
  checkIn: Date;
  checkOut: Date;
  adultCount: number;
  childCount: number;
  numberOfNights: number;
  hotel: HotelType;
  roomSeleted: RoomType;
  pricePerNight: number;
  currentUser?: UserType;
};

const BookingDetailsSummary = ({
  checkIn,
  checkOut,
  adultCount,
  childCount,
  numberOfNights,
  pricePerNight,
  hotel,
  roomSeleted,
  currentUser,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState<boolean>(false);
  const toast = useRef<Toast>(null);
  const buttonEl = useRef(null);
  const navigate = useNavigate();
  const totalCost = pricePerNight * numberOfNights;

  const mutation = useMutation(apiClient.addBooking, {
    onSuccess: () => {
      // showToast({ message: "Room Saved!", type: "SUCCESS" });
    },
    onError: () => {
      // showToast({ message: error.message, type: "ERROR" });
    },
  });

  const accept = async (paymentMethod: "online" | "offline") => {
    // console.log("data: ", {
    //   hotelId: hotel?._id, // dùng key hotelId thay vì hotel._id
    //   roomId: roomSeleted?._id,
    //   adultCount,
    //   childCount,
    //   checkIn,
    //   checkOut,
    //   totalCost: numberOfNights * pricePerNight,
    // });

    if (paymentMethod === "online") {
      await handleConfirmPayment();
      mutation.mutate({
        hotelId: hotel._id, // dùng key hotelId thay vì hotel._id
        roomId: roomSeleted._id,
        adultCount,
        childCount,
        checkIn,
        checkOut,
        totalCost: totalCost,
        status: "success",
      });
    } else {
      // toast.current?.show({
      //   severity: "info",
      //   summary: "Payment Method",
      //   detail: "You have selected Offline Payment",
      //   life: 3000,
      // });
      mutation.mutate({
        hotelId: hotel._id, // dùng key hotelId thay vì hotel._id
        roomId: roomSeleted._id,
        adultCount,
        childCount,
        checkIn,
        checkOut,
        totalCost: 0,
        status: "pending",
      });
      // Sử dụng navigate để truyền dữ liệu qua trạng thái
      navigate("/?status=PENDING", {
        state: {
          checkIn,
          checkOut,
          adultCount,
          childCount,
          numberOfNights,
          pricePerNight,
          hotel,
          currentUser,
        },
      });
    }
  };

  function formatDate(date: Date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Chuyển đổi sang định dạng 12h
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes; // Đảm bảo có 2 chữ số

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }

  const priceBodyTemplate = (totalPrice: number) => {
    return new Intl.NumberFormat("vn-VN", {
      style: "currency",
      currency: "VND",
    }).format(totalPrice);
  };

  // Hàm xử lý sự kiện nhấn nút "Xác nhận thanh toán"
  const handleConfirmPayment = async () => {
    setLoading(true);
    const Random = () => Math.floor(Math.random() * 1000000);
    const url = "https://payos-56ml.onrender.com/create-payment-link";
    const payload = {
      orderCode: Random(),
      amount: 5000, // totalCost
      description: `Booking ${hotel.name}`, // bị giới hạn kí tự
      returnUrl: `${FRONTEND_BASE_URL}`, // back home page
      cancelUrl: `${FRONTEND_BASE_URL}`, // back home page
      buyerName: `${currentUser?.firstName} ${currentUser?.lastName}`,
      buyerEmail: `${currentUser?.email}`,
      buyerPhone: `${currentUser?.phone}`,
      //   items: [
      //     {
      //       name: "Iphone",
      //       quantity: 2,
      //       price: 28000000,
      //     },
      //   ],
      // };
      customerName: "Guest User", // phải có vì bên code của Tín folder Payos
      customerPhone: "0123456789", // phải có vì bên code của Tín folder Payos
      customerAddress: `${hotel.city}, ${hotel.country}`, // phải có vì bên code của Tín folder Payos
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error("No payment URL returned in response:", data);
        alert("Không có URL thanh toán được trả về. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error creating payment link:", error);
      alert("Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.");
    } finally {
      console.log(payload);
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmPopup
        target={buttonEl.current || undefined}
        visible={visible}
        onHide={() => setVisible(false)}
        message="Choose your payment method:"
        icon="pi pi-exclamation-triangle"
        acceptLabel="Online"
        rejectLabel="Offline"
        acceptClassName="ml-1 px-2 py-1 bg-blue-500 text-white flex justify-content-center rounded hover:bg-blue-700"
        rejectClassName="px-2 py-1 text-blue-500 flex justify-content-center rounded hover:bg-gray-100"
        accept={() => accept("online")}
        reject={() => accept("offline")}
      />

      <div className="grid gap-4 rounded-lg border border-slate-300 p-5 h-fit">
        <h2 className="text-xl font-bold">Your Booking Details</h2>
        <div className="border-b py-2">
          Location:
          <div className="font-bold">{`${hotel.name}, ${hotel.city}, ${hotel.country}`}</div>
        </div>
        <div className="flex justify-between">
          <div>
            Check-in:
            <div className="mt-1 font-bold"> {checkIn.toDateString()}</div>
            <div className=""> {formatDate(checkIn)}</div>
          </div>
          <div>
            Check-out:
            <div className="mt-1 font-bold"> {checkOut.toDateString()}</div>
            <div className=""> {formatDate(checkOut)}</div>
          </div>
        </div>
        <div className="border-t border-b py-2">
          Total length of stay:
          <div className="font-bold">{numberOfNights} nights</div>
        </div>

        <div>
          Guests:
          <div className="font-bold">
            {adultCount} adults & {childCount} children
          </div>
        </div>

        <div className="border-t border-b py-2">
          Total Price:
          <div className="font-bold text-green-600">
            {priceBodyTemplate(totalCost)}
          </div>
        </div>

        <Button
          className="mt-5 px-4 py-2 bg-blue-500 text-white flex justify-content-center rounded hover:bg-blue-700"
          ref={buttonEl}
          onClick={() => setVisible(true)}
          icon="pi pi-check"
          label={loading ? "Processing..." : "Confirm Booking"}
        />
      </div>
    </>
  );
};

export default BookingDetailsSummary;
