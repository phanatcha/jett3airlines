import React, { useState } from "react";
import MainHeaderVer2 from "../components/MainHeaderVer2";
import PreviewBar from "../components/PreviewBar";
import Back from "../components/BackBlack";
import { useNavigate } from "react-router-dom";
import creditCardIcon from "/icons/credit-card-icon.svg";

const Payment = () => {
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState({
    paymentMethod: "Credit/Debit card",
    cardNumber: "",
    cvvNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cardHolderName: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/confirmation");
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
            onClick={() => navigate(-1)}
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

            {/* Card Number */}
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Card Number
            </label>
            <div className="relative mb-4">
              <input
                type="text"
                name="cardNumber"
                value={paymentData.cardNumber}
                onChange={handleChange}
                placeholder="Card Number..."
                className="w-full border rounded-md p-2 pl-10"
              />
              <img
                src={creditCardIcon}
                alt="card"
                className="absolute left-3 top-2.5 w-5 h-5"
              />
            </div>

            {/* CVV and Expiry */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  CVV Number
                </label>
                <input
                  type="text"
                  name="cvvNumber"
                  value={paymentData.cvvNumber}
                  onChange={handleChange}
                  placeholder="CVV"
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="expiryMonth"
                    value={paymentData.expiryMonth}
                    onChange={handleChange}
                    placeholder="MM"
                    className="w-1/2 border rounded-md p-2 text-center"
                  />
                  <span>/</span>
                  <input
                    type="text"
                    name="expiryYear"
                    value={paymentData.expiryYear}
                    onChange={handleChange}
                    placeholder="YY"
                    className="w-1/2 border rounded-md p-2 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Card Holder Name */}
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Card Holder’s Name
            </label>
            <input
              type="text"
              name="cardHolderName"
              value={paymentData.cardHolderName}
              onChange={handleChange}
              placeholder="Card Holder’s Name"
              className="w-full border rounded-md p-2 mb-6"
            />

            {/* Pay Button */}
            <button
              type="submit"
              className="w-full bg-[#003366] text-white py-3 rounded-md font-semibold hover:bg-[#002244] transition"
            >
              Pay now
            </button>
          </form>
        </div>

        {/* Right Section - Itinerary */}
        <div className="bg-white rounded-2xl shadow-md w-full lg:w-1/3 p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Your Itinerary</h2>

          {/* Departure */}
          <div className="border rounded-xl p-4 mb-4">
            <p className="font-semibold mb-2">Your Departure Flight</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">BKK</p>
                <p className="text-sm text-gray-600">14:00</p>
                <p className="text-xs text-gray-500">6 Dec</p>
              </div>
              <div className="text-center text-sm text-gray-500">
                <span className="text-xs text-gray-500 relative top-4">2 stops</span>
                <img
                    src="/icons/arrow-right.svg"
                    alt="arrow"
                    className="w-16 h-16 object-contain"
                />
                <span className="text-xs relative -top-4">14h 15m</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">BER</p>
                <p className="text-sm text-gray-600">22:15</p>
                <p className="text-xs text-gray-500">6 Dec</p>
              </div>
            </div>
          </div>

          {/* Return */}
          <div className="border rounded-xl p-4 mb-4">
            <p className="font-semibold mb-2">Your Return Flight</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">BER</p>
                <p className="text-sm text-gray-600">22:15</p>
                <p className="text-xs text-gray-500">13 Dec</p>
              </div>
              <div className="text-center text-sm text-gray-500">
                <span className="text-xs text-gray-500 relative top-4">1 stop</span>
                <img
                    src="/icons/arrow-right.svg"
                    alt="arrow"
                    className="w-16 h-16 object-contain"
                />
                <span className="text-xs relative -top-4">13h 50m</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">BKK</p>
                <p className="text-sm text-gray-600">15:15</p>
                <p className="text-xs text-gray-500">14 Dec</p>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="border-t pt-4">
            <h3 className="text-xl font-bold mb-2">Price Summary</h3>
            <div className="flex justify-between text-sm mb-1">
              <span>Base Fare</span>
              <span>THB 39,716</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Total Taxes</span>
              <span>THB 397</span>
            </div>
            <div className="flex justify-between font-semibold mt-2 text-lg">
              <span>Total</span>
              <span>THB 40,113</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
