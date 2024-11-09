import { Link, useLocation } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import "../assets/css/AdminDashboard.css";
import { fetchCurrentUser } from "../api-client"; 
import React, { useEffect, useState } from 'react';

const DashboardMenu = () => {
    const location = useLocation();
    const { role } = useAppContext();
    const [user, setUser] = useState<{ firstName: string; phone: string } | null>(null);
    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await fetchCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error("Failed to fetch current user:", error);
            }
        };
        loadUser();
    }, []); 
    return (
        <div className="admin-menu">
            <div className="admin-profile">
                <div className="profile-info">
                    <h2 className="font-bold">{user ? user.firstName : 'Loading...'}</h2>
                    {user && <p>{user.phone}</p>}
                    <span className="role-badge">
                        {role === "Admin" || "admin" ? 'Administrator' : 'Hotel Owner'}
                    </span>
                </div>
            </div>
            <nav className="admin-nav">
                <Link to="/admin/dashboard" className={`nav-itemx ${location.pathname === "/admin/dashboard" ? "active" : ""}`}>
                    <i className="fas fa-chart-line"></i> Dashboard
                </Link>
                <Link
                    to="/admin/verify?verify=Pending"
                    className={`nav-itemx ${location.pathname === "/admin/verify" && location.search === "?verify=Pending" ? "active" : ""}`}>
                    <i className="fas fa-boxes"></i> Hotels Request
                </Link>

                <Link
                    to="/admin/verifyUserRequest?verify=Pending"
                    className={`nav-itemx ${location.pathname === "/admin/verifyUserRequest" && location.search === "?verify=Pending" ? "active" : ""}`}>
                    <i className="fas fa-users-cog"></i> Users Request
                </Link>

                <Link to="/admin/bookings" className={`nav-itemx ${location.pathname === "/" ? "active" : ""}`}>
                    <i className="fas fa-shopping-cart"></i> Manage Booking
                </Link>
            </nav>
        </div>
    );
};

export default DashboardMenu;
