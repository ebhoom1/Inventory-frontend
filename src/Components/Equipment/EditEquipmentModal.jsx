import React, { useState, useEffect } from "react";

// --- Helper Functions for Date Formatting ---

/**
 * Formats a date string or timestamp into 'YYYY-MM-DD' for date inputs.
 * Gracefully handles null, undefined, or invalid dates.
 */
const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    // Check if the date is valid
    if (isNaN(date.getTime())) return "";
    // toISOString() returns 'YYYY-MM-DDTHH:mm:ss.sssZ'
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Invalid date value:", dateStr, error);
    return ""; // Return empty string on error
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
    
    // Get year and month, pad month with '0' if needed
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    return `${year}-${month}`;
  } catch (error) {
    console.error("Invalid month value:", dateStr, error);
    return "";
  }
};


// Simple reusable input component
const FormInput = ({ label, name, value, onChange, ...props }) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700"
    >
      {label}
    </label>
    <input
      type="text"
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#DC6D18] focus:border-[#DC6D18] sm:text-sm disabled:opacity-50"
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

export default function EditEquipmentModal({
  isOpen,
  onClose,
  equipment,
  onSave,
  isLoading, // Added isLoading prop
}) {
  const [formData, setFormData] = useState({});

  // Update form state if the equipment prop changes
  // We format the dates here for the form inputs
  useEffect(() => {
    if (equipment) {
      setFormData({
        ...equipment,
        installationDate: formatDateForInput(equipment.installationDate),
        refDue: formatDateForInput(equipment.refDue),
        expiryDate: formatDateForInput(equipment.expiryDate),
        mfgMonth: formatMonthForInput(equipment.mfgMonth), // Use month formatter
      });
    } else {
      setFormData({});
    }
  }, [equipment]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevent multiple submissions
    onSave(formData);
  };

  return (
    // Modal Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
      onClick={onClose}
    >
      {/* Modal Content - Increased width to max-w-3xl */}
      <div
        className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl m-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent closing on content click
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            Edit: {equipment?.equipmentName || "Equipment"}
          </h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
            disabled={isLoading}
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>

        {/* Body - Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* --- 3-Column Grid for most fields --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1 */}
              <FormInput
                label="Equipment Name"
                name="equipmentName"
                value={formData.equipmentName}
                onChange={handleChange}
              />
              <FormInput
                label="User ID"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                // Note: You might want to make this a <select> dropdown
                // Or disable it if it shouldn't be changed
                // disabled={true} 
              />
              <FormInput
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
              />
               <FormInput
                label="Capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
              />
               <FormInput
                label="Installation Date"
                name="installationDate"
                value={formData.installationDate}
                onChange={handleChange}
                type="date"
              />

              {/* Column 2 */}
              <FormInput
                label="Model/Series"
                name="modelSeries"
                value={formData.modelSeries}
                onChange={handleChange}
              />
              <FormInput
                label="Gross Weight"
                name="grossWeight"
                value={formData.grossWeight}
                onChange={handleChange}
              />
              <FormInput
                label="Content"
                name="content"
                value={formData.content}
                onChange={handleChange}
              />
              <FormInput
                label="Batch No"
                name="batchNo"
                value={formData.batchNo}
                onChange={handleChange}
              />
              <FormInput
                label="MFG Month"
                name="mfgMonth"
                value={formData.mfgMonth}
                onChange={handleChange}
                type="month"
              />

              {/* Column 3 */}
              <FormInput
                label="Serial Number"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
              />

                 {/* --- EXPIRY DATE INPUT --- */}
              <FormInput
                label="Expiry Date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                type="date"
              />
               {/* This field was not in your list, but in your details view. Add if needed.
               <FormInput
                label="Fire Rating"
                name="fireRating"
                value={formData.fireRating}
                onChange={handleChange}
              /> */}
               <FormInput
                label="REF Due"
                name="refDue"
                value={formData.refDue}
                onChange={handleChange}
                type="date"
              />
            </div>
          

            {/* --- Full-width fields for Location and Notes --- */}
            <FormInput
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
            <FormTextarea
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {/* Footer - Actions */}
          <div className="flex items-center justify-end p-6 space-x-2 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#DC6D18] rounded-lg hover:bg-[#B85B14] focus:ring-4 focus:outline-none focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}                 