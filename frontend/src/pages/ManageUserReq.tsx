import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserReqs, updateUserRole } from '../api-client';
import "../assets/css/manageHotels.css";
import DashboardMenu from "./DashboardMenu";
import AdminTopbar from '../components/AdminTopbar';

interface UserRequest {
    _id: string;
    firstName: string;
    role: string;
    wantToBeHotelManager: string;
}

const ManageUserReq: React.FC = () => {
    const [userRequests, setUserRequests] = useState<UserRequest[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserRequest | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserRequests = async () => {
            try {
                const response = await getUserReqs();
                const pendingRequests = response.filter((user: UserRequest) =>
                    user.wantToBeHotelManager && user.wantToBeHotelManager.toLowerCase() === 'pending'
                );
                setUserRequests(pendingRequests);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to fetch user requests', error);
                setError('Failed to load user requests');
            }
        };

        fetchUserRequests();
    }, []);


    const handleMoreInfo = (userId: string) => {
        navigate(`/user/${userId}/profile`);
    };

    const handleUpdate = (user: UserRequest) => {
        if (user) {
            setSelectedUser(user);
            console.log("Selected user:", user); // Check what hotel is being set
            setShowPopup(true);
        }
    };
    const handleRoleChange = async (approved: boolean) => {
        console.log("handleStatusChange called with approved:", approved);

        if (selectedUser) {
            console.log("selectedHotel object:", selectedUser); // Log the whole object
            if (selectedUser._id) {
                console.log("selectedHotel.id 2:", selectedUser._id);
                try {
                    const action: 'approve' | 'reject' = approved ? 'approve' : 'reject'; // Determine the action
                    await updateUserRole(selectedUser._id, { action });

                    setUserRequests(prevUsers =>
                        prevUsers.map(h =>
                            h._id === selectedUser._id ? { ...h, wantToBeHotelManager: approved ? 'Approved' : 'Denied' } : h
                        )
                    );
                    setShowPopup(false);
                    setSelectedUser(null);
                    console.log("Update successful");
                } catch (error) {
                    console.error('Failed to update user role', error);
                    setError('Failed to update hotel role');
                }
            } else {
                console.error('No ID found on selectedUser:', selectedUser);
            }
        } else {
            console.error('selectedUser is null');
        }
    };


    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'denied': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <>
            <AdminTopbar />        
                <div className="dashboard-container pt-32">
                <DashboardMenu />
                <main className="dashboard-main">
                    <div className=" min-h-screen">
                        <div className="summary-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <div className="sm:flex sm:items-center">
                                <div className="sm:flex-auto">
                                    <h1 className="text-2xl font-semibold text-gray-900">Manage User Requests</h1>
                                    {error && (
                                        <div className="mt-2 text-sm text-red-600">{error}</div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col">
                                <div className="overflow-x-auto">
                                    <div className="inline-block min-w-full">
                                        <div className="overflow-hidden rounded-lg border border-gray-950">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Name
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Current Role
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
                                                    {userRequests.length > 0 ? (
                                                        userRequests.map((user) => (
                                                            <tr key={user._id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {user.firstName}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {user.role}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(user.wantToBeHotelManager)}`}>
                                                                        {user.wantToBeHotelManager /* ? user.wantToBeHotelManager.charAt(0).toUpperCase() + user.wantToBeHotelManager.slice(1) : 'Pending' */}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                    <button
                                                                        onClick={() => handleMoreInfo(user._id)}
                                                                        className="mr-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                                    >
                                                                        More Info
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdate(user)}
                                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                                    >
                                                                        Update
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                                No user requests available
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {showPopup && selectedUser && (
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
                                    <div className="fixed inset-0 z-10 overflow-y-auto">
                                        <div className="flex min-h-full items-center justify-center p-4">
                                            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                                                <h2 className="text-xl font-semibold mb-4">
                                                    Update User Role
                                                </h2>
                                                <p className="text-gray-600 mb-6">
                                                    Do you want to approve or deny the role request for {selectedUser.firstName}?
                                                </p>
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        onClick={() => setShowPopup(false)}
                                                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleRoleChange(false)}
                                                        className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    >
                                                        Deny
                                                    </button>
                                                    <button
                                                        onClick={() => handleRoleChange(true)}
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
        </>
    );
};

export default ManageUserReq;
