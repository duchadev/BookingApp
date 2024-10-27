import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Rating } from "primereact/rating";
import * as apiClient from "../api-client";
import { useQuery, useMutation } from "react-query";
import { useNavigate } from "react-router-dom"; // Assuming you're using react-router-dom for navigation
import { HotelType } from "../../../backend/src/shared/types";

const FeedbackComponent = ({ hotel }: { hotel: HotelType }) => {
  const [visible, setVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [value, setValue] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const navigate = useNavigate(); // To navigate to the login page

  const { data: currentUser } = useQuery(
    "fetchCurrentUser",
    apiClient.fetchCurrentUser
  );

  // Mutation to handle feedback submission
  const mutation = useMutation(apiClient.submitFeedback, {
    onMutate: () => {
      setIsSubmitting(true); // Set loading state
      setErrorMessage(""); // Clear any previous error message
    },
    onSuccess: () => {
      setVisible(false);
      setFeedback("");
      setValue(undefined);
      setBookingId("");
      setIsSubmitting(false);
    },
    onError: (error: unknown) => {
      console.error("Error submitting feedback:", error);

      // Capture error message from the response (assuming the error is from API)
      if (error?.errorData?.error) {
        setErrorMessage(error?.errorData?.error); // Display API error
      } else {
        setErrorMessage("Invalid BookingID or Wrong Hotel"); // Generic error message
      }

      setIsSubmitting(false);
    },
  });

  const showModal = () => {
    setVisible(true);
  };

  const handleSubmit = () => {
    // Prepare feedback data to send
    const feedbackData = {
      hotelId: hotel._id,
      bookingId,
      rating: value,
      comment: feedback,
      userId: currentUser ? currentUser._id : null, // Assuming user ID is fetched
    };

    // Call the mutation to submit the feedback
    mutation.mutate(feedbackData);
  };

  const handleLoginRedirect = () => {
    navigate("/sign-in"); // Redirect to login page
  };

  const footer = (
    <div
      className="flex flex-row justify-content-end gap-3"
      style={{ justifyContent: "right" }}
    >
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setVisible(false)}
        className="p-button-text"
      />
      <Button
        label="Submit"
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={isSubmitting}
      />
    </div>
  );

  return (
    <div className="flex justify-content-center">
      {currentUser ? (
        <Button
          label="Write a feedback"
          severity="secondary"
          onClick={showModal}
        />
      ) : (
        <Button label="Login to Feedback" onClick={handleLoginRedirect} />
      )}

      <Dialog
        header="User Feedback"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={() => setVisible(false)}
      >
        <div className="flex flex-column gap-2 mt-1">
          <label htmlFor="hotel">Booking ID:</label>
          <InputText
            id="hotel"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
          />
          <label htmlFor="feedback">Please provide your feedback:</label>
          <InputTextarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
          />
        </div>
        <div className=" flex justify-content-center mt-2">
          <Rating
            value={value}
            onChange={(e) => setValue(e.value === null ? undefined : e.value)}
            cancel={false}
          />
        </div>

        {/* Display the error message */}
        {errorMessage && (
          <div
            className="error-message"
            style={{ color: "red", marginTop: "10px" }}
          >
            {errorMessage}
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default FeedbackComponent;
