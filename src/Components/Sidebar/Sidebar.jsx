// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import kspcb from '../../assets/safetik.png';
// import { useSelector } from 'react-redux';

// function Sidebar({ isOpen, onClose }) {
//   const navigate = useNavigate();
//   const [openSection, setOpenSection] = useState(null);
//     const { userInfo } = useSelector((state) => state.users);

//   const handleSectionToggle = (section) => {
//     setOpenSection(openSection === section ? null : section);
//   };

//   // Class strings now use the specific hex codes you requested
//   const navItemClasses = "flex items-center p-3 rounded-md cursor-pointer transition-colors duration-200 hover:bg-[#FFF7ED] hover:text-[#DC6D18]";
//   const subNavItemClasses = "p-2 rounded-md cursor-pointer hover:bg-[#FFF7ED] hover:text-[#DC6D18]";

//   return (
//     <>
//       {/* Overlay for mobile with blur */}
//       <div
//         className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'block backdrop-blur-sm' : 'hidden'}`}
//         onClick={onClose}
//       ></div>

//       {/* Sidebar drawer using your specific orange #DC6D18 */}
//       <div
//         className={`
//           fixed top-0 left-0 h-full w-60 md:w-50 bg-[#DC6D18] text-[#FFF7ED] p-3 shadow-2xl flex flex-col rounded-br-large-radius rounded-tr-large-radius z-50
//           transform transition-transform duration-300
//           ${isOpen ? 'translate-x-0 ring-4 ring-[#F59E0B] ring-opacity-70' : '-translate-x-full'}
//           md:static md:translate-x-0 md:flex md:h-auto md:z-auto md:ring-0
//         `}
//       >
//         {/* Close button for mobile */}
//         <button
//           className="md:hidden self-end mb-4 text-2xl focus:outline-none"
//           onClick={onClose}
//           aria-label="Close sidebar"
//         >
//           &times;
//         </button>

//         {/* Logo Section */}
//         <div className="mb-8 text-center">
//           <div className="w-20 h-20 bg-[#FFF7ED] rounded-full mx-auto flex items-center justify-center shadow-md">
//             <img
//               src={kspcb}
//               alt="Safetick Logo"
//               className="w-14 h-15 object-contain"
//             />
//           </div>
//         </div>

  
//      {/* Navigation Links */}
// <ul className="space-y-2">
//   {userInfo?.userType === 'Admin' || 'Super Admin' && (
//     <li className={navItemClasses} onClick={() => navigate('/manageuser')}>
//       <span className="mr-4 text-xl"></span>
//       <span>Manage Users</span>
//     </li>
//   )}

//   <li className={navItemClasses} onClick={() => navigate('/inventory')}>
//     <span className="mr-4 text-xl"></span>
//     <span>Inventory</span>
//   </li>
  
//   <li className={navItemClasses} onClick={() => navigate('/services')}>
//     <span className="mr-4 text-xl"></span>
//     <span>Services</span>
//   </li>

//   <li className={navItemClasses} onClick={() => navigate('/equipment')}>
//     <span className="mr-4 text-xl"></span>
//     <span>Equipments</span>
//   </li>

//   <li className={navItemClasses} onClick={() => navigate('/attendence')}>
//     <span className="mr-4 text-xl"></span>
//     <span>Attendence</span>
//   </li>

//   <li className={navItemClasses} onClick={() => navigate('/account')}>
//     <span className="mr-4 text-xl"></span>
//     <span>Account</span>
//   </li>
// </ul>

//       </div>
//     </>
//   );
// }

// export default Sidebar;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import kspcb from "../../assets/safetik.png";
import { useSelector } from "react-redux";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState(null);
  const { userInfo } = useSelector((state) => state.users);

  const handleSectionToggle = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const navItemClasses =
    "flex items-center p-3 rounded-md cursor-pointer transition-colors duration-200 hover:bg-[#FFF7ED] hover:text-[#DC6D18]";

  // Normalize role
  const role = (userInfo?.userType || "").toLowerCase();
  const isAdmin = role === "admin";
  const isSuperAdmin = role === "super admin";
  const isUser = role === "user";

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "block backdrop-blur-sm" : "hidden"
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-60 md:w-50 bg-[#DC6D18] text-[#FFF7ED] p-3 shadow-2xl flex flex-col rounded-br-large-radius rounded-tr-large-radius z-50
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0 ring-4 ring-[#F59E0B] ring-opacity-70" : "-translate-x-full"}
          md:static md:translate-x-0 md:flex md:h-auto md:z-auto md:ring-0
        `}
      >
        <button
          className="md:hidden self-end mb-4 text-2xl focus:outline-none"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          &times;
        </button>

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-[#FFF7ED] rounded-full mx-auto flex items-center justify-center shadow-md">
            <img src={kspcb} alt="Safetick Logo" className="w-14 h-15 object-contain" />
          </div>
        </div>

        {/* Navigation */}
        <ul className="space-y-2">
          {/* Admin & Super Admin get Manage Users */}
          {(isAdmin || isSuperAdmin) && (
            <li className={navItemClasses} onClick={() => navigate("/manageuser")}>
              <span className="mr-4 text-xl"></span>
              <span>Manage Users</span>
            </li>
          )}

          {/* Show rest only if not just a User */}
          {!isUser && (
            <>
              <li className={navItemClasses} onClick={() => navigate("/inventory")}>
                <span className="mr-4 text-xl"></span>
                <span>Inventory</span>
              </li>
              <li className={navItemClasses} onClick={() => navigate("/services")}>
                <span className="mr-4 text-xl"></span>
                <span>Services</span>
              </li>
              {/* <li className={navItemClasses} onClick={() => navigate("/attendence")}>
                <span className="mr-4 text-xl"></span>
                <span>Attendence</span>
              </li> */}
            </>
          )}

          {/* Common to all (User, Admin, Super Admin) */}
          <li className={navItemClasses} onClick={() => navigate("/equipment")}>
            <span className="mr-4 text-xl"></span>
            <span>Equipments</span>
          </li>
          <li className={navItemClasses} onClick={() => navigate("/account")}>
            <span className="mr-4 text-xl"></span>
            <span>Account</span>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
