import React from "react";

const HaveLuggage = ({ hasLuggage }) => {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/icons/suitcase-icon.svg"
        alt="suitcase"
        className="w-8 h-8"
      />
      <img
        src={
          hasLuggage
            ? "/icons/check-circle-icon.svg"
            : "/icons/cross-circle-icon.svg"
        }
        alt={hasLuggage ? "has luggage" : "no luggage"}
        className="w-6 h-6"
      />
    </div>
  );
};

export default HaveLuggage;
