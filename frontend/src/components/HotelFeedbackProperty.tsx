import React, { useState, useEffect } from "react";
import { Carousel, CarouselResponsiveOption } from "primereact/carousel";
import { FeedbackType } from "../../src/shared/types"; // Import the FeedbackType
import { fetchFeedbackByHotel, fetchTop5Feedback } from "../api-client";
import "../assets/css/featuredProperties.css";
import { Rating } from "primereact/rating";
import { Avatar } from "primereact/avatar"; // Import Avatar component for user profile picture
import { ProgressSpinner } from "primereact/progressspinner"; // Spinner for loading state

const HotelFeedBackProperty: React.FC<{ hotelId?: string }> = ({ hotelId }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch feedback data when component mounts or hotelId changes
  useEffect(() => {
    const getFeedbacks = async () => {
      try {
        setLoading(true);
        let data;

        try {
          // Gọi API đầu tiên để lấy top 5 feedbacks
          data = await fetchTop5Feedback(hotelId);
        } catch (error: any) {
          console.log(error);
          // Kiểm tra nếu lỗi là 404, tiếp tục gọi API thứ hai
          if (error.status === 404) {
            data = await fetchFeedbackByHotel(hotelId); // Gọi API dự phòng nếu không có feedbacks
          } else {
            throw error; // Nếu lỗi khác, ném lỗi
          }
        }

        setFeedbacks(data); // Cập nhật feedbacks với kết quả từ API
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getFeedbacks();
  }, []);

  // Update responsive options to reflect showing 1 item
  const responsiveOptions: CarouselResponsiveOption[] = [
    { breakpoint: "1400px", numVisible: 1, numScroll: 1 },
    { breakpoint: "1199px", numVisible: 1, numScroll: 1 },
    { breakpoint: "767px", numVisible: 1, numScroll: 1 },
    { breakpoint: "575px", numVisible: 1, numScroll: 1 },
  ];

  const feedbackTemplate = (feedback: FeedbackType) => {
    return (
      <div className="feedback-container h-full p-3 border rounded-lg">
        <div className="header flex justify-between items-center">
          <div className="left">
            <h4 className="text-xl font-bold">Exceptional</h4>
            <span className="text-sm text-gray-500">{`${feedbacks.length} reviews`}</span>
          </div>
          <div className="rating-box text-center">
            <span className="rating-score text-white bg-blue-500 font-bold p-2 rounded">
              {feedback.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="comment-section mt-4 text-center italic">
          <p>"{feedback.comment}"</p>
        </div>

        <div className="user-info flex items-center mt-4">
          <Avatar
            className="mr-3"
            image={`https://ui-avatars.com/api/?name=${feedback.userId.firstName} ${feedback.userId.lastName}&background=random`} // Assuming avatar is available
            size="large"
            shape="circle"
          />
          <div>
            <h5 className="font-bold">
              {feedback.userId.firstName} {feedback.userId.lastName}
            </h5>
            <span className="text-sm text-gray-600 inline-flex items-center">
              Vietnam
              <img
                src="https://flagsapi.com/VN/flat/16.png"
                alt="Vietnam flag"
                className="ml-1"
              />
            </span>
          </div>
        </div>

        <div className="badge-section mt-6 p-4 bg-gray-100 text-center rounded-lg">
          <span className="text-gray-600 font-semibold">
            Top-rated beach nearby
          </span>
          <span className="ml-3 bg-blue-100font-bold p-2 rounded">
            <Rating
              className="justify-center"
              value={feedback.rating}
              readOnly
              cancel={false}
            />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="hotel-feedback-property">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <ProgressSpinner />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="no-feedback-message text-center p-4">
          <h4 className="text-xl font-bold">No Feedback Available</h4>
          <p>This hotel has not been reviewed by any users yet.</p>
        </div>
      ) : (
        <Carousel
          value={feedbacks}
          numVisible={1}
          numScroll={1}
          orientation="vertical"
          responsiveOptions={responsiveOptions}
          verticalViewPortHeight="400px" // Adjusted height for better layout
          itemTemplate={feedbackTemplate}
          // circular
        />
      )}
    </div>
  );
};

export default HotelFeedBackProperty;
