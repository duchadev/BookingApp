const BookingSuccessEmail = ({
  status,
  orderCode,
}: {
  status: string;
  orderCode: string | null;
}) => {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center;">
          <h1 style="color: #4CAF50;">Payment Successful!</h1>
          <p style="font-size: 18px;">Thank you for completing your transaction.</p>
        </div>
  
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px;">
          <h2 style="color: #333;">Your Payment Details:</h2>
          <p style="font-size: 16px;">Payment Status: <strong style="color: #4CAF50;">${status}</strong></p>
          <p style="font-size: 16px;">Transaction ID: <strong>${orderCode}</strong></p>
          <p style="font-size: 16px;">Date: <strong>${new Date().toLocaleDateString()}</strong></p>
        </div>
  
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://yourwebsite.com" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px;">View your order</a>
        </div>
  
        <p style="text-align: center; font-size: 14px; color: #888; margin-top: 40px;">&copy; 2024 Your Company Name. All rights reserved.</p>
      </div>
    `;
};

export default BookingSuccessEmail;
