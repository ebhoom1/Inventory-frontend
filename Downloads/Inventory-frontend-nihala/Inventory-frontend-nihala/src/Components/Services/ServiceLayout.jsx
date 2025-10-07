import React, { useState, useMemo } from 'react';
import RequestService from './RequestService';
import ServiceHistory from './ServiceHistory';
import ServiceDue from './ServiceDue';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import { useSelector } from 'react-redux';

// All possible tabs
const ALL_TABS = {
  requestService: { label: 'Service Report', component: RequestService },
  // serviceHistory: { label: 'Service History', component: ServiceHistory },
  serviceDue: { label: 'Service Due', component: ServiceDue },
};

function ServiceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userInfo } = useSelector((state) => state.users);

  // Normalize role
  const role = (userInfo?.userType || '').toString().trim().toLowerCase();

  // Tab filtering logic
  const availableTabs = useMemo(() => {
    if (role === 'user') {
      // Only Request Service for user
      return { requestService: ALL_TABS.requestService };
    }
    // Admin & Super Admin → see all tabs
    return ALL_TABS;
  }, [role]);

  // Default tab setup
  const defaultTab = Object.keys(availableTabs)[0];
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Reset if role changes
  React.useEffect(() => {
    if (!availableTabs[activeTab]) {
      setActiveTab(defaultTab);
    }
  }, [availableTabs, activeTab, defaultTab]);

  // Which component to render
  const ActiveComponent = availableTabs[activeTab]?.component;

  if (!ActiveComponent) {
    return (
      <div className="flex min-h-screen bg-[#DC6D18]">
        <div className="flex-1 flex items-center justify-center">
          <p>No available services for your user type.</p>
        </div>
      </div>
    );
  }

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
                  {Object.keys(availableTabs).map((tabKey) => (
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
                      {availableTabs[tabKey].label}
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

export default ServiceLayout;

