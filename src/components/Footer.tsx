import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-orange-500 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Camera className="h-8 w-8" />
            <span className="text-xl font-bold">Photo Quest</span>
          </div>
          <p className="text-center md:text-left mb-4 md:mb-0">
            "Capture. Share. Guess. Level Up!"
          </p>
          <div className="flex space-x-6">
            <Link to="#" className="hover:text-orange-200">Twitter</Link>
            <Link to="#" className="hover:text-orange-200">Facebook</Link>
            <Link to="#" className="hover:text-orange-200">Instagram</Link>
            <Link to="#" className="hover:text-orange-200">Pinterest</Link>
          </div>
        </div>
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>Copyright © 2025 Photo Quest</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/about" className="hover:text-orange-200">About</Link>
            <Link to="/contact" className="hover:text-orange-200">Contact Us</Link>
            <Link to="/terms" className="hover:text-orange-200">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-orange-200">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 