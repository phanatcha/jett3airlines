import React, { useState } from "react";
import MainHeaderVer2 from "../components/MainHeaderVer2";
import PreviewBar from "../components/PreviewBar";
import Back from "../components/BackBlack";
import { useNavigate } from "react-router-dom";
import redCross from "/icons/red-cross-icon.svg";
import greenCheck from "/icons/green-check-mark-icon.svg";

const Fare = () => {
  const navigate = useNavigate();
  const [selectedFare, setSelectedFare] = useState("Economy Saver");

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/passengerinfo");
  };

  const fares = [
    {
      name: "Economy Saver",
      price: "34,716 Baht",
      details: [
        { text: "7kg x 1 cabin baggage", available: true },
        { text: "23kg x 1 checked baggage", available: true },
        { text: "No cancellation/changes", available: false },
        { text: "No seat selection", available: false },
        { text: "No refund", available: false },
      ],
    },
    {
      name: "Economy Standard",
      price: "36,987 Baht",
      details: [
        { text: "7kg x 1 cabin baggage", available: true },
        { text: "23kg x 1 checked baggage", available: true },
        { text: "Fees for cancellation/changes", available: true },
        { text: "Standard seat selection", available: true },
        { text: "Refund with partial penalty", available: true },
      ],
    },
    {
      name: "Economy Plus",
      price: "42,562 Baht",
      details: [
        { text: "7kg x 1 cabin baggage", available: true },
        { text: "30kg x 1 checked baggage", available: true },
        { text: "Free cancellation/changes", available: true },
        { text: "Better seat selection", available: true },
        { text: "Full refund", available: true },
      ],
    },
  ];

  return (
    <div>
      <MainHeaderVer2 />

      <div className="mt-8">
        <PreviewBar currentStep={0} />
      </div>

      <div className="flex flex-col px-20 pt-8 gap-2">
        <Back />
        <div>
          <h2 className="text-3xl font-semibold mb-1">
            Bangkok, BKK ↔ Berlin, BER
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            2 passengers • Sat, Dec 6 - Sat, Dec 13
          </p>
        </div>
        <p className="text-2xl mt-7 font-semibold">Choose your fare</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex justify-center mt-6 gap-8 flex-wrap">
            {fares.map((fare) => (
            <div
                key={fare.name}
                onClick={() => setSelectedFare(fare.name)}
                className={`w-72 p-5 border rounded-2xl cursor-pointer bg-white shadow-sm transition hover:shadow-md flex flex-col justify-between min-h-[380px] ${
                selectedFare === fare.name
                    ? "border-primary-500 shadow-md"
                    : "border-gray-300"
                }`}
            >
                {/* Top section */}
                <div>
                <h3 className="text-xl font-semibold mb-1">{fare.name}</h3>
                <p className="text-gray-600 mb-3">{fare.price}</p>

                <div className="border rounded-xl p-3 mb-4">
                    {fare.details.map((detail, i) => (
                    <p key={i} className="flex items-center text-sm mb-1">
                        <img
                        src={detail.available ? greenCheck : redCross}
                        alt={detail.available ? "Available" : "Unavailable"}
                        className="w-4 h-4 mr-2"
                        />
                        <span
                        className={
                            detail.available
                            ? "text-gray-800"
                            : "text-gray-500 line-through"
                        }
                        >
                        {detail.text}
                        </span>
                    </p>
                    ))}
                </div>
                </div>

                <button
                type="button"
                className={`w-full py-2 rounded-md font-medium transition ${
                    selectedFare === fare.name
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
                >
                {selectedFare === fare.name ? "Selected" : "Select"}
                </button>
            </div>
            ))}
        </div>

        <div className="flex justify-center mt-10 mb-10">
            <button
            type="submit"
            className="block w-2/5 mb-20 text-center bg-primary-500 text-white py-2 rounded-md font-medium hover:bg-primary-300 transition"
            >
            Continue
            </button>
        </div>
      </form>

    </div>
  );
};

export default Fare;
