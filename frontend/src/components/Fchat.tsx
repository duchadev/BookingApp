// Fchat.js
import { useEffect } from "react";

const Fchat = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.fchat.vn/assets/embed/webchat.js?id=671d1ea168209c1046745b76";
    script.async = true;
    script.onload = () => console.log("Fchat script loaded");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []); // Only load once when the component mounts

  return null;
};

export default Fchat;
