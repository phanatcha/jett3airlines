import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainHeaderVer2 from "../components/MainHeaderVer2";
import PreviewBar from "../components/PreviewBar";
import Back from "../components/BackBlack";
import { useBooking } from "../context/BookingContext";
import { flightsAPI } from "../services/api";

const Seat = () => {
  const navigate = useNavigate();
  const { selectedFlights, passengers, selectedSeats, selectSeat } = useBooking();
  
  const [seatMap, setSeatMap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPassengerIndex, setCurrentPassengerIndex] = useState(0);
  const [seatPricing, setSeatPricing] = useState({});
  const [seatIdMapping, setSeatIdMapping] = useState({});
  const [localSelectedSeats, setLocalSelectedSeats] = useState({});

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!selectedFlights.departure) {
          setError("No flight selected. Please select a flight first.");
          setLoading(false);
          return;
        }

        const flightId = selectedFlights.departure.flight_id;
        const response = await flightsAPI.getSeats(flightId);

        if (response.success) {
          const seats = response.data.seat_map;
          const transformedSeats = transformSeatsToMap(seats);
          setSeatMap(transformedSeats);
          
          const pricing = {};
          const seatIdMap = {};
          Object.keys(seats).forEach(seatClass => {
            seats[seatClass].available.forEach(seat => {
              pricing[seat.seat_no] = seat.price;
              seatIdMap[seat.seat_no] = seat.seat_id;
            });
            seats[seatClass].booked.forEach(seat => {
              pricing[seat.seat_no] = seat.price;
              seatIdMap[seat.seat_no] = seat.seat_id;
            });
          });
          setSeatPricing(pricing);
          setSeatIdMapping(seatIdMap);
        } else {
          setError(response.message || "Failed to load seats");
        }
      } catch (err) {
        console.error("Error fetching seats:", err);
        setError("Failed to load seat information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [selectedFlights.departure]);

  useEffect(() => {
    if (selectedSeats.length > 0 && Object.keys(seatIdMapping).length > 0) {
      const reverseSeatIdMapping = {};
      Object.entries(seatIdMapping).forEach(([seatNo, seatId]) => {
        reverseSeatIdMapping[seatId] = seatNo;
      });
      
      const seatsObj = {};
      selectedSeats.forEach(seat => {
        const seatNo = reverseSeatIdMapping[seat.seatId] || seat.seatId;
        seatsObj[seat.passengerId] = seatNo;
      });
      setLocalSelectedSeats(seatsObj);
    }
  }, [selectedSeats, seatIdMapping]);

  const transformSeatsToMap = (seats) => {
    const allSeats = [];
    
    Object.keys(seats).forEach(seatClass => {
      seats[seatClass].available.forEach(seat => {
        allSeats.push({
          id: seat.seat_no,
          number: seat.seat_no,
          isBooked: false,
          class: seatClass,
          price: seat.price
        });
      });
      seats[seatClass].booked.forEach(seat => {
        allSeats.push({
          id: seat.seat_no,
          number: seat.seat_no,
          isBooked: true,
          class: seatClass,
          price: seat.price
        });
      });
    });

    allSeats.sort((a, b) => {
      const rowA = parseInt(a.number.match(/\d+/)?.[0] || 0);
      const rowB = parseInt(b.number.match(/\d+/)?.[0] || 0);
      if (rowA !== rowB) return rowA - rowB;
      return a.number.localeCompare(b.number);
    });

    const rows = [];
    const seatsByRow = {};
    
    allSeats.forEach(seat => {
      const rowNum = parseInt(seat.number.match(/\d+/)?.[0] || 0);
      if (!seatsByRow[rowNum]) {
        seatsByRow[rowNum] = [];
      }
      seatsByRow[rowNum].push(seat);
    });

    Object.keys(seatsByRow).sort((a, b) => parseInt(a) - parseInt(b)).forEach(rowNum => {
      const rowSeats = seatsByRow[rowNum];
      const formattedRow = [];
      
      const availableColumns = rowSeats.map(s => s.number.slice(-1)).sort();
      
      const is2x2Config = availableColumns.length === 4 && 
                          availableColumns.includes('A') && 
                          availableColumns.includes('C') && 
                          availableColumns.includes('D') && 
                          availableColumns.includes('F') &&
                          !availableColumns.includes('B') &&
                          !availableColumns.includes('E');
      
      if (is2x2Config) {
        const seatA = rowSeats.find(s => s.number.endsWith('A'));
        const seatC = rowSeats.find(s => s.number.endsWith('C'));
        const seatD = rowSeats.find(s => s.number.endsWith('D'));
        const seatF = rowSeats.find(s => s.number.endsWith('F'));
        
        formattedRow.push(undefined, seatA, seatC, null, seatD, seatF, undefined);
      } else {
        const seatA = rowSeats.find(s => s.number.endsWith('A'));
        const seatB = rowSeats.find(s => s.number.endsWith('B'));
        const seatC = rowSeats.find(s => s.number.endsWith('C'));
        const seatD = rowSeats.find(s => s.number.endsWith('D'));
        const seatE = rowSeats.find(s => s.number.endsWith('E'));
        const seatF = rowSeats.find(s => s.number.endsWith('F'));
        
        formattedRow.push(seatA, seatB, seatC, null, seatD, seatE, seatF);
      }
      
      rows.push(formattedRow);
    });

    return rows;
  };

  const handleSeatClick = (seatId, isBooked) => {
    if (isBooked) return;

    const isSelectedByOther = Object.entries(localSelectedSeats).some(
      ([passengerId, selectedSeatId]) => 
        parseInt(passengerId) !== currentPassengerIndex && selectedSeatId === seatId
    );

    if (isSelectedByOther) {
      alert("This seat is already selected by another passenger.");
      return;
    }

    setLocalSelectedSeats(prev => {
      const newSeats = { ...prev };
      if (newSeats[currentPassengerIndex] === seatId) {
        delete newSeats[currentPassengerIndex];
      } else {
        newSeats[currentPassengerIndex] = seatId;
      }
      return newSeats;
    });
  };

  const getSeatClass = (seat) => {
    if (!seat) return "w-8 h-8 mx-1";

    const baseClass = "w-8 h-8 rounded-md flex items-center justify-center text-xs font-semibold cursor-pointer m-0.5 transition-colors";

    if (seat.isBooked) {
      return `${baseClass} bg-gray-400 text-gray-700 cursor-not-allowed`;
    }
    
    if (localSelectedSeats[currentPassengerIndex] === seat.id) {
      return `${baseClass} bg-blue-900 text-white border-2 border-blue-900`;
    }
    
    const isSelectedByOther = Object.entries(localSelectedSeats).some(
      ([passengerId, seatId]) => 
        parseInt(passengerId) !== currentPassengerIndex && seatId === seat.id
    );
    
    if (isSelectedByOther) {
      return `${baseClass} bg-green-500 text-white border-2 border-green-600`;
    }
    
    return `${baseClass} bg-blue-300 text-gray-800 hover:bg-blue-400`;
  };

  const getRowNumber = (rowIndex) => rowIndex + 1;

  const handleContinue = () => {
    const allSeatsSelected = passengers.every((_, index) => localSelectedSeats[index]);
    
    if (!allSeatsSelected) {
      alert(`Please select seats for all ${passengers.length} passenger(s).`);
      return;
    }

    passengers.forEach((passenger, index) => {
      if (localSelectedSeats[index]) {
        const seatNo = localSelectedSeats[index];
        const price = seatPricing[seatNo] || 200;
        const seatId = seatIdMapping[seatNo];
        
        if (!seatId) {
          console.error(`No seat_id found for seat ${seatNo}`);
          alert(`Error: Could not find seat ID for seat ${seatNo}. Please try again.`);
          return;
        }
        
        selectSeat(index, seatId, price);
      }
    });

    navigate("/payment");
  };

  const handleNextPassenger = () => {
    if (!localSelectedSeats[currentPassengerIndex]) {
      alert(`Please select a seat for ${passengers[currentPassengerIndex]?.first_name || `Passenger ${currentPassengerIndex + 1}`}`);
      return;
    }
    
    if (currentPassengerIndex < passengers.length - 1) {
      setCurrentPassengerIndex(currentPassengerIndex + 1);
    }
  };

  const handlePreviousPassenger = () => {
    if (currentPassengerIndex > 0) {
      setCurrentPassengerIndex(currentPassengerIndex - 1);
    }
  };

  const calculateTotalSeatPrice = () => {
    let total = 0;
    Object.values(localSelectedSeats).forEach(seatId => {
      total += seatPricing[seatId] || 0;
    });
    return total;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <MainHeaderVer2 />
        <div className="mt-8">
          <PreviewBar currentStep={2} />
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading seat information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <MainHeaderVer2 />
        <div className="mt-8">
          <PreviewBar currentStep={2} />
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/flights/departure")}
              className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800"
            >
              Back to Flight Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPassenger = passengers[currentPassengerIndex];
  const currentSeat = localSelectedSeats[currentPassengerIndex];
  const seatPrice = currentSeat ? (seatPricing[currentSeat] || 0) : 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <MainHeaderVer2 />
      <div className="mt-8">
        <PreviewBar currentStep={2} />
      </div>

      <div className="flex flex-col lg:flex-row justify-center items-start gap-8 mt-10 mx-auto w-11/12 max-w-6xl bg-white rounded-2xl shadow-md p-6">
        {/* Left side info */}
        <div className="flex-1 space-y-6">
          <Back to="/passenger-info" />

          <div>
            <p className="text-gray-500 text-sm">Passenger {currentPassengerIndex + 1} of {passengers.length}</p>
            <h2 className="text-2xl font-bold">
              {currentPassenger?.first_name} {currentPassenger?.last_name}
            </h2>
            <p className="text-gray-600 mt-1">
              {selectedFlights.departure?.flight_no || 'Flight'}, {selectedFlights.departure?.class || 'Economy'}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-3xl font-bold">
              {currentSeat || "--"}
            </p>
            <p className="text-gray-600">Selected Seat</p>
            {currentSeat && (
              <p className="text-lg font-semibold text-blue-900 mt-2">
                ${seatPrice.toFixed(2)}
              </p>
            )}
          </div>

          {/* All passengers' seats */}
          {passengers.length > 1 && (
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-2">All Passengers:</p>
              {passengers.map((passenger, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <span className="text-sm">
                    {passenger.first_name} {passenger.last_name}
                  </span>
                  <span className={`text-sm font-semibold ${localSelectedSeats[index] ? 'text-green-600' : 'text-gray-400'}`}>
                    {localSelectedSeats[index] || 'Not selected'}
                  </span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Seat Price:</span>
                  <span className="font-bold text-blue-900">${calculateTotalSeatPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-300 rounded"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-sm">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-900 rounded"></div>
              <span className="text-sm">Your Selection</span>
            </div>
            {passengers.length > 1 && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Other Passenger</span>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          {passengers.length > 1 && (
            <div className="flex gap-2">
              <button
                onClick={handlePreviousPassenger}
                disabled={currentPassengerIndex === 0}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  currentPassengerIndex === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleNextPassenger}
                disabled={currentPassengerIndex === passengers.length - 1}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  currentPassengerIndex === passengers.length - 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-200 text-blue-900 hover:bg-blue-300'
                }`}
              >
                Next Passenger
              </button>
            </div>
          )}

          <button
            onClick={handleContinue}
            className="mt-6 w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            Continue to Fare Options
          </button>
        </div>


        {/* Right side seat map */}
        <div className="flex-1 flex justify-center overflow-x-auto">
          <div className="p-6 border rounded-xl bg-white shadow-sm">
            
            <div className="max-h-96 overflow-y-auto p-2"> 
              
              <div className="flex flex-col items-start space-y-1">
                {seatMap.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center">

                    <div className="w-6 text-sm font-medium text-gray-500 mr-2 text-right flex-shrink-0">
                      {getRowNumber(rowIndex)}
                    </div>
                    

                    {row.map((seat, seatIndex) => {
                      if (seat === null) {
                        return <div key={`aisle-${rowIndex}-${seatIndex}`} className="w-7 mx-1"></div>;
                      }
                      if (seat === undefined) {
                        return <div key={`empty-${rowIndex}-${seatIndex}`} className="w-8 h-8 mx-1"></div>;
                      }
                      return (
                        <div
                          key={seat.id}
                          className={getSeatClass(seat)}
                          onClick={() => handleSeatClick(seat.id, seat.isBooked)}
                        >
                          {seat.number.slice(-1)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Seat;
