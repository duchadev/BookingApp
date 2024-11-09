// components/OrderCancellationEmail.js
const BookingCancellationEmail = ({
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

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <div style="text-align: center;">
        <h1 style="color: #e74c3c;">Booking Cancelled</h1>
        <p style="font-size: 18px;">We are sorry to inform you that your booking has been cancelled.</p>
      </div>

      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px;">
        <h2 style="color: #333;">Booking Details:</h2>
        <p style="font-size: 16px;">Booking Status: <strong style="color: #e74c3c;">${status}</strong></p>
        <p style="font-size: 16px;">Booking ID: <strong>${bookingId}</strong></p>
        <p style="font-size: 16px;">Cancellation Date: <strong>${new Date().toLocaleDateString()}</strong></p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="https://yourwebsite.com/contact-support" style="text-decoration: none; background-color: #e74c3c; color: white; padding: 10px 20px; border-radius: 5px;">Contact Support</a>
      </div>

      <p style="text-align: center; font-size: 14px; color: #888; margin-top: 40px;">&copy; 2024 Your Company Name. All rights reserved.</p>
    </div>
  `;
};

export default BookingCancellationEmail;
