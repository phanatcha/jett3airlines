import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between px-16 py-6 absolute top-0 left-0 w-full z-50">

        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/flights')}>
        <img
            src="/jett3airlines-gray-logo.svg"
            alt="Jett3Airlines logo"
            className="w-8 h-8 object-contain"
        />
        <p className="text-gray-100">Jett3Airlines</p>
        </div>

        <div className="flex items-center space-x-10 text-white font-">
            <a href="/flights" className="hover:text-primary-300 transition-colors duration-200">
                Home
            </a>
            <a href="/my-bookings" className="hover:text-primary-300 transition-colors duration-200">
                Book
            </a>
            <a href="/experience" className="hover:text-primary-300 transition-colors duration-200">
                Experience
            </a>
            <a href="/contact" className="hover:text-primary-300 transition-colors duration-200">
                Contact
            </a>
            
            {isAuthenticated && isAuthenticated() && (
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition backdrop-blur-sm border border-white/20"
              >
                Logout
              </button>
            )}
        </div>

    </nav>
  );
};

export default Navbar;