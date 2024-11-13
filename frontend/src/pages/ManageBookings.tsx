import React, { useEffect, useState } from 'react';
import AdminTopbar from '../components/AdminTopbar';
import DashboardMenu from './DashboardMenu';
import { fetchBookings } from '../api-client';

interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
}

interface Hotel {
    _id: string;
    name: string;
}

interface Room {
    _id: string;
    type: string;
    roomNumber: number;
}

interface Booking {
    _id: string;
    userId: User;
    hotelId: Hotel;
    roomIds: Room[];
    status: string;
    totalCost: number;
    createdAt: string;
}

const ManageBookings = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadBookings = async () => {
            try {
                const data = await fetchBookings();
                if (data) {
                    setBookings(data);
                } else {
                    setError("No bookings found.");
                }
            } catch (error) {
                setError("Failed to load bookings. Please try again later.");
                console.error("Error fetching bookings:", error);
            }
        };
        loadBookings();

        // Cleanup on unmount
        return () => {
            setBookings([]);
            setError(null);
        };
    }, []);

    const getStatusClass = (status: string) => {
        return status === 'completed' ? 'bg-green-500' : 'bg-yellow-500';
    };

    const formatCurrency = (totalCost: number) => {
        const formatter = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });

        return formatter.format(totalCost);
    };

    return (
        <>
            <AdminTopbar />
            <div className="dashboard-container pt-32">
                <DashboardMenu />
                <main className="dashboard-main">
                    <div className="min-h-screen">
                        <div className="summary-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <div className="sm:flex sm:items-center">
                                <div className="sm:flex-auto">
                                    <h1 className="text-2xl font-semibold text-gray-900">Manage Bookings</h1>
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
                                        <div className="overflow-hidden rounded-lg border border-gray-950">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr className="bg-gray-100 text-gray-700 border-b">
                                                        <th className="px-6 py-4 font-medium rounded-tl-md">Booking ID</th>
                                                        <th className="px-6 py-4 font-medium">User</th>
                                                        <th className="px-6 py-4 font-medium">Hotel</th>
                                                        <th className="px-6 py-4 font-medium">Room Details</th>
                                                        <th className="px-6 py-4 font-medium">Status</th>
                                                        <th className="px-6 py-4 font-medium">Amount</th>
                                                        <th className="px-6 py-4 font-medium rounded-tr-md">Date Created</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {bookings.map((booking) => (
                                                        <tr key={booking._id} className="border-b hover:bg-gray-50 transition-colors duration-300">
                                                            <td className="px-6 py-4 font-medium">
                                                                <div>{booking._id}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="font-medium">{booking.userId.firstName} {booking.userId.lastName}</div>
                                                                <div className="text-gray-500">{booking.userId.email}</div>
                                                                <div className="text-gray-500">{booking.userId.phone}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="font-medium">{booking.hotelId.name}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div>Total Rooms: {booking.roomIds.length}</div>
                                                                <div>
                                                                    Room Types:
                                                                    {booking.roomIds.length > 0 ? (
                                                                        booking.roomIds.map((room, index) => (
                                                                            <span key={room._id} className="mr-1">
                                                                                {room.type}{index < booking.roomIds.length - 1 ? ',' : ''}
                                                                            </span>
                                                                        ))
                                                                    ) : (
                                                                        "N/A"
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className={`px-6 py-4 rounded ${getStatusClass(booking.status)} text-white font-medium`}>
                                                                {booking.status}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {booking.totalCost !== undefined ? formatCurrency(booking.totalCost) : "N/A"}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {new Date(booking.createdAt).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default ManageBookings;
