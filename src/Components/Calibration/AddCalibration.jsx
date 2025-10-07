import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

const Calibration = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div>
      <div className="flex min-h-screen bg-[#236a80]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col rounded-tl-large-radius bg-main-content-bg">
          <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />
          <div className="p-4 sm:p-6 md:p-8 flex-1 rounded-tl-[50px] bg-gradient-to-br from-white to-[#f0f7fa] min-h-screen">
            <div className="w-full max-w-4xl mx-auto">
              <form className="space-y-10">
                {/* Calibration Added By */}
                <div>
                  <h1 className="text-2xl font-bold text-center text-[#236a80] mb-6">Calibration Added By</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User ID */}
                    <div className="relative flex items-center justify-center">
                      <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] z-10">User ID</span>
                      <input type="text" placeholder="User ID" className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md focus:outline-none focus:ring-2 focus:ring-[#236a80]" />
                    </div>
                    {/* Date of Calibration Added */}
                    <div className="relative flex items-center justify-center">
                      <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] z-10">Date of Calibration Added</span>
                      <input type="date" className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md focus:outline-none focus:ring-2 focus:ring-[#236a80]" />
                    </div>
                    {/* Time of Calibration Added */}
                    <div className="relative flex items-center justify-center">
                      <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] z-10">Time of Calibration Added</span>
                      <input type="text" placeholder="Time" className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md focus:outline-none focus:ring-2 focus:ring-[#236a80]" />
                    </div>
                    {/* User Name */}
                    <div className="relative flex items-center justify-center">
                      <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] z-10">User Name</span>
                      <input type="text" placeholder="User Name" className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md focus:outline-none focus:ring-2 focus:ring-[#236a80]" />
                    </div>
                  </div>
                </div>
                {/* Add Calibration Details */}
                <div>
                  <h1 className="text-2xl font-bold text-center text-[#236a80] mb-6">Add Calibration Details</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User ID */}
                    <div className="relative flex items-center justify-center">
                      <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] z-10">User ID</span>
                      <input type="text" placeholder="User ID" className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md focus:outline-none focus:ring-2 focus:ring-[#236a80]" />
                    </div>
                    {/* Model Name */}
                    <div className="relative flex items-center justify-center">
                      <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] z-10">Model Name</span>
                      <input type="text" placeholder="Model Name" className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md focus:outline-none focus:ring-2 focus:ring-[#236a80]" />
                    </div>
                    {/* Date of Calibration */}
                    <div className="relative flex items-center justify-center">
                      <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] z-10">Date of Calibration</span>
                      <input type="date" className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md focus:outline-none focus:ring-2 focus:ring-[#236a80]" />
                    </div>
                  </div>
                </div>
                {/* Results */}
                <div>
                  <h1 className="text-2xl font-bold text-center text-[#236a80] mb-6">Results</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Before */}
                    <div className="relative flex items-center justify-center">
                      <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] z-10">Before</span>
                      <textarea placeholder="Before" className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md focus:outline-none focus:ring-2 focus:ring-[#236a80]" />
                    </div>
                    {/* After */}
                    <div className="relative flex items-center justify-center">
                      <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] z-10">After</span>
                      <textarea placeholder="After" className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md focus:outline-none focus:ring-2 focus:ring-[#236a80]" />
                    </div>
                    {/* Technician */}
                    <div className="relative flex items-center justify-center">
                      <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] z-10">Technician</span>
                      <input type="text" placeholder="Technician Name" className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md focus:outline-none focus:ring-2 focus:ring-[#236a80]" />
                    </div>
                    {/* Notes */}
                    <div className="relative flex items-center justify-center">
                      <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] z-10">Notes</span>
                      <textarea placeholder="Notes" className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md focus:outline-none focus:ring-2 focus:ring-[#236a80]" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 justify-center mt-8">
                  <button type="submit" className="btn bg-[#236a80] text-white p-3">Add Calibration</button>
                  <button type="button" className="btn btn-error text-white p-3">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calibration;
