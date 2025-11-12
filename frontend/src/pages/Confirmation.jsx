import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import MainHeaderVer2 from "../components/MainHeaderVer2";
import { useNavigate, useLocation } from "react-router-dom";
import Barcode from "react-barcode";
import airplaneIcon from "/icons/airplane-v2-icon.svg";
import { useBooking } from "../context/BookingContext";

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketRef = useRef(null);
  const { getBookingById } = useBooking();

  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const bookingId = location.state?.bookingId || 
                         JSON.parse(localStorage.getItem('paymentConfirmation') || '{}').booking_id;

        if (!bookingId) {
          setError('No booking information found');
          setIsLoading(false);
          return;
        }

        const result = await getBookingById(bookingId);

        if (result.success) {
          setBookingData(result.data);
        } else {
          setError(result.error || 'Failed to load booking details');
        }
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [location.state]);

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

  const getBoardingTime = (departureTime) => {
    if (!departureTime) return '';
    const date = new Date(departureTime);
    date.setMinutes(date.getMinutes() - 30);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const handleDownloadPDF = async () => {
    try {
      const element = ticketRef.current;
      if (!element) {
        console.error('Ticket element not found');
        return;
      }

      element.style.display = 'block';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      element.style.display = 'none';
      element.style.position = '';
      element.style.left = '';

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width * 0.264583;
      const imgHeight = canvas.height * 0.264583;

      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight) * 0.9;
      const newWidth = imgWidth * ratio;
      const newHeight = imgHeight * ratio;

      const x = (pageWidth - newWidth) / 2;
      const y = (pageHeight - newHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, newWidth, newHeight);
      pdf.save(`E-Ticket-${bookingData?.booking?.booking_no || 'Booking'}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
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
              onClick={() => navigate('/flights')}
              className="bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-800"
            >
              Back to Flights
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { booking, passengers } = bookingData;

  return (
    <>
        <style>
        {`
            .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
            .text-gray-500 { color: rgb(107, 114, 128) !important; }
            .text-gray-600 { color: rgb(75, 85, 99) !important; }
            .bg-blue-50 { background-color: rgb(239, 246, 255) !important; }
            .bg-blue-900 { background-color: rgb(30, 58, 138) !important; }
            .hover\\:bg-blue-800:hover { background-color: rgb(30, 64, 175) !important; }
            .shadow-md { box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important; }
        `}
        </style>

        <div className="bg-gray-50 min-h-screen">
        <MainHeaderVer2 />

        <div className="p-10 flex justify-between items-start gap-8">
            {/* LEFT SIDE */}
            <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">Flight Details</h1>
            <p className="text-gray-500 text-sm mb-6">
                *Your e-ticket has been sent to your email address.
            </p>

            {/* Booking Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Booking Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Booking Number</p>
                  <p className="font-semibold">{booking.booking_no}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold capitalize">{booking.status}</p>
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

            {/* Passenger Details */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Passenger Details</h2>
              {passengers && passengers.length > 0 ? (
                <div className="space-y-3">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="border-b pb-3 last:border-b-0">
                      <p className="font-medium">
                        {passenger.firstname} {passenger.lastname}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-600 mt-1">
                        <span>Gender: {passenger.gender}</span>
                        {passenger.seat_no && <span>Seat: {passenger.seat_no}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No passenger information available</p>
              )}
            </div>

            <div className="flex gap-10">
                {/* Departure Flight */}
                <div className="flex gap-6">
                <div className="border rounded-2xl shadow-sm bg-white p-4 w-64">
                    <p className="mb-3 font-medium text-base">Flight Details</p>
                    <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">{booking.departure_iata}</span>
                    <img
                        src={airplaneIcon}
                        alt="Airplane"
                        className="w-7 h-7 opacity-80"
                    />
                    <span className="font-bold text-lg">{booking.arrival_iata}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>{formatTime(booking.depart_when)}</span>
                    <span>{formatTime(booking.arrive_when)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{formatDate(booking.depart_when)}</p>
                    <div className="border rounded-md px-3 py-2 bg-blue-50">
                    <p className="text-sm text-gray-600">Airplane: {booking.airplane_type || 'N/A'}</p>
                    </div>
                </div>
                </div>
            </div>

            {/* Additional Services */}
            {(booking.support === 'Yes' || booking.fasttrack === 'Yes') && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Additional Services</h2>
                <div className="space-y-2">
                  {booking.support === 'Yes' && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Customer Support Service</span>
                    </div>
                  )}
                  {booking.fasttrack === 'Yes' && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Fast Track Service</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
     
            {/* RIGHT SIDE */}
            <div>
                {/* Visible e-ticket display */}
                <div className="bg-white rounded-2xl shadow-md p-6 w-[350px] text-center mb-4">
                    <h2 className="text-2xl font-semibold mb-4">Your E-Ticket</h2>

                    {/* Barcode - using booking number */}
                    <div className="flex justify-center mb-4">
                        <Barcode
                        value={booking.booking_no || "BOOKING"}
                        displayValue={false}
                        height={60}
                        width={1.5}
                        />
                    </div>

                    {/* Route */}
                    <div className="flex justify-between items-center text-xl font-semibold mb-4">
                        <span>{booking.departure_iata}</span>
                        <img
                        src={airplaneIcon}
                        alt="Airplane"
                        className="w-8 h-8 opacity-80"
                        />
                        <span>{booking.arrival_iata}</span>
                    </div>

                    {/* City & Info Rows */}
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <div className="text-left">
                        <p className="font-medium text-black">{booking.departure_city}</p>
                        <p>{formatTime(booking.depart_when)}</p>
                        </div>
                        <div className="text-center">
                        <p className="font-medium text-black">Booking No.</p>
                        <p>{booking.booking_no}</p>
                        </div>
                        <div className="text-right">
                        <p className="font-medium text-black">{booking.arrival_city}</p>
                        <p>{formatTime(booking.arrive_when)}</p>
                        </div>
                    </div>

                    {/* Date Row */}
                    <div className="flex justify-between text-sm text-gray-600 mt-4">
                        <div className="text-left">
                        <p className="font-medium text-black">Date</p>
                        <p>{formatDate(booking.depart_when)}</p>
                        </div>
                        <div className="text-right">
                        <p className="font-medium text-black">Boarding Time</p>
                        <p>{getBoardingTime(booking.depart_when)}</p>
                        </div>
                    </div>

                    {/* Flight Number */}
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-500">Flight Number</p>
                        <p className="font-semibold">{booking.flight_no || 'N/A'}</p>
                    </div>
                </div>

                {/* Hidden e-ticket template for PDF generation */}
                <div ref={ticketRef} className="hidden">
                    {/* E-Ticket for Departure Flight */}
                    <div className="bg-white rounded-2xl shadow-md p-6 w-[350px] text-center mb-7">
                    <h2 className="text-2xl font-semibold mb-4">Your E-Ticket</h2>

                    {/* Barcode - using booking number */}
                    <div className="flex justify-center mb-4">
                        <Barcode
                        value={booking.booking_no || "BOOKING"}
                        displayValue={false}
                        height={60}
                        width={1.5}
                        />
                    </div>

                    {/* Route */}
                    <div className="flex justify-between items-center text-xl font-semibold mb-4">
                        <span>{booking.departure_iata}</span>
                        <img
                        src={airplaneIcon}
                        alt="Airplane"
                        className="w-8 h-8 opacity-80"
                        />
                        <span>{booking.arrival_iata}</span>
                    </div>

                    {/* City & Info Rows */}
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <div className="text-left">
                        <p className="font-medium text-black">{booking.departure_city}</p>
                        <p>{formatTime(booking.depart_when)}</p>
                        </div>
                        <div className="text-center">
                        <p className="font-medium text-black">Booking No.</p>
                        <p>{booking.booking_no}</p>
                        </div>
                        <div className="text-right">
                        <p className="font-medium text-black">{booking.arrival_city}</p>
                        <p>{formatTime(booking.arrive_when)}</p>
                        </div>
                    </div>

                    {/* Date Row */}
                    <div className="flex justify-between text-sm text-gray-600 mt-4">
                        <div className="text-left">
                        <p className="font-medium text-black">Date</p>
                        <p>{formatDate(booking.depart_when)}</p>
                        </div>
                        <div className="text-right">
                        <p className="font-medium text-black">Boarding Time</p>
                        <p>{getBoardingTime(booking.depart_when)}</p>
                        </div>
                    </div>

                    {/* Flight Number */}
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-500">Flight Number</p>
                        <p className="font-semibold">{booking.flight_no || 'N/A'}</p>
                    </div>
                    </div>

                </div>
                    <button
                    onClick={handleDownloadPDF}
                    className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 transition mb-4"
                    >
                    Download E-Ticket (PDF)
                    </button>

                    {/* View/Manage Booking Button */}
                    <button
                    onClick={() => navigate('/my-bookings')}
                    className="w-full bg-white border-2 border-blue-900 text-blue-900 py-2 rounded-md hover:bg-blue-50 transition"
                    >
                    View My Bookings
                    </button>
            </div>
        </div>
        </div>
    </>
  );
};

export default Confirmation;
