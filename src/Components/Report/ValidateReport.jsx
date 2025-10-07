import React, { useState } from 'react';

// Import your actual Sidebar and Header components
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import { useNavigate } from 'react-router-dom';

const ValidateReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State for form inputs
  const [formData, setFormData] = useState({
    industry: '',
    company: '',
    fromDate: '',
    toDate: '',
    user: '',
    stationName: ''
  });
const navigate = useNavigate()
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle the "Approve" logic, e.g., API call to submit the report
    console.log("Approving Report:", formData);
    // Add your API submission logic here
  };

  const handleValidate = () => {
    // Handle the "Validate" logic, e.g., API call to fetch and display data for validation
   navigate('/checkandvalidate')
    // Add your validation logic here
  };

  return (
    <div className="flex min-h-screen bg-[#236a80]">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-main-content-bg rounded-tl-[50px] min-w-0">
        <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />

        <div className="flex-1 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white to-[#f0f7fa] rounded-tl-[50px] min-w-0">
          <div className="w-full max-w-5xl mx-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-center text-[#236a80] mb-6 sm:mb-10">
              VALIDATE & APPROVE REPORTS
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                
                {/* Select Industry */}
            

                {/* Select Company */}
                <div className="relative">
                  <label htmlFor="company" className="absolute -top-3 left-4 bg-gradient-to-br from-white to-[#f0f7fa] px-1 text-sm font-semibold text-[#236a80]">
                    Select Company
                  </label>
                  <select
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-gray-700 bg-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-[#236a80] appearance-none"
                  >
                    <option value="" disabled>Select a Company</option>
                    <option value="company_a">Company A</option>
                    <option value="company_b">Company B</option>
                  </select>
                </div>
                    <div className="relative">
                  <label htmlFor="industry" className="absolute -top-3 left-4 bg-gradient-to-br from-white to-[#f0f7fa] px-1 text-sm font-semibold text-[#236a80]">
                    Select Industry
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-gray-700 bg-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-[#236a80] appearance-none"
                  >
                    <option value="" disabled>Select an Industry</option>
                    <option value="pharma">Pharmaceutical</option>
                    <option value="seafood">Seafood Processing</option>
                    <option value="chemical">Chemical Manufacturing</option>
                  </select>
                </div>

                {/* From Date */}
                <div className="relative">
                  <label htmlFor="fromDate" className="absolute -top-3 left-4 bg-gradient-to-br from-white to-[#f0f7fa] px-1 text-sm font-semibold text-[#236a80]">
                    From Date
                  </label>
                  <input
                    type="date"
                    id="fromDate"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleInputChange}
                    className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-gray-700 bg-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-[#236a80]"
                  />
                </div>
                
                {/* To Date */}
                <div className="relative">
                  <label htmlFor="toDate" className="absolute -top-3 left-4 bg-gradient-to-br from-white to-[#f0f7fa] px-1 text-sm font-semibold text-[#236a80]">
                    To Date
                  </label>
                  <input
                    type="date"
                    id="toDate"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleInputChange}
                    className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-gray-700 bg-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-[#236a80]"
                  />
                </div>

                {/* Select User */}
              

                {/* Station Name */}
                <div className="relative">
                  <label htmlFor="stationName" className="absolute -top-3 left-4 bg-gradient-to-br from-white to-[#f0f7fa] px-1 text-sm font-semibold text-[#236a80]">
                    Station Name
                  </label>
                  <input
                    type="text"
                    id="stationName"
                    name="stationName"
                    placeholder="Enter Station Name"
                    value={formData.stationName}
                    onChange={handleInputChange}
                    className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 bg-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-[#236a80]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 sm:gap-6 justify-center pt-6">
                <button
                  type="button"
                  onClick={handleValidate}
                  className="px-6 sm:px-8 py-3 text-base font-semibold text-white bg-[#236a80] rounded-xl shadow-lg hover:bg-[#1a5a70] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#236a80] transition-all duration-300"
                >
                  Validate and Approve 
                </button>
             {/*    <button
                  type="submit"
                  className="px-6 sm:px-8 py-3 text-base font-semibold text-white bg-green-600 rounded-xl shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
                >
                  Approve
                </button> */}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidateReport;