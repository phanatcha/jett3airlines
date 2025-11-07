import React from "react";
import airplaneIcon from "/icons/airplane-icon.svg";
import userIcon from "/icons/user-icon.svg";
import airplaneSeatIcon from "/icons/airplane-seat-icon.svg";
import creditCard from "/icons/credit-card-icon.svg";

const steps = [
  { icon: airplaneIcon, label: "Choose your fare" },
  { icon: userIcon, label: "Enter passenger info" },
  { icon: airplaneSeatIcon, label: "Choose your seat(s)" },
  { icon: creditCard, label: "Review & pay" },
];

const PreviewBar = ({ currentStep = 0 }) => {
  return (
    <div className="flex justify-center w-full mt-4">
      <div className="flex justify-between items-center bg-white rounded-full shadow-md px-8 py-3 max-w-3xl w-full">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              index === currentStep
                ? "bg-[#003366] text-white font-semibold"
                : "text-black"
            }`}
          >
            <img
              src={step.icon}
              alt={step.label}
              className={`w-5 h-5 ${
                index === currentStep ? "filter brightness-0 invert" : ""
              }`}
            />
            <span className="text-sm whitespace-nowrap">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewBar;

