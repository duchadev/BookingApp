import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "primereact/resources/themes/lara-light-cyan/theme.css";

import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import AddHotel from "./pages/AddHotel";
import MyHotels from "./pages/MyHotels";
import EditHotel from "./pages/EditHotel";
import Search from "./pages/Search";
import Detail from "./pages/Detail";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import Home from "./pages/Home";
import ProtectedRoute from "./routes/ProtectedRoute";
import MailList from "./components/MailList";
import Layout from "./layouts/Layout";
import { HotelRoomTypes } from "./pages/rooms/HotelRoomTypes";
import AddRoom from "./pages/rooms/AddRoom";
import EditRoom from "./pages/rooms/EditRoom";
import { HotelRoomTypeDetails } from "./pages/rooms/HotelRoomTypeDetails";
import { HotelCustomerBookings } from "./pages/HotelCustomerBookings";
import ManageUserReq from "./pages/ManageUserReq";
import ManageHotels from "./pages/ManageHotels";
import ManageBookings from "./pages/ManageBookings";
import Dashboard from "./pages/Dashboard";
import MyBookingDetails from "./pages/MyBookingDetails";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPasswordForm";
import Profile from "./pages/Profile";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute roles={["user", "hotel_manager"]}>
            <Layout>
              <Home />
              <MailList />
            </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute roles={["user", "hotel_manager"]}>
            <Layout>
              <Search />
            </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/detail/:hotelId"
          element={
            <ProtectedRoute roles={["user", "hotel_manager"]}>
            <Layout>
              <Detail />
            </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/sign-in" element={<SignIn />} />
  <Route path="/register" element={<Register />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        reset-password
        <Route path="/reset-password" element={<ResetPassword />} />
       <Route
          path="/my-profile"
          element={
            <ProtectedRoute roles={["user", "hotel_manager", "admin"]}>
              <Layout>
                <Profile/>
              </Layout>
            </ProtectedRoute>
          }
        />
   
        {/* Protected Routes based on roles */}
        <Route
          path="/hotel/:hotelId/booking"
          element={
            <ProtectedRoute roles={["user", "hotel_manager"]}>
              <Layout>
                <Booking />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/:hotelId/customer-bookings"
          element={
            <ProtectedRoute roles={["hotel_manager", "admin"]}>
              <Layout>
                <HotelCustomerBookings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-hotel"
          element={
            <ProtectedRoute roles={["hotel_manager"]}>
              <Layout>
                <AddHotel />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:hotelId"
          element={
            <ProtectedRoute roles={["hotel_manager"]}>
              <Layout>
                <EditHotel />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-hotels"
          element={
            <ProtectedRoute roles={["hotel_manager"]}>
              <Layout>
                <MyHotels />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/:hotelId/rooms/types"
          element={
            <ProtectedRoute roles={["hotel_manager"]}>
              <Layout>
                <HotelRoomTypes />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/:hotelId/rooms/types/:roomType"
          element={
            <ProtectedRoute roles={["hotel_manager"]}>
              <Layout>
                <HotelRoomTypeDetails />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/:hotelId/rooms/add"
          element={
            <ProtectedRoute roles={["hotel_manager"]}>
              <Layout>
                <AddRoom />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/:hotelId/rooms/edit/:roomId"
          element={
            <ProtectedRoute roles={["hotel_manager"]}>
              <Layout>
                <EditRoom />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute roles={["user", "hotel_manager"]}>
              <Layout>
                <MyBookings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings/details/:bookingId"
          element={
            <ProtectedRoute roles={["user", "hotel_manager", "admin"]}>
              <Layout>
                <MyBookingDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verify"
          element={
            <ProtectedRoute roles={["admin"]}>
              <ManageHotels />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verifyUserRequest"
          element={
            <ProtectedRoute roles={["admin"]}>
              <ManageUserReq />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-bookings"
          element={
            <ProtectedRoute roles={["admin"]}>
              <ManageBookings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
