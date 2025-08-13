import React, { useState } from 'react';

function RequestInventory() {
  // State updated to include the 'date' field.
  const [formData, setFormData] = useState({
    skuName: '',
    requiredQuantity: '',
    userName: '',
    date: '', // Added date field
    reason: '', 
  });

  // No changes needed for the handler.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Submission handler updated to log and reset the date.
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Inventory Request Submitted:', formData);
    alert(`Request for ${formData.requiredQuantity} of ${formData.skuName} submitted!`);
    // Reset the form, including the new date field.
    setFormData({
      skuName: '',
      requiredQuantity: '',
      userName: '',
      date: '',
      reason: '',
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-[#DC6D18] mb-10">
        Request Inventory
      </h2>
      
      <form className="space-y-10" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
          
          {/* SKU Name Input */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">SKU Name</span>
            <input
              type="text"
              name="skuName"
              value={formData.skuName}
              onChange={handleChange}
              placeholder="e.g., SAFETY-GOGGLES-05"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* Required Quantity Input */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Required Quantity</span>
            <input
              type="number"
              name="requiredQuantity"
              value={formData.requiredQuantity}
              onChange={handleChange}
              placeholder="e.g., 25"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
              min="1"
            />
          </div>

          {/* User Name Input */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">User Name</span>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="e.g., Priya Kumar"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>
          
          {/* --- ADDED: Date Input --- */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Date Required</span>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* Optional Reason Textarea */}
          <div className="relative flex items-center md:col-span-2">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Optional Reason</span>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="e.g., For new site deployment next month."
              rows="3"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            ></textarea>
          </div>
        </div>

        {/* Action Button Area */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="px-8 py-3 bg-[#DC6D18] text-[#FFF7ED] rounded-lg font-semibold shadow-md hover:bg-[#B85B14] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC6D18] transition-all duration-200 ease-in-out"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}

export default RequestInventory;