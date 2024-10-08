import { Link } from "react-router-dom";
import SignOutButton from "./SignOutButton";

const Header = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");
  // const { isLoggedIn } = useAppContext();

  return (
    <div className="bg-blue-800 py-6">
      <div className="container mx-auto flex justify-between">
        <span className="text-5xl text-white font-bold tracking-tight">
          <Link to="/">HotelHaven</Link>
        </span>
        <span className="flex space-x-2">
          {isLoggedIn ? (
            role === "user" || role === "admin" ? (
              <>
                <Link
                  className="flex items-center text-white px-3 font-bold hover:bg-blue-500"
                  to="/my-bookings"
                >
                  My Bookings
                </Link>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link
                  className="flex items-center text-white px-3 font-bold hover:bg-blue-500"
                  to="/my-hotels"
                >
                  My Hotels
                </Link>
                <SignOutButton />
              </>
            )
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
