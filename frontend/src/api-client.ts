import { RegisterFormData } from "./pages/Register";
import { SignInFormData } from "./pages/SignIn";
import {
  BookingType,
  HotelSearchResponse,
  HotelType,
  PaymentIntentResponse,
  RoomType,
  UserType,
} from "../src/shared/types";
import axios from "axios";
const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
interface UpdateHotelStatusData {
  action: 'approve' | 'reject'; 
}
interface UpdateUserReqData {
  action: 'approve' | 'reject'; 
}
export const fetchCurrentUser = async (): Promise<UserType> => {
  const response = await fetch(`${VITE_BACKEND_BASE_URL}/api/users/me`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Error fetching user");
  }
  return response.json();
};

export const sendEmail = async (
  to: string | undefined,
  subject: string,
  html: string
) => {
  try {
    if (!to || !subject || !html) {
      throw new Error("Email parameters are missing");
    }

    const response = await fetch(`${VITE_BACKEND_BASE_URL}/api/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, subject, html }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send email. Status: ${response.status}`);
    }

    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

export const register = async (formData: RegisterFormData) => {
  try {
    const response = await fetch(
      `${VITE_BACKEND_BASE_URL}/api/users/register`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    if (!response.ok) {
      // Lấy dữ liệu lỗi từ phản hồi (nếu có)
      const errorData = await response.json();

      // Ném ra lỗi với thông tin từ phản hồi và mã trạng thái
      throw { errorData, status: response.status };
    }

    // Nếu thành công, trả về dữ liệu JSON
    return await response.json();
  } catch (error: any) {
    // Nếu lỗi là lỗi tùy chỉnh từ phía trên, ném lại lỗi với chi tiết
    if (error.errorData && error.status) {
      throw {
        message: error.errorData.message[0].msg,
        errorData: error.errorData.message,
        status: error.status,
      };
    }

    // Ném lỗi chung nếu lỗi không phải là từ response
    throw new Error(error.message || "An unknown error occurred");
  }
};

export const signIn = async (formData: SignInFormData) => {
  const response = await fetch(`${VITE_BACKEND_BASE_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message);
  }
  return body;
};

export const validateToken = async () => {
  const response = await fetch(
    `${VITE_BACKEND_BASE_URL}/api/auth/validate-token`,
    {
      credentials: "include",
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Token invalid");
  }
  return response.json();
};

export const signOut = async () => {
  const response = await fetch(`${VITE_BACKEND_BASE_URL}/api/auth/logout`, {
    credentials: "include",
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Error during sign out");
  }
};

export const addMyHotel = async (hotelFormData: FormData) => {
  const response = await fetch(`${VITE_BACKEND_BASE_URL}/api/hotels`, {
    method: "POST",
    credentials: "include",
    body: hotelFormData,
  });

  if (!response.ok) {
    throw new Error("Failed to add hotel");
  }

  return response.json();
};

export const deleteHotel = async (hotelId: string) => {
  try {
    const response = await axios.delete(
      `${VITE_BACKEND_BASE_URL}/api/hotels/${hotelId}`,
      {
        withCredentials: true, // Include credentials (cookies or tokens), giống credentials: "include" bên fetch API thông thường
      }
    );
    return response.data; // hoặc tùy thuộc vào cấu trúc dữ liệu trả về
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error deleting hotel");
  }
};

// export const fetchMyHotels = async (): Promise<HotelType[]> => {
export const fetchMyHotelsByUserId = async () => {
  const response = await fetch(`${VITE_BACKEND_BASE_URL}/api/hotels/users`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }

  return response.json();
};

export const fetchMyHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await fetch(
    `${VITE_BACKEND_BASE_URL}/api/hotels/${hotelId}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Error fetching Hotels");
  }

  return response.json();
};

export const updateMyHotelById = async (hotelFormData: FormData) => {
  const response = await fetch(
    `${VITE_BACKEND_BASE_URL}/api/hotels/${hotelFormData.get("hotelId")}`,
    {
      method: "PUT",
      body: hotelFormData,
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update Hotel");
  }

  return response.json();
};

export const addRoom = async (roomFormData: FormData) => {
  try {
    const response = await fetch(`${VITE_BACKEND_BASE_URL}/api/rooms`, {
      method: "POST",
      credentials: "include",
      body: roomFormData,
    });

    // Kiểm tra nếu phản hồi không thành công
    if (!response.ok) {
      // Lấy thông tin lỗi từ phản hồi JSON
      const errorData = await response.json();
      throw new Error(
        `Failed to add Room: ${response.status} - ${
          errorData.message || errorData.error || "Unknown error"
        }`
      );
    }

    // Trả về phản hồi JSON nếu thành công
    return response.json();
  } catch (error: any) {
    // Ném ra lỗi với thông tin cụ thể
    throw new Error(error.message || "An unknown error occurred");
  }
};

export const fetchRoomsByHotelId = async (hotelId: string) => {
  const response = await fetch(
    `${VITE_BACKEND_BASE_URL}/api/rooms?hotelId=${hotelId}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Error fetching Room");
  }

  return response.json();
};

export const fetchRoomById = async (roomId: string): Promise<RoomType> => {
  const response = await fetch(`${VITE_BACKEND_BASE_URL}/api/rooms/${roomId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching Room");
  }

  return response.json();
};

export const updateRoomById = async (roomFormData: FormData) => {
  try {
    const response = await fetch(
      `${VITE_BACKEND_BASE_URL}/api/rooms/${roomFormData.get("roomId")}`,
      {
        method: "PUT",
        body: roomFormData,
        credentials: "include", // cho phép các yêu cầu HTTP bao gồm cookies, session token hoặc bất kỳ thông tin xác thực nào khác khi yêu cầu được gửi tới API. Cụ thể:
        // Giá trị "include": Buộc phải đính kèm thông tin xác thực (như cookies) trong mọi yêu cầu, bất kể nguồn gốc của tài nguyên được yêu cầu (cùng nguồn hoặc khác nguồn).
        // Cần thiết khi: API yêu cầu thông tin xác thực để nhận dạng người dùng hoặc quản lý phiên làm việc.
      }
    );

    // Kiểm tra nếu phản hồi không thành công
    if (!response.ok) {
      // Lấy thông tin lỗi từ phản hồi JSON
      const errorData = await response.json();
      throw new Error(
        `Failed to update Room: ${response.status} - ${
          errorData.message || errorData.error || "Unknown error"
        }`
      );
    }

    // Trả về phản hồi JSON nếu thành công
    return response.json();
  } catch (error: any) {
    // Ném ra lỗi với thông tin cụ thể
    throw new Error(error.message || "An unknown error occurred");
  }
};

export const deleteRoomById = async (roomId?: string | null) => {
  const response = await fetch(`${VITE_BACKEND_BASE_URL}/api/rooms/${roomId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete room");
  }

  return response.json();
};

// Define the delete API call for booking
export const deleteBookingById = async (bookingId: string) => {
  try {
    const response = await fetch(
      `${VITE_BACKEND_BASE_URL}/api/bookings/${bookingId}`,
      {
        method: "DELETE",
        credentials: "include", // Include credentials if required for authentication
      }
    );

    // Check if the response is unsuccessful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to delete booking: ${response.status} - ${
          errorData.message || errorData.error || "Unknown error"
        }`
      );
    }

    return response.json();
  } catch (error: any) {
    throw new Error(error.message || "An unknown error occurred");
  }
};

export const getBookingById = async (bookingId: string) => {
  try {
    const response = await fetch(
      `${VITE_BACKEND_BASE_URL}/api/bookings/${bookingId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    // Kiểm tra nếu phản hồi không thành công
    if (!response.ok) {
      // Lấy thông tin lỗi từ phản hồi JSON
      const errorData = await response.json();
      throw new Error(
        `Failed to fetch Booking: ${response.status} - ${
          errorData.message || errorData.error || "Unknown error"
        }`
      );
    }

    // Trả về phản hồi JSON nếu thành công
    return response.json();
  } catch (error: any) {
    // Ném ra lỗi với thông tin cụ thể
    throw new Error(error.message || "An unknown error occurred");
  }
};

export const deleteRoomsByType = async (roomType: string) => {
  const response = await fetch(
    `${VITE_BACKEND_BASE_URL}/api/rooms/type/${roomType}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete room");
  }

  return response.json();
};

export type SearchParams = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adultCount?: string;
  childCount?: string;
  page?: string;
  facilities?: string[];
  types?: string[];
  stars?: string[];
  maxPrice?: string;
  sortOption?: string;
};

export const searchHotels = async (
  searchParams: SearchParams
): Promise<HotelSearchResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append("destination", searchParams.destination || "");
  queryParams.append("checkIn", searchParams.checkIn || "");
  queryParams.append("checkOut", searchParams.checkOut || "");
  queryParams.append("adultCount", searchParams.adultCount || "");
  queryParams.append("childCount", searchParams.childCount || "");
  queryParams.append("page", searchParams.page || "");

  queryParams.append("maxPrice", searchParams.maxPrice || "");
  queryParams.append("sortOption", searchParams.sortOption || "");

  searchParams.facilities?.forEach((facility) =>
    queryParams.append("facilities", facility)
  );

  searchParams.types?.forEach((type) => queryParams.append("types", type));
  searchParams.stars?.forEach((star) => queryParams.append("stars", star));

  const response = await fetch(
    `${VITE_BACKEND_BASE_URL}/api/hotels/search?${queryParams}`
  );

  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }

  return response.json();
};

export const fetchHotels = async (): Promise<HotelType[]> => {
  const response = await fetch(`${VITE_BACKEND_BASE_URL}/api/hotels`);
  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }
  return response.json();
};

export const fetchHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await fetch(
    `${VITE_BACKEND_BASE_URL}/api/hotels/${hotelId}`
  );
  if (!response.ok) {
    throw new Error("Error fetching Hotels");
  }

  return response.json();
};

export const createPaymentIntent = async (
  hotelId: string,
  numberOfNights: string
): Promise<PaymentIntentResponse> => {
  const response = await fetch(
    `${VITE_BACKEND_BASE_URL}/api/hotels/${hotelId}/bookings/payment-intent`,
    {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({ numberOfNights }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error fetching payment intent");
  }

  return response.json();
};

export const fetchMyBookings = async (): Promise<BookingType[]> => {
  // userId có trong request bên frontend lẫn backend rồi
  const response = await fetch(
    `${VITE_BACKEND_BASE_URL}/api/bookings/my-bookings`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Unable to fetch bookings");
  }

  return response.json();
};

export const fetchFeedbacks = async () => {
  const response = await fetch(
    `${VITE_BACKEND_BASE_URL}/api/feedback/feedback`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch feedback");
  }
  return response.json();
};
// api-client.js
export const submitFeedback = async (feedbackData: any) => {
  const response = await fetch(`${VITE_BACKEND_BASE_URL}/api/feedback/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(feedbackData),
  });

  if (!response.ok) {
    // Lấy dữ liệu lỗi từ phản hồi (nếu có)
    const errorData = await response.json();

    // Ném ra lỗi với thông tin từ phản hồi và mã trạng thái
    throw { errorData, status: response.status };
  }

  return response.json(); // Return the response data
};

export const fetchFeedbackByHotel = async (hotelId?: string) => {
  try {
    const response = await fetch(
      `${VITE_BACKEND_BASE_URL}/api/feedback/get/${hotelId}`
    );

    if (!response.ok) {
      // Lấy dữ liệu lỗi từ phản hồi (nếu có)
      const errorData = await response.json();

      // Ném ra lỗi với thông tin từ phản hồi và mã trạng thái
      throw { errorData, status: response.status };
    }

    // Trả về phản hồi JSON nếu thành công
    return await response.json();
  } catch (error: any) {
    // Nếu lỗi là lỗi tùy chỉnh từ phía trên, ném lại lỗi với chi tiết
    if (error.errorData && error.status) {
      throw {
        message: "Failed to fetch feedback",
        errorData: error.errorData,
        status: error.status,
      };
    }

    // Ném lỗi chung nếu lỗi không phải là từ response
    throw new Error(error.message || "An unknown error occurred");
  }
};
export const fetchTop5Feedback = async (hotelId?: string) => {
  try {
    const response = await fetch(
      `${VITE_BACKEND_BASE_URL}/api/feedback/top-feedback/${hotelId}`
    );

    if (!response.ok) {
      // Lấy dữ liệu lỗi từ phản hồi (nếu có)
      const errorData = await response.json();

      // Ném ra lỗi với thông tin từ phản hồi và mã trạng thái
      throw { errorData, status: response.status };
    }

    // Nếu thành công, trả về dữ liệu JSON
    return await response.json();
  } catch (error: any) {
    // Nếu lỗi là lỗi tùy chỉnh từ phía trên, ném lại lỗi với chi tiết
    if (error.errorData && error.status) {
      throw {
        message: "Failed to fetch feedback",
        errorData: error.errorData,
        status: error.status,
      };
    }

    // Ném lỗi chung nếu lỗi không phải là từ response
    throw new Error(error.message || "An unknown error occurred");
  }
};

export const addBooking = async (bookingData: any) => {
  try {
    console.log("bookingData: ", bookingData);
    const response = await fetch(`${VITE_BACKEND_BASE_URL}/api/bookings`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      // Lấy dữ liệu lỗi từ phản hồi (nếu có)
      const errorData = await response.json();

      // Ném ra lỗi với thông tin từ phản hồi và mã trạng thái
      throw { errorData, status: response.status };
    }
    const res = await response.json();
    console.log("res: ", res);
    // Nếu thành công, trả về dữ liệu JSON
    return res;
  } catch (error: any) {
    // Nếu lỗi là lỗi tùy chỉnh từ phía trên, ném lại lỗi với chi tiết
    if (error.errorData && error.status) {
      throw {
        message: "Failed to add booking",
        errorData: error.errorData,
        status: error.status,
      };
    }

    // Ném lỗi chung nếu lỗi không phải là từ response
    throw new Error(error.message || "An unknown error occurred");
  }
};
export const fetchBookings = async () => {
  const response = await fetch(`${VITE_BACKEND_BASE_URL}/api/bookings`, {
      credentials: "include",
  });
  if (!response.ok) {
      throw new Error("Error fetching bookings");
  }
  return response.json();  
};
export const fetchUsers = async () => {
  const response = await fetch(`${VITE_BACKEND_BASE_URL}/api/admin/users`);
  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }
  return response.json();
};

export const getHotels = async (verifyStatus?: string) => {
  const url = verifyStatus 
    ? `${VITE_BACKEND_BASE_URL}/api/admin/verify?verify=${verifyStatus}` 
    : `${VITE_BACKEND_BASE_URL}/api/admin/verify`;

  const response = await fetch(url, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch hotels");
  }

  const data = await response.json();
  console.log("Fetched Hotels:", data); // Debugging response structure
  return data;
};
// Make sure this function exists in api-client.js
export const updateHotelStatus = async (hotelId: string, data: UpdateHotelStatusData) => {
  const response = await fetch(`${VITE_BACKEND_BASE_URL}/api/admin/${hotelId}/verify`, {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include' // This ensures cookies are sent with the request
  });

  // Log the response status and body for debugging
  console.log("Response status:", response.status);
  
  // Attempt to parse the response as JSON
  let responseData;
  try {
      responseData = await response.json();
      console.log("Response data:", responseData);
  } catch (err) {
      console.error("Failed to parse JSON response", err);
      throw new Error('Failed to parse response data');
  }

  // Check if the response is okay
  if (!response.ok) {
      throw new Error(`Failed to update hotel status: ${responseData.message || response.statusText}`);
  }

  return responseData; // Return the parsed response data if needed
};
export const getUserReqs = async (verifyStatus?: string) => {
  const url = verifyStatus 
    ? `${VITE_BACKEND_BASE_URL}/api/admin/verifyUserRequest?verify=${verifyStatus}` 
    : `${VITE_BACKEND_BASE_URL}/api/admin/verifyUserRequest`;

  const response = await fetch(url, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users' requests");
  }

  const data = await response.json();
  console.log("Fetched User Request:", data); // Debugging response structure
  return data;
};
export const updateUserRole = async (userId: string, data: UpdateUserReqData) => {
  const response = await fetch(`${VITE_BACKEND_BASE_URL}/api/admin/${userId}/verifyUserRequest`, {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include' // This ensures cookies are sent with the request
  });

  // Log the response status and body for debugging
  console.log("Response status:", response.status);
  
  // Attempt to parse the response as JSON
  let responseData;
  try {
      responseData = await response.json();
      console.log("Response data:", responseData);
  } catch (err) {
      console.error("Failed to parse JSON response", err);
      throw new Error('Failed to parse response data');
  }

  // Check if the response is okay
  if (!response.ok) {
      throw new Error(`Failed to update user role: ${responseData.message || response.statusText}`);
  }

  return responseData; // Return the parsed response data if needed
};
export const requestPasswordReset = async (data: { email: string }) => {
  const response = await axios.post(
    `${VITE_BACKEND_BASE_URL}/api/users/forgot-password`,
    data
  );
  return response.data;
};
export const resetPassword = async (data: {
  token: string;
  newPassword: string;
}) => {
  const response = await axios.post(
    `${VITE_BACKEND_BASE_URL}/api/users/reset-password`,
    data
  );
  return response.data;
};
