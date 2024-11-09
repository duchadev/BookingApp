import { ConfirmPopup } from "primereact/confirmpopup";
import { HotelType, RoomType, UserType } from "../../src/shared/types";
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
  selectedRooms: RoomType[];
  currentUser?: UserType;
};

const BookingDetailsSummary = ({
  checkIn,
  checkOut,
  adultCount,
  childCount,
  numberOfNights,
  hotel,
  selectedRooms,
  currentUser,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState<boolean>(false);
  // const [bookingId, setBookingId] = useState<string>("");
  const toast = useRef<Toast>(null);
  const buttonEl = useRef(null);
  const navigate = useNavigate();
  // Tính tổng chi phí dựa trên tất cả các phòng đã chọn
  const totalCost = selectedRooms.reduce((total, room) => {
    return total + room.pricePerNight * numberOfNights;
  }, 0);

  const roomIds = selectedRooms.map((room) => room._id);

  const mutation = useMutation(apiClient.addBooking, {
    onSuccess: (res: any) => {
      const bookingId = res._id;
      console.log(res);
      localStorage.setItem(
        "bookingData",
        JSON.stringify({
          bookingId,
          checkIn,
          checkOut,
          adultCount,
          childCount,
          numberOfNights,
          totalCost,
          hotel,
          currentUser,
        })
      );
      // showToast({ message: "Room Saved!", type: "SUCCESS" });
    },
    onError: () => {
      // showToast({ message: error.message, type: "ERROR" });
    },
  });

  const accept = async (paymentMethod: "online" | "offline") => {
    if (paymentMethod === "online") {
      await handleConfirmPayment();
    } else {
      mutation.mutate({
        hotelId: hotel._id, // dùng key hotelId thay vì hotel._id
        roomIds,
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
          totalCost,
          hotel,
          currentUser,
        },
      });
    }
  };

  function formatTime(date: Date) {
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
      description: `Booking`, // bị giới hạn kí tự, nếu dài sẽ bị lỗi `Không có URL thanh toán được trả về. Vui lòng thử lại.` ở dưới
      returnUrl: `${FRONTEND_BASE_URL}`, // back home page, http://localhost:5174/
      cancelUrl: `${FRONTEND_BASE_URL}`, // back home page
      buyerName: `${currentUser?.firstName} ${currentUser?.lastName}`,
      buyerEmail: `${currentUser?.email}`,
      buyerPhone: `${currentUser?.phone}`,
      customerName: "Guest User", // phải có vì bên code của Tín folder Payos
      customerPhone: "0123456789", // phải có vì bên code của Tín folder Payos
      customerAddress: `${hotel.city}, ${hotel.country}`, // phải có vì bên code của Tín folder Payos
    };

    // Lưu booking data vào localStorage
    localStorage.setItem(
      "pendingBooking",
      JSON.stringify({
        hotelId: hotel._id,
        roomIds,
        adultCount,
        childCount,
        checkIn,
        checkOut,
        totalCost,
        status: "pending", // trạng thái ban đầu là pending
        numberOfNights,
        hotel,
        currentUser,
      })
    );

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
        acceptClassName="ml-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
        rejectClassName="px-2 py-1 text-blue-500 rounded hover:bg-gray-100"
        accept={() => accept("online")}
        reject={() => accept("offline")}
      />

      <div className="grid gap-4 rounded-lg border border-slate-300 p-5 h-fit">
        <h2 className="text-xl font-bold">Your Booking Details</h2>
        <div className="border-b py-2">
          Location:
          <div className="font-bold">{`${hotel.name}, ${hotel.city}, ${hotel.country}`}</div>
        </div>
        <div className="border-b py-2">
          Number of booked rooms:
          <div className="font-bold">{roomIds.length}</div>
        </div>
        <div className="flex justify-between">
          <div>
            Check-in:
            <div className="mt-1 font-bold"> {checkIn.toDateString()}</div>
            <div className=""> {formatTime(checkIn)}</div>
          </div>
          <div>
            Check-out:
            <div className="mt-1 font-bold"> {checkOut.toDateString()}</div>
            <div className=""> {formatTime(checkOut)}</div>
          </div>
        </div>
        <div className="border-t border-b py-2">
          Total length of stay:
          <div className="font-bold">
            {numberOfNights > 0
              ? `${numberOfNights} night${numberOfNights > 1 ? "s" : ""}`
              : "No nights"}
          </div>
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
