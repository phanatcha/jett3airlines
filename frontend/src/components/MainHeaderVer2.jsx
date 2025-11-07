import React from "react";
import GrayLogo from "../components/GrayLogo";

const MainHeaderVer2 = () => {
  return (
      <div>
        {/* Header Section */}
        <div className="bg-[url('/main-bg.png')] bg-cover bg-center text-white pt-22 rounded-bl-4xl">
            <div className="absolute top-8 left-8 z-10">
                <GrayLogo />
            </div>
        </div>
      </div>

  );
};

export default MainHeaderVer2;