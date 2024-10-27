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

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Layout>
                <Home />
                <MailList />
              </Layout>
            </>
          }
        />
        <Route
          path="/search"
          element={
            <Layout>
              <Search />
            </Layout>
          }
        />
        <Route
          path="/detail/:hotelId"
          element={
            <Layout>
              <Detail />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <Register />
            </Layout>
          }
        />
        <Route
          path="/sign-in"
          element={
            <Layout>
              <SignIn />
            </Layout>
          }
        />

        {/* Protected Routes based on roles */}
        <Route
          path="/hotel/:hotelId/booking"
          element={
            <ProtectedRoute roles={["user", "hotel_manager", "admin"]}>
              <Layout>
                <Booking />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-hotel"
          element={
            <ProtectedRoute roles={["hotel_manager", "admin"]}>
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
            <ProtectedRoute roles={["hotel_manager", "admin"]}>
              <Layout>
                <HotelRoomTypes />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/:hotelId/rooms/types/:roomType"
          element={
            <ProtectedRoute roles={["hotel_manager", "admin"]}>
              <Layout>
                <HotelRoomTypeDetails />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/:hotelId/rooms/add"
          element={
            <ProtectedRoute roles={["hotel_manager", "admin"]}>
              <Layout>
                <AddRoom />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/:hotelId/rooms/edit/:roomId"
          element={
            <ProtectedRoute roles={["hotel_manager", "admin"]}>
              <Layout>
                <EditRoom />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute roles={["user", "hotel_manager", "admin"]}>
              <Layout>
                <MyBookings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
