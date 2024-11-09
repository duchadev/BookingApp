const BookingSuccessEmail = ({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) => {
  const bookingData = JSON.parse(
    localStorage.getItem("pendingBooking") || "{}"
  );
  if (!bookingData) return "<p>Booking information is missing.</p>";

  const {
    roomIds,
    totalCost,
    checkIn,
    checkOut,
    adultCount,
    childCount,
    numberOfNights,
    hotel,
    currentUser,
  } = bookingData;

  const formattedCheckIn = new Date(checkIn).toLocaleDateString();
  const formattedCheckOut = new Date(checkOut).toLocaleDateString();

  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center;">
          <h1 style="color: #4CAF50;">Payment Successful!</h1>
          <p style="font-size: 18px;">Thank you for your booking, ${
            currentUser.firstName
          } ${currentUser.lastName}.</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px;">
          <h2 style="color: #333;">Booking Details</h2>
          <p><strong>Hotel:</strong> ${hotel.name}, ${hotel.city}, ${
    hotel.country
  }</p>
          <p><strong>Number of rooms booked:</strong> ${roomIds.length}</p>
          <p><strong>Check-In:</strong> ${formattedCheckIn}</p>
          <p><strong>Check-Out:</strong> ${formattedCheckOut}</p>
          <p><strong>Adults:</strong> ${adultCount}</p>
          <p><strong>Children:</strong> ${childCount}</p>
          <p><strong>Number of Nights:</strong> ${numberOfNights}</p>
          <p><strong>Total Cost:</strong> ${totalCost.toLocaleString("en-US", {
            style: "currency",
            currency: "VND",
          })}</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px;">
          <h2 style="color: #333;">Payment Details</h2>
          <p style="font-size: 16px;">Payment Status: <strong style="color: #4CAF50;">${status}</strong></p>
          <p style="font-size: 16px;">Booking ID: <strong>${bookingId}</strong></p>
          <p style="font-size: 16px;">Date: <strong>${new Date().toLocaleDateString()}</strong></p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:5174/" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px;">View your booking</a>
        </div>

        <p style="text-align: center; font-size: 14px; color: #888; margin-top: 40px;">&copy; 2024 Hotel Haven Company. All rights reserved.</p>
      </div>
    `;
};

export default BookingSuccessEmail;
