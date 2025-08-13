import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

function AddParameterUI() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const industryType = [
    "Sugar", "Cement", "Distillery", "Petrochemical", "Pulp & Paper", "Fertilizer", "Tannery", "Pesticides",
    "Thermal Power Station", "Caustic Soda", "Pharmaceuticals", "Chemical", "Dye and Dye Stuff", "Refinery",
    "Copper Smelter", "Iron and Steel", "Zinc Smelter", "Hotel", "Aluminium", "STP", "ETP", "NWMS/SWMS", "Noise", "Other"
  ];

  return (
    <div>
      <div className="flex min-h-screen bg-[#236a80]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col rounded-tl-large-radius bg-main-content-bg">
          <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />
          <div className="p-4 sm:p-6 md:p-8 flex-1 rounded-tl-[50px] bg-[#fff]">
            <div className="w-full max-w-6xl mx-auto">
              <div className="flex justify-between items-center m-3 flex-wrap gap-2">
                <h1 className="text-center text-2xl font-semibold mt-5 flex-1">Set Parameter Exceedance Values</h1>
              </div>
              <div className="bg-white shadow-md rounded-md m-2">
                <div className="p-5">
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative flex items-center justify-center">
                        <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] tracking-wide z-10">
                          Admin User ID
                        </span>
                        <input type="text" readOnly className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md input focus:outline-none focus:ring-2 focus:ring-[#236a80]" />
                      </div>
                      <div className="relative flex items-center justify-center">
                        <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] tracking-wide z-10">
                          Date of Parameter Threshold Exceedance Value Added
                        </span>
                        <input type="date" readOnly className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md input focus:outline-none focus:ring-2 focus:ring-[#236a80]" />
                      </div>
                      <div className="relative flex items-center justify-center">
                        <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] tracking-wide z-10">
                          Admin Name
                        </span>
                        <input type="text" readOnly className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md input focus:outline-none focus:ring-2 focus:ring-[#236a80]" />
                      </div>
                      <div className="relative flex items-center justify-center">
                        <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] tracking-wide z-10">
                          User ID
                        </span>
                        <input type="text" className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md input focus:outline-none focus:ring-2 focus:ring-[#236a80]" />
                      </div>
                      <div className="relative flex items-center justify-center">
                        <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] tracking-wide z-10">
                          Product ID
                        </span>
                        <input type="text" className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md input focus:outline-none focus:ring-2 focus:ring-[#236a80]" />
                      </div>
                      <div className="relative flex items-center justify-center">
                        <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] tracking-wide z-10">
                          Industry Type
                        </span>
                        <select className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md input focus:outline-none focus:ring-2 focus:ring-[#236a80]">
                          <option value="">Select Industry</option>
                          {industryType.map((industry, index) => (
                            <option key={index} value={industry}>{industry}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mt-6 mb-2">Values</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[
                        'pH-Above', 'pH-Below', 'TDS', 'Turbidity', 'Temperature', 'BOD', 'COD', 'TSS', 'ORP',
                        'Nitrate', 'Ammonical Nitrogen', 'DO', 'Chloride', 'Flow', 'CO', 'NOX', 'Pressure', 'PM',
                        'SO2', 'NO2', 'Mercury', 'PM 10', 'PM 2.5', 'NOH', 'NH3', 'Wind Speed', 'Wind Direction',
                        'Air Temperature', 'Humidity', 'Solar Radiation', 'DB'
                      ].map((label, idx) => (
                        <div key={idx} className="relative flex items-center justify-center">
                          <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] tracking-wide z-10">
                            {label}
                          </span>
                          <input
                            type="text"
                            
                            className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#236a80] bg-gradient-to-r from-white to-[#f0f7fa] shadow-md transition-all duration-200"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-6 justify-center">
                      <button type="submit" className="btn bg-[#236a80] text-white p-3">Add Limit</button>
                      <button type="button" className="btn btn-error text-white">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddParameterUI;
