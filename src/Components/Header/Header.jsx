// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { logout } from '../../redux/features/users/userSlice'; // Adjust path as needed

// const userList = ['Hindustan Organic Limited', 'SeafoodLab', 'Hilton Manyata', 'Travancore KSPCB'];

// function Header({ onSidebarToggle }) {
//   const [selectedUser, setSelectedUser] = useState('');
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [onlineStatus, setOnlineStatus] = useState(navigator.onLine ? 'Online' : 'Offline');
//   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   // Get user info from Redux store
//   const { userInfo } = useSelector((state) => state.users);

//   const filteredUsers = userList.filter(user =>
//     user.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   useEffect(() => {
//     const handleOnlineStatusChange = () => {
//       setOnlineStatus(navigator.onLine ? 'Online' : 'Offline');
//     };
//     window.addEventListener('online', handleOnlineStatusChange);
//     window.addEventListener('offline', handleOnlineStatusChange);
//     return () => {
//       window.removeEventListener('online', handleOnlineStatusChange);
//       window.removeEventListener('offline', handleOnlineStatusChange);
//     };
//   }, []);

//   const handleLogout = () => {
//     // Clear localStorage
//     localStorage.removeItem('userInfo');

//     // Dispatch logout action to clear Redux state
//     dispatch(logout());

//     // Navigate to login page
//     navigate('/');

//     console.log('User logged out successfully');
//   };

//   // Get display name for the logged-in user
//   const getDisplayName = () => {
//     if (userInfo) {
//       return userInfo.firstName || userInfo.userId || userInfo.email;
//     }
//     return 'ADMIN-DEV';
//   };

//   // Get user type display
//   const getUserTypeDisplay = () => {
//     if (userInfo) {
//       return userInfo.userType ? userInfo.userType.toUpperCase() : 'USER';
//     }
//     return 'ADMIN-DEV';
//   };

//   return (
//     // Main header bar updated to the new theme
//     <header className="p-4 sm:p-6 flex justify-between items-center shadow-sm bg-[#DC6D18] text-[#FFF7ED] relative z-10">
//       {/* Hamburger for mobile (will inherit the new text color) */}
//       <button
//         className="md:hidden mr-2 focus:outline-none"
//         onClick={onSidebarToggle}
//         aria-label="Open sidebar"
//       >
//         <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
//         </svg>
//       </button>

//       {/* Select User UI updated */}
//       <div className="bg-[#FFF7ED] rounded-full px-2 sm:px-4 py-2 flex items-center shadow-sm w-full max-w-[220px] sm:max-w-md relative">
//         {selectedUser && (
//           // Using a darker orange for better contrast on the cream background
//           <span className="text-[#B85B14] font-bold mr-4">{selectedUser}</span>
//         )}
//         <button
//           onClick={() => setDropdownOpen(!dropdownOpen)}
//           className="text-[#B85B14] font-semibold flex items-center space-x-2 focus:outline-none"
//         >
//           <span>{selectedUser ? '' : 'Select user'}</span>
//           <span className="text-[#B85B14]">▼</span>
//         </button>
//         <div className="ml-auto">
//           {/* Search button updated to match theme */}
//           <button
//             className="w-9 h-9 rounded-full bg-[#DC6D18] flex items-center justify-center text-[#FFF7ED] text-sm hover:bg-[#B85B14] transition"
//             onClick={() => setDropdownOpen(true)}
//           >
//             <i className="fa-solid fa-search"></i>
//           </button>
//         </div>
//         {dropdownOpen && (
//           // Dropdown menu styling updated
//           <div className="absolute top-14 left-0 bg-white text-black w-full rounded-md shadow-lg p-4 z-[100] border border-gray-200">
//             <input
//               type="text"
//               placeholder="Search users..."
//               className="w-full border border-gray-300 rounded-md px-3 py-1 mb-2 focus:outline-none"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//             <ul className="max-h-40 overflow-y-auto">
//               {filteredUsers.map((user) => (
//                 <li
//                   key={user}
//                   className="px-3 py-2 hover:bg-[#FFF7ED] hover:text-[#B85B14] cursor-pointer rounded"
//                   onClick={() => {
//                     setSelectedUser(user);
//                     setDropdownOpen(false);
//                     setSearchQuery('');
//                   }}
//                 >
//                   {user}
//                 </li>
//               ))}
//               {filteredUsers.length === 0 && (
//                 <li className="text-sm text-gray-500 text-center">No users found</li>
//               )}
//             </ul>
//           </div>
//         )}
//       </div>

//       {/* Right side icons section */}
//       <div className="ml-2 flex items-center space-x-4 font-semibold relative">
//         {/* Display logged-in user info */}
//         <span className="hidden md:inline" title={userInfo ? `Logged in as: ${userInfo.email}` : 'Not logged in'}>
//           {getUserTypeDisplay()}
//         </span>

//         {/* Show user name on smaller screens */}
//         <span className="md:hidden text-sm truncate max-w-20" title={getDisplayName()}>
//           {getDisplayName()}
//         </span>

//         {/* NOTE: Status colors (green/red) are intentionally kept for universal UX understanding */}
//         <span
//           className={`w-3 h-3 rounded-full animate-pulse ${
//             onlineStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'
//           } hidden md:inline`}
//           title={onlineStatus}
//         ></span>

//         {/* NOTE: Notification color (red) is kept for universal UX understanding */}
//         <button className="relative">
//           <i className="fa-regular fa-bell text-xl"></i>
//           <span className="absolute -top-1 -right-2 bg-red-600 text-white rounded-full px-1 text-xs">3</span>
//         </button>

//         <div className="relative">
//           <img
//             src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png"
//             alt="Profile"
//             // Profile image border updated to cream
//             className="w-8 h-8 rounded-full border-2 border-[#FFF7ED] cursor-pointer"
//             onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
//           />
//           {profileDropdownOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2 z-50">
//               {/* Show user info in dropdown */}
//               {userInfo && (
//                 <>
//                   <div className="px-4 py-2 border-b border-gray-200">
//                     <p className="text-sm font-semibold text-gray-800">
//                       {getDisplayName()}
//                     </p>
//                     <p className="text-xs text-gray-600">{userInfo.email}</p>
//                   </div>
//                 </>
//               )}

//              {/*  <button
//                 className="block w-full text-left px-4 py-2 hover:bg-gray-100"
//                 onClick={() => setProfileDropdownOpen(false)}
//               >
//                 Profile Settings
//               </button> */}

//               <button
//                 onClick={handleLogout}
//                 className="block w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-600 text-red-500 font-semibold"
//               >
//                 <i className="fa-solid fa-sign-out-alt mr-2"></i>
//                 Logout
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Header;

// src/components/Header/Header.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { logout } from '../../redux/features/users/userSlice';
// import safetickLogo from '../../assets/safetik.png';

// function Header({ onSidebarToggle }) {
//   const [onlineStatus, setOnlineStatus] = useState(navigator.onLine ? 'Online' : 'Offline');
//   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const { userInfo } = useSelector((state) => state.users);

//   useEffect(() => {
//     const handleOnlineStatusChange = () => {
//       setOnlineStatus(navigator.onLine ? 'Online' : 'Offline');
//     };
//     window.addEventListener('online', handleOnlineStatusChange);
//     window.addEventListener('offline', handleOnlineStatusChange);
//     return () => {
//       window.removeEventListener('online', handleOnlineStatusChange);
//       window.removeEventListener('offline', handleOnlineStatusChange);
//     };
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem('userInfo');
//     dispatch(logout());
//     navigate('/');
//   };

//   const getDisplayName = () =>
//     userInfo ? (userInfo.firstName || userInfo.userId || userInfo.email) : 'ADMIN-DEV';

//   const getUserTypeDisplay = () =>
//     userInfo ? (userInfo.userType ? userInfo.userType.toUpperCase() : 'USER') : 'ADMIN-DEV';

//   return (
//     <header className="p-4 sm:p-6 flex justify-between items-center shadow-sm bg-[#DC6D18] text-[#FFF7ED] relative z-10">
//       {/* Hamburger (mobile) */}
//       <button
//         className="md:hidden mr-2 focus:outline-none"
//         onClick={onSidebarToggle}
//         aria-label="Open sidebar"
//       >
//         <svg
//           className="w-7 h-7"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2"
//           viewBox="0 0 24 24"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
//         </svg>
//       </button>

//       {/* ✨ Enhanced static company label */}
//       <div className="relative w-full max-w-xl">
//         <div
//           className="group flex items-center gap-3 pr-4 pl-2 py-2 rounded-2xl
//                      bg-gradient-to-r from-[#FFF7ED] via-[#FFF7ED] to-[#FFE9D6]
//                      border border-[#F5D2B6] shadow-md ring-1 ring-[#DC6D18]/10"
//           title="Safetik Safety Solutions Pvt. Ltd"
//         >

//           <div className="min-w-0">
//             <div className="text-[#B85B14] font-extrabold tracking-tight text-base sm:text-lg truncate">
//               Safetik Safety Solutions Pvt. Ltd
//             </div>

//           </div>

//         </div>
//       </div>

//       {/* Right side */}
//       <div className="ml-2 flex items-center space-x-4 font-semibold relative">
//         <span
//           className="hidden md:inline"
//           title={userInfo ? `Logged in as: ${userInfo.email}` : 'Not logged in'}
//         >
//           {getUserTypeDisplay()}
//         </span>

//         <span className="md:hidden text-sm truncate max-w-20" title={getDisplayName()}>
//           {getDisplayName()}
//         </span>

//         <span
//           className={`w-3 h-3 rounded-full animate-pulse ${
//             onlineStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'
//           } hidden md:inline`}
//           title={onlineStatus}
//         />

//         <button className="relative" aria-label="Notifications">
//           <i className="fa-regular fa-bell text-xl" />
//           <span className="absolute -top-1 -right-2 bg-red-600 text-white rounded-full px-1 text-xs">
//             3
//           </span>
//         </button>

//         <div className="relative">
//           <img
//             src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png"
//             alt="Profile avatar"
//             className="w-8 h-8 rounded-full border-2 border-[#FFF7ED] cursor-pointer"
//             onClick={() => setProfileDropdownOpen((o) => !o)}
//           />
//           {profileDropdownOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2 z-50">
//               {userInfo && (
//                 <div className="px-4 py-2 border-b border-gray-200">
//                   <p className="text-sm font-semibold text-gray-800">{getDisplayName()}</p>
//                   <p className="text-xs text-gray-600">{userInfo.email}</p>
//                 </div>
//               )}
//               <button
//                 onClick={handleLogout}
//                 className="block w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-600 text-red-500 font-semibold"
//               >
//                 <i className="fa-solid fa-sign-out-alt mr-2" />
//                 Logout
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Header;

// src/components/Header/Header.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, logoutUserBackend } from "../../redux/features/users/userSlice";
import safetickLogo from "../../assets/safetik.png";
import axios from "axios";
import Swal from "sweetalert2";
import { API_URL } from "../../../utils/apiConfig";

function Header({ onSidebarToggle }) {
  const [onlineStatus, setOnlineStatus] = useState(
    navigator.onLine ? "Online" : "Offline"
  );
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.users);

  const [loginTimestamp, setLoginTimestamp] = useState(
    userInfo?.loginTime ? new Date(userInfo.loginTime) : null
  );
  const [elapsedTime, setElapsedTime] = useState("");

  // Technician Logout States
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLocation, setLogoutLocation] = useState(null);
  const [logoutLocating, setLogoutLocating] = useState(false);
  const [logoutLocError, setLogoutLocError] = useState("");
  const [logoutCamError, setLogoutCamError] = useState("");
  const [logoutCapturedImage, setLogoutCapturedImage] = useState(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const logoutVideoRef = React.useRef(null);
  const logoutCanvasRef = React.useRef(null);
  const logoutStreamRef = React.useRef(null);

  useEffect(() => {
    if (userInfo && userInfo.userType === "Technician" && userInfo.activeAttendanceId) {
      const fetchActiveAttendance = async () => {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          };
          const { data } = await axios.get(`${API_URL}/api/auth/active-attendance`, config);
          if (data && data.checkIn) {
            setLoginTimestamp(new Date(data.checkIn));
          }
        } catch (err) {
          console.error("Error fetching active attendance:", err);
          if (userInfo.loginTime) {
            setLoginTimestamp(new Date(userInfo.loginTime));
          }
        }
      };
      fetchActiveAttendance();
    } else {
      setLoginTimestamp(null);
    }
  }, [userInfo]);

  useEffect(() => {
    if (loginTimestamp) {
      const updateTime = () => {
        const diffMs = new Date() - loginTimestamp;
        const diffMins = Math.max(0, Math.floor(diffMs / 60000));
        if (diffMins < 60) {
          setElapsedTime(`${diffMins} mins`);
        } else {
          const hrs = Math.floor(diffMins / 60);
          const remainingMins = diffMins % 60;
          if (remainingMins === 0) {
            setElapsedTime(`${hrs} ${hrs === 1 ? 'hr' : 'hrs'}`);
          } else {
            setElapsedTime(`${hrs} ${hrs === 1 ? 'hr' : 'hrs'} ${remainingMins} mins`);
          }
        }
      };

      updateTime();
      const interval = setInterval(updateTime, 10000);
      return () => clearInterval(interval);
    } else {
      setElapsedTime("");
    }
  }, [loginTimestamp]);

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setOnlineStatus(navigator.onLine ? "Online" : "Offline");
    };
    window.addEventListener("online", handleOnlineStatusChange);
    window.addEventListener("offline", handleOnlineStatusChange);
    return () => {
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);
    };
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopLogoutCamera();
  }, []);

  const startLogoutCamera = async () => {
    try {
      setLogoutCamError("");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported. Ensure you are using HTTPS or localhost.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      logoutStreamRef.current = stream;
      setTimeout(() => {
        if (logoutVideoRef.current) {
          logoutVideoRef.current.srcObject = stream;
        }
      }, 150); // Small delay to let modal render
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setLogoutCamError("Camera access was denied. Please allow it in browser settings.");
      } else {
        setLogoutCamError(err.message || "Camera permission is required or device not found.");
      }
    }
  };

  const stopLogoutCamera = () => {
    if (logoutStreamRef.current) {
      logoutStreamRef.current.getTracks().forEach(track => track.stop());
      logoutStreamRef.current = null;
    }
  };

  const fetchLogoutLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLogoutLocError("Geolocation is not supported by your browser");
      return;
    }
    setLogoutLocating(true);
    setLogoutLocError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLogoutLocating(false);
        setLogoutLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        startLogoutCamera();
      },
      (error) => {
        setLogoutLocating(false);
        let errMsg = "Location permission is required.";
        if (error.code === 1) errMsg = "Location access was denied. Please allow it in browser settings.";
        if (error.code === 2) errMsg = "Location is unavailable. Please check your network or GPS.";
        if (error.code === 3) errMsg = "Location request timed out.";
        setLogoutLocError(errMsg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  // Effect to automatically retry fetching logout location when permission status changes or tab gains focus
  useEffect(() => {
    if (!showLogoutModal || (userInfo && userInfo.userType !== "Technician")) return;

    let permissionStatus = null;

    const handlePermissionChange = () => {
      if (permissionStatus && (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt')) {
        fetchLogoutLocation();
      }
    };

    const handleWindowFocus = () => {
      // Auto-retry location fetching on window focus if logout modal is open and we don't have location yet
      if (!logoutLocation) {
        fetchLogoutLocation();
      }
    };

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((status) => {
          permissionStatus = status;
          status.addEventListener('change', handlePermissionChange);
        })
        .catch((err) => {
          console.warn("Permissions API query failed:", err);
        });
    }

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      if (permissionStatus) {
        permissionStatus.removeEventListener('change', handlePermissionChange);
      }
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [showLogoutModal, logoutLocation, userInfo, fetchLogoutLocation]);

  const captureLogoutPhoto = () => {
    if (logoutVideoRef.current && logoutCanvasRef.current) {
      const video = logoutVideoRef.current;
      const canvas = logoutCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setLogoutCapturedImage(dataUrl);
      stopLogoutCamera();
    }
  };

  const retakeLogoutPhoto = () => {
    setLogoutCapturedImage(null);
    startLogoutCamera();
  };

  const cancelLogoutModal = () => {
    stopLogoutCamera();
    setShowLogoutModal(false);
    setLogoutLocation(null);
    setLogoutCapturedImage(null);
    setLogoutLocError("");
    setLogoutCamError("");
  };

  const submitLogout = async () => {
    if (!logoutCapturedImage) {
      alert("Please capture a photo first.");
      return;
    }
    if (!logoutLocation) {
      alert("GPS location is required to logout.");
      return;
    }

    setLogoutLoading(true);
    try {
      await dispatch(logoutUserBackend({
        image: logoutCapturedImage,
        latitude: logoutLocation.latitude,
        longitude: logoutLocation.longitude
      })).unwrap();

      // Successfully logged out
      stopLogoutCamera();
      setShowLogoutModal(false);
      localStorage.removeItem("userInfo");
      dispatch(logout());
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: err || "Something went wrong during logout. Please try again."
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleLogout = () => {
    if (userInfo && userInfo.userType === "Technician") {
      // For Technicians, open the custom attendance logout camera modal
      setShowLogoutModal(true);
      setLogoutLocating(true);
      setLogoutLocError("");
      setLogoutCapturedImage(null);
      setLogoutLocation(null);
      setLogoutCamError("");

      fetchLogoutLocation();
    } else {
      // Non-technicians logout normally without modal
      performLogout();
    }
  };

  const performLogout = () => {
    dispatch(logoutUserBackend()).finally(() => {
      localStorage.removeItem("userInfo");
      dispatch(logout());
      navigate("/");
    });
  };

  const getDisplayName = () =>
    userInfo
      ? userInfo.firstName || userInfo.userId || userInfo.email
      : "ADMIN-DEV";

  const getUserTypeDisplay = () =>
    userInfo
      ? userInfo.userType
        ? userInfo.userType.toUpperCase()
        : "USER"
      : "ADMIN-DEV";

  return (
    <>
      <header className="p-4 sm:p-6 flex justify-between items-center shadow-sm bg-[#DC6D18] text-[#FFF7ED] relative z-10">
        {/* Hamburger (mobile) */}
        <button
          className="md:hidden mr-2 focus:outline-none"
          onClick={onSidebarToggle}
          aria-label="Open sidebar"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* ✨ Company label — show on md+ only */}
        <div className="hidden md:block w-medium max-w-2xl">
          <div
            className="group flex items-center gap-3 pr-4 pl-2 py-2 rounded-2xl
                 bg-gradient-to-r from-[#FFF7ED] via-[#FFF7ED] to-[#FFE9D6]
                 border border-[#F5D2B6] shadow-md ring-1 ring-[#DC6D18]/10"
            title="Safetik Safety Solutions Pvt. Ltd"
          >
            <div className="min-w-0">
              <div className="text-[#B85B14] font-extrabold tracking-tight text-base sm:text-lg truncate">
                Safetik Safety Solutions Pvt. Ltd
              </div>
              <div className="hidden sm:block text-xs text-[#9a5a24] opacity-80">
                Safety • Compliance • Reliability
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="ml-2 flex items-center space-x-4 font-semibold relative">
          {/* Logged-in user — name/ID + role (desktop) */}
          <div
            className="hidden md:flex flex-col items-end leading-tight"
            title={userInfo ? `Logged in as: ${userInfo.email}` : "Not logged in"}
          >
            <span className="text-sm font-bold truncate max-w-[180px]">
              {getDisplayName()}
            </span>
            <span className="text-xs opacity-80">{getUserTypeDisplay()}</span>
            {userInfo?.userType === "Technician" && elapsedTime && (
              <span className="text-[10px] text-green-300 font-bold bg-[#B85B14]/40 px-1.5 py-0.5 rounded mt-1 animate-pulse">
                ⏱ {elapsedTime}
              </span>
            )}
          </div>

          {/* Logged-in user — compact (mobile) */}
          <div className="md:hidden flex flex-col items-end leading-tight mr-1">
            <span
              className="text-sm font-bold truncate max-w-20"
              title={getDisplayName()}
            >
              {getDisplayName()}
            </span>
            {userInfo?.userType === "Technician" && elapsedTime && (
              <span className="text-[9px] text-green-300 font-bold animate-pulse">
                ⏱ {elapsedTime}
              </span>
            )}
          </div>

          <span
            className={`w-3 h-3 rounded-full animate-pulse ${
              onlineStatus === "Online" ? "bg-green-500" : "bg-red-500"
            } hidden md:inline`}
            title={onlineStatus}
          />

          <div className="relative">
            <img
              src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png"
              alt="Profile avatar"
              className="w-8 h-8 rounded-full border-2 border-[#FFF7ED] cursor-pointer"
              onClick={() => setProfileDropdownOpen((o) => !o)}
            />
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2 z-50">
                {userInfo && (
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-gray-600">{userInfo.email}</p>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-600 text-red-500 font-semibold"
                >
                  <i className="fa-solid fa-sign-out-alt mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Technician Logout Camera & Location Capture Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-md flex justify-center items-start overflow-y-auto z-[9999] p-4 sm:p-6 py-8 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-orange-100 space-y-5 text-gray-800 relative z-50 animate-bounce-in my-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <i className="fa-solid fa-sign-out-alt text-[#DC6D18]"></i>
                Attendance Check-Out
              </h2>
              <div className="h-1 w-16 bg-[#DC6D18] rounded-full mx-auto mt-2"></div>
            </div>

            {/* Elapsed Time / Duration Display */}
            {elapsedTime && (
              <div className="text-center py-2 bg-orange-50 border border-orange-100 rounded-xl">
                <p className="text-xs text-gray-500">Your total login duration is:</p>
                <p className="text-2xl font-black text-[#DC6D18] tracking-tight">{elapsedTime}</p>
              </div>
            )}

            {/* GPS Acquiring Section */}
            {logoutLocating && (
              <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl flex flex-col items-center justify-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#DC6D18] border-t-transparent"></div>
                <p className="text-sm font-semibold text-[#B85B14] animate-pulse">Acquiring GPS location...</p>
                <p className="text-xs text-gray-500">Please wait. Location is required to verify check-out.</p>
              </div>
            )}

            {/* GPS Error State */}
            {logoutLocError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                <div className="flex items-start gap-2 text-red-700">
                  <i className="fa-solid fa-triangle-exclamation text-lg mt-0.5 animate-bounce"></i>
                  <div>
                    <h4 className="font-bold text-sm">GPS Location Error</h4>
                    <p className="text-xs mt-1 leading-relaxed">{logoutLocError}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fetchLogoutLocation}
                  className="w-full bg-red-600 text-white text-xs py-2.5 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Retry GPS Capture
                </button>
              </div>
            )}

            {/* Camera Setup / Error State */}
            {logoutLocation && logoutCamError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                <div className="flex items-start gap-2 text-red-700">
                  <i className="fa-solid fa-camera text-lg mt-0.5"></i>
                  <div>
                    <h4 className="font-bold text-sm">Camera Initialization Error</h4>
                    <p className="text-xs mt-1 leading-relaxed">{logoutCamError}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={startLogoutCamera}
                  className="w-full bg-[#DC6D18] text-white text-xs py-2.5 rounded-lg font-semibold hover:bg-[#B85B14] transition"
                >
                  Retry Camera
                </button>
              </div>
            )}

            {/* GPS Verified Status & Camera Preview */}
            {logoutLocation && !logoutCamError && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-green-50 text-green-800 p-2.5 rounded-lg border border-green-200 text-xs">
                  <i className="fa-solid fa-circle-check text-green-600 text-sm"></i>
                  <div>
                    <span className="font-bold text-green-800">GPS Coordinates Verified</span>
                    <span className="block font-mono mt-0.5 text-[10px] text-green-700">
                      Lat: {logoutLocation.latitude.toFixed(6)}, Lng: {logoutLocation.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>

                {!logoutCapturedImage ? (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 text-center">A live checkout selfie is required to log out.</p>
                    <div className="relative rounded-xl overflow-hidden bg-gray-950 max-h-[240px] sm:max-h-[320px] aspect-[4/3] sm:aspect-[3/4] flex items-center justify-center shadow-inner border border-gray-200 mx-auto w-full">
                      <video ref={logoutVideoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                      <button
                        type="button"
                        onClick={captureLogoutPhoto}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-[#DC6D18] rounded-full w-14 h-14 shadow-xl hover:bg-gray-100 hover:scale-105 transition-all flex items-center justify-center border-4 border-gray-300"
                        title="Capture Photo"
                      >
                        <i className="fa-solid fa-camera text-xl"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 text-center">Verify your photo. If it is clear, confirm logout.</p>
                    <div className="relative rounded-xl overflow-hidden bg-gray-950 max-h-[240px] sm:max-h-[320px] aspect-[4/3] sm:aspect-[3/4] flex items-center justify-center shadow-inner border border-gray-200 mx-auto w-full">
                      <img src={logoutCapturedImage} alt="Logout selfie" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={retakeLogoutPhoto}
                        className="absolute top-4 right-4 bg-gray-900 bg-opacity-70 text-white rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-opacity-95 transition backdrop-blur-sm"
                      >
                        <i className="fa-solid fa-rotate-right mr-1"></i> Retake
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <canvas ref={logoutCanvasRef} className="hidden"></canvas>

            {/* Actions Footer */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={cancelLogoutModal}
                disabled={logoutLoading}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition focus:outline-none disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitLogout}
                disabled={logoutLoading || !logoutLocation || !logoutCapturedImage}
                className="flex-[2] bg-[#DC6D18] text-[#FFF7ED] py-3 rounded-lg font-semibold hover:bg-[#B85B14] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {logoutLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "Confirm Logout"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
