import Footer from "../components/Footer";
import Header from "../components/Header";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import "../assets/css/home.css";

interface Props {
  children: React.ReactNode;
}

const HomeLayout = ({ children }: Props) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Hero />
      <div className="container mx-auto">
        <SearchBar />
      </div>
      <div className="homeContainer">{children}</div>
      <hr />
      <div className="homeContainer">
        <Footer />
      </div>
    </div>
  );
};

export default HomeLayout;
