import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GrayLogo from "../components/GrayLogo";

const Login = () => {
  console.log('Login component rendered');
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    console.log('Input changed:', id, '=', value);
    setFormData((prev) => {
      const newData = {
        ...prev,
        [id]: value,
      };
      console.log('New form data:', newData);
      return newData;
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    console.log('=== LOGIN SUBMIT STARTED ===');
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setError("");

    try {
      if (!formData.username || !formData.password) {
        console.log('Validation failed: missing fields');
        setError("Please fill in all fields");
        return;
      }

      console.log('Calling login API...');
      const result = await login({
        username: formData.username,
        password: formData.password,
      });

      console.log('Login result:', result);

      if (result.success) {
        console.log('Login successful, navigating...');
        if (result.data?.isAdmin === true) {
          navigate("/admin");
        } else {
          navigate("/flights");
        }
      } else {
        console.log('Login failed, showing error');
        let errorMessage = "Login failed. Please try again.";
        
        if (typeof result.error === 'string') {
          errorMessage = result.error;
        } else if (result.error?.message) {
          errorMessage = result.error.message;
        }
        
        if (errorMessage.toLowerCase().includes('invalid') || 
            errorMessage.toLowerCase().includes('credentials')) {
          errorMessage = "User not found or password incorrect. Please check your credentials.";
        }
        
        console.log('Setting error:', errorMessage);
        setError(errorMessage);
        console.log('=== LOGIN SUBMIT COMPLETED (ERROR) ===');
      }
    } catch (err) {
      console.error('Login form error:', err);
      setError("An unexpected error occurred. Please try again.");
      console.log('=== LOGIN SUBMIT COMPLETED (EXCEPTION) ===');
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
        <div className="w-full max-w-md space-y-6">
          <h2 className="mb-6">Sign In</h2>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm" role="alert">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
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
                type="button"
                onClick={(e) => {
                  console.log('Button clicked!', e);
                  console.log('Loading state:', loading);
                  console.log('Form data:', formData);
                  handleSubmit(e);
                }}
                disabled={loading}
                className="block w-full text-center bg-primary-500 text-white py-3 rounded-md font-medium hover:bg-primary-300 transition disabled:opacity-50 disabled:cursor-not-allowed relative z-50"
                onMouseEnter={() => console.log('Mouse entered button')}
                onMouseDown={() => console.log('Mouse down on button')}
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
        </div>
      </div>
    </div>
  );
};

export default Login;
