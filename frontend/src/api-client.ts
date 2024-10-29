import { RegisterFormData } from "./pages/Register";
import { SignInFormData } from "./pages/SignIn";
import axios from 'axios';
import {
  HotelSearchResponse,
  HotelType,
  PaymentIntentResponse,
  RoomType,
  UserType,
} from "../../backend/src/shared/types";
import { BookingFormData } from "./forms/BookingForm/BookingForm";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
interface UpdateHotelStatusData {
  action: 'approve' | 'reject'; // Restrict action to only 'approve' or 'reject'
}
export const fetchCurrentUser = async (): Promise<UserType> => {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Error fetching user");
  }
  return response.json();
};

export const register = async (formData: RegisterFormData) => {
  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(responseBody.message);
  }
};

export const signIn = async (formData: SignInFormData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
  const response = await fetch(`${API_BASE_URL}/api/auth/validate-token`, {
    credentials: "include",
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Token invalid");
  }
  return response.json();
};

export const signOut = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    credentials: "include",
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Error during sign out");
  }
};

export const addMyHotel = async (hotelFormData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/hotels`, {
    method: "POST",
    credentials: "include",
    body: hotelFormData,
  });

  if (!response.ok) {
    throw new Error("Failed to add hotel");
  }

  return response.json();
};

// export const fetchMyHotels = async (): Promise<HotelType[]> => {
export const fetchMyHotelsByUserId = async () => {
  const response = await fetch(`${API_BASE_URL}/api/hotels/users`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }

  return response.json();
};

export const fetchMyHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await fetch(`${API_BASE_URL}/api/hotels/${hotelId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching Hotels");
  }

  return response.json();
};

export const updateMyHotelById = async (hotelFormData: FormData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/hotels/${hotelFormData.get("hotelId")}`,
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
  // const response = await fetch(`${API_BASE_URL}/api/rooms`, {
  //   method: "POST",
  //   credentials: "include",
  //   body: roomFormData,
  // });

  // if (!response.ok) {
  //   throw new Error("Failed to add room");
  // }

  // return response.json();

  // --------
  try {
    const response = await fetch(`${API_BASE_URL}/api/rooms`, {
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

export const fetchRoomsByHotelId = async (
  hotelId: string
): Promise<RoomType> => {
  const response = await fetch(`${API_BASE_URL}/api/rooms?hotelId=${hotelId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching Room");
  }

  return response.json();
};

export const fetchRoomById = async (roomId: string): Promise<RoomType> => {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
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
      `${API_BASE_URL}/api/rooms/${roomFormData.get("roomId")}`,
      {
        method: "PUT",
        body: roomFormData,
        credentials: "include",
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

export const deleteRoomById = async (roomId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
    method: "DELETE",
    credentials: "include",
  });

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
    `${API_BASE_URL}/api/hotels/search?${queryParams}`
  );

  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }

  return response.json();
};

export const fetchHotels = async (): Promise<HotelType[]> => {
  const response = await fetch(`http://localhost:7000/api/hotels`);
  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }
  return response.json();
};

export const fetchHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await fetch(`${API_BASE_URL}/api/hotels/${hotelId}`);
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
    `${API_BASE_URL}/api/hotels/${hotelId}/bookings/payment-intent`,
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

export const createRoomBooking = async (formData: BookingFormData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/hotels/${formData.hotelId}/bookings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    }
  );

  if (!response.ok) {
    throw new Error("Error booking room");
  }
};

export const fetchMyBookings = async (): Promise<HotelType[]> => {
  const response = await fetch(`${API_BASE_URL}/api/my-bookings`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to fetch bookings");
  }

  return response.json();
};
export const fetchFeedbacks = async () => {
  const response = await fetch(`${API_BASE_URL}/api/feedback/feedback`);
  if (!response.ok) {
    throw new Error("Failed to fetch feedback");
  }
  console.log(response);
  return response.json();
};
// api-client.js
export const submitFeedback = async (feedbackData: any) => {
  const response = await fetch(`${API_BASE_URL}/api/feedback/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(feedbackData),
  });

  if (!response.ok) {
    throw new Error("Error submitting feedback");
  }

  return response.json(); // Return the response data
};

export const fetchFeedbackByHotel = async (hotelId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/feedback/get/${hotelId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch feedback");
  }
  console.log(response);
  return response.json();
};
export const fetchTop5Feedback = async (hotelId: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/feedback/top-feedback/${hotelId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch feedback");
  }
  console.log(response);
  return response.json();
};
export const fetchBookings = async () => {
  const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      credentials: "include",
  });
  if (!response.ok) {
      throw new Error("Error fetching bookings");
  }
  return response.json();  
};

export const getHotels = async (verifyStatus?: string) => {
  const url = verifyStatus 
    ? `${API_BASE_URL}/api/admin/verify?verify=${verifyStatus}` 
    : `${API_BASE_URL}/api/admin/verify`;

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
  const response = await fetch(`${API_BASE_URL}/api/admin/${hotelId}/verify`, {
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

