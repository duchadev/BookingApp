import { useState, useEffect } from 'react';
import Layout from "../layouts/Layout";
import * as apiClient from "../api-client";
import { useAppContext } from "../contexts/AppContext";
import "../assets/css/AdminDashboard.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardMenu from "./DashboardMenu";
import { TooltipProps } from 'recharts';

// Define the structure of each booking item
interface BookingType {
    price: number;
    createdAt: string;
    rooms: Array<{ id: string; name: string; count: number }>;
}
interface Stats {
    totalUsers: number;
    totalBookings: number;
    totalHotels: number;
    totalRevenue: number;
    totalItemsSold: number;
    revenueData: Array<{ date: string; amount: number }>;
}

const Dashboard = () => {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalBookings: 0,
        totalHotels: 0,
        totalRevenue: 0,
        totalItemsSold: 0,
        revenueData: []
    });
    const { role } = useAppContext();

    const fetchDashboardData = async () => {
        try {
            const bookings: BookingType[] = await apiClient.fetchBookings();  // Fetch bookings as intended
            const hotels = await apiClient.fetchHotels();         // Fetch hotels if needed for user role stats

            // Calculate total revenue and items sold from bookings
            const totalRevenue = bookings.reduce((acc, booking) => acc + (booking.price || 0), 0);
            const totalItemsSold = bookings.reduce((acc, booking) => acc + (booking.rooms?.length || 0), 0);

            // Prepare data for the chart, with dates and amounts
            const revenueData = bookings.map(booking => ({
                date: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB') : 'N/A', 
                amount: booking.price || 0
            }));

            return {
                totalUsers: role === "Admin" ? hotels.length : 0,
                totalBookings: bookings.length,
                totalHotels: hotels.length,
                totalRevenue,
                totalItemsSold,
                revenueData
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            return {
                totalUsers: 0,
                totalBookings: 0,
                totalHotels: 0,
                totalRevenue: 0,
                totalItemsSold: 0,
                revenueData: []
            };
        }
    };

    useEffect(() => {
        const getDashboardStats = async () => {
            const stats = await fetchDashboardData();
            setStats(stats);
        };
        getDashboardStats();
    }, []);

    const StatCard = ({ icon, title, value, color }: { icon: string; title: string; value: number | string; color: string }) => (
        <div className="stat-card" style={{ borderColor: color }}>
            <i className={`fas ${icon}`} style={{ color }}></i>
            <div className="stat-info">
                <h3>{title}</h3>
                <h2>{value}</h2>
            </div>
        </div>
    );

    const chartData = stats.revenueData;

    const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            const formattedDate = payload[0].payload.date;
            return (
                <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #6f42c1' }}>
                    <p>Date: {formattedDate}</p>
                    <p>Amount: ${payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Layout
            // title="Admin Dashboard"
            // description="Welcome to your dashboard"
            className="dashboard-layout"
        >
            <div className="dashboard-container">
                <DashboardMenu />
                <main className="dashboard-main">
                    <div className="stats-grid">
                        <StatCard icon="fa-box" title="Total Hotels" value={stats.totalHotels} color="#4CAF50" />
                        <StatCard icon="fa-shopping-cart" title="Total Bookings" value={stats.totalBookings} color="#2196F3" />
                        <StatCard icon="fa-users" title="Total Users" value={stats.totalUsers} color="#9C27B0" />
                        <StatCard icon="fa-dollar-sign" title="Total Revenue" value={`$${stats.totalRevenue}`} color="#F44336" />
                    </div>
                    <div className="dashboard-charts">
                        <div className="chart-container">
                            <h3>Revenue Overview</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="amount" stroke="#4CAF50" activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    );
};

export default Dashboard;
