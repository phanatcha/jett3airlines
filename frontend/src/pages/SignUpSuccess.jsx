import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUpSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-green-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Sign Up Successful!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Your account has been created successfully. Please proceed to log in.
        </p>

        {/* Loading Animation */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full animate-progress"
              style={{
                animation: 'progress 5s linear forwards'
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Redirecting to login page...
          </p>
        </div>

        {/* Manual Navigation Button */}
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition"
        >
          Go to Login Now
        </button>
      </div>

      <style>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .animate-progress {
          width: 0%;
        }
      `}</style>
    </div>
  );
};

export default SignUpSuccess;
