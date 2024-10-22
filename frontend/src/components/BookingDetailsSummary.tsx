import { HotelType } from "../../../backend/src/shared/types";
import { useState } from "react";

type Props = {
  checkIn: Date;
  checkOut: Date;
  adultCount: number;
  childCount: number;
  numberOfNights: number;
  hotel: HotelType;
  pricePerNight: number;
};

const BookingDetailsSummary = ({
  checkIn,
  checkOut,
  adultCount,
  childCount,
  numberOfNights,
  pricePerNight,
  hotel,
}: Props) => {
  const [loading, setLoading] = useState(false);

  // Hàm xử lý sự kiện nhấn nút "Xác nhận thanh toán"
  const handleConfirmPayment = async () => {
    setLoading(true);
    const Random = () => Math.floor(Math.random() * 1000000);
    const url = "https://payos-deploy.onrender.com/create-payment-link";
    const payload = {
      orderCode: Random(),
      amount: 5000,
      description: `Thanh toán `,
      returnUrl: "http://localhost:5174/?status=PAID",
      cancelUrl: "http://localhost:5174/?status=CANCELLED",
      customerName: "Guest User",
      customerPhone: "0123456789",
      customerAddress: `${hotel.city}, ${hotel.country}`,
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
      console.log("Response Data: ", data);

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
    <div className="grid gap-4 rounded-lg border border-slate-300 p-5 h-fit">
      <h2 className="text-xl font-bold">Your Booking Details</h2>
      <div className="border-b py-2">
        Location:
        <div className="font-bold">{`${hotel.name}, ${hotel.city}, ${hotel.country}`}</div>
      </div>
      <div className="flex justify-between">
        <div>
          Check-in
          <div className="font-bold"> {checkIn.toDateString()}</div>
        </div>
        <div>
          Check-out
          <div className="font-bold"> {checkOut.toDateString()}</div>
        </div>
      </div>
      <div className="border-t border-b py-2">
        Total length of stay:
        <div className="font-bold">{numberOfNights} nights</div>
      </div>

      <div>
        Guests{" "}
        <div className="font-bold">
          {adultCount} adults & {childCount} children
        </div>
      </div>

      <div className="border-t border-b py-2">
        Total Price:
        <div className="font-bold text-green-600">
          {pricePerNight * numberOfNights} VND
        </div>
      </div>

      <button
        className="mt-5 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        onClick={handleConfirmPayment}
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
      </button>
    </div>
  );
};

export default BookingDetailsSummary;
