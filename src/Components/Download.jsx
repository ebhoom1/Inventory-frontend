import React, { useState } from 'react';
import Sidebar from './Sidebar/Sidebar'; // Assuming path is correct
import Header from './Header/Header';   // Assuming path is correct

const Download = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div>
      {/* Outermost background updated to the theme's primary orange */}
      <div className="flex min-h-screen bg-[#DC6D18]">
        {/* Sidebar will correctly show the new theme */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Header will correctly show the new theme */}
          <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />
          
          {/* Content panel background updated to a warm, creamy gradient */}
          <div className="p-4 sm:p-6 md:p-8 flex-1 rounded-tl-[50px] bg-gradient-to-br from-[#FFF] to-[#FFF7ED] min-h-screen">
            <div className="w-full max-w-3xl mx-auto">
              {/* Title updated to brand orange */}
              <h1 className="text-2xl font-bold text-center text-[#DC6D18] mb-6">Download average data</h1>
              
              <form className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Select User - Themed */}
                  <div className="relative flex items-center justify-center">
                    <span className="absolute -top-3 left-6 bg-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Select User</span>
                    <input type="text" placeholder="Select User" className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" />
                  </div>
                  
                  {/* Stack Names - Themed */}
                  <div className="relative flex items-center justify-center">
                    <span className="absolute -top-3 left-6 bg-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Stack Names</span>
                    <input type="text" placeholder="Stack Names" className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" />
                  </div>
                  
                  {/* Start Date - Themed */}
                  <div className="relative flex items-center justify-center">
                    <span className="absolute -top-3 left-6 bg-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Start Date</span>
                    <input type="date" className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" />
                  </div>

                  {/* End Date - Themed */}
                  <div className="relative flex items-center justify-center">
                    <span className="absolute -top-3 left-6 bg-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">End Date</span>
                    <input type="date" className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center mt-8">
                  {/* Download Button - Themed */}
                  <button type="submit" className="px-6 py-3 bg-[#DC6D18] text-[#FFF7ED] rounded-lg font-semibold shadow-md hover:bg-[#B85B14] transition-colors duration-200">
                    Download
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Download;