import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

// Layout
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

// Tabs
import InventoryList from './InventoryList';
import AddInventory from './AddInventory';
import UseInventory from './UseInventory';
import RequestInventory from './RequestInventory';
import RequestHistory from './RequestHistory';

const TABS = {
  inventoryList: { label: 'Inventory List', component: InventoryList },
  addInventory: { label: 'Add Inventory', component: AddInventory },
  useInventory: { label: 'Use Inventory', component: UseInventory },
  requestInventory: { label: 'Request Inventory', component: RequestInventory },
  requestHistory: { label: 'Request History', component: RequestHistory },
};

const TAB_ORDER = ['inventoryList', 'addInventory', 'useInventory', 'requestInventory', 'requestHistory'];

function InventoryLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inventoryList');

  // Logged-in user
  const { userInfo } = useSelector((state) => state.users);

// Role flags
const role = (userInfo?.userType || '').toLowerCase();
const isAdmin = role === 'admin' || role === 'super admin';
const isTechnician = role === 'technician';

// Visible tabs based on role
const visibleTabKeys = useMemo(() => {
  return TAB_ORDER.filter((key) => {
    if (key === 'requestInventory' || key === 'requestHistory') {
      return isAdmin || isTechnician;
    }
    return true; // always show others
  });
}, [isAdmin, isTechnician]);


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
