import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHotels, updateHotelStatus } from '../api-client';
import "../assets/css/manageHotels.css";
import DashboardMenu from "./DashboardMenu";
import Layout from "../layouts/Layout";

interface Hotel {
    _id: string;
    name: string;
    status: string;
}

const ManageHotels: React.FC = () => {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const verifyStatus = queryParams.get('verify') || 'Pending'; // Default to "Pending"

        const fetchHotels = async () => {
            try {
                const response = await getHotels(verifyStatus); // Pass status to API call
                setHotels(response);
            } catch (error) {
                console.error('Failed to fetch hotels', error);
            }
        };

        fetchHotels();
    }, [location.search]);
    const handleMoreInfo = (hotelId: string) => {
        if (hotelId) {
            navigate(`/hotel/${hotelId}/detail`);
        }
    };

    const handleUpdate = (hotel: Hotel) => {
        if (hotel) {
            setSelectedHotel(hotel);
            console.log("Selected hotel set:", hotel); // Check what hotel is being set
            setShowPopup(true);
        }
    };
    const handleStatusChange = async (approved: boolean) => {
        console.log("handleStatusChange called with approved:", approved);

        if (selectedHotel) {
            console.log("selectedHotel object:", selectedHotel); // Log the whole object
            if (selectedHotel._id) {
                console.log("selectedHotel.id 2:", selectedHotel._id);
                try {
                    const action: 'approve' | 'reject' = approved ? 'approve' : 'reject'; // Determine the action
                    await updateHotelStatus(selectedHotel._id, { action });

                    setHotels(prevHotels =>
                        prevHotels.map(h =>
                            h._id === selectedHotel._id ? { ...h, status: approved ? 'approved' : 'denied' } : h
                        )
                    );
                    setShowPopup(false);
                    setSelectedHotel(null);
                    console.log("Update successful");
                } catch (error) {
                    console.error('Failed to update hotel status', error);
                    setError('Failed to update hotel status');
                }
            } else {
                console.error('No ID found on selectedHotel:', selectedHotel);
            }
        } else {
            console.error('selectedHotel is null');
        }
    };





    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'denied': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    // if (isLoading) {
    //     return (
    //         <div className="dashboard-container dashboard-layout">
    //             <DashboardMenu />
    //             <main className="dashboard-main">
    //                 <div className="flex items-center justify-center min-h-screen">
    //                     <p className="text-gray-500">Loading...</p>
    //                 </div>
    //             </main>
    //         </div>
    //     );
    // }

    return (
        <Layout className="dashboard-layout">
            <div className="dashboard-container">
                <DashboardMenu />
                <main className="dashboard-main">
                    <div className="bg-gray-50 min-h-screen">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <div className="sm:flex sm:items-center">
                                <div className="sm:flex-auto">
                                    <h1 className="text-2xl font-semibold text-gray-900">Manage Hotels</h1>
                                    {error && (
                                        <div className="mt-2 text-sm text-red-600">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col">
                                <div className="overflow-x-auto">
                                    <div className="inline-block min-w-full">
                                        <div className="overflow-hidden shadow-md rounded-lg border border-gray-200">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Name
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {hotels.length > 0 ? (
                                                        hotels.map((hotel) => (
                                                            <tr key={hotel._id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {hotel.name}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(hotel.status)}`}>
                                                                        {hotel.status ? hotel.status.charAt(0).toUpperCase() + hotel.status.slice(1) : 'Pending'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                    <button
                                                                        onClick={() => handleMoreInfo(hotel._id)}
                                                                        className="mr-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                                    >
                                                                        More Info
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdate(hotel)}
                                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                                    >
                                                                        Update
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                                No hotels available
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {showPopup && selectedHotel && (
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
                                    <div className="fixed inset-0 z-10 overflow-y-auto">
                                        <div className="flex min-h-full items-center justify-center p-4">
                                            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                                                <h2 className="text-xl font-semibold mb-4">
                                                    Update Hotel Status
                                                </h2>
                                                <p className="text-gray-600 mb-6">
                                                    Do you want to approve or deny the request for {selectedHotel.name}?
                                                </p>
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        onClick={() => setShowPopup(false)}
                                                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(false)} // Call function with false for Deny
                                                        className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    >
                                                        Deny
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(true)} // Call function with true for Approve
                                                        className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                    >
                                                        Approve
                                                    </button>


                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    );
};

export default ManageHotels;