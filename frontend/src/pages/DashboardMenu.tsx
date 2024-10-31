import { Link, useLocation } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import "../assets/css/AdminDashboard.css";

const DashboardMenu = () => {
    const location = useLocation();
    const { role } = useAppContext();

    return (
        <div className="admin-menu">
            <div className="admin-profile">
                <div className="profile-info">
                    <h2>Admin</h2>
                    <span className="role-badge">
                        {role === "Admin" ? 'Administrator' : 'User'}
                    </span>
                </div>
            </div>
            <nav className="admin-nav">
                <Link to="/admin/dashboard" className={`nav-itemx ${location.pathname === "/admin/dashboard" ? "active" : ""}`}>
                    <i className="fas fa-chart-line"></i> Dashboard
                </Link>
                <Link to="/admin/verify?verify=Pending" className={`nav-itemx ${location.pathname === "/admin/verify?verify=Pending" ? "active" : ""}`}>
                    <i className="fas fa-boxes"></i> Hotels Request
                </Link>

                <Link to="/admin/bookings" className={`nav-itemx ${location.pathname === "/" ? "active" : ""}`}>
                    <i className="fas fa-shopping-cart"></i> Manage Booking
                </Link>
                <Link to="/admin/verifyUserRequest?verify=Pending" className={`nav-itemx ${location.pathname === "/admin/verifyUserRequest?verify=Pending" ? "active" : ""}`}>
                    <i className="fas fa-users-cog"></i> Users Request
                </Link>
            </nav>
        </div>
    );
};

export default DashboardMenu;
