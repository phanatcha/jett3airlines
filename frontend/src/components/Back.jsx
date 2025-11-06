import React from "react";
import { useNavigate } from "react-router-dom";

const Back = ({ to = "/", className = "text-white hover:text-blue-600" }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => navigate(to)}
        className={`mb-4 flex items-center space-x-2 ${className}`}
      >
        <img
          src="/icons/back-icon.svg"
          alt="back icon"
          className="w-3 h-3 object-contain"
        />
        <span>Back</span>
      </button>
    </div>
  );
};

export default Back;

