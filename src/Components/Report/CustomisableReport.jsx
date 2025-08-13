import React, { useState } from 'react';

function CustomisableReport() {
  const [formData, setFormData] = useState({
    username: '',
    stackName: '',
    fromDate: '',
    toDate: '',
    industryType: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to generate and display the report based on formData
    console.log("Generating Report with data:", formData);
    alert("Report generation logic would be triggered here.");
  };

  const handleDownload = () => {
    // Logic to download the generated report
    console.log("Downloading Report with data:", formData);
    alert("Report download logic would be triggered here.");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
      
      {/* Header with Download Button */}
      <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-700">Customisable Report Generator</h2>
        <button 
          onClick={handleDownload}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download Report
        </button>
      </div>

      {/* Form for Report Generation */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
          
          {/* Select Username */}
          <div className="relative">
            <label htmlFor="username" className="absolute -top-3 left-4 bg-white px-1 text-sm font-semibold text-[#236a80]">Select Username</label>
            <select id="username" name="username" value={formData.username} onChange={handleInputChange} className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 bg-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-[#236a80]">
              <option value="" disabled>Select a user</option>
              <option value="admin_kspcb">admin_kspcb</option>
              <option value="operator_spl">operator_spl</option>
              <option value="viewer_gov">viewer_gov</option>
            </select>
          </div>

          {/* Select StackName */}
          <div className="relative">
            <label htmlFor="stackName" className="absolute -top-3 left-4 bg-white px-1 text-sm font-semibold text-[#236a80]">Select Stack Name</label>
            <select id="stackName" name="stackName" value={formData.stackName} onChange={handleInputChange} className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 bg-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-[#236a80]">
              <option value="" disabled>Select a stack</option>
              <option value="STP-01">STP-01</option>
              <option value="ETP-Main">ETP-Main</option>
              <option value="Boiler-A">Boiler-A</option>
            </select>
          </div>

          {/* From Date */}
          <div className="relative">
            <label htmlFor="fromDate" className="absolute -top-3 left-4 bg-white px-1 text-sm font-semibold text-[#236a80]">From Date</label>
            <input type="date" id="fromDate" name="fromDate" value={formData.fromDate} onChange={handleInputChange} className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 bg-transparent shadow-sm"/>
          </div>

          {/* To Date */}
          <div className="relative">
            <label htmlFor="toDate" className="absolute -top-3 left-4 bg-white px-1 text-sm font-semibold text-[#236a80]">To Date</label>
            <input type="date" id="toDate" name="toDate" value={formData.toDate} onChange={handleInputChange} className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 bg-transparent shadow-sm"/>
          </div>
          
          {/* Select Industry Type */}
          <div className="relative md:col-span-2">
            <label htmlFor="industryType" className="absolute -top-3 left-4 bg-white px-1 text-sm font-semibold text-[#236a80]">Select Industry Type</label>
            <select id="industryType" name="industryType" value={formData.industryType} onChange={handleInputChange} className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 bg-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-[#236a80]">
              <option value="" disabled>Select an industry</option>
              <option value="Seafood Processing">Seafood Processing</option>
              <option value="Pharmaceutical">Pharmaceutical</option>
              <option value="Chemical Manufacturing">Chemical Manufacturing</option>
              <option value="Power Plant">Power Plant</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button 
            type="submit"
            className="px-10 py-3 text-lg font-semibold text-white bg-green-600 rounded-xl shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
          >
            Generate Report
          </button>
        </div>
      </form>
    </div>
  );
}

export default CustomisableReport;