import React, { useState } from "react";
import MainHeaderVer2 from "../components/MainHeaderVer2";
import PreviewBar from "../components/PreviewBar";
import Back from "../components/BackBlack";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useNavigate } from "react-router-dom";
import userIcon from "/icons/user-icon.svg";

const PassengerInfo = () => {
  const navigate = useNavigate();
  const [contactData, setContactData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phoneNumber: "",
  });

  const [passengers, setPassengers] = useState([
    { firstName: "", lastName: "", gender: "" },
    { firstName: "", lastName: "", gender: "" },
  ]);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePassengerChange = (index, e) => {
    const { name, value } = e.target;
    setPassengers((prev) => {
      const newData = [...prev];
      newData[index][name] = value;
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/seat");
  };

  return (
    <div>
      <MainHeaderVer2 />
      <div className="mt-8">
        <PreviewBar currentStep={1} />
      </div>

      <div className="flex flex-col w-5/7 px-20 pt-8 gap-2">
        <Back />

        <form onSubmit={handleSubmit} className="flex flex-col gap-8 mt-4">
          {/* Contact Details */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-1">Contact Details</h2>
            <p className="text-sm text-gray-500 mb-4">
              Please provide the contact information for the main traveler. We'll send booking confirmations and updates to this contact.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="firstName"
                value={contactData.firstName}
                onChange={handleContactChange}
                placeholder="First Name"
                className="border rounded-md p-2 w-full"
              />
              <input
                type="text"
                name="lastName"
                value={contactData.lastName}
                onChange={handleContactChange}
                placeholder="Last Name"
                className="border rounded-md p-2 w-full"
              />
            </div>

            <input
              type="email"
              name="email"
              value={contactData.email}
              onChange={handleContactChange}
              placeholder="yourname@gmail.com"
              className="border rounded-md p-2 w-full mb-4"
            />

            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                name="country"
                value={contactData.country}
                onChange={handleContactChange}
                placeholder="Country"
                className="border rounded-md p-2 w-full col-span-1"
              />
              <div className="flex col-span-2 gap-2">
                <div className="relative col-span-1 w-full">
                <PhoneInput
                    country={'th'}
                    enableSearch={true}
                    inputClass="!w-full !h-11 !border !border-black !rounded-md !p-2 !pl-12 !text-base !shadow-none focus:!ring-0 focus:!outline-none"
                    buttonClass="!absolute !left-3 !top-1/2 !-translate-y-1/2 !bg-transparent !border-0"
                    containerClass="!w-full"
                    dropdownClass="!text-sm"
                    value={contactData.phoneNumber}
                    onChange={(value) =>
                    setContactData((prev) => ({ ...prev, phoneNumber: value }))
                    }
                />
                </div>


              </div>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-1">Passenger Details</h2>
            <p className="text-sm text-gray-500 mb-4">
              Enter the information exactly as shown on your passport or official ID.
            </p>

            {passengers.map((passenger, index) => (
              <div
                key={index}
                className="border rounded-lg mb-4 p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <img src={userIcon} alt="User" className="w-5 h-5" />
                  <p className="font-medium">
                    Passenger {index + 1} <span className="text-gray-500">Adult</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <input
                    type="text"
                    name="firstName"
                    value={passenger.firstName}
                    onChange={(e) => handlePassengerChange(index, e)}
                    placeholder="First Name"
                    className="border rounded-md p-2 w-full"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={passenger.lastName}
                    onChange={(e) => handlePassengerChange(index, e)}
                    placeholder="Last Name"
                    className="border rounded-md p-2 w-full"
                  />
                </div>

                <select
                  name="gender"
                  value={passenger.gender}
                  onChange={(e) => handlePassengerChange(index, e)}
                  className="border rounded-md p-2 w-full"
                >
                  <option value="" disabled selected hidden>
                  Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            ))}
          </div>

          {/* Next Button */}
          <button
            type="submit"
            className="bg-blue-900 text-white py-2 mb-10 rounded-md hover:bg-blue-800 transition-colors"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
};

export default PassengerInfo;
