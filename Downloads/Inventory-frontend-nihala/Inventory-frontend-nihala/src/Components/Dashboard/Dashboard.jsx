import React, { useState } from 'react';
import Water from '../WaterDashboard/Water';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

// Placeholder components for Air and Noise dashboards
const AirDashboard = () => <div className="p-10 text-center"><h2 className="text-2xl font-bold text-gray-500">Air Quality Dashboard Content</h2></div>;
const NoiseDashboard = () => <div className="p-10 text-center"><h2 className="text-2xl font-bold text-gray-500">Noise Level Dashboard Content</h2></div>;


function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Water');
  const tabs = ['Water', 'Air', 'Noise'];

  return (
    <div className="flex min-h-screen bg-[#236a80]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col bg-main-content-bg rounded-tl-[50px] min-w-0">
        <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />
        
        <div className="p-4 sm:p-6 lg:p-8 flex-1 rounded-tl-[50px] bg-gradient-to-br from-white to-[#f0f7fa]">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors duration-200 focus:outline-none ${
                    activeTab === tab
                      ? 'border-[#236a80] text-[#1d596a]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content Area */}
          <div className="mt-4">
            {activeTab === 'Water' && <Water />}
            {activeTab === 'Air' && <AirDashboard />}
            {activeTab === 'Noise' && <NoiseDashboard />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;