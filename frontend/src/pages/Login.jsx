import { useState } from "react";
import { Link } from "react-router-dom";
import GrayLogo from "../components/GrayLogo";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };


  const fields = [
      { id: "email", label: "Sign in with email address", type: "email", placeholder: "yourname@gmail.com" },
      { id: "password", label: "Password", type: "password", placeholder: "Password" },
  ];

  return (
    <div className="flex h-screen bg-white text-black">
      {/* Left Side */}
      <div className="w-2/5 relative flex items-center justify-center">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/log-in.mp4" type="video/mp4" />
        </video>
        <div className="absolute top-8 left-8 z-10">
          <GrayLogo />
        </div>
      </div>

      {/* Right Side */}
      <div className="w-3/5 flex items-center justify-center px-16">
        <form className="w-full max-w-md space-y-6">
          <h2 className="mb-6">Sign In</h2>

        {fields.map(({ id, label, type, placeholder }) => (
        <div key={id} className="flex flex-col space-y-2 w-full">
            <label htmlFor={id} className="font-semibold text-black">
            {label}
            </label>
            <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={formData[id]}
            onChange={(e) =>
                setFormData({ ...formData, [id]: e.target.value })
            }
            className="border border-gray-400 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
        </div>
        ))}



          <div className="w-full">
            <Link
                to="/flights"
                className="block w-full text-center bg-primary-500 text-white py-3 rounded-md font-medium hover:bg-primary-300 transition"
            >
                Login
            </Link>
          </div>


        </form>
      </div>
    </div>
  );
};

export default Login;
