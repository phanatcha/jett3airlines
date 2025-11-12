import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Back from "../components/Back";
import Filter from "../components/Filter";
import { useState, useEffect } from "react";
import { useBooking } from "../context/BookingContext";
import { flightsAPI } from "../services/api";

const Return = () => {
  const navigate = useNavigate();
  const { searchCriteria, selectedFlights, selectReturnFlight } = useBooking();
  const [selectedTab, setSelectedTab] = useState("best");

  // Filter state
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 100000,
    maxStops: 'any',
    departureTimeRanges: []
  });

  const [filteredFlights, setFilteredFlights] = useState([]);
  const [allFlights, setAllFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check if this is a one-way trip and redirect if needed
  useEffect(() => {
    if (searchCriteria.tripType === 'one-way') {
      // Skip return flight selection for one-way trips
      navigate('/fare');
      return;
    }

    // Check if departure flight is selected
    if (!selectedFlights.departure) {
      // Redirect back to departure selection if no departure flight selected
      navigate('/flights/departure');
      return;
    }

    // Fetch return flights
    fetchReturnFlights();
  }, []);

  // Fetch return flights based on search criteria
  const fetchReturnFlights = async () => {
    try {
      setLoading(true);

      // Prepare search parameters for return flight (reverse direction)
      const searchParams = {
        depart_airport_id: parseInt(searchCriteria.toWhere), // Reverse: arrival becomes departure
        arrive_airport_id: parseInt(searchCriteria.fromWhere), // Reverse: departure becomes arrival
        depart_date: searchCriteria.returnDate,
        passengers: parseInt(searchCriteria.passengers),
        class: searchCriteria.cabinClass,
      };

      console.log('🔍 Return Flight Search Criteria:', searchCriteria);
      console.log('🔍 Return Flight Search Params:', searchParams);

      const response = await flightsAPI.search(searchParams);

      console.log('✈️ Return Flight API Response:', response);

      if (response.success) {
        console.log('✅ Return flights found:', response.data?.length || 0);
        setAllFlights(response.data || []);
      } else {
        console.error('❌ Failed to fetch return flights:', response.message);
        setAllFlights([]);
      }
    } catch (error) {
      console.error('❌ Error fetching return flights:', error);
      setAllFlights([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever filters, flight data, or selected tab changes
  useEffect(() => {
    applyFilters();
  }, [filters, allFlights, selectedTab]);

  const applyFilters = () => {
    let filtered = [...allFlights];

    // Price filter
    filtered = filtered.filter(flight => 
      flight.base_price >= filters.minPrice && 
      flight.base_price <= filters.maxPrice
    );

    // Stops filter - for now, assume all flights are direct (stops = 0)
    if (filters.maxStops === '0') {
      filtered = filtered.filter(flight => !flight.stops || flight.stops === 0);
    }

    // Departure time filter
    if (filters.departureTimeRanges.length > 0) {
      filtered = filtered.filter(flight => {
        const departureDate = new Date(flight.depart_when);
        const hour = departureDate.getHours();

        return filters.departureTimeRanges.some(range => {
          switch (range) {
            case 'night': return hour >= 0 && hour < 6;
            case 'morning': return hour >= 6 && hour < 12;
            case 'afternoon': return hour >= 12 && hour < 18;
            case 'evening': return hour >= 18 && hour < 24;
            default: return true;
          }
        });
      });
    }

    // Apply sorting based on selected tab
    if (selectedTab === 'cheapest') {
      filtered.sort((a, b) => a.base_price - b.base_price);
    } else if (selectedTab === 'fastest') {
      filtered.sort((a, b) => {
        const durationA = new Date(a.arrive_when).getTime() - new Date(a.depart_when).getTime();
        const durationB = new Date(b.arrive_when).getTime() - new Date(b.depart_when).getTime();
        return durationA - durationB;
      });
    } else {
      // 'best' - balance of price and duration
      filtered.sort((a, b) => {
        const durationA = new Date(a.arrive_when).getTime() - new Date(a.depart_when).getTime();
        const durationB = new Date(b.arrive_when).getTime() - new Date(b.depart_when).getTime();
        const scoreA = (a.base_price / 1000) + (durationA / 3600000);
        const scoreB = (b.base_price / 1000) + (durationB / 3600000);
        return scoreA - scoreB;
      });
    }

    setFilteredFlights(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Format price for display
  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Format stops for display
  const formatStops = (stops) => {
    if (!stops || stops === 0) return 'Direct';
    if (stops === 1) return '1 stop';
    return `${stops} stops`;
  };

  // Format time from ISO string
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Format date from ISO string
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate flight duration
  const calculateDuration = (departTime, arriveTime) => {
    const depart = new Date(departTime);
    const arrive = new Date(arriveTime);
    const durationMs = arrive.getTime() - depart.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Handle return flight selection
  const handleSelectFlight = (flight) => {
    // Store selected return flight in BookingContext
    selectReturnFlight(flight);

    // Navigate to fare options page
    navigate('/fare');
  };

  // Get route display
  const getRouteDisplay = (flight) => {
    return [
      flight.depart_airport_name || 'Departure Airport',
      flight.arrive_airport_name || 'Arrival Airport'
    ];
  };

  // Get departure flight summary for display
  const getDepartureSummary = () => {
    if (!selectedFlights.departure) return null;
    
    const flight = selectedFlights.departure;
    return {
      from: flight.depart_iata_code || 'DEP',
      to: flight.arrive_iata_code || 'ARR',
      depTime: formatTime(flight.depart_when),
      arrTime: formatTime(flight.arrive_when),
      date: formatDate(flight.depart_when),
      stops: formatStops(flight.stops || 0),
      duration: calculateDuration(flight.depart_when, flight.arrive_when),
      price: formatPrice(flight.base_price),
    };
  };

  const departureSummary = getDepartureSummary();

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Navbar */}
      <div className="absolute top-0 w-full">
        <Navbar />
      </div>

      {/* Header Section */}
      <div className="bg-[url('/main-bg.png')] bg-cover bg-center text-white pt-28 pb-6 px-16 rounded-b-3xl">
        <Back to="/flights/departure"/>

        {/* Selected Departure Flight Card */}
        {departureSummary && (
          <div className="bg-white text-black rounded-2xl shadow-md p-6 flex justify-between items-center mb-8 max-w-8xl">
            <div className="flex items-center space-x-8">
              {/* Departure Info */}
              <div>
                <p className="text-xs text-gray-500">{departureSummary.from}</p>
                <p className="text-3xl font-semibold">{departureSummary.depTime}</p>
                <p className="text-xs text-gray-500 mt-1">{departureSummary.date}</p>
              </div>

              {/* Arrow and flight info */}
              <div className="flex flex-col items-center text-gray-600">
                <span className="text-sm font-medium mb-[-10px]">
                  {departureSummary.stops}
                </span>
                <div className="flex items-center justify-center mb-[2px]">
                  <img
                    src="/icons/arrow-right.svg"
                    alt="arrow"
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-600 mt-[-10px]">
                  {departureSummary.duration}
                </span>
              </div>

              {/* Arrival Info */}
              <div>
                <p className="text-xs text-gray-500">{departureSummary.to}</p>
                <p className="text-3xl font-semibold">{departureSummary.arrTime}</p>
                <p className="text-xs text-gray-500 mt-1">{departureSummary.date}</p>
              </div>
            </div>

            {/* Price and details */}
            <div className="text-right">
              <p className="text-xl font-semibold">{departureSummary.price}</p>
            </div>
          </div>
        )}

        {/* Return Info */}
        <div>
          <p className="uppercase text-sm tracking-wide mb-2">Return</p>
          <h2 className="text-3xl font-semibold mb-1">
            {allFlights.length > 0 
              ? `${allFlights[0].depart_city_name || 'Departure'}, ${allFlights[0].depart_iata_code || ''} → ${allFlights[0].arrive_city_name || 'Arrival'}, ${allFlights[0].arrive_iata_code || ''}`
              : 'Select Your Return Flight'
            }
          </h2>
          <p className="text-sm text-white/80 mt-1">
            {searchCriteria.returnDate 
              ? new Date(searchCriteria.returnDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })
              : 'Select a date'
            }
          </p>
        </div>
      </div>

      {/* Main Content (same as before) */}
      <div className="flex px-16 py-8 space-x-8">
        {/* Filter Section */}
        <div className="w-1/4">
          <Filter 
            filters={filters}
            onFilterChange={handleFilterChange}
            resultsCount={filteredFlights.length}
          />
        </div>

        {/* Flight Results */}
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

          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-[#004E92]"
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
                <span className="ml-3 text-gray-600">Loading return flights...</span>
              </div>
            </div>
          ) : allFlights.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg mb-2">No return flights available</p>
              <p className="text-gray-400 text-sm mb-4">
                We couldn't find any return flights matching your search criteria.
              </p>
              <button
                onClick={() => navigate('/flights')}
                className="bg-[#004E92] hover:bg-[#003974] text-white px-6 py-2 rounded-lg font-medium"
              >
                Search Again
              </button>
            </div>
          ) : filteredFlights.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg">No flights match your filter criteria.</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            filteredFlights.map((flight) => {
              return <FlightCard 
                key={flight.flight_id} 
                flight={flight} 
                onSelect={handleSelectFlight}
                formatPrice={formatPrice}
                formatStops={formatStops}
                formatTime={formatTime}
                formatDate={formatDate}
                calculateDuration={calculateDuration}
                getRouteDisplay={getRouteDisplay}
              />;
            })
          )}
        </div>
      </div>
    </div>
  );
};

// FlightCard component for displaying individual flight details
const FlightCard = ({ 
  flight, 
  onSelect, 
  formatPrice, 
  formatStops, 
  formatTime, 
  formatDate, 
  calculateDuration,
  getRouteDisplay 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const route = getRouteDisplay(flight);
  const duration = calculateDuration(flight.depart_when, flight.arrive_when);
  const stops = flight.stops || 0;

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 flex justify-between items-start transition hover:shadow-lg">
      {/* LEFT — Flight Details */}
      <div className="flex-1">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-8">
            {/* Departure Info */}
            <div>
              <p className="text-xs text-gray-500">{flight.depart_iata_code || 'DEP'}</p>
              <p className="text-3xl font-semibold">{formatTime(flight.depart_when)}</p>
              <p className="text-xs text-gray-500 mt-1">{formatDate(flight.depart_when)}</p>
            </div>

            {/* Duration & Stops */}
            <div className="flex flex-col items-center text-gray-600">
              <span className="text-sm font-medium mb-[-20px]">{formatStops(stops)}</span>
              <div className="relative flex items-center justify-center mb-[2px]">
                <img
                  src="/icons/arrow-right.svg"
                  alt="arrow"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <span className="text-sm font-semibold text-gray-600 mt-[-20px]">
                {duration}
              </span>
            </div>

            {/* Arrival Info */}
            <div>
              <p className="text-xs text-gray-500">{flight.arrive_iata_code || 'ARR'}</p>
              <p className="text-3xl font-semibold">{formatTime(flight.arrive_when)}</p>
              <p className="text-xs text-gray-500 mt-1">{formatDate(flight.arrive_when)}</p>
            </div>
          </div>
        </div>

        {/* Flight Number and Status */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Flight {flight.flight_no} • {flight.airplane_model || 'Aircraft'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Status: <span className={`font-medium ${
              flight.status === 'Scheduled' ? 'text-green-600' : 
              flight.status === 'Delayed' ? 'text-yellow-600' : 
              flight.status === 'Cancelled' ? 'text-red-600' : 'text-gray-600'
            }`}>{flight.status}</span>
          </p>
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
              {route.map((stop, index) => (
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
                        ? `${formatDate(flight.depart_when)} • ${formatTime(flight.depart_when)}`
                        : `${formatDate(flight.arrive_when)} • ${formatTime(flight.arrive_when)}`
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Additional Flight Details */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Available Seats</p>
                  <p className="font-medium">{flight.available_seats || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Aircraft</p>
                  <p className="font-medium">{flight.airplane_model || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT — Price + Select */}
      <div className="flex flex-col items-end justify-between ml-8">
        <div className="text-right">
          <p className="text-xl font-semibold">{formatPrice(flight.base_price)}</p>
          <p className="text-xs text-gray-500 mt-1">per person</p>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-sm text-gray-500 mt-2 flex items-center justify-end gap-1 hover:text-gray-700 w-full text-right"
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
          onClick={() => onSelect(flight)}
          disabled={flight.status === 'Cancelled' || flight.available_seats === 0}
          className={`mt-8 px-8 py-2 rounded-lg font-medium ${
            flight.status === 'Cancelled' || flight.available_seats === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#004E92] hover:bg-[#003974] text-white'
          }`}
        >
          {flight.status === 'Cancelled' ? 'Cancelled' : 
           flight.available_seats === 0 ? 'Sold Out' : 'Select'}
        </button>
      </div>
    </div>
  );
};

export default Return;
