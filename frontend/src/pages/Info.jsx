import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GrayLogo from "../components/GrayLogo";

const Info = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    country: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

const handleSubmit = (e) => {
  e.preventDefault();

  const normalizedData = Object.fromEntries(
    Object.entries(formData).map(([k, v]) => [k, v.trim()])
  );

  const emptyFields = Object.entries(normalizedData).filter(([_, value]) => !value);
  if (emptyFields.length > 0) {
    alert("Please fill out all fields before continuing.");
    return;
  }

  const isInvalidName = (name) => name.length < 2 || /\d/.test(name);

  if (isInvalidName(normalizedData.firstName)) {
    alert("Please enter a valid first name.");
    return;
  }
  if (isInvalidName(normalizedData.lastName)) {
    alert("Please enter a valid last name.");
    return;
  }

  if (/\d/.test(normalizedData.country)) {
    alert("Please enter a valid country name.");
    return;
  }
  if (/\d/.test(normalizedData.state)) {
    alert("Please enter a valid state name.");
    return;
  }

  if (!/^\d{4,6}$/.test(normalizedData.postalCode)) {
    alert("Please enter a valid postal code (4–6 digits).");
    return;
  }

  navigate("/flights");
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/personal-info-page-bg.png')] bg-cover bg-center relative overflow-auto">
      <div className="absolute top-8 left-8 z-10">
        <GrayLogo />
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-10 w-[90%] max-w-2xl relative z-20 flex flex-col">
        <h2 className="text-center mb-8">
          Personal Information
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-grow">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold mb-1">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[--color-primary-100]"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[--color-primary-100]"
              />
            </div>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-semibold mb-1">
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[--color-primary-100]"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-semibold mb-1">
                Country
              </label>
              <input
                id="country"
                type="text"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[--color-primary-100]"
              />
            </div>
          </div>


          <div>
            <label htmlFor="address" className="block text-sm font-semibold mb-1">
              Address
            </label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[--color-primary-100]"
            />
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-semibold mb-1">
                City
              </label>
              <input
                id="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[--color-primary-100]"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-semibold mb-1">
                State/Province
              </label>
              <input
                id="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
                placeholder="State/Province"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[--color-primary-100]"
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-semibold mb-1">
                Postal Code
              </label>
              <input
                id="postalCode"
                type="text"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Postal Code"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[--color-primary-100]"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="block w-full text-center bg-primary-500 text-white py-3 rounded-md font-medium hover:bg-primary-300 transition"
            >
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Info;
