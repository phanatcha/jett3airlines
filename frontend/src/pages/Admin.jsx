import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('flights');
  const [selectedFlights, setSelectedFlights] = useState([]);
  const [formData, setFormData] = useState({
    flightNo: '',
    fromAirport: '',
    toAirport: '',
    airplane: '',
    departureTime: '',
    arrivalTime: '',
    basePrice: '',
    status: ''
  });

  // Sample flight data with IDs
  const [flights] = useState([
    {
      id: 1,
      flightNo: 'JT123',
      route: 'BKK→BER',
      fromAirport: 'BKK',
      toAirport: 'BER',
      airplane: 'A320',
      departureTime: '10/11/2030 12:30:00',
      arrivalTime: '11/11/2030 00:30:00',
      basePrice: '500',
      status: 'Scheduled'
    },
    {
      id: 2,
      flightNo: 'JT124',
      route: 'BKK→BER',
      fromAirport: 'BKK',
      toAirport: 'BER',
      airplane: 'B737',
      departureTime: '10/11/2030 12:30:00',
      arrivalTime: '11/11/2030 00:30:00',
      basePrice: '550',
      status: 'Scheduled'
    },
    {
      id: 3,
      flightNo: 'JT125',
      route: 'BKK→BER',
      fromAirport: 'BKK',
      toAirport: 'BER',
      airplane: 'A380',
      departureTime: '10/11/2030 12:30:00',
      arrivalTime: '11/11/2030 00:30:00',
      basePrice: '600',
      status: 'Scheduled'
    },
    {
      id: 4,
      flightNo: 'JT126',
      route: 'BKK→BER',
      fromAirport: 'BKK',
      toAirport: 'BER',
      airplane: 'B777',
      departureTime: '10/11/2030 12:30:00',
      arrivalTime: '11/11/2030 00:30:00',
      basePrice: '650',
      status: 'Scheduled'
    },
    {
      id: 5,
      flightNo: 'JT127',
      route: 'BKK→BER',
      fromAirport: 'BKK',
      toAirport: 'BER',
      airplane: 'A350',
      departureTime: '10/11/2030 12:30:00',
      arrivalTime: '11/11/2030 00:30:00',
      basePrice: '700',
      status: 'Scheduled'
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddFlight = () => {
    console.log('Adding flight:', formData);
    // Add flight logic here
  };

  const handleSelectFlight = (flightId) => {
    // Only allow one selection at a time (radio button behavior)
    setSelectedFlights([flightId]);
  };

  const handleEditSelected = () => {
    if (selectedFlights.length === 0) {
      alert('Please select a flight to edit');
      return;
    }
    // Navigate to edit page with the selected flight ID
    const selectedFlight = flights.find(f => f.id === selectedFlights[0]);
    navigate('/admin/edit-flight', { state: { flight: selectedFlight } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Sky Background */}
      <header className="bg-[url('/main-bg.png')] bg-cover bg-center text-white px-16 py-6 shadow-lg rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/jett3airlines-gray-logo.svg"
              alt="Jett3Airlines logo"
              className="w-10 h-10 object-contain"
            />
            <p className="text-white text-2xl font-semibold">Jett3Airlines</p>
          </div>
          <p className="text-white text-2xl font-bold">Welcome Admin!</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex justify-center mt-8 px-16">
        <div className="flex bg-white rounded-full shadow-lg overflow-hidden border-2 border-gray-200">
          <button
            onClick={() => setActiveTab('flights')}
            className={`flex items-center space-x-2 px-8 py-4 font-semibold text-lg transition-all duration-300 ${
              activeTab === 'flights'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.7624 18.0807L5.41825 21.4416C5.06692 21.5742 4.74271 21.5385 4.44563 21.3344C4.14854 21.1303 4 20.8449 4 20.478V20.013C4 19.8443 4.03746 19.6854 4.11237 19.5364C4.18729 19.3874 4.29321 19.2656 4.43012 19.1709L13.7624 12.5963V6.86258C13.7624 6.35022 13.9445 5.91192 14.3088 5.54767C14.6739 5.18256 15.1126 5 15.625 5C16.1374 5 16.5757 5.18256 16.9399 5.54767C17.3042 5.91278 17.4867 6.35108 17.4876 6.86258V12.5963L26.8199 19.1709C26.9568 19.2656 27.0627 19.3874 27.1376 19.5364C27.2125 19.6854 27.25 19.8447 27.25 20.0143V20.478C27.25 20.844 27.1015 21.1295 26.8044 21.3344C26.5073 21.5394 26.1831 21.5751 25.8317 21.4416L17.4876 18.0807V23.6736L20.8136 26.0245C20.9238 26.1054 21.01 26.2031 21.072 26.3177C21.134 26.4322 21.165 26.5571 21.165 26.6922V27.1443C21.165 27.4259 21.0573 27.6477 20.842 27.8095C20.6268 27.9714 20.3874 28.0123 20.1239 27.9322L15.625 26.5605L11.1261 27.9322C10.8618 28.0115 10.6224 27.9706 10.408 27.8095C10.1935 27.6485 10.0859 27.4268 10.085 27.1443V26.6858C10.085 26.5575 10.116 26.4356 10.178 26.3202C10.24 26.2049 10.3262 26.1063 10.4364 26.0245L13.7624 23.6736V18.0807Z" fill="currentColor"/>
            </svg>
            <span>Flights</span>
          </button>
          
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center space-x-2 px-8 py-4 font-semibold text-lg transition-all duration-300 ${
              activeTab === 'bookings'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            <img 
              src="/icons/tabler_book.svg" 
              alt="Bookings" 
              className={`w-6 h-6 ${activeTab === 'bookings' ? 'brightness-0 invert' : ''}`}
            />
            <span>Bookings</span>
          </button>
          
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-2 px-8 py-4 font-semibold text-lg transition-all duration-300 ${
              activeTab === 'reports'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.87533 18.0833L4.52116 18.1737L10.4241 12.2708C10.3056 11.8371 10.3055 11.3796 10.4236 10.9457C10.5417 10.5119 10.7738 10.1176 11.0957 9.80375C12.1032 8.78333 13.7307 8.78333 14.7382 9.80375C15.4228 10.4754 15.6424 11.4312 15.4099 12.2708L18.7295 15.5904L19.3753 15.5C19.6078 15.5 19.8274 15.5 20.0212 15.5904L24.6324 10.9792C24.542 10.7854 24.542 10.5658 24.542 10.3333C24.542 9.64819 24.8142 8.99111 25.2986 8.50664C25.7831 8.02217 26.4402 7.75 27.1253 7.75C27.8105 7.75 28.4675 8.02217 28.952 8.50664C29.4365 8.99111 29.7087 9.64819 29.7087 10.3333C29.7087 11.0185 29.4365 11.6756 28.952 12.16C28.4675 12.6445 27.8105 12.9167 27.1253 12.9167C26.8928 12.9167 26.6732 12.9167 26.4795 12.8263L21.8682 17.4375C21.9587 17.6312 21.9587 17.8508 21.9587 18.0833C21.9587 18.7685 21.6865 19.4256 21.202 19.91C20.7175 20.3945 20.0605 20.6667 19.3753 20.6667C18.6902 20.6667 18.0331 20.3945 17.5486 19.91C17.0642 19.4256 16.792 18.7685 16.792 18.0833L16.8824 17.4375L13.5628 14.1179C13.1495 14.2083 12.6845 14.2083 12.2712 14.1179L6.36824 20.0208L6.45866 20.6667C6.45866 21.3518 6.18649 22.0089 5.70202 22.4934C5.21755 22.9778 4.56047 23.25 3.87533 23.25C3.19018 23.25 2.5331 22.9778 2.04863 22.4934C1.56416 22.0089 1.29199 21.3518 1.29199 20.6667C1.29199 19.9815 1.56416 19.3244 2.04863 18.84C2.5331 18.3555 3.19018 18.0833 3.87533 18.0833Z" fill="currentColor"/>
            </svg>
            <span>Reports</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-16 py-8">
        {activeTab === 'flights' && (
          <>
            {/* Add Flight Section */}
            <div className="mb-12">
              <h2 className="text-black mb-6">Add flight</h2>
              
              <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Flight Number */}
                <div>
                  <label className="block text-black text-base font-semibold mb-2">
                    Flight Number
                  </label>
                  <input
                    type="text"
                    name="flightNo"
                    value={formData.flightNo}
                    onChange={handleInputChange}
                    placeholder="Flight no"
                    className="w-full px-4 py-3 rounded-lg border-2 border-black text-lg placeholder-gray-400 focus:outline-none focus:border-primary-300"
                  />
                </div>

                {/* From */}
                <div>
                  <label className="block text-black text-base font-semibold mb-2">
                    From
                  </label>
                  <input
                    type="text"
                    name="fromAirport"
                    value={formData.fromAirport}
                    onChange={handleInputChange}
                    placeholder="Airport id"
                    className="w-full px-4 py-3 rounded-lg border-2 border-black text-lg placeholder-gray-400 focus:outline-none focus:border-primary-300"
                  />
                </div>

                {/* To */}
                <div>
                  <label className="block text-black text-base font-semibold mb-2">
                    To
                  </label>
                  <input
                    type="text"
                    name="toAirport"
                    value={formData.toAirport}
                    onChange={handleInputChange}
                    placeholder="Airport id"
                    className="w-full px-4 py-3 rounded-lg border-2 border-black text-lg placeholder-gray-400 focus:outline-none focus:border-primary-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Airplane */}
                <div>
                  <label className="block text-black text-base font-semibold mb-2">
                    Airplane
                  </label>
                  <input
                    type="text"
                    name="airplane"
                    value={formData.airplane}
                    onChange={handleInputChange}
                    placeholder="Airplane id"
                    className="w-full px-4 py-3 rounded-lg border-2 border-black text-lg placeholder-gray-400 focus:outline-none focus:border-primary-300"
                  />
                </div>

                {/* Departure Time */}
                <div>
                  <label className="block text-black text-base font-semibold mb-2">
                    Departure time
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      name="departureTime"
                      value={formData.departureTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-black text-lg placeholder-gray-400 focus:outline-none focus:border-primary-300"
                    />
                  </div>
                </div>

                {/* Arrival Time */}
                <div>
                  <label className="block text-black text-base font-semibold mb-2">
                    Arrival time
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      name="arrivalTime"
                      value={formData.arrivalTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-black text-lg placeholder-gray-400 focus:outline-none focus:border-primary-300"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Base Price */}
                <div>
                  <label className="block text-black text-base font-semibold mb-2">
                    Base price
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    placeholder="Minimum price"
                    className="w-full px-4 py-3 rounded-lg border-2 border-black text-lg placeholder-gray-400 focus:outline-none focus:border-primary-300"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-black text-base font-semibold mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-black text-lg focus:outline-none focus:border-primary-300"
                  >
                    <option value="">Select status</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Add Button */}
                <div className="flex items-end">
                  <button
                    onClick={handleAddFlight}
                    className="w-full bg-primary-300 text-white px-6 py-3 rounded-lg text-xl font-semibold hover:bg-primary-500 transition-colors duration-200 shadow-md"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Flights Table */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-black">Flights</h2>
                <button 
                  onClick={handleEditSelected}
                  className="text-gray-500 text-base font-semibold underline hover:text-primary-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedFlights.length === 0}
                >
                  Edit {selectedFlights.length > 0 && `(${selectedFlights.length})`}
                </button>
              </div>

              <div className="bg-primary-500/50 rounded-3xl overflow-hidden shadow-xl">
                {/* Table Header */}
                <div className="bg-primary-500 px-8 py-4">
                  <div className="grid grid-cols-6 gap-4 text-white font-semibold text-lg items-center">
                    <div>Select</div>
                    <div>Flight no</div>
                    <div>Route</div>
                    <div>Departure time</div>
                    <div>Arrival time</div>
                    <div>Status</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-300">
                  {flights.map((flight) => (
                    <div
                      key={flight.id}
                      className={`grid grid-cols-6 gap-4 px-8 py-4 text-black font-medium text-lg transition-colors cursor-pointer ${
                        selectedFlights.includes(flight.id)
                          ? 'bg-primary-300/40'
                          : 'hover:bg-primary-500/30'
                      }`}
                      onClick={() => handleSelectFlight(flight.id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="selectedFlight"
                          checked={selectedFlights.includes(flight.id)}
                          onChange={() => handleSelectFlight(flight.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-5 h-5 cursor-pointer accent-primary-300"
                        />
                      </div>
                      <div>{flight.flightNo}</div>
                      <div>{flight.route}</div>
                      <div>{flight.departureTime}</div>
                      <div>{flight.arrivalTime}</div>
                      <div>{flight.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'bookings' && (
          <div className="text-center py-20">
            <h2 className="text-black mb-4">Bookings Management</h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="text-center py-20">
            <h2 className="text-black mb-4">Reports</h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;