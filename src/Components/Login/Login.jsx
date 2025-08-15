import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, reset } from '../../redux/features/users/userSlice'; // Adjust path as needed
import safetickLogo from '../../assets/safetik.png';

const Login = () => {
  // State for handling form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [passShow, setPassShow] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get state from Redux store
  const { loading, userInfo, error } = useSelector((state) => state.users);

  // Effect to handle successful login
  useEffect(() => {
    if (userInfo) {
      setShowSuccessMessage(true);
      
      // Hide success message and navigate after 2 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        navigate('/inventory');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [userInfo, navigate]);

  // Cleanup error state when component mounts
  useEffect(() => {
    dispatch(reset());
  }, [dispatch]);

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !userType) {
      return;
    }

    const userData = {
      email,
      password,
      userType
    };

    dispatch(loginUser(userData));
  };

  // Success Message Component
  const SuccessMessage = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full transform animate-bounce-in">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <i className="fa-solid fa-check text-green-500 text-2xl"></i>
          </div>
          
          {/* Success Text */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Successful!</h2>
          <p className="text-lg text-[#DC6D18] font-semibold mb-4">Welcome!!!</p>
          
          {/* User Info */}
          {userInfo && (
            <p className="text-sm text-gray-600">
              Hello, {userInfo.firstName || userInfo.email}
            </p>
          )}
          
          {/* Loading animation */}
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#DC6D18] border-t-transparent"></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Redirecting...</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Success Message Overlay */}
      {showSuccessMessage && <SuccessMessage />}
      
      {/* Main container with gradient background, centered content, and responsive padding */}
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#efe1d3] to-[#FDECDA] p-4">
        
        {/* Login Card: Responsive width, padding, and styling */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          
          {/* Logo and Title Section */}
          <div className="text-center">
            <img src={safetickLogo} alt="Safetick Logo" className="w-24 sm:w-28 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Sign in</h1>
            {/* Accent line */}
            <div className="flex justify-center mt-2">
              <span className="h-1 w-20 bg-[#DC6D18] rounded-full"></span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <i className="fa-solid fa-exclamation-triangle text-red-500 mr-2"></i>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email Field */}
            <div className="relative">
              <i className="fa-solid fa-envelope absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"></i>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-3 border-2 border-dotted border-[#DC6D18] rounded-lg focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#DC6D18] transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <i className="fa-solid fa-lock absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"></i>
              <input
                type={passShow ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-12 pr-12 py-3 border-2 border-dotted border-[#DC6D18] rounded-lg focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#DC6D18] transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <i
                className={`fa-solid ${passShow ? "fa-eye" : "fa-eye-slash"} absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-[#DC6D18] ${loading ? 'pointer-events-none opacity-50' : ''}`}
                onClick={() => !loading && setPassShow(!passShow)}
                title={passShow ? "Hide password" : "Show password"}
              ></i>
            </div>

            {/* User Type Dropdown */}
            <div className="relative">
              <i className="fa-solid fa-user-gear absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"></i>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-3 border-2 border-dotted border-[#DC6D18] rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#DC6D18] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>Select User Type</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
                <option value="Super Admin">Super Admin</option>

              </select>
              <i className="fa-solid fa-chevron-down absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
            
            {/* Forgot Password Link */}
            <div className="text-right text-sm">
              <a href="/reset" className="font-medium text-[#DC6D18] hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#DC6D18] text-white py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC6D18] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0.3) translateY(-50px); opacity: 0; }
          50% { transform: scale(1.05) translateY(0); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </>
  );
};

export default Login;