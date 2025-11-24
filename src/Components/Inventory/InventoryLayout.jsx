import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

// Layout
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

// Tabs
import InventoryList from './InventoryList';
import AddEquipment from './AddEquipment';
import AssignInventory from './AssignInventory';
import RequestInventory from './RequestInventory';
import RequestHistory from './RequestHistory';
import AssignedUsers from './AssignedUsers';

const TABS = {
  inventoryList: { label: 'Inventory List', component: InventoryList },
  addInventory: { label: 'Add Equipment', component: AddEquipment },
  useInventory: { label: 'Assign Inventory', component: AssignInventory },
  requestInventory: { label: 'Request Inventory', component: RequestInventory },
  requestHistory: { label: 'Request History', component: RequestHistory },
  assignedUsers: { label: 'Assigned Users', component: AssignedUsers },
};

const TAB_ORDER = ['inventoryList', 'addInventory', 'useInventory', 'requestInventory', 'requestHistory', 'assignedUsers'];

function InventoryLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inventoryList');

  // Logged-in user
  const { userInfo } = useSelector((state) => state.users);

// Role flags
const role = (userInfo?.userType || '').toLowerCase();
const isSuperAdmin = role === 'super admin';
const isAdmin = role === 'admin';
const isTechnician = role === 'technician';

// Visible tabs based on role
const visibleTabKeys = useMemo(() => {
  return TAB_ORDER.filter((key) => {
      // 🔸 Request Inventory tab: only technicians should see this
      if (key === 'requestInventory') {
        return isTechnician;
      }

          // 🔸 Assigned Users tab: only admin and super admin should see this
          if (key === 'assignedUsers') {
            return isSuperAdmin || isAdmin;
          }

      // 🔸 Admin and SuperAdmin: full access to other inventory tabs
      if (isSuperAdmin || isAdmin) return true;

      // 🔸 Technician: access to all other tabs
      if (isTechnician) return true;

    // 🔸 Normal user: hide request tabs
    if (key === 'requestInventory' || key === 'requestHistory') {
      return false;
    }

    return true;
  });
}, [isSuperAdmin, isAdmin, isTechnician]);



  // Ensure active tab is valid for current role
  useEffect(() => {
  if (!visibleTabKeys.includes(activeTab)) {
    setActiveTab('inventoryList');
  }
}, [visibleTabKeys, activeTab]);

  const ActiveComponent = (TABS[activeTab] || TABS.inventoryList).component;

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
                  {visibleTabKeys.map((tabKey) => (
                    <button
                      key={tabKey}
                      onClick={() => setActiveTab(tabKey)}
                      className={`whitespace-nowrap py-3 px-3 sm:px-4 border-b-4 font-semibold text-sm md:text-md transition-colors duration-200
                        ${
                          activeTab === tabKey
                            ? 'border-[#DC6D18] text-[#DC6D18]'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                    >
                      {TABS[tabKey].label}
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

export default InventoryLayout;
