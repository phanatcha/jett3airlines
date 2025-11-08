import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GrayLogo from "../components/GrayLogo";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

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

    // Validation
    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    // Call login API
    const result = await login({
      username: formData.username,
      password: formData.password,
    });

    if (result.success) {
      // Redirect to flights page on successful login
      navigate("/flights");
    } else {
      setError(result.error || "Login failed. Please check your credentials.");
    }
  };

  const fields = [
      { id: "username", label: "Username", type: "text", placeholder: "Enter your username" },
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
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <h2 className="mb-6">Sign In</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

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
            onChange={handleChange}
            className="border border-gray-400 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
            />
        </div>
        ))}

          <div className="w-full">
            <button
                type="submit"
                disabled={loading}
                className="block w-full text-center bg-primary-500 text-white py-3 rounded-md font-medium hover:bg-primary-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign up now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
