import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainHeaderVer2 from '../components/MainHeaderVer2';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';
import airplaneIcon from '/icons/airplane-v2-icon.svg';

const MyBookings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/my-bookings' } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (authLoading) return;
    
    if (isAuthenticated()) {
      fetchBookings();
    }
  }, [authLoading, currentPage]);

  useEffect(() => {
    applyFilters();
  }, [bookings, activeFilter, searchQuery]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await bookingsAPI.getAll();

      if (response.success) {
        setBookings(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      } else {
        setError(response.error?.message || 'Failed to load bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];
    const now = new Date();

    if (activeFilter === 'upcoming') {
      filtered = filtered.filter(booking => {
        const departureDate = new Date(booking.depart_when);
        return departureDate > now && booking.status !== 'cancelled';
      });
    } else if (activeFilter === 'past') {
      filtered = filtered.filter(booking => {
        const departureDate = new Date(booking.depart_when);
        return departureDate <= now || booking.status === 'completed';
      });
    } else if (activeFilter === 'cancelled') {
      filtered = filtered.filter(booking => booking.status === 'cancelled');
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.booking_no?.toLowerCase().includes(query) ||
        booking.flight_no?.toLowerCase().includes(query) ||
        booking.departure_city?.toLowerCase().includes(query) ||
        booking.arrival_city?.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleViewDetails = (bookingId) => {
    navigate(`/booking-details/${bookingId}`);
  };

  const handleCancelBooking = async (bookingId, bookingNo) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${bookingNo}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await bookingsAPI.cancel(bookingId);

      if (response.success) {
        alert(response.message || 'Booking cancelled successfully');
        fetchBookings();
      } else {
        alert(response.error?.message || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(err.message || 'Failed to cancel booking. Please try again.');
    }
  };

  const handleViewTicket = (bookingId) => {
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancelBooking = (booking) => {
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return false;
    }
    
    const departureDate = new Date(booking.depart_when);
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
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <MainHeaderVer2 />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstname || 'Guest'}! Manage your flight bookings here.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => navigate('/flights')}
            className="bg-blue-900 text-white p-4 rounded-lg hover:bg-blue-800 transition flex items-center justify-center gap-2"
          >
            <span className="text-xl">✈️</span>
            <span>Book New Flight</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="bg-white border-2 border-blue-900 text-blue-900 p-4 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2"
          >
            <span className="text-xl">👤</span>
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => setSearchQuery('')}
            className="bg-white border-2 border-gray-300 text-gray-700 p-4 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <span className="text-xl">🔄</span>
            <span>Refresh</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by booking number, flight number, or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                activeFilter === 'all'
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`px-4 py-2 rounded-lg transition ${
                activeFilter === 'upcoming'
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveFilter('past')}
              className={`px-4 py-2 rounded-lg transition ${
                activeFilter === 'past'
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setActiveFilter('cancelled')}
              className={`px-4 py-2 rounded-lg transition ${
                activeFilter === 'cancelled'
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : activeFilter === 'all'
                ? "You haven't made any bookings yet"
                : `No ${activeFilter} bookings found`}
            </p>
            {activeFilter === 'all' && !searchQuery && (
              <button
                onClick={() => navigate('/flights')}
                className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition"
              >
                Book Your First Flight
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.booking_id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left: Flight Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status?.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        Booking: {booking.booking_no}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mb-2">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{booking.departure_iata}</p>
                        <p className="text-sm text-gray-600">{booking.departure_city}</p>
                        <p className="text-sm font-medium">{formatTime(booking.depart_when)}</p>
                      </div>

                      <div className="flex-1 flex items-center justify-center">
                        <img
                          src={airplaneIcon}
                          alt="Flight"
                          className="w-8 h-8 opacity-60"
                        />
                      </div>

                      <div className="text-center">
                        <p className="text-2xl font-bold">{booking.arrival_iata}</p>
                        <p className="text-sm text-gray-600">{booking.arrival_city}</p>
                        <p className="text-sm font-medium">{formatTime(booking.arrive_when)}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>📅 {formatDate(booking.depart_when)}</span>
                      <span>✈️ {booking.flight_no}</span>
                      {booking.support === 'Yes' && <span>🎧 Support</span>}
                      {booking.fasttrack === 'Yes' && <span>⚡ Fast Track</span>}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    <button
                      onClick={() => handleViewDetails(booking.booking_id)}
                      className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleViewTicket(booking.booking_id)}
                      className="bg-white border-2 border-blue-900 text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-50 transition text-sm"
                    >
                      View E-Ticket
                    </button>
                    {canCancelBooking(booking) && (
                      <button
                        onClick={() => handleCancelBooking(booking.booking_id, booking.booking_no)}
                        className="bg-white border-2 border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition text-sm"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
