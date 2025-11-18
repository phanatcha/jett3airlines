import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainHeaderVer2 from '../components/MainHeaderVer2';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';
import airplaneIcon from '/icons/airplane-v2-icon.svg';

const BookingDetails = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { isAuthenticated } = useAuth();
  
  const [bookingData, setBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBookingDetails = async () => {
      console.log('=== BookingDetails Loading ===');
      console.log('Booking ID:', bookingId);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        console.log('No token, redirecting to login');
        navigate('/login', { state: { from: `/booking-details/${bookingId}` } });
        return;
      }

      if (bookingId) {
        try {
          setIsLoading(true);
          setError(null);

          console.log('Fetching booking details from API...');
          const response = await bookingsAPI.getById(bookingId);
          console.log('API Response:', response);

          if (response.success) {
            console.log('Booking data received:', response.data);
            setBookingData(response.data);
          } else {
            console.error('API returned error:', response.error);
            setError(response.error?.message || 'Failed to load booking details');
          }
        } catch (err) {
          console.error('=== Error fetching booking details ===');
          console.error('Error object:', err);
          console.error('Error response:', err.response);
          console.error('Error message:', err.message);
          
          // If 401 error, redirect to login
          if (err.response?.status === 401) {
            console.log('401 error, removing token and redirecting');
            localStorage.removeItem('token');
            navigate('/login', { state: { from: `/booking-details/${bookingId}` } });
            return;
          }
          
          setError(err.response?.data?.error?.message || err.message || 'Failed to load booking details');
        } finally {
          setIsLoading(false);
          console.log('=== BookingDetails Loading Complete ===');
        }
      } else {
        console.log('No booking ID provided');
        setIsLoading(false);
        setError('No booking ID provided');
      }
    };

    loadBookingDetails();
  }, [bookingId, navigate]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await bookingsAPI.getById(bookingId);

      if (response.success) {
        setBookingData(response.data);
      } else {
        setError(response.error?.message || 'Failed to load booking details');
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError(err.message || 'Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await bookingsAPI.cancel(bookingId);

      if (response.success) {
        alert(response.message || 'Booking cancelled successfully');
        fetchBookingDetails();
      } else {
        alert(response.error?.message || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const handleDownloadTicket = () => {
    navigate('/confirmation', { state: { bookingId } });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const canCancelBooking = () => {
    if (!bookingData?.booking) return false;
    
    const { status, depart_when } = bookingData.booking;
    
    if (status === 'cancelled' || status === 'completed') {
      return false;
    }
    
    const departureDate = new Date(depart_when);
    const now = new Date();
    const hoursDifference = (departureDate - now) / (1000 * 60 * 60);
    
    return hoursDifference > 24;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <MainHeaderVer2 />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <MainHeaderVer2 />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Booking not found'}</p>
            <button
              onClick={() => navigate('/my-bookings')}
              className="bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-800"
            >
              Back to My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { booking, passengers, paymentStatus, totalCost } = bookingData;

  return (
    <div className="bg-gray-50 min-h-screen">
      <MainHeaderVer2 />

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/my-bookings')}
              className="text-blue-900 hover:underline mb-2 flex items-center gap-1"
            >
              ← Back to My Bookings
            </button>
            <h1 className="text-3xl font-bold">Booking Details</h1>
          </div>
          <div className={`px-4 py-2 rounded-lg border-2 font-semibold ${getStatusColor(booking.status)}`}>
            {booking.status?.toUpperCase()}
          </div>
        </div>

        {/* Booking Summary Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Booking Number</p>
              <p className="font-semibold text-lg">{booking.booking_no}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Booking Date</p>
              <p className="font-semibold">{formatDate(booking.created_date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Passengers</p>
              <p className="font-semibold">{passengers?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Flight Details Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Flight Information</h2>
          
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <p className="text-3xl font-bold mb-1">{booking.departure_iata}</p>
              <p className="text-gray-600 mb-2">{booking.departure_city}</p>
              <p className="text-sm text-gray-500">{booking.departure_airport}</p>
            </div>

            <div className="flex-1 flex flex-col items-center">
              <img src={airplaneIcon} alt="Flight" className="w-12 h-12 opacity-60 mb-2" />
              <p className="text-sm text-gray-500">Flight {booking.flight_no}</p>
            </div>

            <div className="text-center flex-1">
              <p className="text-3xl font-bold mb-1">{booking.arrival_iata}</p>
              <p className="text-gray-600 mb-2">{booking.arrival_city}</p>
              <p className="text-sm text-gray-500">{booking.arrival_airport}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-500">Departure</p>
              <p className="font-semibold">{formatDateTime(booking.depart_when)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Arrival</p>
              <p className="font-semibold">{formatDateTime(booking.arrive_when)}</p>
            </div>
            {booking.airplane_type && (
              <div>
                <p className="text-sm text-gray-500">Aircraft</p>
                <p className="font-semibold">{booking.airplane_type}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Flight Status</p>
              <p className="font-semibold">{booking.flight_status || 'Scheduled'}</p>
            </div>
          </div>
        </div>

        {/* Passenger Details Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Passenger Information</h2>
          {passengers && passengers.length > 0 ? (
            <div className="space-y-4">
              {passengers.map((passenger, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">
                      Passenger {index + 1}
                    </h3>
                    {passenger.seat_no && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Seat {passenger.seat_no}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Full Name</p>
                      <p className="font-medium">{passenger.firstname} {passenger.lastname}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Gender</p>
                      <p className="font-medium">{passenger.gender}</p>
                    </div>
                    {passenger.phone && (
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium">{passenger.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No passenger information available</p>
          )}
        </div>

        {/* Additional Services Card */}
        {(booking.support === 'Yes' || booking.fasttrack === 'Yes') && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Additional Services</h2>
            <div className="space-y-2">
              {booking.support === 'Yes' && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-2xl">🎧</span>
                  <div>
                    <p className="font-semibold">Customer Support Service</p>
                    <p className="text-sm text-gray-600">24/7 dedicated support for your journey</p>
                  </div>
                </div>
              )}
              {booking.fasttrack === 'Yes' && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-semibold">Fast Track Service</p>
                    <p className="text-sm text-gray-600">Priority check-in and security clearance</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Information Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <p className={`font-semibold ${
                paymentStatus === 'completed' ? 'text-green-600' :
                paymentStatus === 'pending' ? 'text-yellow-600' :
                paymentStatus === 'refunded' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                {paymentStatus?.toUpperCase() || 'PENDING'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-semibold text-lg">
                ${totalCost ? totalCost.toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={handleDownloadTicket}
            className="flex-1 bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition font-semibold"
          >
            Download E-Ticket
          </button>
          
          {canCancelBooking() && (
            <button
              onClick={handleCancelBooking}
              className="flex-1 bg-white border-2 border-red-500 text-red-500 py-3 rounded-lg hover:bg-red-50 transition font-semibold"
            >
              Cancel Booking
            </button>
          )}
          
          {!canCancelBooking() && booking.status === 'cancelled' && (
            <div className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-lg text-center font-semibold">
              Booking Cancelled
            </div>
          )}
          
          {!canCancelBooking() && booking.status !== 'cancelled' && (
            <div className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-lg text-center text-sm">
              Cancellation not available<br/>
              <span className="text-xs">(Must be 24+ hours before departure)</span>
            </div>
          )}
        </div>

        {/* Cancellation Policy Notice */}
        {canCancelBooking() && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Cancellation Policy:</strong> You can cancel this booking up to 24 hours before departure. 
              If payment was completed, a refund will be processed automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetails;
