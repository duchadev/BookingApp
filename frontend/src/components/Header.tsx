import { Link,useNavigate  } from "react-router-dom";
import SignOutButton from "./SignOutButton";
import Fchat from "./Fchat";
import { registerAsManager,fetchCurrentUser } from '../api-client';
import { useAppContext } from "../contexts/AppContext";
const Header = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");
   const { showToast } = useAppContext();
    const navigate = useNavigate();
const handleRegisterAsManager = async () => {
  try {
  
    const currentUser = await fetchCurrentUser();
    const userID = currentUser._id;
      const response = await registerAsManager(userID);
      showToast({ message: "Register successfully!", type: "SUCCESS" });
      navigate("/"); // Optionally redirect on success
    } catch (error) {
       showToast({ message: "Fail to become hotel manager", type: "ERROR" });
    }
  };

  return (
    <div className="bg-blue-500 py-6">
      <Fchat />
      <div className="container mx-auto flex justify-between">
        <span className="text-5xl text-white font-bold tracking-tight">
          <Link to="/">Hotel Haven</Link>
        </span>
       <span className="flex space-x-2">
          {isLoggedIn ? (
           
    role === "user" ? (
      <>
        <Link
          className="flex items-center text-white px-3 font-bold hover:bg-blue-500"
          to="/my-bookings"
        >
          My Bookings
                </Link>
                

                 <Link
                className="flex items-center text-white px-3 font-bold hover:bg-blue-500"
                to="/my-profile"
              >
                My Profile
              </Link>
        <SignOutButton />
      </>
    ) : role === "admin" ? (
      <>
        <Link
          className="flex items-center text-white px-3 font-bold hover:bg-blue-500"
          to="/admin/dashboard"
        >
          Dashboard
        </Link>
        <SignOutButton />
      </>
    ) : role === "hotel_manager" ? (
      <>
        <Link
          className="flex items-center text-white px-3 font-bold hover:bg-blue-500"
          to="/my-hotels"
        >
          My Hotels
        </Link>
        <SignOutButton />
      </>
    ) : null
  ) : (
    <Link
      to="/sign-in"
      className="flex bg-white items-center text-blue-600 px-3 font-bold hover:bg-gray-100"
    >
      Sign In
              </Link>
              
  )}
</span>

      </div>
    </div>
  );
};

export default Header;
