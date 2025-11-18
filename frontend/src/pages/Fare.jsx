import { useState, useEffect } from "react";
import MainHeaderVer2 from "../components/MainHeaderVer2";
import PreviewBar from "../components/PreviewBar";
import Back from "../components/BackBlack";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import redCross from "/icons/red-cross-icon.svg";
import greenCheck from "/icons/green-check-mark-icon.svg";

const Fare = () => {
  const navigate = useNavigate();
  const { 
    selectedFlights, 
    searchCriteria,
    updateFareOptions
  } = useBooking();

  const getDefaultFare = () => {
    const cabinClass = searchCriteria.cabinClass || 'Economy';
    if (cabinClass === 'Business') return 'Business Saver';
    if (cabinClass === 'Premium Economy') return 'Premium Economy Saver';
    return 'Economy Saver';
  };
  
  const [selectedFare, setSelectedFare] = useState(getDefaultFare());

  useEffect(() => {
    if (!selectedFlights.departure) {
      alert("No flight selected. Please select a flight first.");
      navigate("/departure");
      return;
    }
  }, [selectedFlights, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedFareData = fares.find(f => f.name === selectedFare);
    const farePrice = parseFloat(selectedFareData?.price || 0);
    
    updateFareOptions({
      fareClass: selectedFare,
      farePrice: farePrice,
      cabinClass: cabinClass,
      support: 'no',
      fasttrack: 'no',
    });

    console.log('=== FARE SELECTION ===');
    console.log('Selected Fare:', selectedFare);
    console.log('Fare Price:', farePrice);
    console.log('Cabin Class:', cabinClass);
    console.log('=====================');

    navigate("/passenger-info");
  };

  const calculateBasePrice = () => {
    let total = 0;
    
    const cabinClass = searchCriteria.cabinClass || selectedFlights.departure?.cabin_class || 'Economy';
    
    const getClassMultiplier = () => {
      if (cabinClass === 'Business') return 2.5;
      if (cabinClass === 'Premium Economy') return 1.5;
      return 1.0;
    };
    
    const multiplier = getClassMultiplier();

    console.log('=== FARE PRICE CALCULATION DEBUG ===');
    console.log('Cabin Class:', cabinClass);
    console.log('Class Multiplier:', multiplier);
    console.log('Selected Flights:', selectedFlights);
    
    if (selectedFlights.departure) {
      const basePrice = parseFloat(
        selectedFlights.departure.base_price || 
        selectedFlights.departure.min_price || 
        150
      );
      
      const flightPrice = basePrice * multiplier;
      
      console.log('Departure base_price:', basePrice);
      console.log('Applied multiplier:', multiplier);
      console.log('Departure calculated price:', flightPrice);
      
      total += flightPrice;
    }

    if (searchCriteria.tripType === 'round-trip' && selectedFlights.return) {
      const basePrice = parseFloat(
        selectedFlights.return.base_price || 
        selectedFlights.return.min_price || 
        150
      );
      
      const flightPrice = basePrice * multiplier;
      
      console.log('Return base_price:', basePrice);
      console.log('Applied multiplier:', multiplier);
      console.log('Return calculated price:', flightPrice);
      
      total += flightPrice;
    } else if (searchCriteria.tripType === 'round-trip') {
      console.log('Round-trip but no return flight selected yet - showing departure price only');
    } else {
      console.log('One-way trip - no return flight price added');
    }

    console.log('Total base price:', total);
    console.log('====================================');
    return total;
  };

  const basePrice = calculateBasePrice();
  
  const cabinClass = searchCriteria.cabinClass || selectedFlights.departure?.cabin_class || 'Economy';
  
  const getFarePrefix = () => {
    if (cabinClass === 'Business') return 'Business';
    if (cabinClass === 'Premium Economy') return 'Premium Economy';
    return 'Economy';
  };
  
  const farePrefix = getFarePrefix();

  const fares = [
    {
      name: `${farePrefix} Saver`,
      price: (basePrice * 1.0).toFixed(2),
      details: [
        { text: "7kg x 1 cabin baggage", available: true },
        { text: "23kg x 1 checked baggage", available: true },
        { text: "No cancellation/changes", available: false },
        { text: "No seat selection", available: false },
        { text: "No refund", available: false },
      ],
    },
    {
      name: `${farePrefix} Standard`,
      price: (basePrice * 1.15).toFixed(2),
      details: [
        { text: "7kg x 1 cabin baggage", available: true },
        { text: "23kg x 1 checked baggage", available: true },
        { text: "Fees for cancellation/changes", available: true },
        { text: "Standard seat selection", available: true },
        { text: "Refund with partial penalty", available: true },
      ],
    },
    {
      name: `${farePrefix} Plus`,
      price: (basePrice * 1.35).toFixed(2),
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
        <Back to="/flights/departure" />
        <div>
          <h2 className="text-3xl font-semibold mb-1">
            {selectedFlights.departure?.depart_city_name || 'Bangkok'}, {selectedFlights.departure?.depart_iata_code || 'BKK'} ↔ {selectedFlights.departure?.arrive_city_name || 'Berlin'}, {selectedFlights.departure?.arrive_iata_code || 'BER'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {searchCriteria.passengers || 1} passenger{(searchCriteria.passengers || 1) > 1 ? 's' : ''} • {selectedFlights.departure?.depart_when ? new Date(selectedFlights.departure.depart_when).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Sat, Dec 6'} - {selectedFlights.return?.depart_when ? new Date(selectedFlights.return.depart_when).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Sat, Dec 13'}
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
                <p className="text-gray-600 mb-3">${fare.price}</p>

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
                onClick={() => setSelectedFare(fare.name)}
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
