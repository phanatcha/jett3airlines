import { useState, useEffect } from "react";
import MainHeaderVer2 from "../components/MainHeaderVer2";
import PreviewBar from "../components/PreviewBar";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import creditCardIcon from "/icons/credit-card-icon.svg";

const Payment = () => {
  const navigate = useNavigate();
  const { 
    selectedFlights, 
    selectedSeats, 
    fareOptions,
    createBooking,
    processPayment,
    currentBooking,
    loading,
    error: bookingError
  } = useBooking();

  const [paymentData, setPaymentData] = useState({
    paymentMethod: "Credit/Debit card",
    cardNumber: "",
    cvvNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cardHolderName: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [fetchingCost, setFetchingCost] = useState(false);

  useEffect(() => {
    const fetchBookingCost = async () => {
      if (currentBooking?.booking?.booking_id) {
        setFetchingCost(true);
        try {
          const response = await fetch(`http://localhost:8080/api/v1/bookings/${currentBooking.booking.booking_id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await response.json();
          if (data.success && data.data.totalCost) {
            console.log('Fetched booking cost from backend:', data.data.totalCost);
            setTotalCost(parseFloat(data.data.totalCost));
            return;
          }
        } catch (error) {
          console.error('Error fetching booking cost:', error);
        } finally {
          setFetchingCost(false);
        }
      }
      
      calculateCostFromSeats();
    };

    const calculateCostFromSeats = () => {
      console.log('Payment - Calculating cost from fare package...');
      console.log('Selected Seats:', selectedSeats);
      console.log('Fare Options:', fareOptions);
      
      // Start with fare package price (seat is included)
      let cost = fareOptions.farePrice || 0;
      console.log('Fare Package Price (includes seat):', cost);
    


    if (cost === 0 && selectedSeats && selectedSeats.length > 0) {
      cost = selectedSeats.length * 200;
      console.log(`Using default base fare: ${selectedSeats.length} passengers × $200 = $${cost}`);
    }

    if (fareOptions.support === 'yes' || fareOptions.support === 'Yes') {
      cost += 50;
      console.log('Added support service: $50');
    }

    if (fareOptions.fasttrack === 'yes' || fareOptions.fasttrack === 'Yes') {
      cost += 30;
      console.log('Added fasttrack service: $30');
    }

    console.log('Total Cost:', cost);
    setTotalCost(cost);
    };

    fetchBookingCost();
  }, [selectedSeats, fareOptions, currentBooking]);

  useEffect(() => {
    if (!selectedFlights.departure) {
      navigate('/flights');
    }
  }, [selectedFlights, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setPaymentData((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === 'expiryMonth' || name === 'expiryYear') {
      const numericValue = value.replace(/\D/g, '');
      setPaymentData((prev) => ({ ...prev, [name]: numericValue }));
    } else if (name === 'cvvNumber') {
      const numericValue = value.replace(/\D/g, '').slice(0, 4);
      setPaymentData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setPaymentData((prev) => ({ ...prev, [name]: value }));
    }

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validatePaymentData = () => {
    const errors = {};

    if (paymentData.paymentMethod === 'Apple Pay' || paymentData.paymentMethod === 'PayPal') {
      return errors;
    }

    const cardNumberDigits = paymentData.cardNumber.replace(/\s/g, '');
    if (!cardNumberDigits) {
      errors.cardNumber = 'Card number is required';
    } else if (cardNumberDigits.length < 13 || cardNumberDigits.length > 19) {
      errors.cardNumber = 'Card number must be between 13 and 19 digits';
    } else if (!/^\d+$/.test(cardNumberDigits)) {
      errors.cardNumber = 'Card number must contain only digits';
    }

    if (!paymentData.cvvNumber) {
      errors.cvvNumber = 'CVV is required';
    } else if (paymentData.cvvNumber.length < 3 || paymentData.cvvNumber.length > 4) {
      errors.cvvNumber = 'CVV must be 3 or 4 digits';
    }

    if (!paymentData.expiryMonth) {
      errors.expiryMonth = 'Expiry month is required';
    } else {
      const month = parseInt(paymentData.expiryMonth);
      if (month < 1 || month > 12) {
        errors.expiryMonth = 'Month must be between 01 and 12';
      }
    }

    if (!paymentData.expiryYear) {
      errors.expiryYear = 'Expiry year is required';
    } else {
      const currentYear = new Date().getFullYear() % 100;
      const year = parseInt(paymentData.expiryYear);
      if (year < currentYear) {
        errors.expiryYear = 'Card has expired';
      }
    }

    if (!paymentData.cardHolderName.trim()) {
      errors.cardHolderName = 'Card holder name is required';
    } else if (paymentData.cardHolderName.trim().length < 3) {
      errors.cardHolderName = 'Card holder name must be at least 3 characters';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validatePaymentData();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsProcessing(true);
    setValidationErrors({});

    try {
      console.log('=== PAYMENT SUBMISSION START ===');
      console.log('Current Booking:', currentBooking);
      
      let bookingId = currentBooking?.booking?.booking_id;
      console.log('Extracted booking ID:', bookingId);
      
      if (!bookingId) {
        console.log('No booking ID found, creating booking...');
        const bookingResult = await createBooking();
        console.log('Booking creation result:', bookingResult);
        
        if (!bookingResult.success) {
          alert(`Booking creation failed: ${bookingResult.error || 'Unknown error'}`);
          setIsProcessing(false);
          return;
        }

        bookingId = bookingResult.data.booking.booking_id;
        console.log('New booking ID:', bookingId);
      } else {
        console.log('Using existing booking ID:', bookingId);
      }

      const paymentPayload = {
        booking_id: bookingId,
        amount: totalCost,
        currency: 'USD',
        payment_method: paymentData.paymentMethod === 'Credit/Debit card' 
          ? getCardType(paymentData.cardNumber)
          : paymentData.paymentMethod.toUpperCase().replace(/\s/g, '_'),
      };

      console.log('Processing payment with payload:', paymentPayload);
      const paymentResult = await processPayment(paymentPayload, bookingId);

      if (paymentResult.success) {
        localStorage.setItem('paymentConfirmation', JSON.stringify({
          payment_id: paymentResult.data.payment_id,
          booking_id: bookingId,
          amount: totalCost,
          receipt: paymentResult.data.receipt,
          timestamp: new Date().toISOString()
        }));

        navigate('/confirmation', { 
          state: { 
            bookingId,
            paymentId: paymentResult.data.payment_id,
            receipt: paymentResult.data.receipt
          } 
        });
      } else {
        alert(`Payment failed: ${paymentResult.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      alert(`Payment failed: ${err.message || 'An unexpected error occurred'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardType = (cardNumber) => {
    const digits = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(digits)) return 'VISA';
    if (/^5[1-5]/.test(digits)) return 'MASTERCARD';
    if (/^3[47]/.test(digits)) return 'AMEX';
    if (/^6(?:011|5)/.test(digits)) return 'DISCOVER';
    if (/^35/.test(digits)) return 'JCB';
    if (/^(5018|5020|5038|6304|6759|676[1-3])/.test(digits)) return 'MAESTRO';
    
    return 'VISA';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <MainHeaderVer2 />

      <div className="mt-8">
        <PreviewBar currentStep={3} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Section - Payment Form */}
        <div className="bg-white rounded-2xl shadow-md flex-1 p-6">
          <button
            onClick={() => navigate('/fare')}
            className="flex items-center gap-2 text-gray-600 mb-4 hover:text-black"
          >
            <img src="/icons/black-back-icon.svg" alt="back" className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center justify-between mb-4">
            <select
              name="paymentMethod"
              value={paymentData.paymentMethod}
              onChange={handleChange}
              className="border rounded-md p-2 w-100"
            >
              <option>Credit/Debit card</option>
              <option>PayPal</option>
              <option>Apple Pay</option>
            </select>
            <span className="font-semibold text-gray-700">
              Select Payment method
            </span>
          </div>

          <hr className="my-4" />

          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-4">Payment Information</h2>

            {/* Display booking error if any */}
            {bookingError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {bookingError}
              </div>
            )}

            {/* Show digital wallet message */}
            {(paymentData.paymentMethod === 'Apple Pay' || paymentData.paymentMethod === 'PayPal') && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-medium mb-2">
                  {paymentData.paymentMethod} Selected
                </p>
                <p className="text-sm text-blue-600">
                  You will be redirected to {paymentData.paymentMethod} to complete your payment securely.
                </p>
              </div>
            )}

            {/* Only show card fields for Credit/Debit card */}
            {paymentData.paymentMethod === 'Credit/Debit card' && (
              <>
                {/* Card Number */}
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Card Number *
                </label>
            <div className="relative mb-1">
              <input
                type="text"
                name="cardNumber"
                value={paymentData.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className={`w-full border rounded-md p-2 pl-10 ${
                  validationErrors.cardNumber ? 'border-red-500' : ''
                }`}
                disabled={isProcessing}
              />
              <img
                src={creditCardIcon}
                alt="card"
                className="absolute left-3 top-2.5 w-5 h-5"
              />
            </div>
            {validationErrors.cardNumber && (
              <p className="text-red-500 text-xs mb-2">{validationErrors.cardNumber}</p>
            )}
            {!validationErrors.cardNumber && <div className="mb-3"></div>}

            {/* CVV and Expiry */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  CVV Number *
                </label>
                <input
                  type="text"
                  name="cvvNumber"
                  value={paymentData.cvvNumber}
                  onChange={handleChange}
                  placeholder="123"
                  maxLength="4"
                  className={`w-full border rounded-md p-2 ${
                    validationErrors.cvvNumber ? 'border-red-500' : ''
                  }`}
                  disabled={isProcessing}
                />
                {validationErrors.cvvNumber && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.cvvNumber}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Expiry Date *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="expiryMonth"
                    value={paymentData.expiryMonth}
                    onChange={handleChange}
                    placeholder="MM"
                    maxLength="2"
                    className={`w-1/2 border rounded-md p-2 text-center ${
                      validationErrors.expiryMonth ? 'border-red-500' : ''
                    }`}
                    disabled={isProcessing}
                  />
                  <span>/</span>
                  <input
                    type="text"
                    name="expiryYear"
                    value={paymentData.expiryYear}
                    onChange={handleChange}
                    placeholder="YY"
                    maxLength="2"
                    className={`w-1/2 border rounded-md p-2 text-center ${
                      validationErrors.expiryYear ? 'border-red-500' : ''
                    }`}
                    disabled={isProcessing}
                  />
                </div>
                {(validationErrors.expiryMonth || validationErrors.expiryYear) && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.expiryMonth || validationErrors.expiryYear}
                  </p>
                )}
              </div>
            </div>

            {/* Card Holder Name */}
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Card Holder's Name *
            </label>
            <input
              type="text"
              name="cardHolderName"
              value={paymentData.cardHolderName}
              onChange={handleChange}
              placeholder="John Doe"
              className={`w-full border rounded-md p-2 mb-1 ${
                validationErrors.cardHolderName ? 'border-red-500' : ''
              }`}
              disabled={isProcessing}
            />
            {validationErrors.cardHolderName && (
              <p className="text-red-500 text-xs mb-2">{validationErrors.cardHolderName}</p>
            )}
            {!validationErrors.cardHolderName && <div className="mb-4"></div>}
              </>
            )}

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing || loading}
              className={`w-full py-3 rounded-md font-semibold transition ${
                isProcessing || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#003366] text-white hover:bg-[#002244]'
              }`}
            >
              {isProcessing || loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing Payment...
                </span>
              ) : paymentData.paymentMethod === 'Apple Pay' ? (
                `Pay $${totalCost.toFixed(2)} with Apple Pay`
              ) : paymentData.paymentMethod === 'PayPal' ? (
                `Pay $${totalCost.toFixed(2)} with PayPal`
              ) : (
                `Pay $${totalCost.toFixed(2)} now`
              )}
            </button>
          </form>
        </div>

        {/* Right Section - Itinerary */}
        <div className="bg-white rounded-2xl shadow-md w-full lg:w-1/3 p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Your Itinerary</h2>

          {/* Departure Flight */}
          {selectedFlights.departure && (
            <div className="border rounded-xl p-4 mb-4">
              <p className="font-semibold mb-2">Your Departure Flight</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{selectedFlights.departure.departure_iata || 'N/A'}</p>
                  <p className="text-sm text-gray-600">
                    {selectedFlights.departure.depart_when 
                      ? new Date(selectedFlights.departure.depart_when).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedFlights.departure.depart_when 
                      ? new Date(selectedFlights.departure.depart_when).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                      : 'N/A'}
                  </p>
                </div>
                <div className="text-center text-sm text-gray-500">
                  <span className="text-xs text-gray-500 relative top-4">
                    {selectedFlights.departure.stops || 0} {selectedFlights.departure.stops === 1 ? 'stop' : 'stops'}
                  </span>
                  <img
                    src="/icons/arrow-right.svg"
                    alt="arrow"
                    className="w-16 h-16 object-contain"
                  />
                  <span className="text-xs relative -top-4">
                    {selectedFlights.departure.duration || 'N/A'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{selectedFlights.departure.arrival_iata || 'N/A'}</p>
                  <p className="text-sm text-gray-600">
                    {selectedFlights.departure.arrive_when 
                      ? new Date(selectedFlights.departure.arrive_when).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedFlights.departure.arrive_when 
                      ? new Date(selectedFlights.departure.arrive_when).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Return Flight */}
          {selectedFlights.return && (
            <div className="border rounded-xl p-4 mb-4">
              <p className="font-semibold mb-2">Your Return Flight</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{selectedFlights.return.departure_iata || 'N/A'}</p>
                  <p className="text-sm text-gray-600">
                    {selectedFlights.return.depart_when 
                      ? new Date(selectedFlights.return.depart_when).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedFlights.return.depart_when 
                      ? new Date(selectedFlights.return.depart_when).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                      : 'N/A'}
                  </p>
                </div>
                <div className="text-center text-sm text-gray-500">
                  <span className="text-xs text-gray-500 relative top-4">
                    {selectedFlights.return.stops || 0} {selectedFlights.return.stops === 1 ? 'stop' : 'stops'}
                  </span>
                  <img
                    src="/icons/arrow-right.svg"
                    alt="arrow"
                    className="w-16 h-16 object-contain"
                  />
                  <span className="text-xs relative -top-4">
                    {selectedFlights.return.duration || 'N/A'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{selectedFlights.return.arrival_iata || 'N/A'}</p>
                  <p className="text-sm text-gray-600">
                    {selectedFlights.return.arrive_when 
                      ? new Date(selectedFlights.return.arrive_when).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedFlights.return.arrive_when 
                      ? new Date(selectedFlights.return.arrive_when).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Price Summary */}
          <div className="border-t pt-4">
            <h3 className="text-xl font-bold mb-3">Price Summary</h3>
            
            {/* Fare Package (includes seat) */}
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">
                {fareOptions.fareClass || 'Economy Saver'} Fare ({selectedSeats?.length || 0} passenger{selectedSeats?.length !== 1 ? 's' : ''})
              </span>
              <span className="font-semibold">${(fareOptions.farePrice || 0).toFixed(2)}</span>
            </div>
            
            {/* Seat included note */}
            {selectedSeats && selectedSeats.length > 0 && (
              <div className="flex justify-between text-sm mb-2 text-gray-500">
                <span className="text-gray-500 text-xs">• Seat selection included in fare</span>
                <span className="text-gray-500">—</span>
              </div>
            )}
            
            {/* Additional Services */}
            {(fareOptions.support === 'yes' || fareOptions.support === 'Yes') && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Support Service</span>
                <span className="font-semibold">$50.00</span>
              </div>
            )}
            
            {(fareOptions.fasttrack === 'yes' || fareOptions.fasttrack === 'Yes') && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Fast Track</span>
                <span className="font-semibold">$30.00</span>
              </div>
            )}
            
            {/* Taxes */}
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Taxes & Fees</span>
              <span className="font-semibold">$0.00</span>
            </div>
            
            {/* Total */}
            <div className="border-t mt-3 pt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span className="text-blue-900">${totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
