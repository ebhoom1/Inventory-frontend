// src/pages/UseInventory/UseInventory.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { logInventoryUsage, resetInventoryState } from '../../redux/features/inventory/inventorySlice';

function UseInventory() {
  const dispatch = useDispatch();
  const { usageLoading, usageError, lastUsage } = useSelector((s) => s.inventory);

  const [formData, setFormData] = useState({
    skuName: '',
    userId: '',
    quantityUsed: '',
    date: '',
    notes: '',
  });

  useEffect(() => {
    if (usageError) {
      Swal.fire({ icon: 'error', title: 'Failed to log usage', text: usageError });
    }
  }, [usageError]);

  useEffect(() => {
    if (lastUsage) {
      Swal.fire({
        icon: 'success',
        title: 'Usage Logged',
        text: `${lastUsage.skuName}: -${lastUsage.quantityUsed} by ${lastUsage.userId}`,
        timer: 1300,
        showConfirmButton: false,
      });
      setFormData({ skuName: '', userId: '', quantityUsed: '', date: '', notes: '' });
      dispatch(resetInventoryState());
    }
  }, [lastUsage, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      skuName: formData.skuName.trim(),
      userId: formData.userId.trim(),
      quantityUsed: Number(formData.quantityUsed),
      date: formData.date,
      notes: formData.notes?.trim(),
    };
    if (!payload.skuName || !payload.userId || !payload.quantityUsed || !payload.date) {
      Swal.fire({ icon: 'warning', title: 'Missing fields', text: 'Please fill all required fields' });
      return;
    }
    if (payload.quantityUsed < 1) {
      Swal.fire({ icon: 'warning', title: 'Invalid quantity', text: 'Quantity must be at least 1' });
      return;
    }
    dispatch(logInventoryUsage(payload));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-[#DC6D18] mb-10">Log Inventory Usage</h2>

      <form className="space-y-10" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">SKU Name</span>
            <input type="text" name="skuName" value={formData.skuName} onChange={handleChange}
              placeholder="e.g., VALVE"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>

          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">User Name</span>
            <input type="text" name="userId" value={formData.userId} onChange={handleChange}
              placeholder="e.g., KIMS67"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>

          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Quantity Used</span>
            <input type="number" name="quantityUsed" value={formData.quantityUsed} onChange={handleChange}
              placeholder="e.g., 5" min="1"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>

          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Date</span>
            <input type="date" name="date" value={formData.date} onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" required />
          </div>

          <div className="relative flex items-center md:col-span-2">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Optional Notes</span>
            <textarea name="notes" value={formData.notes} onChange={handleChange}
              placeholder="e.g., For project X, afternoon shift." rows="3"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]" />
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button type="submit" disabled={usageLoading}
            className="px-8 py-3 bg-[#DC6D18] text-[#FFF7ED] rounded-lg font-semibold shadow-md hover:bg-[#B85B14] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC6D18] transition-all duration-200 ease-in-out disabled:opacity-60">
            {usageLoading ? 'Logging…' : 'Log Usage'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UseInventory;
