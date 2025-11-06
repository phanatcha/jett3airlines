import MainHeaderVer1 from "../components/MainHeaderVer1";
import Back from "../components/BackBlack";
import Filter from "../components/Filter";
import searchIcon from "/icons/search-icon.svg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Book = () => {
  const navigate = useNavigate();

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
    <div className="bg-white min-h-screen">
      <MainHeaderVer1 />

      <div className="flex px-10 pt-10 gap-6">
        {/* LEFT SIDE */}
        <div className="w-1/4">
          <Back to="/flights"/>
          <Filter />
        </div>

        {/* RIGHT SIDE */}
        <div className="w-3/4 bg-white rounded-3xl shadow-md p-6">
          {/* Search Bar */}
          <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 mb-6">
            <img
              src={searchIcon}
              alt="Search"
              className="w-5 h-5 opacity-70 mr-3"
            />
            <input
              type="text"
              placeholder="Search flights"
              className="w-full outline-none text-gray-700 placeholder-gray-400"
            />
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

                {/* DETAIL SECTION */}
                {isOpen && (
                <div className="relative border border-gray-300 rounded-xl p-6 w-[115%]">
                    <div className="flex justify-between items-start">
                    {/* LEFT SIDE */}
                    <div>
                        <p className="font-semibold text-base">Seat: 40A</p>
                        <p className="text-sm text-gray-500">Economy</p>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="text-right">
                        <p className="font-semibold text-base">Flight: JT234</p>
                        <p className="text-sm text-gray-500">Payment: Credit Card</p>
                    </div>
                    </div>
                </div>
                )}

              </div>

              {/* RIGHT */}
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

              </div>

            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default Book;
