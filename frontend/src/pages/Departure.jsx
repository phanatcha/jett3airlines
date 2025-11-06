import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Back from "../components/Back"
import Filter from "../components/Filter";
import { useState } from "react";

const Departure = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("best");

  const flightResults = [
    {
      id: 1,
      from: "BKK",
      to: "BER",
      depTime: "14:00",
      arrTime: "22:15",
      stops: "2 stops",
      duration: "14h 15m",
      price: "THB 15,482",
      route: [
        "Suvarnabhumi Airport",
        "Vienna International Airport",
        "Berlin Brandenburg Airport",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Navbar */}
      <div className="absolute top-0 w-full">
        <Navbar />
      </div>

      {/* Header Section */}
      <div className="bg-[url('/main-bg.png')] bg-cover bg-center text-white pt-28 pb-6 px-16 rounded-b-3xl">
        <Back to="/flights" />


        <div>
          <p className="uppercase text-sm tracking-wide mb-2">Depart</p>
          <h2 className="text-3xl font-semibold mb-1">
            Bangkok, BKK ↔ Berlin, BER
          </h2>
          <p className="text-sm text-white/80 mt-1">
            Saturday, December 6, 2025
          </p>
        </div>

      </div>

      {/* Main Content */}
      <div className="flex px-16 py-8 space-x-8">
        {/* Filter Section */}
        <div className="w-1/4">
          <Filter />
        </div>
        <div className="w-3/4 space-y-6">
            {/* Tabs */}
            <div className="flex mt-3 bg-gray-200 rounded-full w-full max-w-2xl mx-auto overflow-hidden">
            {["best", "cheapest", "fastest"].map((tab) => (
                <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 py-3 md:py-3 text-center text-white font-medium capitalize transition-all duration-200 ${
                    selectedTab === tab
                    ? "bg-[#13759F] text-white shadow-md"
                    : "bg-[#003C6F] hover:text-gray-500"
                }`}
                >
                {tab}
                </button>
            ))}
            </div>

        {flightResults.map((flight) => {
          const [isOpen, setIsOpen] = useState(true); // toggle for route visibility

          return (
            <div
              key={flight.id}
              className="bg-white rounded-2xl shadow-md p-8 flex justify-between items-start transition hover:shadow-lg"
            >
              {/* LEFT — Flight Details */}
              <div className="flex-1">
                {/* Header Row (BKK → BER + time info) */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-8">
                    {/* Departure Info */}
                    <div>
                      <p className="text-xs text-gray-500">{flight.from}</p>
                      <p className="text-3xl font-semibold">{flight.depTime}</p>
                      <p className="text-xs text-gray-500 mt-1">6 Dec</p>
                    </div>

                    {/* Duration & Stops */}
                    <div className="flex flex-col items-center text-gray-600">
                      <span className="text-sm font-medium mb-[-20px]">{flight.stops}</span>
                      <div className="relative flex items-center justify-center mb-[2px]">
                        <img
                          src="/icons/arrow-right.svg"
                          alt="arrow"
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 mt-[-20px]">
                        {flight.duration}
                      </span>
                    </div>

                    {/* Arrival Info */}
                    <div>
                      <p className="text-xs text-gray-500">{flight.to}</p>
                      <p className="text-3xl font-semibold">{flight.arrTime}</p>
                      <p className="text-xs text-gray-500 mt-1">6 Dec</p>
                    </div>
                  </div>
                </div>

                {/* Luggage Icons */}
                <div className="flex items-center gap-4 mb-6">
                  <img src="/icons/suitcase-icon.svg" alt="carry-on" className="w-6 h-6" />
                  <img src="/icons/check-circle-icon.svg" alt="included" className="w-4 h-4" />
                  <img src="/icons/luggage-icon.svg" alt="checked" className="w-6 h-6" />
                  <img src="/icons/check-circle-icon.svg" alt="included" className="w-4 h-4" />
                </div>

                {/* ROUTE SECTION */}
                {isOpen && (
                  <div className="relative border border-gray-800 rounded-xl p-6">
                    <div className="space-y-6">
                      {flight.route.map((stop, index) => (
                        <div key={index} className="flex items-start relative z-10">
                          {/* logo */}
                          <div>
                            <img
                              src="/jett3airlines-black-logo.svg"
                              alt="Jett3Airlines logo"
                              className="w-8 h-8 object-contain mr-5"
                            />
                          </div>

                          {/* Stop Info */}
                          <div>
                            <p className="font-medium text-base">{stop}</p>
                            <p className="text-sm text-gray-500">
                              {index === 0
                                ? "Sat, Dec 6 • 14:00"
                                : index === 1
                                ? "Sat, Dec 6 • 19:55"
                                : "Sat, Dec 6 • 22:15"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT — Price + Select */}
              <div className="flex flex-col items-end justify-between ml-8">
                <div className="text-right">
                  <p className="text-xl font-semibold">{flight.price}</p>
                  <button
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="text-sm text-gray-500 mt-1 flex items-center justify-end gap-1 hover:text-gray-700 w-full text-right"
                  >
                    <span>Details</span>
                    <img
                      src={isOpen ? "/icons/up-icon.svg" : "/icons/down-icon.svg"}
                      alt="toggle details"
                      className="w-3 h-3"
                    />
                  </button>
                </div>

                <button
                  onClick={() => navigate("/flights/return")}
                  className="mt-8 bg-[#004E92] hover:bg-[#003974] text-white px-8 py-2 rounded-lg font-medium"
                >
                  Select
                </button>
              </div>

            </div>
          );
        })}


        </div>
      </div>
    </div>
  );
};

export default Departure;
