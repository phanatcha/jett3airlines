import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainHeaderVer2 from "../components/MainHeaderVer2";
import PreviewBar from "../components/PreviewBar";
import Back from "../components/BackBlack";

const Seat = () => {
  const navigate = useNavigate();
  const [selectedSeat, setSelectedSeat] = useState(null);


  const rows = [
    [
        { id: '1A', number: "A" },
        null,
        { id: '1C', number: "C" },
        null,
        { id: '1D', number: "D" },
        null,
        { id: '1F', number: "F" },
    ],
    [
        { id: '2A', number: "A" },
        null,
        { id: '2C', number: "C" },
        null,
        { id: '2D', number: "D", isBooked: true },
        null,
        { id: '2F', number: "F" },
    ],
    [
        { id: '3A', number: "A", isBooked: true },
        null,
        { id: '3C', number: "C" },
        null,
        { id: '3D', number: "D" },
        null,
        { id: '3F', number: "F", isBooked: true },
    ],
    [
        { id: '4A', number: "A" },
        { id: '4B', number: "B" },
        { id: '4C', number: "C" },
        null,
        { id: '4D', number: "D" },
        { id: '4E', number: "E" },
        { id: '4F', number: "F" },
    ],
    [
        { id: '5A', number: "A" },
        { id: '5B', number: "B" },
        { id: '5C', number: "C" },
        null,
        { id: '5D', number: "D" },
        { id: '5E', number: "E" },
        { id: '5F', number: "F" },
    ],
    [
        { id: '6A', number: "A" },
        { id: '6B', number: "B" },
        { id: '6C', number: "C" },
        null,
        { id: '6D', number: "D" },
        { id: '6E', number: "E" },
        { id: '6F', number: "F" },
    ],    
    [
        { id: '7A', number: "A" },
        { id: '7B', number: "B" },
        { id: '7C', number: "C" },
        null,
        { id: '7D', number: "D" },
        { id: '7E', number: "E", isBooked: true },
        { id: '7F', number: "F" },
    ],
    [
        { id: '8A', number: "A", isBooked: true },
        { id: '8B', number: "B", isBooked: true },
        { id: '8C', number: "C" },
        null,
        { id: '8D', number: "D" },
        { id: '8E', number: "E" },
        { id: '8F', number: "F" },
    ],
    [
        { id: '9A', number: "A" },
        { id: '9B', number: "B" },
        { id: '9C', number: "C" },
        null,
        { id: '9D', number: "D" },
        { id: '9E', number: "E" },
        { id: '9F', number: "F" },
    ],
    [
        { id: '10A', number: "A" },
        { id: '10B', number: "B", isBooked: true },
        { id: '10C', number: "C", isBooked: true },
        null,
        { id: '10D', number: "D" },
        { id: '10E', number: "E" },
        { id: '10F', number: "F" },
    ],
    [
        { id: '11A', number: "A", isBooked: true },
        { id: '11B', number: "B", isBooked: true },
        { id: '11C', number: "C", isBooked: true },
        null,
        { id: '11D', number: "D", isBooked: true },
        { id: '11E', number: "E", isBooked: true },
        { id: '11F', number: "F", isBooked: true },
    ],
    [
        { id: '12A', number: "A", isBooked: true },
        { id: '12B', number: "B" },
        { id: '12C', number: "C", isBooked: true },
        null,
        { id: '12D', number: "D" },
        { id: '12E', number: "E", isBooked: true },
        { id: '12F', number: "F", isBooked: true },
    ],
    [
        { id: '13A', number: "A" },
        { id: '13B', number: "B", isBooked: true },
        { id: '13C', number: "C" },
        null,
        { id: '13D', number: "D" },
        { id: '13E', number: "E", isBooked: true },
        { id: '13F', number: "F" },
    ],
    [
        { id: '14A', number: "A", isBooked: true },
        { id: '14B', number: "B", isBooked: true },
        { id: '14C', number: "C" },
        null,
        { id: '14D', number: "D" },
        { id: '14E', number: "E" },
        { id: '14F', number: "F" },
    ],
    [
        { id: '15A', number: "A", isBooked: true },
        { id: '15B', number: "B" },
        { id: '15C', number: "C" },
        null,
        { id: '15D', number: "D", isBooked: true },
        { id: '15E', number: "E" },
        { id: '15F', number: "F" },
    ],
    [
        { id: '16A', number: "A", isBooked: true },
        { id: '16B', number: "B", isBooked: true },
        { id: '16C', number: "C", isBooked: true },
        null,
        { id: '16D', number: "D" },
        { id: '16E', number: "E" },
        { id: '16F', number: "F" },
    ],
    [
        { id: '17A', number: "A" },
        { id: '17B', number: "B" },
        { id: '17C', number: "C" },
        null,
        { id: '17D', number: "D" },
        { id: '17E', number: "E" },
        { id: '17F', number: "F" },
    ],
    [
        { id: '18A', number: "A" },
        { id: '18B', number: "B", isBooked: true },
        { id: '18C', number: "C", isBooked: true },
        null,
        { id: '18D', number: "D", isBooked: true },
        { id: '18E', number: "E", isBooked: true },
        { id: '18F', number: "F" },
    ],
    [
        { id: '19A', number: "A", isBooked: true },
        { id: '19B', number: "B" },
        { id: '19C', number: "C", isBooked: true },
        null,
        { id: '19D', number: "D" },
        { id: '19E', number: "E" },
        { id: '19F', number: "F" },
    ],
    [
        { id: '20A', number: "A" },
        { id: '20B', number: "B" },
        { id: '20C', number: "C" },
        null,
        { id: '20D', number: "D", isBooked: true },
        { id: '20E', number: "E" },
        { id: '20F', number: "F", isBooked: true },
    ],
    [
        { id: '21A', number: "A", isBooked: true },
        { id: '21B', number: "B", isBooked: true },
        { id: '21C', number: "C" },
        null,
        { id: '21D', number: "D" },
        { id: '21E', number: "E" },
        { id: '21F', number: "F" },
    ],
    [
        { id: '22A', number: "A" },
        { id: '22B', number: "B" },
        { id: '22C', number: "C" },
        null,
        { id: '22D', number: "D" },
        { id: '22E', number: "E", isBooked: true },
        { id: '22F', number: "F", isBooked: true },
    ],
    [
        { id: '23A', number: "A" },
        { id: '23B', number: "B", isBooked: true },
        { id: '23C', number: "C" },
        null,
        { id: '23D', number: "D" },
        { id: '23E', number: "E" },
        { id: '23F', number: "F" },
    ],
    [
        { id: '24A', number: "A" },
        { id: '24B', number: "B" },
        { id: '24C', number: "C" },
        null,
        { id: '24D', number: "D", isBooked: true },
        { id: '24E', number: "E" },
        { id: '24F', number: "F" },
    ],
    [
        { id: '25A', number: "A" },
        { id: '25B', number: "B", isBooked: true },
        { id: '25C', number: "C" },
        null,
        { id: '25D', number: "D" },
        { id: '25E', number: "E" },
        { id: '25F', number: "F" },
    ],
    [
        { id: '26A', number: "A", isBooked: true },
        { id: '26B', number: "B" },
        { id: '26C', number: "C" },
        null,
        { id: '26D', number: "D" },
        { id: '26E', number: "E" },
        { id: '26F', number: "F" },
    ],
    [
        { id: '27A', number: "A", isBooked: true },
        { id: '27B', number: "B" },
        { id: '27C', number: "C" },
        null,
        { id: '27D', number: "D" },
        { id: '27E', number: "E" },
        { id: '27F', number: "F" },
    ],
    [
        { id: '28A', number: "A" },
        { id: '28B', number: "B", isBooked: true },
        { id: '28C', number: "C", isBooked: true },
        null,
        { id: '28D', number: "D" },
        { id: '28E', number: "E" },
        { id: '28F', number: "F" },
    ],
    [
        { id: '29A', number: "A" },
        { id: '29B', number: "B" },
        { id: '29C', number: "C" },
        null,
        { id: '29D', number: "D", isBooked: true },
        { id: '29E', number: "E", isBooked: true },
        { id: '29F', number: "F", isBooked: true },
    ],
    [
        { id: '30A', number: "A", isBooked: true },
        { id: '30B', number: "B", isBooked: true },
        { id: '30C', number: "C" },
        null,
        { id: '30D', number: "D" },
        { id: '30E', number: "E" },
        { id: '30F', number: "F" },
    ],
    [
        { id: '31A', number: "A" },
        { id: '31B', number: "B", isBooked: true },
        { id: '31C', number: "C" },
        null,
        { id: '31D', number: "D", isBooked: true },
        { id: '31E', number: "E" },
        { id: '31F', number: "F" },
    ],
    [
        { id: '32A', number: "A" },
        { id: '32B', number: "B" },
        { id: '32C', number: "C", isBooked: true },
        null,
        { id: '32D', number: "D" },
        { id: '32E', number: "E" },
        { id: '32F', number: "F" },
    ],
    [
        { id: '33A', number: "A", isBooked: true },
        { id: '33B', number: "B" },
        { id: '33C', number: "C" },
        null,
        { id: '33D', number: "D" },
        { id: '33E', number: "E" },
        { id: '33F', number: "F" },
    ],
    [
        { id: '34A', number: "A" },
        { id: '34B', number: "B" },
        { id: '34C', number: "C" },
        null,
        { id: '34D', number: "D", isBooked: true },
        { id: '34E', number: "E" },
        { id: '34F', number: "F" },
    ],
    [
        { id: '35A', number: "A" },
        { id: '35B', number: "B" },
        { id: '35C', number: "C" },
        null,
        { id: '35D', number: "D" },
        { id: '35E', number: "E" },
        { id: '35F', number: "F" },
    ],
    [
        { id: '36A', number: "A" },
        { id: '36B', number: "B" },
        { id: '36C', number: "C" },
        null,
        { id: '36D', number: "D" },
        { id: '36E', number: "E" },
        { id: '36F', number: "F" },
    ],
    [
        { id: '37A', number: "A" },
        { id: '37B', number: "B" },
        { id: '37C', number: "C" },
        null,
        { id: '37D', number: "D" },
        { id: '37E', number: "E" },
        { id: '37F', number: "F" },
    ],

       
  ];


  const seatMap = rows.map((row, rowIndex) => 
    row.map(seat => 
      seat ? { ...seat, id: `${rowIndex + 1}${seat.number}` } : null
    )
  );

  const handleSeatClick = (seatId, isBooked) => {
    if (isBooked) return; //

    setSelectedSeat(prevSeat => (prevSeat === seatId ? null : seatId));
  };
  
  const getSeatClass = (seat) => {
    if (!seat) return "w-8 h-8 mx-1";

    const baseClass = "w-8 h-8 rounded-md flex items-center justify-center text-xs font-semibold cursor-pointer m-0.5 transition-colors";

    if (seat.isBooked) {
      return `${baseClass} bg-gray-400 text-gray-700 cursor-not-allowed`;
    }
    if (selectedSeat === seat.id) {
      return `${baseClass} bg-blue-900 text-white border-2 border-blue-900`;
    }
    return `${baseClass} bg-blue-300 text-gray-800 hover:bg-blue-400`;
  };

  const getRowNumber = (rowIndex) => rowIndex + 1;

  const handleContinue = () => {
    if (selectedSeat) {
      navigate("/payment", { state: { seat: selectedSeat } });
    } else {
      alert("Please select a seat first.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <MainHeaderVer2 />
      <div className="mt-8">
        <PreviewBar currentStep={2} />
      </div>

      <div className="flex flex-col lg:flex-row justify-center items-start gap-8 mt-10 mx-auto w-11/12 max-w-6xl bg-white rounded-2xl shadow-md p-6">
        {/* Left side info */}
        <div className="flex-1 space-y-6">
          <Back />

          <div>
            <p className="text-gray-500 text-sm">Passenger</p>
            <h2 className="text-2xl font-bold">Passenger’s name</h2>
            <p className="text-gray-600 mt-1">JT123, Economy</p>
          </div>

          <div className="mt-6">
            <p className="text-3xl font-bold">
              {selectedSeat || "--"}
            </p>
            <p className="text-gray-600">Selected Seat</p>
          </div>

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
              <span className="text-sm">Selected</span>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="mt-6 w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            Continue
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
                    

                    {row.map((seat, seatIndex) =>
                      seat ? (
                        <div
                          key={seat.id}
                          className={getSeatClass(seat)}
                          onClick={() => handleSeatClick(seat.id, seat.isBooked)}
                        >
                          {seat.number}
                        </div>
                      ) : (

                        <div key={`aisle-${rowIndex}-${seatIndex}`} className="w-7 mx-1"></div> 
                      )
                    )}
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