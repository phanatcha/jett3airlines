import React, { useState, useEffect } from "react";
import MainHeaderVer2 from "../components/MainHeaderVer2";
import PreviewBar from "../components/PreviewBar";
import Back from "../components/BackBlack";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import userIcon from "/icons/user-icon.svg";

const PassengerInfo = () => {
  const navigate = useNavigate();
  const { searchCriteria, passengers: contextPassengers, addPassenger, updatePassenger, removePassenger } = useBooking();
  
  const [contactData, setContactData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phoneNumber: "",
  });

  const [passengers, setPassengers] = useState(() => {
    // Initialize passengers on mount only
    const passengerCount = searchCriteria.passengers || 1;
    
    // If context already has passengers, use them
    if (contextPassengers.length > 0) {
      return contextPassengers;
    }
    
    // Initialize empty passenger array based on count
    return Array.from({ length: passengerCount }, () => ({
      firstName: "",
      lastName: "",
      gender: "",
    }));
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[`contact_${name}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`contact_${name}`];
        return newErrors;
      });
    }
  };

  const handlePassengerChange = (index, e) => {
    const { name, value } = e.target;
    setPassengers((prev) => {
      const newData = [...prev];
      // Ensure the passenger object exists
      if (!newData[index]) {
        newData[index] = {};
      }
      newData[index][name] = value;
      return newData;
    });
    
    // Clear error for this field when user starts typing
    const errorKey = `passenger_${index}_${name}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    // Phone number should be at least 10 digits (excluding country code)
    return phone && phone.length >= 10;
  };

  const validateName = (name) => {
    // Name should be at least 2 characters and contain only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-']{2,}$/;
    return nameRegex.test(name);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate contact details
    if (!contactData.firstName.trim()) {
      newErrors.contact_firstName = "First name is required";
    } else if (!validateName(contactData.firstName)) {
      newErrors.contact_firstName = "Please enter a valid first name (at least 2 letters)";
    }

    if (!contactData.lastName.trim()) {
      newErrors.contact_lastName = "Last name is required";
    } else if (!validateName(contactData.lastName)) {
      newErrors.contact_lastName = "Please enter a valid last name (at least 2 letters)";
    }

    if (!contactData.email.trim()) {
      newErrors.contact_email = "Email is required";
    } else if (!validateEmail(contactData.email)) {
      newErrors.contact_email = "Please enter a valid email address";
    }

    if (!contactData.country.trim()) {
      newErrors.contact_country = "Country is required";
    }

    if (!contactData.phoneNumber) {
      newErrors.contact_phoneNumber = "Phone number is required";
    } else if (!validatePhoneNumber(contactData.phoneNumber)) {
      newErrors.contact_phoneNumber = "Please enter a valid phone number (at least 10 digits)";
    }

    // Validate passenger details
    passengers.forEach((passenger, index) => {
      if (!passenger.firstName.trim()) {
        newErrors[`passenger_${index}_firstName`] = `Passenger ${index + 1} first name is required`;
      } else if (!validateName(passenger.firstName)) {
        newErrors[`passenger_${index}_firstName`] = `Please enter a valid first name for passenger ${index + 1}`;
      }

      if (!passenger.lastName.trim()) {
        newErrors[`passenger_${index}_lastName`] = `Passenger ${index + 1} last name is required`;
      } else if (!validateName(passenger.lastName)) {
        newErrors[`passenger_${index}_lastName`] = `Please enter a valid last name for passenger ${index + 1}`;
      }

      if (!passenger.gender) {
        newErrors[`passenger_${index}_gender`] = `Passenger ${index + 1} gender is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(contactData).forEach(key => {
      allTouched[`contact_${key}`] = true;
    });
    passengers.forEach((_, index) => {
      allTouched[`passenger_${index}_firstName`] = true;
      allTouched[`passenger_${index}_lastName`] = true;
      allTouched[`passenger_${index}_gender`] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorElement = document.querySelector('.border-red-500');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Store passenger data in context
    // Clear existing passengers first
    while (contextPassengers.length > 0) {
      removePassenger(0);
    }

    // Add all passengers with contact info
    passengers.forEach((passenger, index) => {
      // Generate a valid temporary passport number (6-20 chars, uppercase + numbers only)
      const timestamp = Date.now().toString().slice(-8); // Last 8 digits
      const tempPassport = `TEMP${timestamp}${index}`.toUpperCase().slice(0, 20);
      
      const passengerData = {
        firstname: passenger.firstName.trim(), // Changed from first_name
        lastname: passenger.lastName.trim(), // Changed from last_name
        gender: passenger.gender,
        // Required fields with default values (TODO: Add form fields for these)
        passport_no: tempPassport, // Temporary passport number (6-20 chars, uppercase+numbers)
        nationality: contactData.country.trim() || 'Unknown', // Use contact country as nationality
        dob: '1990-01-01', // Default DOB (TODO: Add DOB field to form)
        // Add contact info to first passenger
        ...(index === 0 && {
          email: contactData.email.trim(),
          phone: contactData.phoneNumber,
          country: contactData.country.trim(),
        }),
      };
      addPassenger(passengerData);
    });

    // Navigate to seat selection
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
              <div>
                <input
                  type="text"
                  name="firstName"
                  value={contactData.firstName}
                  onChange={handleContactChange}
                  onBlur={() => handleBlur('contact_firstName')}
                  placeholder="First Name"
                  className={`border rounded-md p-2 w-full ${errors.contact_firstName ? 'border-red-500' : ''}`}
                  required
                />
                {errors.contact_firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_firstName}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="lastName"
                  value={contactData.lastName}
                  onChange={handleContactChange}
                  onBlur={() => handleBlur('contact_lastName')}
                  placeholder="Last Name"
                  className={`border rounded-md p-2 w-full ${errors.contact_lastName ? 'border-red-500' : ''}`}
                  required
                />
                {errors.contact_lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_lastName}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <input
                type="email"
                name="email"
                value={contactData.email}
                onChange={handleContactChange}
                onBlur={() => handleBlur('contact_email')}
                placeholder="yourname@gmail.com"
                className={`border rounded-md p-2 w-full ${errors.contact_email ? 'border-red-500' : ''}`}
                required
              />
              {errors.contact_email && (
                <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <input
                  type="text"
                  name="country"
                  value={contactData.country}
                  onChange={handleContactChange}
                  onBlur={() => handleBlur('contact_country')}
                  placeholder="Country"
                  className={`border rounded-md p-2 w-full ${errors.contact_country ? 'border-red-500' : ''}`}
                  required
                />
                {errors.contact_country && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_country}</p>
                )}
              </div>
              <div className="flex col-span-2 gap-2">
                <div className="relative col-span-1 w-full">
                  <PhoneInput
                    country={'th'}
                    enableSearch={true}
                    inputClass={`!w-full !h-11 !border ${errors.contact_phoneNumber ? '!border-red-500' : '!border-black'} !rounded-md !p-2 !pl-12 !text-base !shadow-none focus:!ring-0 focus:!outline-none`}
                    buttonClass="!absolute !left-3 !top-1/2 !-translate-y-1/2 !bg-transparent !border-0"
                    containerClass="!w-full"
                    dropdownClass="!text-sm"
                    value={contactData.phoneNumber}
                    onChange={(value) => {
                      setContactData((prev) => ({ ...prev, phoneNumber: value }));
                      if (errors.contact_phoneNumber) {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.contact_phoneNumber;
                          return newErrors;
                        });
                      }
                    }}
                    onBlur={() => handleBlur('contact_phoneNumber')}
                  />
                  {errors.contact_phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.contact_phoneNumber}</p>
                  )}
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
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={passenger.firstName || ""}
                      onChange={(e) => handlePassengerChange(index, e)}
                      onBlur={() => handleBlur(`passenger_${index}_firstName`)}
                      placeholder="First Name"
                      className={`border rounded-md p-2 w-full ${errors[`passenger_${index}_firstName`] ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors[`passenger_${index}_firstName`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`passenger_${index}_firstName`]}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      value={passenger.lastName || ""}
                      onChange={(e) => handlePassengerChange(index, e)}
                      onBlur={() => handleBlur(`passenger_${index}_lastName`)}
                      placeholder="Last Name"
                      className={`border rounded-md p-2 w-full ${errors[`passenger_${index}_lastName`] ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors[`passenger_${index}_lastName`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`passenger_${index}_lastName`]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <select
                    name="gender"
                    value={passenger.gender || ""}
                    onChange={(e) => handlePassengerChange(index, e)}
                    onBlur={() => handleBlur(`passenger_${index}_gender`)}
                    className={`border rounded-md p-2 w-full ${errors[`passenger_${index}_gender`] ? 'border-red-500' : ''}`}
                    required
                  >
                    <option value="" disabled>
                      Gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors[`passenger_${index}_gender`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`passenger_${index}_gender`]}</p>
                  )}
                </div>
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
