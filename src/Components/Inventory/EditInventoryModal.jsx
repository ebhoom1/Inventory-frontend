import React, { useState, useEffect } from "react";
import { API_URL } from "../../../utils/apiConfig";
import { useSelector } from "react-redux";

// --- Helper Functions for Date Formatting ---

/**
 * Formats a date string or timestamp into 'YYYY-MM-DD' for date inputs.
 * Gracefully handles null, undefined, or invalid dates.
 */
const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Invalid date value:", dateStr, error);
    return "";
  }
};

/**
 * Formats a date string or timestamp into 'YYYY-MM' for month inputs.
 * Gracefully handles null, undefined, or invalid dates.
 */
const formatMonthForInput = (dateStr) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  } catch (error) {
    console.error("Invalid month value:", dateStr, error);
    return "";
  }
};

// Simple reusable input component
const FormInput = ({ label, name, value, onChange, disabled, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type="text"
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm 
        ${disabled ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'border-gray-300 focus:ring-[#DC6D18] focus:border-[#DC6D18]'}`}
      {...props}
    />
  </div>
);

// Simple reusable textarea component
const FormTextarea = ({ label, name, value, onChange, ...props }) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700"
    >
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      rows={3}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#DC6D18] focus:border-[#DC6D18] sm:text-sm"
      {...props}
    />
  </div>
);

export default function EditInventoryModal({ isOpen, onClose, item, onSave, isLoading }) {
  const { userInfo } = useSelector((s) => s.users);
  const authToken = userInfo?.token || localStorage.getItem("token");

  const [formData, setFormData] = useState({
    equipmentName: "",
    quantity: "",
    date: "",
    brand: "",
    capacity: "",
    content: "",
    serialNumbers:"",
    grossWeight: "",
    batchNo: "",
    mfgMonth: "",
    notes: "",
  });

  // ✅ NEW: Serial numbers management state (matches Equipment edit modal)
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [selectedSerialIndices, setSelectedSerialIndices] = useState(new Set());
  // ✅ REMOVED: remainingStock and loadingStock state - no longer needed
  // We only use item.serialNumbers which are batch-specific

  // ✅ REMOVED: fetchRemainingStock was fetching ALL equipment with the same SKU
  // This was incorrect - we only need the batch-specific serial numbers from item.serialNumbers
  // Previously this caused the modal to show 96 units instead of just the 8 for this batch

  // ✅ FIXED: Populate form immediately from item data (don't wait for async)
  useEffect(() => {
    if (item) {
      // ✅ Use item.quantity immediately (don't wait for remainingStock)
      const initialQuantity = item.quantity || 0;
      
      setFormData({
        equipmentName: item.equipmentName || item.skuName || "",
        quantity: initialQuantity,
        date: formatDateForInput(item.date),
        brand: item.brand || "",
        capacity: item.capacity || "",
        content: item.content || "",
        grossWeight: item.grossWeight || "",
        batchNo: item.batchNo || "",
        mfgMonth: formatMonthForInput(item.mfgMonth),
        notes: item.notes || "",
      });

      // ✅ Initialize serial numbers from ALL batches (original + restocks combined)
      // Use allSerialNumbers if available (contains merged serials from all batches)
      // Fall back to serialNumbers for backward compatibility
      const existingSerials = item.allSerialNumbers || item.serialNumbers || [];
      const initSerials = [];
      
      for (let i = 0; i < initialQuantity; i++) {
        initSerials.push({
          id: `unit-${i}`,
          value: existingSerials[i] || "",
          isRestock: false,
        });
      }
      
      setSerialNumbers(initSerials);
      setSelectedSerialIndices(new Set());
      
      console.log("EditInventoryModal - Loaded from item:", {
        skuName: item.equipmentName || item.skuName,
        total: initialQuantity,
        allSerials: existingSerials,
        fromAllBatches: item.allSerialNumbers ? "YES (combined original + restock)" : "NO (single batch)"
      });

      // ✅ NOTE: Removed fetchRemainingStock call - we only need batch-specific serials
      // The remainingStock concept was showing ALL unassigned equipment, not just this batch
    }
  }, [item]);
  
  // ✅ REMOVED: No longer replace batch serials with remainingStock
  // Previously this was replacing item.serialNumbers with ALL unassigned equipment units
  // Now we always display ONLY the serial numbers specific to this inventory batch
  // The remainingStock concept was incorrect - it showed all equipment, not just this batch

  // ✅ REMOVED: No longer listening for assignment events to refresh remainingStock
  // Since we only display batch-specific serials (item.serialNumbers), 
  // there's no need to refresh from equipment collection

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ NEW: Handle quantity change - dynamically add/remove serial slots
  const handleQuantityChange = (e) => {
    const newQty = Number(e.target.value) || 0;
    const currentQty = serialNumbers.length;

    if (newQty > currentQty) {
      // Add new blank serial slots
      const newSerials = [...serialNumbers];
      for (let i = currentQty; i < newQty; i++) {
        newSerials.push({
          id: `new-${i}`,
          value: "",
          new: true,
        });
      }
      setSerialNumbers(newSerials);
    } else if (newQty < currentQty) {
      // Remove slots from the end
      setSerialNumbers((prev) => prev.slice(0, newQty));
      // Clear selections for removed items
      const newSelected = new Set(
        Array.from(selectedSerialIndices).filter((idx) => idx < newQty)
      );
      setSelectedSerialIndices(newSelected);
    }

    handleChange(e);
  };

  // ✅ NEW: Handle serial number editing
  const handleSerialChange = (index, value) => {
    const updated = [...serialNumbers];
    updated[index].value = value;
    setSerialNumbers(updated);
  };

  // ✅ NEW: Toggle serial selection for removal
  const toggleSerialSelection = (index) => {
    const newSelected = new Set(selectedSerialIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSerialIndices(newSelected);
  };

  // ✅ NEW: Remove selected serials (deselect unwanted quantities)
  const removeSelectedSerials = () => {
    const newSerials = serialNumbers.filter(
      (_, idx) => !selectedSerialIndices.has(idx)
    );
    setSerialNumbers(newSerials);
    setSelectedSerialIndices(new Set());
    // Update quantity
    setFormData((prev) => ({ ...prev, quantity: newSerials.length }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ NEW: Validate that we have serials for all quantities
    const validSerials = serialNumbers.filter(s => s.value && s.value.trim());
    if (validSerials.length !== Number(formData.quantity || 0)) {
      alert(`Please provide serial numbers for all ${formData.quantity} units, or remove empty slots.`);
      return;
    }

    // Include serial numbers in the save payload
    const payload = {
      ...formData,
      serialNumbers: serialNumbers.map(s => s.value),
    };

    onSave(item._id, payload);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - preserved orange theme */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-orange-50">
          <h3 className="text-xl font-bold text-gray-800">
            Edit: {item?.equipmentName || item?.skuName || "Inventory Record"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form - with scroll area for expanded fields */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
          {/* Main Details (Top Section) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Equipment Name"
              name="equipmentName"
              value={formData.equipmentName}
              onChange={handleChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleQuantityChange}
                  required
                  className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18] border-gray-300`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date Added
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]"
              />
            </div>
          </div>

          {/* Technical & Batch Details */}
          <div className="border-t border-gray-100 pt-5 mt-5">
            <h4 className="text-lg font-bold text-[#DC6D18] mb-4">Technical & Batch Details</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <FormInput label="Brand" name="brand" value={formData.brand} onChange={handleChange} />
              <FormInput label="Capacity (e.g., 6 kg)" name="capacity" value={formData.capacity} onChange={handleChange} />
              <FormInput label="Content (e.g., Dry Powder)" name="content" value={formData.content} onChange={handleChange} />
              <FormInput label="Gross Weight" name="grossWeight" value={formData.grossWeight} onChange={handleChange} />
              <FormInput label="Batch No." name="batchNo" value={formData.batchNo} onChange={handleChange} />
              <div>
                <label className="block text-sm font-medium text-gray-700">MFG Month</label>
                <input
                  type="month"
                  name="mfgMonth"
                  value={formData.mfgMonth}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#DC6D18] focus:border-[#DC6D18]"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <FormTextarea label="Optional Notes" name="notes" value={formData.notes} onChange={handleChange} />

          {/* ✅ SERIAL NUMBERS MANAGEMENT SECTION - Shows all serials from all batches */}
          <div className="border-t border-gray-100 pt-5 mt-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-lg font-bold text-[#DC6D18]">
                  Serial Numbers 
                  {item?.restockCount > 0 ? ` (Original + ${item.restockCount} Restock${item.restockCount > 1 ? 's' : ''})` : ' for This Batch'}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  📦 Total: <span className="font-semibold">{serialNumbers.length} units</span> 
                  {item?.restockCount > 0 ? (
                    <span className="ml-3">
                      (All serial numbers from original batch + all restock batches combined)
                    </span>
                  ) : (
                    <span className="ml-3">
                      (Only serial numbers from this specific inventory batch are displayed)
                    </span>
                  )}
                </p>
              </div>
              {selectedSerialIndices.size > 0 && (
                <button
                  type="button"
                  onClick={removeSelectedSerials}
                  className="px-3 py-1 text-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded transition-colors"
                >
                  Remove Selected ({selectedSerialIndices.size})
                </button>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
              {serialNumbers.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {serialNumbers.map((serial, idx) => {
                    // ✅ Visual indicator for original vs restocked serials
                    // We don't always know which are restocked, so we highlight empty ones
                    const isEmpty = !serial.value || serial.value.trim() === "";
                    
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded border transition-colors ${
                          selectedSerialIndices.has(idx)
                            ? "bg-red-50 border-red-300"
                            : isEmpty
                            ? "bg-yellow-50 border-yellow-200 shadow-sm"
                            : "bg-white border-gray-200 shadow-sm"
                        }`}
                      >
                        {/* Checkbox for selection */}
                        <input
                          type="checkbox"
                          checked={selectedSerialIndices.has(idx)}
                          onChange={() => toggleSerialSelection(idx)}
                          className="w-4 h-4 text-red-600 rounded cursor-pointer flex-shrink-0"
                          title="Select to remove this serial number"
                        />

                        {/* Serial number input */}
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-600 uppercase font-semibold">
                            Unit #{idx + 1} / {serialNumbers.length}
                          </label>
                          <input
                            type="text"
                            value={serial.value || ""}
                            onChange={(e) => handleSerialChange(idx, e.target.value)}
                            placeholder={`Serial number ${idx + 1}`}
                            className="w-full text-sm font-mono border-b border-gray-300 focus:border-[#DC6D18] focus:outline-none py-1 transition-colors"
                          />
                        </div>

                        {/* Status badge */}
                        {isEmpty && (
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded flex-shrink-0 whitespace-nowrap">
                            ⚠ EMPTY
                          </span>
                        )}
                        
                        {serial.value && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded flex-shrink-0 whitespace-nowrap">
                            ✓ FILLED
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm text-center py-4">
                  No serial numbers yet. Set a quantity above to add serial number fields.
                </p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 <strong>All {serialNumbers.length} serial numbers are displayed above.</strong> 
              {item?.restockCount > 0 
                ? ` These include serials from the original batch plus all ${item.restockCount} restock batch(es).` 
                : ' These are the serial numbers for this inventory batch.'
              } Edit any field or remove unwanted units.
            </p>
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