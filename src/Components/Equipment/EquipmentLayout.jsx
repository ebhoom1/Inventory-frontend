import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import EquipmentList from "./EquipmentList";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";

// Base config for all possible tabs
const TABS = {
  equipmentList: { label: "Equipment List", component: EquipmentList },
};

function EquipmentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("equipmentList");

  // Read role from Redux (adjust selector if your slice differs)
  const { userInfo } = useSelector((state) => state.users || {});

  // If current active tab isn't allowed anymore, reset to equipmentList
  useEffect(() => {
    if (!Object.prototype.hasOwnProperty.call(TABS, activeTab)) {
      setActiveTab("equipmentList");
    }
  }, [activeTab]);

  const ActiveComponent = TABS[activeTab].component;

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
                  {Object.keys(TABS).map((tabKey) => (
                    <button
                      key={tabKey}
                      onClick={() => setActiveTab(tabKey)}
                      className={`whitespace-nowrap py-3 px-3 sm:px-4 border-b-4 font-semibold text-sm md:text-md transition-colors duration-200 ${
                        activeTab === tabKey
                          ? "border-[#DC6D18] text-[#DC6D18]"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
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

export default EquipmentLayout;
