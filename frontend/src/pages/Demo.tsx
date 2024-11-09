import * as apiClient from "../api-client";
import React, { useState } from "react";
import { useMutation } from "react-query";

const Demo = () => {
  const [hotelId, setHotelId] = useState("66fa3e941d79fc0672fab255");
  const [roomId, setRoomId] = useState("67248ad0f93c04451f301dba");
  const [checkIn, setCheckIn] = useState("2024-11-01");
  const [checkOut, setCheckOut] = useState("2024-11-05");
  const [totalCost] = useState(1000); // Set a default value for total cost
  const [childCount] = useState(1); // Set a default value for child count
  const [adultCount] = useState(2); // Set a default value for adult count
  const [message, setMessage] = useState("");

  const mutation = useMutation(apiClient.addBooking, {
    onSuccess: (data) => {
      setMessage(`Booking successful! Booking ID: ${data._id}`);
    },
    onError: (error: any) => {
      setMessage(`Error: ${error.message || "Failed to add booking."}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Include totalCost, childCount, and adultCount in the booking data
    mutation.mutate({
      hotelId,
      roomId,
      checkIn,
      checkOut,
      totalCost,
      childCount,
      adultCount,
    });
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "1rem" }}>
      <h2>Book a Room</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Hotel ID:</label>
          <input
            type="text"
            value={hotelId}
            onChange={(e) => setHotelId(e.target.value)}
            readOnly
          />
        </div>
        <div>
          <label>Room ID:</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            readOnly
          />
        </div>
        <div>
          <label>Check-In Date:</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            readOnly
          />
        </div>
        <div>
          <label>Check-Out Date:</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            readOnly
          />
        </div>
        <button type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? "Booking..." : "Book Now"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Demo;
