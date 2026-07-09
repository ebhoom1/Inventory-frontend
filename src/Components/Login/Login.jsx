import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, reset, clearError } from '../../redux/features/users/userSlice'; // Adjust path as needed
import safetickLogo from '../../assets/safetik.png';

const Login = () => {
  // State for handling form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [passShow, setPassShow] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [step, setStep] = useState(1);
  const [cameraError, setCameraError] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [showForceLoginModal, setShowForceLoginModal] = useState(false);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const streamRef = React.useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux store
  const { loading, userInfo, error, errorStatus } = useSelector((state) => state.users);

  // Effect to handle successful login
  useEffect(() => {
    if (userInfo) {
      setShowSuccessMessage(true);

      // Hide success message and navigate after 2 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        navigate('/equipment');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [userInfo, navigate]);

  // Effect to handle already logged-in session error status
  useEffect(() => {
    if (errorStatus === 'SESSION_EXISTS') {
      setShowForceLoginModal(true);
    }
  }, [errorStatus]);

  // Effect to request location when Technician is selected
  useEffect(() => {
    if (userType === 'Technician') {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by your browser");
      } else {
        setIsLocating(true);
        setLocationError("");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setIsLocating(false);
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            setIsLocating(false);
            let errMsg = "Location permission is required.";
            if (error.code === 1) errMsg = "Location access was denied. Please allow it in browser settings.";
            if (error.code === 2) errMsg = "Location is unavailable. Please check your network or GPS.";
            if (error.code === 3) errMsg = "Location request timed out.";
            setLocationError(errMsg);
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      }
    } else {
      setUserLocation(null);
      setLocationError("");
      setManualLocation("");
    }
  }, [userType]);

  // Cleanup error state and camera on mount/unmount
  useEffect(() => {
    dispatch(reset());
    return () => stopCamera();
  }, [dispatch]);

  const startCamera = async () => {
    try {
      setCameraError("");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported. Ensure you are using HTTPS or localhost.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setCameraError("Camera access was denied. Please allow it in browser settings and try again.");
      } else {
        setCameraError(err.message || "Camera permission is required or device not found.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Handle form submission
  const handleLogin = async (e, isForced = false) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!email || !password || !userType) {
      return;
    }

    if (userType === 'Technician') {
      if (step === 1) {
        if (isLocating) {
          alert("Acquiring GPS location. Please wait...");
          return;
        }
        if (!userLocation) {
          alert(locationError || "GPS Location is required to log in. Please enable location services in your browser settings and try again.");
          return;
        }
        setStep(2);
        setTimeout(() => startCamera(), 100); // Wait for video element to render
        return;
      }

      if (step === 2) {
        if (!capturedImage) {
          alert("Please capture a photo before logging in.");
          return;
        }
        const userData = {
          email,
          password,
          userType,
          latitude: userLocation ? userLocation.latitude : "",
          longitude: userLocation ? userLocation.longitude : "",
          location: manualLocation,
          image: capturedImage,
          forceLogin: isForced
        };
        dispatch(loginUser(userData));
      }
    } else {
      const userData = {
        email,
        password,
        userType,
        forceLogin: isForced
      };
      dispatch(loginUser(userData));
    }

    if (isForced) {
      setShowForceLoginModal(false);
    }
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

  // Force Login Confirmation Modal Component
  const ForceLoginModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 mx-4 max-w-sm w-full transform animate-bounce-in border border-[#DC6D18]/10">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100 animate-pulse">
            <i className="fa-solid fa-circle-exclamation text-amber-500 text-3xl animate-bounce"></i>
          </div>
          
          {/* Alert Title */}
          <h2 className="text-xl font-bold text-gray-800 mb-2">Already Logged In</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            You are currently logged in on another device. Logging in here will automatically disconnect that session. Do you want to proceed?
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForceLoginModal(false);
                dispatch(clearError());
              }}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                handleLogin(null, true);
              }}
              className="flex-1 bg-[#DC6D18] text-white py-3 rounded-lg font-semibold hover:bg-opacity-95 transition-transform transform active:scale-95 shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18] flex items-center justify-center"
            >
              Yes, Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Success Message Overlay */}
      {showSuccessMessage && <SuccessMessage />}

      {/* Force Login Confirmation Overlay */}
      {showForceLoginModal && <ForceLoginModal />}

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
          {error && errorStatus !== 'SESSION_EXISTS' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <i className="fa-solid fa-exclamation-triangle text-red-500 mr-2"></i>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form / Camera Step */}
          {step === 1 ? (
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
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                  <option value="Technician">Technician</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>

              {/* Location Display for Technician */}
              {userType === 'Technician' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-blue-800 text-sm">
                      <i className="fa-solid fa-location-dot mr-2"></i> Location (Required)
                    </h3>
                    <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-semibold uppercase">Required</span>
                  </div>

                  {isLocating ? (
                    <p className="text-xs text-blue-600 animate-pulse">Fetching GPS location...</p>
                  ) : locationError ? (
                    <p className="text-xs text-blue-500 font-medium"><i className="fa-solid fa-triangle-exclamation mr-1"></i> GPS: {locationError}</p>
                  ) : userLocation ? (
                    <div className="text-xs text-blue-800 bg-blue-100 p-2 rounded-lg inline-block w-full">
                      <span className="block font-mono">GPS Lat: {userLocation.latitude.toFixed(6)}</span>
                      <span className="block font-mono">GPS Lng: {userLocation.longitude.toFixed(6)}</span>
                    </div>
                  ) : null}

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">Manual Location / Site Name</label>
                    <input
                      type="text"
                      placeholder="Enter location or site name..."
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      disabled={loading}
                      className="w-full px-3 py-2 text-sm border-2 border-dotted border-[#DC6D18] rounded-lg focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#DC6D18] transition disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              {/* Forgot Password Link */}
              <div className="text-right text-sm">
                <a href="/resetpassword" className="font-medium text-[#DC6D18] hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading || isLocating}
                className="w-full bg-[#DC6D18] text-white py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC6D18] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {loading || isLocating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    {isLocating ? 'Getting Location...' : 'Processing...'}
                  </>
                ) : (
                  userType === 'Technician' ? 'Next' : 'Login'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-semibold text-gray-800 text-center"><i className="fa-solid fa-camera mr-2"></i> Take a Photo</h2>
              <p className="text-sm text-center text-gray-500">A live photo is required to complete attendance.</p>

              {cameraError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center justify-between">
                  <div>
                    <i className="fa-solid fa-triangle-exclamation mr-1"></i> {cameraError}
                  </div>
                  <button type="button" onClick={startCamera} className="underline font-semibold whitespace-nowrap ml-2">Try Again</button>
                </div>
              )}

              {!capturedImage ? (
                <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-[3/4] flex items-center justify-center shadow-inner">
                  {!cameraError && (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                  )}
                  <button type="button" onClick={capturePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-[#DC6D18] rounded-full w-16 h-16 shadow-xl hover:bg-gray-100 hover:scale-105 transition-all flex items-center justify-center border-4 border-gray-300">
                    <i className="fa-solid fa-camera text-2xl"></i>
                  </button>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-[3/4] flex items-center justify-center shadow-inner">
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                  <button type="button" onClick={retakePhoto} className="absolute top-4 right-4 bg-gray-900 bg-opacity-70 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-opacity-90 transition backdrop-blur-sm">
                    <i className="fa-solid fa-rotate-right mr-1"></i> Retake
                  </button>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden"></canvas>

              <div className="flex gap-4">
                <button type="button" onClick={() => { setStep(1); stopCamera(); }} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition focus:ring-2 focus:ring-gray-300">
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loading || !capturedImage}
                  className="flex-[2] bg-[#DC6D18] text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#DC6D18] focus:ring-offset-1 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Logging in...
                    </>
                  ) : (
                    'Final Login'
                  )}
                </button>
              </div>
            </div>
          )}
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