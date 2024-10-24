import { Link } from "react-router-dom";
import "../assets/css/footer.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
      {/* Social Media Section */}
      <div className="border-b border-blue-400/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h6 className="text-lg font-semibold">
              Get connected with us on social networks!
            </h6>
            <div className="flex gap-6">
              <Link to="#" className="hover:text-blue-200 transition-colors">
                <i className="fab fa-facebook-f text-xl"></i>
              </Link>
              <Link to="#" className="hover:text-blue-200 transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </Link>
              <Link to="#" className="hover:text-blue-200 transition-colors">
                <i className="fab fa-google-plus-g text-xl"></i>
              </Link>
              <Link to="#" className="hover:text-blue-200 transition-colors">
                <i className="fab fa-linkedin-in text-xl"></i>
              </Link>
              <Link to="#" className="hover:text-blue-200 transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h6 className="font-bold text-xl">HotelHaven</h6>
            </div>
            <div className="h-0.5 w-16 bg-blue-400"></div>
            <p className="text-sm text-blue-100">
              A Solution that activates the travelling bug with vibrant imagery and working on to continuously provides enjoyable quality excursions/trips on time and on budget. We focus on developing satisfied customers all of the time.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h6 className="font-bold text-lg uppercase">Services</h6>
            <div className="h-0.5 w-16 bg-blue-400"></div>
            <div className="flex flex-col space-y-2">
              <Link to="/shop" className="text-sm hover:text-blue-200 transition-colors">Places</Link>
              <Link to="/gallery" className="text-sm hover:text-blue-200 transition-colors">Gallery</Link>
              <Link to="/team" className="text-sm hover:text-blue-200 transition-colors">Our Team</Link>
              <Link to="/about" className="text-sm hover:text-blue-200 transition-colors">About Us</Link>
            </div>
          </div>

          {/* Useful Links */}
          <div className="space-y-4">
            <h6 className="font-bold text-lg uppercase">Useful Links</h6>
            <div className="h-0.5 w-16 bg-blue-400"></div>
            <div className="flex flex-col space-y-2">
              <Link to="/dashboard" className="text-sm hover:text-blue-200 transition-colors">Your Account</Link>
              <Link to="/cart" className="text-sm hover:text-blue-200 transition-colors">Wishlist</Link>
              <Link to="/contact" className="text-sm hover:text-blue-200 transition-colors">Contact Us</Link>
              <Link to="#" className="text-sm hover:text-blue-200 transition-colors">Help</Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h6 className="font-bold text-lg uppercase">Contact</h6>
            <div className="h-0.5 w-16 bg-blue-400"></div>
            <div className="space-y-3">
              <p className="flex items-center gap-3 text-sm">
                <i className="fa fa-home"></i>
                Ngũ Hành Sơn, Việt Nam
              </p>
              <p className="flex items-center gap-3 text-sm">
                <i className="fa fa-envelope"></i>
                info@hotelhaven.com
              </p>
              <p className="flex items-center gap-3 text-sm">
                <i className="fa fa-phone"></i>
                + 01 234 567 88
              </p>
              <p className="flex items-center gap-3 text-sm">
                <i className="fa fa-print"></i>
                + 01 234 567 89
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-blue-400/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-sm">
            © {new Date().getFullYear()} Copyright:{" "}
            <a href="https://travel-ease-gamma.vercel.app" className="hover:text-blue-200 transition-colors">
              HotelHaven.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;