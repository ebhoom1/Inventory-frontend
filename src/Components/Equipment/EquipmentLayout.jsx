// import React, { useState } from 'react';
// import EquipmentList from './EquipmentList';
// import AddEquipment from './AddEquipment';
// import Sidebar from '../Sidebar/Sidebar';
// import Header from '../Header/Header';

// // Import shared layout components


// // Configuration object for the equipment tabs
// const TABS = {
//   equipmentList: { label: 'Equipment List', component: EquipmentList },
//   addEquipment: { label: 'Add Equipment', component: AddEquipment },
// };

// function EquipmentLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
  
//   // Set the default active tab to 'equipmentList'
//   const [activeTab, setActiveTab] = useState('equipmentList');

//   // Dynamically select the component to render based on the active tab
//   const ActiveComponent = TABS[activeTab].component;

//   return (
//     <div className="flex min-h-screen bg-[#DC6D18]">
//       {/* Reusable Sidebar component */}
//       <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
//       <div className="flex-1 flex flex-col min-w-0">
//         {/* Reusable Header component */}
//         <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />
        
//         {/* Main content panel with the theme's styling */}
//         <main className="p-4 sm:p-6 md:p-8 flex-1 rounded-tl-[50px] bg-gradient-to-br from-[#FFF] to-[#FFF7ED]">
//           <div className="w-full max-w-7xl mx-auto">

//             {/* Responsive Tab Navigation */}
//             <div className="border-b-2 border-[#FFEFE1] mb-6">
//               <div className="overflow-x-auto">
//                 <nav className="flex space-x-2 sm:space-x-4 -mb-0.5" aria-label="Tabs">
//                   {Object.keys(TABS).map((tabKey) => (
//                     <button
//                       key={tabKey}
//                       onClick={() => setActiveTab(tabKey)}
//                       className={`whitespace-nowrap py-3 px-3 sm:px-4 border-b-4 font-semibold text-sm md:text-md transition-colors duration-200
//                         ${
//                           activeTab === tabKey
//                             ? 'border-[#DC6D18] text-[#DC6D18]' // Active tab style
//                             : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700' // Inactive tab style
//                         }
//                       `}
//                     >
//                       {TABS[tabKey].label}
//                     </button>
//                   ))}
//                 </nav>
//               </div>
//             </div>

//             {/* Tab Content Area */}
//             <div className="mt-4">
//               {/* The selected component is rendered here */}
//               <ActiveComponent />
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// export default EquipmentLayout;

import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import EquipmentList from "./EquipmentList";
import AddEquipment from "./AddEquipment";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";

// Base config for all possible tabs
const TABS = {
  equipmentList: { label: "Equipment List", component: EquipmentList },
  addEquipment: { label: "Add Equipment", component: AddEquipment },
};

function EquipmentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("equipmentList");

  // Read role from Redux (adjust selector if your slice differs)
  const { userInfo } = useSelector((state) => state.users || {});
  const roleRaw = (userInfo?.userType || "").toString();
  const role = roleRaw.toLowerCase();

  const isAdmin = role === "admin";
  const isSuperAdmin = role === "super admin";
  const isUser = role === "user";

  // Tabs available based on role: hide Add tab for 'user'
  const AVAILABLE_TABS = useMemo(() => {
    const base = { equipmentList: TABS.equipmentList };
    if (isAdmin || isSuperAdmin) base.addEquipment = TABS.addEquipment;
    return base;
  }, [isAdmin, isSuperAdmin]);

  // If current active tab isn't allowed anymore, reset to equipmentList
  useEffect(() => {
    if (!Object.prototype.hasOwnProperty.call(AVAILABLE_TABS, activeTab)) {
      setActiveTab("equipmentList");
    }
  }, [AVAILABLE_TABS, activeTab]);

  const ActiveComponent = AVAILABLE_TABS[activeTab].component;

  return (
    <div className="flex min-h-screen bg-[#DC6D18]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />

        <main className="p-4 sm:p-6 md:p-8 flex-1 rounded-tl-[50px] bg-gradient-to-br from-[#FFF] to-[#FFF7ED]">
          <div className="w-full max-w-7xl mx-auto">
            {/* Tabs */}
            <div className="border-b-2 border-[#FFEFE1] mb-6">
              <div className="overflow-x-auto">
                <nav className="flex space-x-2 sm:space-x-4 -mb-0.5" aria-label="Tabs">
                  {Object.keys(AVAILABLE_TABS).map((tabKey) => (
                    <button
                      key={tabKey}
                      onClick={() => setActiveTab(tabKey)}
                      className={`whitespace-nowrap py-3 px-3 sm:px-4 border-b-4 font-semibold text-sm md:text-md transition-colors duration-200 ${
                        activeTab === tabKey
                          ? "border-[#DC6D18] text-[#DC6D18]"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      {AVAILABLE_TABS[tabKey].label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="mt-4">
              <ActiveComponent />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EquipmentLayout;
