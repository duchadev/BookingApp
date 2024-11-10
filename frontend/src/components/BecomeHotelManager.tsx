import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../api-client"; 
const BecomeHotelManager = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Replace useHistory with useNavigate

  const handleRegisterAsManager = async () => {
    setLoading(true);
    try {
      const currentUser = await fetchCurrentUser(); // Replace this with the actual user ID (e.g., from context or state)
        const userID = currentUser._id;
      const response = await fetch("/api/register-manager", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        // Optionally, redirect to another page after successful registration
        navigate("/some-other-page"); // Use navigate to redirect
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Something went wrong!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Become a Hotel Manager</h1>
      <button
        onClick={handleRegisterAsManager}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? "Registering..." : "Register to Become a Hotel Manager"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default BecomeHotelManager;
