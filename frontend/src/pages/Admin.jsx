import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminAPI } from '../services/api';
import CountryAirportSelector from '../components/CountryAirportSelector';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('flights');
  const [selectedFlights, setSelectedFlights] = useState([]);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [reportView, setReportView] = useState('table');
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

  const [departureCountry, setDepartureCountry] = useState('');
  const [arrivalCountry, setArrivalCountry] = useState('');

  const [reportsMetrics, setReportsMetrics] = useState([
    { metric: 'Total flights', value: '0', note: 'All flights in system' },
    { metric: 'Total bookings', value: '0', note: 'All bookings made' },
    { metric: 'Total revenue', value: '0.00', note: 'Completed payments' },
    { metric: 'Total cancellations', value: '0', note: 'Cancelled bookings' },
  ]);

  const [bookingsPerDayData, setBookingsPerDayData] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const [flights, setFlights] = useState([]);
  const [isLoadingFlights, setIsLoadingFlights] = useState(true);
  
  const [airports, setAirports] = useState([]);
  const [airplanes, setAirplanes] = useState([]);
  const [isLoadingAirports, setIsLoadingAirports] = useState(false);
  const [isLoadingAirplanes, setIsLoadingAirplanes] = useState(false);

  const fetchFlights = async () => {
    try {
      setIsLoadingFlights(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/admin/flights?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const transformedFlights = result.data.map(flight => ({
          id: flight.flight_id,
          flightNo: flight.flight_no,
          route: `${flight.depart_airport?.code || flight.depart_airport_id}→${flight.arrive_airport?.code || flight.arrive_airport_id}`,
          fromAirport: flight.depart_airport_id,
          toAirport: flight.arrive_airport_id,
          airplane: flight.airplane_id,
          departureTime: new Date(flight.depart_when).toLocaleString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }).replace(',', ''),
          arrivalTime: new Date(flight.arrive_when).toLocaleString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }).replace(',', ''),
          basePrice: flight.base_price,
          status: flight.status
        }));
        setFlights(transformedFlights);
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
      alert('Failed to load flights. Please try again.');
    } finally {
      setIsLoadingFlights(false);
    }
  };

  const fetchAirports = async () => {
    try {
      setIsLoadingAirports(true);
      const response = await fetch('http://localhost:8080/api/v1/airports');
      const result = await response.json();
      
      if (result.success && result.data) {
        setAirports(result.data);
      }
    } catch (error) {
      console.error('Error fetching airports:', error);
    } finally {
      setIsLoadingAirports(false);
    }
  };

  const fetchAirplanes = async () => {
    try {
      setIsLoadingAirplanes(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/admin/airplanes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setAirplanes(result.data);
      }
    } catch (error) {
      console.error('Error fetching airplanes:', error);
    } finally {
      setIsLoadingAirplanes(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setIsLoadingBookings(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const transformedBookings = result.data.map(booking => ({
          id: booking.booking_id,
          bookingNo: booking.booking_no || `BK${booking.booking_id}`,
          flightNo: booking.flight_no || 'N/A',
          fastTrack: booking.fasttrack ? 'Yes' : 'No',
          support: booking.support ? 'Yes' : 'No',
          capacity: booking.passenger_count || 0,
          status: booking.status || 'Pending'
        }));
        setBookings(transformedBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Failed to load bookings. Please try again.');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchFlights();
    fetchAirports();
    fetchAirplanes();
  }, []);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchReportsData = async () => {
    try {
      setIsLoadingReports(true);
      const token = localStorage.getItem('token');
      
      const metricsResponse = await fetch('http://localhost:8080/api/v1/admin/reports/metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const metricsData = await metricsResponse.json();
      
      if (metricsData.success) {
        setReportsMetrics([
          { 
            metric: 'Total flights', 
            value: metricsData.data.totalFlights.toLocaleString(), 
            note: 'All flights in system' 
          },
          { 
            metric: 'Total bookings', 
            value: metricsData.data.totalBookings.toLocaleString(), 
            note: 'All bookings made' 
          },
          { 
            metric: 'Total revenue', 
            value: `$${parseFloat(metricsData.data.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            note: 'Completed payments' 
          },
          { 
            metric: 'Total cancellations', 
            value: metricsData.data.totalCancellations.toLocaleString(), 
            note: 'Cancelled bookings' 
          }
        ]);
      }
      
      const bookingsResponse = await fetch('http://localhost:8080/api/v1/admin/reports/bookings-per-day?days=7', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bookingsData = await bookingsResponse.json();
      
      if (bookingsData.success) {
        setBookingsPerDayData(bookingsData.data.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
          bookings: item.bookings
        })));
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
      alert('Failed to load reports data. Please try again.');
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReportsData();
    }
  }, [activeTab]);

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const type = reportView === 'table' ? 'metrics' : 'bookings';
      
      const response = await fetch(`http://localhost:8080/api/v1/admin/reports/export/csv?type=${type}&days=30`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jett3-report-${type}-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        alert(`Failed to export CSV: ${errorData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const type = reportView === 'table' ? 'metrics' : 'chart';
      
      const response = await fetch(`http://localhost:8080/api/v1/admin/reports/export/pdf?type=${type}&days=30`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jett3-report-${type}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        alert(`Failed to export PDF: ${errorData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddFlight = async () => {
    try {
      if (!formData.fromAirport || !formData.toAirport || 
          !formData.airplane || !formData.departureTime || !formData.arrivalTime || 
          !formData.status) {
        alert('Please fill in all required fields (From, To, Airplane, Departure Time, Arrival Time, Status)');
        return;
      }

      const departureDate = new Date(formData.departureTime);
      const arrivalDate = new Date(formData.arrivalTime);
      
      if (departureDate >= arrivalDate) {
        alert('Departure time must be before arrival time');
        return;
      }

      const now = new Date();
      if (departureDate <= now) {
        alert('Departure time must be in the future');
        return;
      }

      const departAirportId = parseInt(formData.fromAirport);
      const arriveAirportId = parseInt(formData.toAirport);
      const airplaneId = parseInt(formData.airplane);

      if (isNaN(departAirportId) || isNaN(arriveAirportId) || isNaN(airplaneId)) {
        alert('Airport IDs and Airplane ID must be valid numbers');
        return;
      }

      if (departAirportId === arriveAirportId) {
        alert('Departure and arrival airports must be different');
        return;
      }

      const flightData = {
        flight_no: formData.flightNo || undefined,
        depart_airport_id: departAirportId,
        arrive_airport_id: arriveAirportId,
        airplane_id: airplaneId,
        depart_when: departureDate.toISOString(),
        arrive_when: arrivalDate.toISOString(),
        status: formData.status
      };

      const response = await adminAPI.createFlight(flightData);
      
      if (response.success) {
        alert('Flight created successfully!');
        
        setFormData({
          flightNo: '',
          fromAirport: '',
          toAirport: '',
          airplane: '',
          departureTime: '',
          arrivalTime: '',
          basePrice: '',
          status: ''
        });
        
        setDepartureCountry('');
        setArrivalCountry('');
        
        await fetchFlights();
      } else {
        alert(`Failed to create flight: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating flight:', error);
      
      let errorMessage = 'Failed to create flight. Please check all fields and try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error) {
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = JSON.stringify(error.error);
        }
      }
      
      alert(`Failed to create flight: ${errorMessage}`);
    }
  };

  const handleSelectFlight = (flightId) => {
    setSelectedFlights([flightId]);
  };

  const handleEditSelected = () => {
    if (selectedFlights.length === 0) {
      alert('Please select a flight to edit');
      return;
    }
    const selectedFlight = flights.find(f => f.id === selectedFlights[0]);
    navigate('/admin/edit-flight', { state: { flight: selectedFlight } });
  };

  const handleSelectBooking = (bookingId) => {
    setSelectedBookings([bookingId]);
  };

  const handleEditBooking = () => {
    if (selectedBookings.length === 0) {
      alert('Please select a booking to edit');
      return;
    }
    const selectedBooking = bookings.find(b => b.id === selectedBookings[0]);
    navigate('/admin/edit-booking', { state: { booking: selectedBooking } });
  };

  const handleDeleteFlight = async (flightId) => {
    if (!window.confirm('Are you sure you want to delete this flight? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/v1/admin/flights/${flightId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        alert('Flight deleted successfully!');
        await fetchFlights();
      } else {
        alert(`Failed to delete flight: ${result.error?.message || result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting flight:', error);
      alert('Failed to delete flight. Please try again.');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will change its status to Cancelled.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/v1/admin/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        alert('Booking cancelled successfully!');
        await fetchBookings();
      } else {
        const errorMsg = result.error?.message || result.message || 'Unknown error';
        alert(`Failed to cancel booking: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(`Failed to cancel booking: ${error.message}`);
    }
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

                {/* From - Using CountryAirportSelector */}
                <CountryAirportSelector
                  label="From"
                  selectedCountry={departureCountry}
                  onCountryChange={(country) => {
                    setDepartureCountry(country);
                    setFormData(prev => ({ ...prev, fromAirport: '' }));
                  }}
                  selectedAirport={formData.fromAirport}
                  onAirportChange={(airportId) => {
                    setFormData(prev => ({ ...prev, fromAirport: airportId }));
                  }}
                  countryPlaceholder="Select departure country"
                  airportPlaceholder="Select departure airport"
                />

                {/* To - Using CountryAirportSelector */}
                <CountryAirportSelector
                  label="To"
                  selectedCountry={arrivalCountry}
                  onCountryChange={(country) => {
                    setArrivalCountry(country);
                    setFormData(prev => ({ ...prev, toAirport: '' }));
                  }}
                  selectedAirport={formData.toAirport}
                  onAirportChange={(airportId) => {
                    setFormData(prev => ({ ...prev, toAirport: airportId }));
                  }}
                  countryPlaceholder="Select arrival country"
                  airportPlaceholder="Select arrival airport"
                />
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Airplane */}
                <div>
                  <label className="block text-black text-base font-semibold mb-2">
                    Airplane
                  </label>
                  <select
                    name="airplane"
                    value={formData.airplane}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-black text-lg focus:outline-none focus:border-primary-300"
                    disabled={isLoadingAirplanes}
                  >
                    <option value="">Select airplane</option>
                    {airplanes.map((airplane) => (
                      <option key={airplane.airplane_id} value={airplane.airplane_id}>
                        {airplane.airplane_id} - {airplane.type} ({airplane.registration})
                      </option>
                    ))}
                  </select>
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
                    <option value="Boarding">Boarding</option>
                    <option value="Departed">Departed</option>
                    <option value="Arrived">Arrived</option>
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
              </div>

              <div className="bg-primary-500/50 rounded-3xl overflow-hidden shadow-xl">
                {/* Table Header */}
                <div className="bg-primary-500 px-8 py-4">
                  <div className="grid grid-cols-8 gap-4 text-white font-semibold text-lg items-center">
                    <div></div>
                    <div>Actions</div>
                    <div>Flight no</div>
                    <div>Route</div>
                    <div>Departure time</div>
                    <div>Arrival time</div>
                    <div>Status</div>
                    <div>Price</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-300">
                  {flights.map((flight) => (
                    <div
                      key={flight.id}
                      className="grid grid-cols-8 gap-4 px-8 py-4 text-black font-medium text-lg hover:bg-primary-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFlight(flight.id);
                          }}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-md"
                          title="Delete flight"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/admin/edit-flight', { state: { flight } });
                          }}
                          className="bg-primary-300 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:bg-primary-500 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                      <div>{flight.flightNo}</div>
                      <div>{flight.route}</div>
                      <div>{flight.departureTime}</div>
                      <div>{flight.arrivalTime}</div>
                      <div>{flight.status}</div>
                      <div>${flight.basePrice || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'bookings' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-black">Bookings</h2>
            </div>

            <div className="bg-primary-500/50 rounded-3xl overflow-hidden shadow-xl">
              {/* Table Header */}
              <div className="bg-primary-500 px-8 py-4">
                <div className="grid grid-cols-7 gap-4 text-white font-semibold text-lg items-center">
                  <div></div>
                  <div>Actions</div>
                  <div>Booking no</div>
                  <div>Flight no</div>
                  <div>Fast track</div>
                  <div>Capacity</div>
                  <div>Status</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-300">
                {isLoadingBookings ? (
                  <div className="px-8 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="px-8 py-12 text-center">
                    <p className="text-gray-600 font-medium text-lg">No bookings found</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="grid grid-cols-7 gap-4 px-8 py-4 text-black font-medium text-lg hover:bg-primary-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBooking(booking.id);
                        }}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-md"
                        title="Delete booking"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/admin/edit-booking', { state: { booking } });
                        }}
                        className="bg-primary-300 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:bg-primary-500 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <div>{booking.bookingNo}</div>
                    <div>{booking.flightNo}</div>
                    <div>{booking.fastTrack}</div>
                    <div>{booking.capacity}</div>
                    <div>{booking.status}</div>
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            {/* View Toggle and Export Buttons */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex bg-primary-500 rounded-full overflow-hidden shadow-md">
                <button
                  onClick={() => setReportView('table')}
                  className={`px-6 py-2 font-semibold text-base transition-all duration-300 ${
                    reportView === 'table'
                      ? 'bg-primary-300 text-white'
                      : 'bg-primary-500 text-white hover:bg-primary-400'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setReportView('graph')}
                  className={`px-6 py-2 font-semibold text-base transition-all duration-300 ${
                    reportView === 'graph'
                      ? 'bg-primary-300 text-white'
                      : 'bg-primary-500 text-white hover:bg-primary-400'
                  }`}
                >
                  Graph
                </button>
              </div>

              {/* Show Export CSV and Download PDF only in table view */}
              {reportView === 'table' && (
                <div className="flex gap-4">
                  <button 
                    onClick={handleExportCSV}
                    className="text-gray-400 text-base font-semibold hover:text-gray-600 transition-colors"
                  >
                    Export CSV
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    className="text-gray-400 text-base font-semibold hover:text-gray-600 transition-colors"
                  >
                    Download PDF
                  </button>
                </div>
              )}
            </div>

            {/* Table View */}
            {reportView === 'table' && (
              <div className="bg-primary-500/50 rounded-3xl overflow-hidden shadow-xl">
                {/* Table Header */}
                <div className="bg-primary-500 px-8 py-4">
                  <div className="grid grid-cols-3 gap-4 text-white font-semibold text-lg items-center">
                    <div>Metric</div>
                    <div>Value</div>
                    <div>Note</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-300">
                  {isLoadingReports ? (
                    <div className="px-8 py-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                      <p className="mt-4 text-gray-600 font-medium">Loading reports data...</p>
                    </div>
                  ) : (
                    reportsMetrics.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-3 gap-4 px-8 py-4 text-black font-medium text-lg"
                      >
                        <div>{item.metric}</div>
                        <div>{item.value}</div>
                        <div>{item.note}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Graph View */}
            {reportView === 'graph' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-black">Bookings/day</h3>
                  <button 
                    onClick={handleExportPDF}
                    className="text-gray-400 text-base font-semibold hover:text-gray-600 transition-colors"
                  >
                    Download PDF
                  </button>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8">
                  {isLoadingReports ? (
                    <div className="flex flex-col items-center justify-center h-[400px]">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                      <p className="mt-4 text-gray-600 font-medium">Loading bookings data...</p>
                    </div>
                  ) : bookingsPerDayData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px]">
                      <p className="text-gray-600 font-medium text-lg">No booking data available for the selected period</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={bookingsPerDayData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#666"
                          style={{ fontSize: '14px' }}
                        />
                        <YAxis 
                          stroke="#666"
                          style={{ fontSize: '14px' }}
                          tickFormatter={(value) => {
                            if (value >= 1000) {
                              return `${(value / 1000).toFixed(1)}k`;
                            }
                            return value.toString();
                          }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #ccc',
                            borderRadius: '8px'
                          }}
                          formatter={(value) => [`${value.toLocaleString()} bookings`, 'Bookings']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="bookings" 
                          stroke="#4A90A4" 
                          strokeWidth={2}
                          dot={{ fill: '#E74C3C', r: 6 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;