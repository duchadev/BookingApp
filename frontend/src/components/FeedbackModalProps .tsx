import React from 'react';
import { Dialog } from 'primereact/dialog';
import { FeedbackType } from "../../../backend/src/shared/types"; // Adjust the path as necessary
import { Rating } from "primereact/rating";
interface FeedbackModalProps {
  visible: boolean;
  feedback: FeedbackType | null;
  onHide: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, feedback, onHide }) => {
  const footer = (
    <div>
      <button onClick={onHide} className="p-button-text">Close</button>
    </div>
  );

  return (
    <Dialog header="Feedback Details" visible={visible} footer={footer} onHide={onHide}>
      {feedback && (
        <div>
          <h4>{`${feedback.userId.firstName} ${feedback.userId.lastName}`}</h4>
          <p>Hotel: {feedback.hotelId.name}</p>
          <div className=" flex justify-content-center">
            <Rating value={feedback.rating} readOnly cancel={false} />
        </div>
          <p>Comment: {feedback.comment}</p>
        </div>
      )}
    </Dialog>
  );
};

export default FeedbackModal;
