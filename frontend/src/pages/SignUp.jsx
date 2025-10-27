import { useState } from "react";
import { Link } from "react-router-dom";
import GrayLogo from "../components/GrayLogo";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const fields = [
    [
      { id: "firstName", label: "First Name", type: "text", placeholder: "First Name" },
      { id: "lastName", label: "Last Name", type: "text", placeholder: "Last Name" },
    ],
    [
      { id: "email", label: "Email", type: "email", placeholder: "yourname@gmail.com" },
    ],
    [
      { id: "password", label: "Password", type: "password", placeholder: "Password" },
      { id: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Confirm Password" },
    ],
  ];

  return (
    <div className="flex h-screen bg-white text-black">
      {/* Left Side */}
      <div className="w-1/2 relative flex items-center justify-center">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/sign-up.mp4" type="video/mp4" />
        </video>
        <div className="absolute top-8 left-8 z-10">
          <GrayLogo />
        </div>
      </div>

      {/* Right Side */}
      <div className="w-1/2 flex items-center justify-center px-16">
        <form className="w-full max-w-md space-y-6">
          <h3 className="text-3xl font-bold mb-6">Create An Account</h3>

          {fields.map((row, i) => (
            <div
              key={i}
              className={`flex ${row.length > 1 ? "space-x-4" : ""}`}
            >
              {row.map(({ id, label, type, placeholder }) => (
                <div key={id} className="flex flex-col space-y-2 w-full">
                  <label htmlFor={id} className="font-semibold text-black">
                    {label}
                  </label>
                  <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={formData[id]}
                    onChange={handleChange}
                    className="border border-gray-400 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
          ))}

          <div className="flex items-center space-x-2">
            <input
              id="agreeTerms"
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label htmlFor="agreeTerms" className="text-sm">
              I agree to the{" "}
              <span className="font-semibold">Terms and Conditions</span>
            </label>
          </div>

          <div className="w-full">
            <Link
                to="/flights"
                className="block w-full text-center bg-primary-500 text-white py-3 rounded-md font-medium hover:bg-primary-300 transition"
            >
                Create Account
            </Link>
          </div>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Login now
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
