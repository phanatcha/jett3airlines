import React from "react";
import Navbar from "../components/Navbar";

const MainHeaderVer1 = () => {
  return (
      <div>
        {/* Header Section */}
        <div className="bg-[url('/main-bg.png')] bg-cover bg-center text-white pt-22 rounded-bl-4xl">
            {/* Navbar */}
             <div className="absolute top-0 w-full">
                <Navbar />
            </div>

        </div>
      </div>

  );
};

export default MainHeaderVer1;