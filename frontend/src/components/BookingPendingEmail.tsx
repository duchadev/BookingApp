const BookingPendingEmail = ({
  orderCode,
  checkInDate,
  checkOutDate,
  totalAmount,
}: {
  orderCode: string;
  checkInDate: Date;
  checkOutDate: Date;
  totalAmount: string | null;
}) => {
  return `
     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <div style="text-align: center;">
        <h1 style="color: #e7b73c;">Payment Reminder</h1>
        <p style="font-size: 18px;">Thank you for your booking!</p>
    </div>

    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px;">
        <h2 style="color: #333;">Booking Details:</h2>
        <p style="font-size: 16px;">Booking Status: <strong style="color: #2ecc71;">Confirmed</strong></p>
        <p style="font-size: 16px;">Booking ID: <strong>${orderCode}</strong></p>
        <p style="font-size: 16px;">Check-in Date: <strong>${checkInDate}</strong></p>
        <p style="font-size: 16px;">Check-out Date: <strong>${checkOutDate}</strong></p>
        <p style="font-size: 16px;">Total Amount Due: <strong>${totalAmount}</strong></p>
        <p style="font-size: 16px;">Payment Method: <strong style="color: #e74c3c;">Direct Payment at Hotel</strong></p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
        <p style="font-size: 16px;">Please remember to bring your booking confirmation and pay the total amount directly at the hotel during check-in.</p>
        <a href="https://yourwebsite.com/contact-support" style="text-decoration: none; background-color: #e74c3c; color: white; padding: 10px 20px; border-radius: 5px;">Contact Support</a>
    </div>

    <p style="text-align: center; font-size: 14px; color: #888; margin-top: 40px;">&copy; 2024 Your Company Name. All rights reserved.</p>
</div>

    `;
};

export default BookingPendingEmail;
