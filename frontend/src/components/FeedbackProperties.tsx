import React, { useState } from 'react';
import { Carousel, CarouselResponsiveOption } from "primereact/carousel";
import { FeedbackType } from "../../../backend/src/shared/types"; // Import the FeedbackType
import FeedbackModal from './FeedbackModalProps '; // Import the FeedbackModal component
import "../assets/css/featuredProperties.css";
import { Rating } from "primereact/rating";
interface FeedbackProps {
  feedbacks: FeedbackType[] | undefined; // Expect feedback data
}

const FeedbackProperties: React.FC<FeedbackProps> = ({ feedbacks }) => {
  const [visible, setVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType | null>(null);

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
          setSelectedFeedback(feedback);
          setVisible(true); // Show the modal
        }}
      >
        <div className="fpItem mr-4">
          <span className="fpName">{`${feedback.userId.firstName} ${feedback.userId.lastName}`}</span>
          <span className="fpCity">{feedback.hotelId.name}</span>
          <div className="card flex justify-content-center">
            <Rating value={feedback.rating} readOnly cancel={false} />
          </div>
          <p className="fpComment">{feedback.comment}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      {feedbacks && (
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
      )}
      <FeedbackModal visible={visible} feedback={selectedFeedback} onHide={() => setVisible(false)} />
    </>
  );
};

export default FeedbackProperties;
