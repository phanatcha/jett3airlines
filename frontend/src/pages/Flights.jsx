import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CountryAirportSelector from "../components/CountryAirportSelector";
import { useBooking } from "../context/BookingContext";
import { flightsAPI } from "../services/api";

const Flights = () => {
    const navigate = useNavigate();
    const { updateSearchCriteria } = useBooking();
    const [formData, setFormData] = useState({
        tripType: "round-trip",
        fromWhere: "",
        toWhere: "",
        departureDate: "",
        returnDate: "",
        passengers: 1,
        cabinClass: "Economy",
        directFlightsOnly: false,
    });

    const [departureCountry, setDepartureCountry] = useState("");
    const [arrivalCountry, setArrivalCountry] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

  const handleChange = (e) => {
    const { id, value, type, checked, name } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id || name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.fromWhere) {
      setError("Please select a departure airport");
      return false;
    }
    
    if (!formData.toWhere) {
      setError("Please select an arrival airport");
      return false;
    }
    
    if (formData.fromWhere === formData.toWhere) {
      setError("Departure and arrival airports must be different");
      return false;
    }
    
    if (!formData.departureDate) {
      setError("Please select a departure date");
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const departDate = new Date(formData.departureDate);
    
    if (departDate < today) {
      setError("Departure date cannot be in the past");
      return false;
    }
    
    if (formData.tripType === "round-trip") {
      if (!formData.returnDate) {
        setError("Please select a return date for round-trip");
        return false;
      }
      
      const returnDate = new Date(formData.returnDate);
      if (returnDate < departDate) {
        setError("Return date must be after departure date");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError("");
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const searchParams = {
        depart_airport_id: parseInt(formData.fromWhere),
        arrive_airport_id: parseInt(formData.toWhere),
        depart_date: formData.departureDate,
        passengers: parseInt(formData.passengers),
        class: formData.cabinClass,
        cabin_class: formData.cabinClass
      };
      
      const response = await flightsAPI.search(searchParams);
      
      if (response.success) {
        updateSearchCriteria({
          tripType: formData.tripType,
          fromWhere: formData.fromWhere,
          toWhere: formData.toWhere,
          departureDate: formData.departureDate,
          returnDate: formData.returnDate,
          passengers: formData.passengers,
          cabinClass: formData.cabinClass,
          directFlightsOnly: formData.directFlightsOnly,
          searchResults: response.data
        });
        
        navigate("/flights/departure", { 
          state: { 
            flights: response.data,
            searchCriteria: formData
          } 
        });
      } else {
        setError(response.message || "Failed to search flights. Please try again.");
      }
    } catch (err) {
      console.error("Flight search error:", err);
      
      if (err.error) {
        setError(err.error.message || err.message || "Failed to search flights");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("An error occurred while searching for flights. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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
          
          <div className="flex mb-6 bg-white/10 rounded-full px-3 py-2">
            {["round-trip", "one-way"].map((type) => (
              <label
                key={type}
                className={`cursor-pointer flex-1 text-center px-4 py-1 rounded-full text-sm ${
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
                {type === "round-trip" ? "Round trip" : "One way"}
              </label>
            ))}
          </div>

          <div className="bg-white text-black rounded-xl mb-6 p-3">
            <div className="flex flex-col space-y-3">
              {/* Departure Country and Airport */}
              <div className="border-b border-gray-300 pb-3">
                <CountryAirportSelector
                  selectedCountry={departureCountry}
                  onCountryChange={(country) => {
                    setDepartureCountry(country);
                    setFormData(prev => ({ ...prev, fromWhere: "" }));
                  }}
                  selectedAirport={formData.fromWhere}
                  onAirportChange={(airportId) => {
                    setFormData(prev => ({ ...prev, fromWhere: airportId }));
                  }}
                  countryPlaceholder="Select departure country"
                  airportPlaceholder="Select departure airport"
                  showIcons={true}
                  iconSrc="/icons/departure-icon.svg"
                  className="country-airport-selector-flights"
                />
              </div>

              {/* Arrival Country and Airport */}
              <div className="pt-2">
                <CountryAirportSelector
                  selectedCountry={arrivalCountry}
                  onCountryChange={(country) => {
                    setArrivalCountry(country);
                    setFormData(prev => ({ ...prev, toWhere: "" }));
                  }}
                  selectedAirport={formData.toWhere}
                  onAirportChange={(airportId) => {
                    setFormData(prev => ({ ...prev, toWhere: airportId }));
                  }}
                  countryPlaceholder="Select arrival country"
                  airportPlaceholder="Select arrival airport"
                  showIcons={true}
                  iconSrc="/icons/arrival-icon.svg"
                  className="country-airport-selector-flights"
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

          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-white rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-primary-300 hover:bg-primary-500 text-white rounded-lg py-3 font-medium transition mt-4 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Searching...
              </span>
            ) : (
              "Search"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Flights;