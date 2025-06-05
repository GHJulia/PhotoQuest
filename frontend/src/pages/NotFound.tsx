import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#FEF6E9] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-600 mb-3 tracking-tight">
          404
        </h1>
        <p className="text-sm md:text-base text-orange-600/80 max-w-2xl mx-auto">
          Oops! Page not found
        </p>
        <a href="/" className="text-orange-500 hover:text-orange-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
