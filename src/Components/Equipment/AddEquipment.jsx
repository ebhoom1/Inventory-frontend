import React, { useState } from 'react';

function AddEquipment() {
  // State expanded to include all new fields
  const [formData, setFormData] = useState({
    equipmentName: '',
    username: '',
    modelSeries: '',
    capacity: '',
    rateLoaded: '',
    installationDate: '',
    grossWeight: '',
    content: '',
    fireRating: '',
    batchNo: '',
    serialNumber: '',
    mfgMonth: '',
    refDue: '',
    notes: '', // Optional field
  });

  // This handler works for all fields without any changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handles form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New Equipment Data Submitted:', formData);
    alert(`Equipment '${formData.equipmentName}' has been added successfully!`);
    
    // Reset the form, including all new fields
    setFormData({
      equipmentName: '',
      username: '',
      modelSeries: '',
      capacity: '',
      rateLoaded: '',
      installationDate: '',
      grossWeight: '',
      content: '',
      fireRating: '',
      batchNo: '',
      serialNumber: '',
      mfgMonth: '',
      refDue: '',
      notes: '',
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-[#DC6D18] mb-8 md:mb-10">
        Add New Equipment
      </h2>

      <form className="space-y-10" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 md:gap-y-10">
          
          {/* --- Existing Fields --- */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Equipment Name</span>
            <input type="text" name="equipmentName" value={formData.equipmentName} onChange={handleChange} placeholder="e.g., Fire Extinguisher" className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Username</span>
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="e.g., John Doe" className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Model / Series</span>
            <input type="text" name="modelSeries" value={formData.modelSeries} onChange={handleChange} placeholder="e.g., ABC Powder Type" className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Capacity</span>
            <input type="text" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="e.g., 6 kg" className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Rate Loaded</span>
            <input type="text" name="rateLoaded" value={formData.rateLoaded} onChange={handleChange} placeholder="e.g., 15 bar" className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Installation Date</span>
            <input type="date" name="installationDate" value={formData.installationDate} onChange={handleChange} className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>

          {/* --- ADDED NEW FIELDS --- */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Gross Weight</span>
            <input type="text" name="grossWeight" value={formData.grossWeight} onChange={handleChange} placeholder="e.g., 9.5 kg" className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Content</span>
            <input type="text" name="content" value={formData.content} onChange={handleChange} placeholder="e.g., Dry Powder" className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Fire Rating</span>
            <input type="text" name="fireRating" value={formData.fireRating} onChange={handleChange} placeholder="e.g., 4A:55B" className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Batch No.</span>
            <input type="text" name="batchNo" value={formData.batchNo} onChange={handleChange} placeholder="e.g., BT-2025-08" className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Serial Number</span>
            <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} placeholder="e.g., SN-12345678" className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>
           <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">MFG Month</span>
            <input type="month" name="mfgMonth" value={formData.mfgMonth} onChange={handleChange} className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">REF Due</span>
            <input type="date" name="refDue" value={formData.refDue} onChange={handleChange} className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>
         
          {/* Optional Notes */}
          <div className="relative md:col-span-2">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">Optional Notes</span>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" placeholder="e.g., Additional details about the equipment." className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"></textarea>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button type="submit" className="px-8 py-3 bg-[#DC6D18] text-[#FFF7ED] rounded-lg font-semibold shadow-md hover:bg-[#B85B14] transition-all duration-200 ease-in-out">
            Add Equipment
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEquipment;