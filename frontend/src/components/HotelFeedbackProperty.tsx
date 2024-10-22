import React, { useState,useEffect } from 'react';
import { Carousel, CarouselResponsiveOption } from "primereact/carousel";
import { FeedbackType } from "../../../backend/src/shared/types"; // Import the FeedbackType
import { fetchTop5Feedback } from '../api-client'; 
import "../assets/css/featuredProperties.css";
import { Rating } from "primereact/rating";
const HotelFeedBackProperty: React.FC<{ hotelId: string }> = ({ hotelId }) => {
    const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch feedback data when component mounts or hotelId changes
    useEffect(() => {
        const getFeedbacks = async () => {
            try {
                setLoading(true);
                const data = await fetchTop5Feedback(hotelId);
                setFeedbacks(data); // Update state with the fetched feedbacks
            } catch (error) {
                setError(error instanceof Error ? error.message : "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        };

        getFeedbacks();
    }, [hotelId]); 


    // Update responsive options to reflect showing 1 item
    const responsiveOptions: CarouselResponsiveOption[] = [
        { breakpoint: "1400px", numVisible: 1, numScroll: 1 },
        { breakpoint: "1199px", numVisible: 1, numScroll: 1 },
        { breakpoint: "767px", numVisible: 1, numScroll: 1 },
        { breakpoint: "575px", numVisible: 1, numScroll: 1 },
    ];


    const feedbackTemplate = (feedback: FeedbackType) => {
        console.log(feedback);
        console.log('abc')
        return (
            <div className="border-1 surface-border border-round m-2 text-center">
               
                <div>
                    <h4 className="mb-1">{`${feedback.userId.firstName} ${feedback.userId.lastName}`}</h4>
                 <span className="fpCity">{`${feedback.hotelId.name}`}</span>
                   

                        <Rating className="justify-center" value={feedback.rating} readOnly cancel={false} />
                        
                   
                     <p className="fpComment">{feedback.comment}</p>
                </div>
            </div>
        );
    };

    return (
        <div className=" flex justify-content-center">
            <Carousel value={feedbacks} numVisible={1} numScroll={1} orientation="vertical" verticalViewPortHeight="120px"
                itemTemplate={feedbackTemplate} />
        </div>
    )
};
export default HotelFeedBackProperty;
