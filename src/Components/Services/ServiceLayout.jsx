import React, { useState, useMemo } from 'react';
import RequestService from './RequestService';
import ServiceHistory from './ServiceHistory';
import ServiceDue from './ServiceDue';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import { useSelector } from 'react-redux';

// Configuration object for the service tabs
const ALL_TABS = {
  requestService: { label: 'Request Service', component: RequestService },
  serviceHistory: { label: 'Service History', component: ServiceHistory },
  serviceDue: { label: 'Service Due', component: ServiceDue },
};

function ServiceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userInfo } = useSelector((state) => state.users);

  // Filter tabs based on user type - Admin users don't see Request Service
  const availableTabs = useMemo(() => {
    if (userInfo?.userType === 'Admin') {
      // Remove requestService tab for Admin users
      const { requestService, ...adminTabs } = ALL_TABS;
      return adminTabs;
    }
    return ALL_TABS;
  }, [userInfo?.userType]);

  // Get the first available tab as default
  const defaultTab = Object.keys(availableTabs)[0];
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Ensure active tab exists in available tabs (important when user type changes)
  React.useEffect(() => {
    if (!availableTabs[activeTab]) {
      setActiveTab(defaultTab);
    }
  }, [availableTabs, activeTab, defaultTab]);

  // Dynamically select the component to render based on the active tab
  const ActiveComponent = availableTabs[activeTab]?.component;

  // Handle case where no component is available
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
      {/* Reusable Sidebar component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Reusable Header component */}
        <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />
        
        {/* Main content panel with the theme's styling */}
        <main className="p-4 sm:p-6 md:p-8 flex-1 rounded-tl-[50px] bg-gradient-to-br from-[#FFF] to-[#FFF7ED]">
          <div className="w-full max-w-7xl mx-auto">
            
            {/* Responsive Tab Navigation */}
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
                            ? 'border-[#DC6D18] text-[#DC6D18]' // Active tab style
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700' // Inactive tab style
                        }
                      `}
                    >
                      {availableTabs[tabKey].label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
            
            {/* Tab Content Area */}
            <div className="mt-4">
              {/* The selected component is rendered here */}
              <ActiveComponent />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ServiceLayout;