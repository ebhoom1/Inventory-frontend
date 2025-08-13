import React, { useState } from 'react';

// Import layout components
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

// Import tab content components
import InventoryList from './InventoryList';
import AddInventory from './AddInventory';
import UseInventory from './UseInventory';
import RequestInventory from './RequestInventory';
import RequestHistory from './RequestHistory';

// Configuration object for our tabs makes the code cleaner and easier to manage
const TABS = {
  inventoryList: { label: 'Inventory List', component: InventoryList },
  addInventory: { label: 'Add Inventory', component: AddInventory },
  useInventory: { label: 'Use Inventory', component: UseInventory },
  requestInventory: { label: 'Request Inventory', component: RequestInventory },
  requestHistory: { label: 'Request History', component: RequestHistory },
};

function InventoryLayout() {
  // State for controlling the sidebar visibility (copied from your Download component)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State for managing the active tab, defaulting to the inventory list
  const [activeTab, setActiveTab] = useState('inventoryList');

  // Dynamically select the component to render based on the active tab
  const ActiveComponent = TABS[activeTab].component;

  return (
    <div className="flex min-h-screen bg-[#DC6D18]">
      {/* Sidebar with the exact same props and functionality */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0"> {/* Added min-w-0 to prevent content overflow */}
        {/* Header with the exact same props and functionality */}
        <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />
        
        {/* Main content panel with responsive padding */}
        <main className="p-4 sm:p-6 md:p-8 flex-1 rounded-tl-[50px] bg-gradient-to-br from-[#FFF] to-[#FFF7ED]">
          <div className="w-full max-w-7xl mx-auto">

            {/* Tab Navigation */}
            <div className="border-b-2 border-[#FFEFE1] mb-6">
              {/* --- RESPONSIVE WRAPPER: Makes the nav scrollable on small screens --- */}
              <div className="overflow-x-auto">
                <nav className="flex space-x-2 sm:space-x-4 -mb-0.5" aria-label="Tabs">
                  {Object.keys(TABS).map((tabKey) => (
                    <button
                      key={tabKey}
                      onClick={() => setActiveTab(tabKey)}
                      // --- RESPONSIVE UPDATE: Adjusted padding & text size for mobile ---
                      className={`whitespace-nowrap py-3 px-3 sm:px-4 border-b-4 font-semibold text-sm md:text-md transition-colors duration-200
                        ${
                          activeTab === tabKey
                            ? 'border-[#DC6D18] text-[#DC6D18]' // Active tab style
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700' // Inactive tab style
                        }
                      `}
                    >
                      {TABS[tabKey].label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content Area */}
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