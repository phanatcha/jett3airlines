import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GrayLogo from "../components/GrayLogo";

const MainHeaderVer2 = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  const loggedIn = isAuthenticated && isAuthenticated();
  console.log('MainHeaderVer2 - Is Authenticated:', loggedIn);
  console.log('MainHeaderVer2 - User:', user);

  return (
      <div>
        
        <div className="bg-[url('/main-bg.png')] bg-cover bg-center text-white rounded-bl-4xl">
            <div className="flex justify-between items-center px-8 py-8">
                <GrayLogo />
                
                {loggedIn ? (
                  <div className="flex items-center gap-4">
                    <span className="text-gray-100 text-sm font-medium">
                      Welcome, {user?.firstname || user?.username || 'User'}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition backdrop-blur-sm border border-white/20 hover:scale-105"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-300 text-sm">Not logged in</div>
                )}
            </div>
        </div>
      </div>

  );
};

export default MainHeaderVer2;