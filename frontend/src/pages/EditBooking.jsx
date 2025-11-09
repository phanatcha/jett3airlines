import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const EditBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.booking;

  const [formData, setFormData] = useState({
    bookingNo: '',
    flightNo: '',
    support: '',
    fastTrack: '',
    status: ''
  });

  useEffect(() => {
    if (bookingData) {
      setFormData({
        bookingNo: bookingData.bookingNo || '',
        flightNo: bookingData.flightNo || '',
        support: bookingData.support || '',
        fastTrack: bookingData.fastTrack || '',
        status: bookingData.status || ''
      });
    } else {
      // If no booking data, redirect back to admin
      navigate('/admin');
    }
  }, [bookingData, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirm = async () => {
    try {
      // Validate that we have a booking ID
      if (!bookingData || !bookingData.id) {
        alert('Error: No booking data available');
        navigate('/admin');
        return;
      }

      // Validate required fields
      if (!formData.status) {
        alert('Please select a status');
        return;
      }

      if (!formData.support) {
        alert('Please select a support option');
        return;
      }

      if (!formData.fastTrack) {
        alert('Please select a fast track option');
        return;
      }

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please log in again.');
        navigate('/login');
        return;
      }

      const bookingId = bookingData.id;

      // Prepare update data with status, support, and fasttrack
      const updateData = {
        status: formData.status,
        support: formData.support,
        fasttrack: formData.fastTrack
      };

      // Update booking via PATCH endpoint
      const response = await fetch(`http://localhost:8080/api/v1/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          alert('Authentication failed. Please log in again.');
          navigate('/login');
          return;
        } else if (response.status === 403) {
          alert('Access denied. Admin privileges required.');
          navigate('/admin');
          return;
        } else if (response.status === 404) {
          alert('Booking not found.');
          navigate('/admin');
          return;
        } else if (response.status === 400) {
          // Validation error - show specific message
          alert(`Validation error: ${result.message || 'Invalid data provided'}`);
          return;
        } else {
          alert(`Failed to update booking: ${result.message || 'Unknown error'}`);
          return;
        }
      }

      // If update was successful, show success message
      if (result.success) {
        alert('Booking updated successfully!');
        navigate('/admin');
      } else {
        alert(`Failed to update booking: ${result.message || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Error updating booking:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('Network error: Unable to connect to the server. Please check your connection and try again.');
      } else {
        alert('An unexpected error occurred while updating the booking. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    navigate('/admin');
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
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-2 px-8 py-4 font-semibold text-lg transition-all duration-300 bg-white text-black hover:bg-gray-50"
          >
            <svg width="24" height="24" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.7624 18.0807L5.41825 21.4416C5.06692 21.5742 4.74271 21.5385 4.44563 21.3344C4.14854 21.1303 4 20.8449 4 20.478V20.013C4 19.8443 4.03746 19.6854 4.11237 19.5364C4.18729 19.3874 4.29321 19.2656 4.43012 19.1709L13.7624 12.5963V6.86258C13.7624 6.35022 13.9445 5.91192 14.3088 5.54767C14.6739 5.18256 15.1126 5 15.625 5C16.1374 5 16.5757 5.18256 16.9399 5.54767C17.3042 5.91278 17.4867 6.35108 17.4876 6.86258V12.5963L26.8199 19.1709C26.9568 19.2656 27.0627 19.3874 27.1376 19.5364C27.2125 19.6854 27.25 19.8447 27.25 20.0143V20.478C27.25 20.844 27.1015 21.1295 26.8044 21.3344C26.5073 21.5394 26.1831 21.5751 25.8317 21.4416L17.4876 18.0807V23.6736L20.8136 26.0245C20.9238 26.1054 21.01 26.2031 21.072 26.3177C21.134 26.4322 21.165 26.5571 21.165 26.6922V27.1443C21.165 27.4259 21.0573 27.6477 20.842 27.8095C20.6268 27.9714 20.3874 28.0123 20.1239 27.9322L15.625 26.5605L11.1261 27.9322C10.8618 28.0115 10.6224 27.9706 10.408 27.8095C10.1935 27.6485 10.0859 27.4268 10.085 27.1443V26.6858C10.085 26.5575 10.116 26.4356 10.178 26.3202C10.24 26.2049 10.3262 26.1063 10.4364 26.0245L13.7624 23.6736V18.0807Z" fill="currentColor"/>
            </svg>
            <span>Flights</span>
          </button>
          
          <button
            className="flex items-center space-x-2 px-8 py-4 font-semibold text-lg transition-all duration-300 bg-primary-500 text-white"
          >
            <img 
              src="/icons/tabler_book.svg" 
              alt="Bookings" 
              className="w-6 h-6 brightness-0 invert"
            />
            <span>Bookings</span>
          </button>
          
          <button
            className="flex items-center space-x-2 px-8 py-4 font-semibold text-lg transition-all duration-300 bg-white text-black hover:bg-gray-50"
          >
            <svg width="24" height="24" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.87533 18.0833L4.52116 18.1737L10.4241 12.2708C10.3056 11.8371 10.3055 11.3796 10.4236 10.9457C10.5417 10.5119 10.7738 10.1176 11.0957 9.80375C12.1032 8.78333 13.7307 8.78333 14.7382 9.80375C15.4228 10.4754 15.6424 11.4312 15.4099 12.2708L18.7295 15.5904L19.3753 15.5C19.6078 15.5 19.8274 15.5 20.0212 15.5904L24.6324 10.9792C24.542 10.7854 24.542 10.5658 24.542 10.3333C24.542 9.64819 24.8142 8.99111 25.2986 8.50664C25.7831 8.02217 26.4402 7.75 27.1253 7.75C27.8105 7.75 28.4675 8.02217 28.952 8.50664C29.4365 8.99111 29.7087 9.64819 29.7087 10.3333C29.7087 11.0185 29.4365 11.6756 28.952 12.16C28.4675 12.6445 27.8105 12.9167 27.1253 12.9167C26.8928 12.9167 26.6732 12.9167 26.4795 12.8263L21.8682 17.4375C21.9587 17.6312 21.9587 17.8508 21.9587 18.0833C21.9587 18.7685 21.6865 19.4256 21.202 19.91C20.7175 20.3945 20.0605 20.6667 19.3753 20.6667C18.6902 20.6667 18.0331 20.3945 17.5486 19.91C17.0642 19.4256 16.792 18.7685 16.792 18.0833L16.8824 17.4375L13.5628 14.1179C13.1495 14.2083 12.6845 14.2083 12.2712 14.1179L6.36824 20.0208L6.45866 20.6667C6.45866 21.3518 6.18649 22.0089 5.70202 22.4934C5.21755 22.9778 4.56047 23.25 3.87533 23.25C3.19018 23.25 2.5331 22.9778 2.04863 22.4934C1.56416 22.0089 1.29199 21.3518 1.29199 20.6667C1.29199 19.9815 1.56416 19.3244 2.04863 18.84C2.5331 18.3555 3.19018 18.0833 3.87533 18.0833Z" fill="currentColor"/>
            </svg>
            <span>Reports</span>
          </button>
        </div>
      </div>

      {/* Edit Booking Form */}
      <div className="px-16 py-8 max-w-4xl mx-auto">
        <h2 className="text-black mb-8">Editing booking</h2>
        
        <div className="space-y-6">
          {/* Row 1: Book Number and Flight */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-black text-base font-semibold mb-2">
                Book number
              </label>
              <input
                type="text"
                name="bookingNo"
                value={formData.bookingNo}
                readOnly
                placeholder="Book value"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-100 text-lg placeholder-gray-400 focus:outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-black text-base font-semibold mb-2">
                Flight
              </label>
              <input
                type="text"
                name="flightNo"
                value={formData.flightNo}
                readOnly
                placeholder="Flight value"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-100 text-lg placeholder-gray-400 focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Row 2: Support and Fast Track */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-black text-base font-semibold mb-2">
                Support
              </label>
              <select
                name="support"
                value={formData.support}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-black text-lg focus:outline-none focus:border-primary-300"
              >
                <option value="">Select support option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-black text-base font-semibold mb-2">
                Fast track
              </label>
              <select
                name="fastTrack"
                value={formData.fastTrack}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-black text-lg focus:outline-none focus:border-primary-300"
              >
                <option value="">Select fast track option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Row 3: Status */}
          <div className="grid grid-cols-2 gap-6">
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
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={handleConfirm}
              className="px-8 py-3 rounded-lg text-lg font-semibold bg-primary-300 text-white hover:bg-primary-500 transition-colors duration-200 shadow-md"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBooking;
