import React, { useState, useEffect } from "react";

export default function EditInventoryModal({ isOpen, onClose, item, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    skuName: "",
    quantity: "",
    date: "",
    brand: "",
    capacity: "",
    content: "",
    grossWeight: "",
    batchNo: "",
    mfgMonth: "",
    expiryDate: "",
    refDue: "",
    notes: "",
  });

  // Helper function to format date to YYYY-MM format
  const formatToMonth = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    } catch (e) {
      return dateStr || "";
    }
  };

  // Helper function to format date to YYYY-MM-DD format
  const formatToDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) return "";
      return date.toISOString().split('T')[0];
    } catch (e) {
      return "";
    }
  };

  // Populate form when modal opens with an item
  useEffect(() => {
    if (item) {
      setFormData({
        skuName: item.skuName || "",
        quantity: item.quantity || "",
        date: formatToDate(item.date),
        brand: item.brand || "",
        capacity: item.capacity || "",
        content: item.content || "",
        grossWeight: item.grossWeight || "",
        batchNo: item.batchNo || "",
        mfgMonth: formatToMonth(item.mfgMonth),
        expiryDate: formatToDate(item.expiryDate),
        refDue: formatToDate(item.refDue),
        notes: item.notes || "",
      });
    }
  }, [item]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item._id, formData);
  };

  return (
   <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - preserved orange theme */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-orange-50">
          <h3 className="text-xl font-bold text-gray-800">Edit Inventory Record</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form - with scroll area for expanded fields */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
          {/* Main Details (Preserved inputs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  SKU Name (e.g., Fire Extinguisher)
                </label>
                <input
                  type="text"
                  name="skuName"
                  value={formData.skuName}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      min="0"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Date Added
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18] transition-all"
                    />
                  </div>
              </div>
          </div>

          <div className="border-t border-gray-100 pt-5 mt-5">
              <h4 className="text-lg font-bold text-[#DC6D18] mb-4">Technical & Batch Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                {/* Technical Fields expanded */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Capacity (e.g., 6 kg)</label>
                  <input type="text" name="capacity" value={formData.capacity} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Content (e.g., Dry Powder)</label>
                  <input type="text" name="content" value={formData.content} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Gross Weight</label>
                  <input type="text" name="grossWeight" value={formData.grossWeight} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]" />
                </div>
                 <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Batch No.</label>
                  <input type="text" name="batchNo" value={formData.batchNo} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">MFG Month</label>
                  <input type="month" name="mfgMonth" value={formData.mfgMonth} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
                  <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Refilling Due</label>
                  <input type="date" name="refDue" value={formData.refDue} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]" />
                </div>
              </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Optional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]"
            ></textarea>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2.5 bg-[#DC6D18] text-white font-semibold rounded-lg hover:bg-[#B85B14] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}