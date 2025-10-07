import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar'; // Adjust path as needed
import Header from '../Header/Header';   // Adjust path as needed
import CustomisableReport from './CustomisableReport';

// Mock data for the Exceedence Report table
const mockData = [
    {
      id: 1,
      fromDate: '2025-07-01',
      toDate: '2025-07-07',
      username: 'admin_kspcb',
      companyName: 'Seafood Park Lmt',
      stationName: 'STP-01',
      industryType: 'Seafood Processing',
      engineerName: 'Rohan Varma',
      status: 'Verified',
    },
    {
      id: 2,
      fromDate: '2025-06-15',
      toDate: '2025-06-22',
      username: 'operator_spl',
      companyName: 'Pharma Solutions',
      stationName: 'ETP-Main',
      industryType: 'Pharmaceutical',
      engineerName: 'Anjali Menon',
      status: 'Declined',
    },
    {
      id: 3,
      fromDate: '2025-06-01',
      toDate: '2025-06-07',
      username: 'admin_kspcb',
      companyName: 'Seafood Park Lmt',
      stationName: 'STP-01',
      industryType: 'Seafood Processing',
      engineerName: 'Rohan Varma',
      status: 'Verified',
    },
  ];

function ViewReport() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Exceedence');
  const tabs = ['Exceedence Report', 'Customisable Report'];

  return (
    <div className="flex min-h-screen bg-[#236a80]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col bg-main-content-bg rounded-tl-[50px] min-w-0">
        <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />
        
        <main className="p-4 sm:p-6 lg:p-8 flex-1 rounded-tl-[50px] bg-gradient-to-br from-white to-[#f0f7fa]">
          <h1 className="text-2xl font-bold text-center text-[#236a80] mb-6">REPORTS</h1>
          
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(index === 0 ? 'Exceedence' : 'Customisable')}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors duration-200 focus:outline-none ${
                    activeTab === (index === 0 ? 'Exceedence' : 'Customisable')
                      ? 'border-[#236a80] text-[#1d596a]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div>
            {activeTab === 'Exceedence' && (
              <div className="w-full overflow-x-auto bg-white rounded-xl shadow-lg">
                <table className="w-full text-sm text-left text-gray-600">
                  {/* --- HEADER STYLES UPDATED HERE --- */}
                  <thead className="text-xs text-white uppercase bg-[#236a80]">
                    <tr>
                      <th className="px-6 py-3">Sl No</th>
                      <th className="px-6 py-3">From Date</th>
                      <th className="px-6 py-3">To Date</th>
                      <th className="px-6 py-3">Username</th>
                      <th className="px-6 py-3">Company Name</th>
                      <th className="px-6 py-3">Station Name</th>
                      <th className="px-6 py-3">Industry Type</th>
                      <th className="px-6 py-3">Engineer Name</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.map((row, index) => (
                      <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{index + 1}</td>
                        <td className="px-6 py-4">{row.fromDate}</td>
                        <td className="px-6 py-4">{row.toDate}</td>
                        <td className="px-6 py-4">{row.username}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{row.companyName}</td>
                        <td className="px-6 py-4">{row.stationName}</td>
                        <td className="px-6 py-4">{row.industryType}</td>
                        <td className="px-6 py-4">{row.engineerName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            row.status === 'Verified' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center justify-center gap-2">
                          <button className="text-blue-600 hover:text-blue-800">View</button>
                          <span className="text-gray-300">|</span>
                          <button className="text-blue-600 hover:text-blue-800">Download</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'Customisable' && (
              <CustomisableReport />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ViewReport;