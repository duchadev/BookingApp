import React, { useState, useEffect } from 'react';
import { Carousel, CarouselResponsiveOption } from "primereact/carousel";
import { FeedbackType } from "../../../backend/src/shared/types"; // Import the FeedbackType
import FeedbackModal from './FeedbackModalProps'; // Fix the import path
import "../assets/css/featuredProperties.css";
import { Rating } from "primereact/rating";
import { fetchFeedbackByHotel } from '../api-client'; 

interface FeedbackProps {
  hotelId: string;
}

const FeedbackProperties: React.FC<FeedbackProps> = ({ hotelId }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);  // Initialize 'visible' state
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType | null>(null);  // Initialize 'selectedFeedback' state

  // Fetch feedback data when component mounts or hotelId changes
  useEffect(() => {
    const getFeedbacks = async () => {
      try {
        setLoading(true);
        const data = await fetchFeedbackByHotel(hotelId);
        setFeedbacks(data); // Update state with the fetched feedbacks
      } catch (error) {
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    getFeedbacks();
  }, [hotelId]);

  const responsiveOptions: CarouselResponsiveOption[] = [
    { breakpoint: "1400px", numVisible: 4, numScroll: 1 },
    { breakpoint: "1199px", numVisible: 3, numScroll: 1 },
    { breakpoint: "767px", numVisible: 2, numScroll: 1 },
    { breakpoint: "575px", numVisible: 1, numScroll: 1 },
  ];

  const feedbackTemplate = (feedback: FeedbackType) => {
    return (
      <div
        key={feedback._id}
        className="relative cursor-pointer overflow-hidden rounded-md"
        onClick={() => {
          setSelectedFeedback(feedback); // Set the selected feedback
          setVisible(true); // Show the modal
        }}
      >
        <div className="fpItem mr-4">
          <span className="fpName">{`${feedback.userId.firstName} ${feedback.userId.lastName}`}</span>
          <span className="fpCity">{feedback.hotelId.name}</span>
          <div className="flex justify-content-start">
            <Rating value={feedback.rating} readOnly cancel={false} />
          </div>
          <p className="fpComment">{feedback.comment}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      {loading ? (
        <div>Loading feedback...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        feedbacks && feedbacks.length > 0 && (
          <Carousel
            value={feedbacks}
            numVisible={4}
            numScroll={3}
            responsiveOptions={responsiveOptions}
            itemTemplate={feedbackTemplate}
            className="custom-carousel"
            circular
            autoplayInterval={3000}
          />
        )
      )}
   
    </>
  );
};

export default FeedbackProperties;
