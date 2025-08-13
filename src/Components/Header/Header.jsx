import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/features/users/userSlice'; // Adjust path as needed

const userList = ['Hindustan Organic Limited', 'SeafoodLab', 'Hilton Manyata', 'Travancore KSPCB'];

function Header({ onSidebarToggle }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine ? 'Online' : 'Offline');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get user info from Redux store
  const { userInfo } = useSelector((state) => state.users);

  const filteredUsers = userList.filter(user =>
    user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setOnlineStatus(navigator.onLine ? 'Online' : 'Offline');
    };
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('userInfo');
    
    // Dispatch logout action to clear Redux state
    dispatch(logout());
    
    // Navigate to login page
    navigate('/');
    
    console.log('User logged out successfully');
  };

  // Get display name for the logged-in user
  const getDisplayName = () => {
    if (userInfo) {
      return userInfo.firstName || userInfo.userId || userInfo.email;
    }
    return 'ADMIN-DEV';
  };

  // Get user type display
  const getUserTypeDisplay = () => {
    if (userInfo) {
      return userInfo.userType ? userInfo.userType.toUpperCase() : 'USER';
    }
    return 'ADMIN-DEV';
  };

  return (
    // Main header bar updated to the new theme
    <header className="p-4 sm:p-6 flex justify-between items-center shadow-sm bg-[#DC6D18] text-[#FFF7ED] relative z-10">
      {/* Hamburger for mobile (will inherit the new text color) */}
      <button
        className="md:hidden mr-2 focus:outline-none"
        onClick={onSidebarToggle}
        aria-label="Open sidebar"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Select User UI updated */}
      <div className="bg-[#FFF7ED] rounded-full px-2 sm:px-4 py-2 flex items-center shadow-sm w-full max-w-[220px] sm:max-w-md relative">
        {selectedUser && (
          // Using a darker orange for better contrast on the cream background
          <span className="text-[#B85B14] font-bold mr-4">{selectedUser}</span>
        )}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="text-[#B85B14] font-semibold flex items-center space-x-2 focus:outline-none"
        >
          <span>{selectedUser ? '' : 'Select user'}</span>
          <span className="text-[#B85B14]">▼</span>
        </button>
        <div className="ml-auto">
          {/* Search button updated to match theme */}
          <button
            className="w-9 h-9 rounded-full bg-[#DC6D18] flex items-center justify-center text-[#FFF7ED] text-sm hover:bg-[#B85B14] transition"
            onClick={() => setDropdownOpen(true)}
          >
            <i className="fa-solid fa-search"></i>
          </button>
        </div>
        {dropdownOpen && (
          // Dropdown menu styling updated
          <div className="absolute top-14 left-0 bg-white text-black w-full rounded-md shadow-lg p-4 z-[100] border border-gray-200">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full border border-gray-300 rounded-md px-3 py-1 mb-2 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ul className="max-h-40 overflow-y-auto">
              {filteredUsers.map((user) => (
                <li
                  key={user}
                  className="px-3 py-2 hover:bg-[#FFF7ED] hover:text-[#B85B14] cursor-pointer rounded"
                  onClick={() => {
                    setSelectedUser(user);
                    setDropdownOpen(false);
                    setSearchQuery('');
                  }}
                >
                  {user}
                </li>
              ))}
              {filteredUsers.length === 0 && (
                <li className="text-sm text-gray-500 text-center">No users found</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Right side icons section */}
      <div className="ml-2 flex items-center space-x-4 font-semibold relative">
        {/* Display logged-in user info */}
        <span className="hidden md:inline" title={userInfo ? `Logged in as: ${userInfo.email}` : 'Not logged in'}>
          {getUserTypeDisplay()}
        </span>
        
        {/* Show user name on smaller screens */}
        <span className="md:hidden text-sm truncate max-w-20" title={getDisplayName()}>
          {getDisplayName()}
        </span>
        
        {/* NOTE: Status colors (green/red) are intentionally kept for universal UX understanding */}
        <span
          className={`w-3 h-3 rounded-full animate-pulse ${
            onlineStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'
          } hidden md:inline`}
          title={onlineStatus}
        ></span>
        
        {/* NOTE: Notification color (red) is kept for universal UX understanding */}
        <button className="relative">
          <i className="fa-regular fa-bell text-xl"></i>
          <span className="absolute -top-1 -right-2 bg-red-600 text-white rounded-full px-1 text-xs">3</span>
        </button>
        
        <div className="relative">
          <img
            src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png"
            alt="Profile"
            // Profile image border updated to cream
            className="w-8 h-8 rounded-full border-2 border-[#FFF7ED] cursor-pointer"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          />
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2 z-50">
              {/* Show user info in dropdown */}
              {userInfo && (
                <>
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-gray-600">{userInfo.email}</p>
                  </div>
                </>
              )}
              
             {/*  <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => setProfileDropdownOpen(false)}
              >
                Profile Settings
              </button> */}
              
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-600 text-red-500 font-semibold"
              >
                <i className="fa-solid fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;