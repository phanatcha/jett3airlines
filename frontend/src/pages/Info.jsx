import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GrayLogo from "../components/GrayLogo";

const Info = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    country: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    cardNumber: "",
    cardLastFour: "",
    paymentType: "credit",
  });
  const [error, setError] = useState("");
  const [basicInfo, setBasicInfo] = useState(null);

  useEffect(() => {
    // Get basic info from sessionStorage
    const storedInfo = sessionStorage.getItem('signupBasicInfo');
    if (!storedInfo) {
      // If no basic info, redirect to signup
      navigate('/signup');
      return;
    }
    setBasicInfo(JSON.parse(storedInfo));
  }, [navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setError(""); // Clear error on input change
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  const normalizedData = Object.fromEntries(
    Object.entries(formData).map(([k, v]) => [k, v.trim()])
  );

  const emptyFields = Object.entries(normalizedData).filter(([key, value]) => {
    if (key === "paymentType") return false;
    return !value;
  });

  if (emptyFields.length > 0) {
    setError("Please fill out all fields before continuing.");
    return;
  }

  if (/\d/.test(normalizedData.country)) {
    setError("Please enter a valid country name.");
    return;
  }
  if (/\d/.test(normalizedData.state)) {
    setError("Please enter a valid state name.");
    return;
  }

  if (!/^\d{4,6}$/.test(normalizedData.postalCode)) {
    setError("Please enter a valid postal code (4–6 digits).");
    return;
  }

  if (!/^\d{16}$/.test(normalizedData.cardNumber.replace(/\s/g, ''))) {
    setError("Please enter a valid 16-digit card number.");
    return;
  }

  if (!/^\d{4}$/.test(normalizedData.cardLastFour)) {
    setError("Please enter the last 4 digits of your card.");
    return;
  }

  // Combine basic info with detailed info
  const registrationData = {
    ...basicInfo,
    dob: normalizedData.dateOfBirth,
    country: normalizedData.country,
    street: normalizedData.address,
    city: normalizedData.city,
    province: normalizedData.state,
    postalcode: normalizedData.postalCode,
    card_no: normalizedData.cardNumber.replace(/\s/g, ''),
    four_digit: normalizedData.cardLastFour,
    payment_type: normalizedData.paymentType,
  };

  // Call register API
  const result = await register(registrationData);

  if (result.success) {
    // Clear stored data
    sessionStorage.removeItem('signupBasicInfo');
    // Redirect to flights page
    navigate("/flights");
  } else {
    setError(result.error || "Registration failed. Please try again.");
  }
};


  if (!basicInfo) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/personal-info-page-bg.png')] bg-cover bg-center relative overflow-auto">
      <div className="absolute top-8 left-8 z-10">
        <GrayLogo />
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-10 w-[90%] max-w-2xl relative z-20 flex flex-col my-8">
        <h2 className="text-center mb-8">
          Personal Information
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-grow">

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
                disabled={loading}
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
                disabled={loading}
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
              disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[--color-primary-100]"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-semibold mb-1">
                  Card Number
                </label>
                <input
                  id="cardNumber"
                  type="text"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[--color-primary-100]"
                />
              </div>

              <div>
                <label htmlFor="cardLastFour" className="block text-sm font-semibold mb-1">
                  Last 4 Digits
                </label>
                <input
                  id="cardLastFour"
                  type="text"
                  value={formData.cardLastFour}
                  onChange={handleChange}
                  placeholder="1234"
                  maxLength="4"
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[--color-primary-100]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="paymentType" className="block text-sm font-semibold mb-1">
                Payment Type
              </label>
              <select
                id="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[--color-primary-100]"
              >
                <option value="credit">Credit Card</option>
                <option value="debit">Debit Card</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="block w-full text-center bg-primary-500 text-white py-3 rounded-md font-medium hover:bg-primary-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Info;
