import React from "react";
import { useNavigate } from "react-router-dom";

const GrayLogo = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/flights');
  };

  return (
    <div 
      className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={handleLogoClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleLogoClick();
        }
      }}
    >
      <img
        src="jett3airlines-gray-logo.svg"
        alt="Jett3Airlines logo"
        className="w-8 h-8 object-contain"
      />
      <p className="text-gray-100">Jett3Airlines</p>
    </div>
  );
};

export default GrayLogo;
