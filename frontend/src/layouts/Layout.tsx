import Footer from "../components/Footer";
import Header from "../components/Header";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import "../assets/css/home.css";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string; // Add className as an optional prop
}

const Layout = ({ children, title, description, className }: LayoutProps) => {
  return (
    <div className={`flex flex-col min-h-screen ${className || ""}`}>
      <Header />
      <Hero />
      <div className="container mx-auto">
        <SearchBar />
      </div>
      <div className="container mx-auto py-10 flex-1">
        {title && <h1>{title}</h1>}
        {description && <p>{description}</p>}
        {children}
      </div>
      <hr />
      <div className="homeContainer">
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
