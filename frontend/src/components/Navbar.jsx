import React from "react";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-16 py-6 absolute top-0 left-0 w-full z-50">

        <div className="flex items-center space-x-2">
        <img
            src="/jett3airlines-gray-logo.svg"
            alt="Jett3Airlines logo"
            className="w-8 h-8 object-contain"
        />
        <p className="text-gray-100">Jett3Airlines</p>
        </div>

        <div className="flex space-x-10 text-white font-">
            <a href="/flights" className="hover:text-primary-300 transition-colors duration-200">
                Home
            </a>
            <a href="/book" className="hover:text-primary-300 transition-colors duration-200">
                Book
            </a>
            <a href="/experience" className="hover:text-primary-300 transition-colors duration-200">
                Experience
            </a>
            <a href="/contact" className="hover:text-primary-300 transition-colors duration-200">
                Contact
            </a>
        </div>

    </nav>
  );
};

export default Navbar;