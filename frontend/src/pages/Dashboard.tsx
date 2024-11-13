import { useState, useEffect } from 'react';
import * as apiClient from "../api-client";
import { useAppContext } from "../contexts/AppContext";
import "../assets/css/AdminDashboard.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardMenu from "./DashboardMenu";
import { TooltipProps } from 'recharts';
import AdminTopbar from '../components/AdminTopbar';

// Define the structure of each booking item
interface BookingType {
    totalCost: number;
    createdAt: string;
    // rooms: Array<{ id: string; name: string; count: number }>;
    rooms: Array<{ id: string; name: string; count: number }>;
}
interface FeedbackType {
    id: string;
    content: string;
    rating: number;
    createdAt: string;
    user: { id: string; name: string; email: string };
}
interface Stats {
    totalUsers: number;
    totalBookings: number;
    totalHotels: number;
    totalRevenue: number;
    totalFeedbacks: number;
    revenueData: Array<{ date: string; amount: number }>;
}

const Dashboard = () => {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalBookings: 0,
        totalHotels: 0,
        totalRevenue: 0,
        totalFeedbacks: 0,
        revenueData: []
    });
    const { role } = useAppContext();
    const formatCurrency = (totalCost: number) => {
        const formatter = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });

        return formatter.format(totalCost);
    }
    const fetchDashboardData = async () => {
        try {
            const bookings: BookingType[] = await apiClient.fetchBookings();
            const feedbacks: FeedbackType[] = await apiClient.fetchFeedbacks();
            const hotels = await apiClient.fetchHotels();  // Fetch hotels data
            const { userCount } = await apiClient.fetchUsers(); // Fetch user count

            const totalRevenue = bookings.reduce((acc, booking) => acc + (booking.totalCost || 0), 0);
            // const totalRoomsBooked = bookings.reduce((acc, booking) => acc + (booking.rooms?.length || 0), 0);
            
            // Prepare revenue data for chart
            const revenueData = bookings.map(booking => ({
                date: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB') : 'N/A',
                amount: booking.totalCost || 0
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); 
            

            return {
                totalUsers: userCount, // Use the user count from the response
                totalBookings: bookings.length,
                totalHotels: hotels.length,
                totalRevenue,
                totalFeedbacks: feedbacks.length,
                revenueData
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            return {
                totalUsers: 0,
                totalBookings: 0,
                totalHotels: 0,
                totalRevenue: 0,
                totalFeedbacks: 0,
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
                <h3 className="font-bold">{title}</h3>
                <h2>{value}</h2>
            </div>
        </div>
    );

    const chartData = stats.revenueData;

    const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            const formattedDate = payload[0].payload.date;
            const tooltipStyle = {
                backgroundColor: '#ffffff', 
                border: '1px solid #6f42c1', 
                borderRadius: '10px', 
                padding: '10px 15px', 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', 
                fontFamily: 'Arial, sans-serif', 
                zIndex: 1000, 
                transition: 'all 0.3s ease',
            };
            const labelStyle = {
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '3px', 
            };
            const amountStyle = {
                fontSize: '1.1em', 
                color: '#4CAF50',
                margin: 0, 
                fontStyle: 'italic',
            };
    
            return (
                <div style={tooltipStyle}>
                    <p style={labelStyle}>Date: {formattedDate}</p>
                    <p style={amountStyle}>Amount: {formatCurrency(payload[0].value as number)}</p>
                </div>
            );
        }
        return null;
    };
    const formatYAxisValue = (value: number) => {
        return value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString();
    };
    
    return (
        <>
        <AdminTopbar/>
            <div className="dashboard-container pt-28">
                <DashboardMenu />
                <main className="dashboard-main">
                    <div className="stats-grid">
                        <StatCard icon="fa-box" title="Total Hotels" value={stats.totalHotels} color="#F44336" />
                        <StatCard icon="fa-shopping-cart" title="Total Bookings" value={stats.totalBookings} color="#2196F3" />
                        <StatCard icon="fa-users" title="Total Users" value={stats.totalUsers} color="#9C27B0" />
                        <StatCard
                            icon="fa-dollar-sign"
                            title="Total Revenue"
                            value={formatCurrency(stats.totalRevenue)}
                            color="#4CAF50"
                        />
                    </div>
                    <div className="dashboard-charts">
                        <div className="chart-container">
                            <h3 className="font-bold">Revenue Overview</h3>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={formatYAxisValue} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="amount" stroke="#4CAF50" activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="summary-container">
                            <h3 className="font-bold">Quick Summary</h3>
                            <div className="summary-content">
                                <div className="summary-item">
                                    <span>Total Feedbacks</span>
                                    <strong>{stats.totalFeedbacks.toLocaleString()}</strong>
                                </div>
                                <div className="summary-item m-0">
                                    <span>Customer Feedback Rate</span>
                                    <strong>
                                        {stats.totalBookings > 0 ?
                                            ((stats.totalFeedbacks / stats.totalBookings) * 100).toFixed(1)
                                            : 'N/A'}%
                                    </strong> 
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            </>
    );
};

export default Dashboard;
