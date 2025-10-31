import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Flights = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tripType: "round-trip",
        fromWhere: "Bangkok",
        toWhere: "",
        departureDate: "",
        returnDate: "",
        passengers: 1,
        cabinClass: "Economy",
        directFlightsOnly: false,
    });


  const handleChange = (e) => {
    const { id, value, type, checked, name } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id || name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/flights/departure");
  };   

  return (
    <div className="flex h-screen text-white bg-[url('/flights-bg.png')] bg-cover bg-center">
      {/* Navbar */}
      <div className="absolute top-0 w-full">
        <Navbar />
      </div>

      {/* Left Side */}
      <div className="w-3/5 relative flex items-center justify-center">
        <div className="max-w-xl">
          <h2 className="text-5xl font-semibold mb-3 drop-shadow-lg">
            Discover the World with Us
          </h2>
          <p className="font-light text-lg drop-shadow-md">
            From city lights to seaside sunsets — the sky is yours.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-2/5 flex items-center justify-center px-12">
        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md"
        >
          
          <div className="flex justify-between mb-6 bg-white/10 rounded-full px-3 py-2">
            {["round-trip", "one-way", "multi-city"].map((type) => (
              <label
                key={type}
                className={`cursor-pointer px-4 py-1 rounded-full text-sm ${
                  formData.tripType === type
                    ? "bg-primary-500 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <input
                  type="radio"
                  name="tripType"
                  value={type}
                  checked={formData.tripType === type}
                  onChange={handleChange}
                  className="hidden"
                />
                {type === "round-trip"
                  ? "Round trip"
                  : type === "one-way"
                  ? "One way"
                  : "Multi-city"}
              </label>
            ))}
          </div>

          <div className="bg-white text-black rounded-xl mb-6 p-3">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 border-b border-gray-300 pb-2">
                <img
                  src="/icons/departure-icon.svg"
                  alt="Departure Icon"
                  className="w-5 h-5 text-gray-500"
                />
                <input
                  id="fromWhere"
                  value={formData.fromWhere}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none"
                  placeholder="From where?"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <img
                  src="/icons/arrival-icon.svg"
                  alt="Arrival Icon"
                  className="w-5 h-5 text-gray-500"
                />
                <input
                  id="toWhere"
                  value={formData.toWhere}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none"
                  placeholder="Where to?"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="departureDate">Departure</label>
              <input
                id="departureDate"
                type="date"
                value={formData.departureDate}
                onChange={handleChange}
                className="bg-transparent border-b border-white/50 outline-none"
              />
            </div>

            {formData.tripType === "round-trip" && (
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="returnDate">Return</label>
                <input
                  id="returnDate"
                  type="date"
                  value={formData.returnDate}
                  onChange={handleChange}
                  className="bg-transparent border-b border-white/50 outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label htmlFor="passengers" className="text-gray-200">
                Passengers
              </label>
              <input
                id="passengers"
                type="number"
                min="1"
                value={formData.passengers}
                onChange={handleChange}
                className="bg-transparent border-b border-white/50 outline-none text-right w-16"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label>Class</label>
              <select
                id="cabinClass"
                value={formData.cabinClass}
                onChange={handleChange}
                className="bg-transparent border-b border-white/50 outline-none"
              >
                <option className="text-black">Economy</option>
                <option className="text-black">Premium Economy</option>
                <option className="text-black">Business</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm mt-4">
            <span>Direct flights only</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="directFlightsOnly"
                checked={formData.directFlightsOnly}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-primary-300 transition-all"></div>
              <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full peer-checked:translate-x-full transition-transform"></div>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-300 hover:bg-primary-500 text-white rounded-lg py-3 font-medium transition mt-4"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
};

export default Flights;