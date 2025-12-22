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
      disabled={disabled} // Pass disabled prop
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

export default function EditEquipmentModal
({ isOpen, onClose, equipment, onSave, isLoading }) {
  const [formData, setFormData] = useState({});
const [editedAssignments, setEditedAssignments] = useState([]);
  // Update form state if the equipment prop changes
  // We format the dates here for the form inputs
  useEffect(() => {
    if (equipment) {

    let specificSerial = equipment.serialNumber || ""; // Default to batch serial

      // If we are editing a specific user's row, look inside assignments
      if (equipment.assignedUserId && equipment.assignments && Array.isArray(equipment.assignments)) {
        const userAssignment = equipment.assignments.find(a => a.userId === equipment.assignedUserId);
        if (userAssignment && userAssignment.serialNumber) {
          specificSerial = userAssignment.serialNumber;
        }
      }

    setFormData({
        ...equipment,
        userId: equipment.assignedUserId || equipment.userId || "Unassigned",
        serialNumber: specificSerial,
        installationDate: formatDateForInput(equipment.installationDate),
        refDue: formatDateForInput(equipment.refDue),
        expiryDate: formatDateForInput(equipment.expiryDate),
        mfgMonth: formatMonthForInput(equipment.mfgMonth),
      });

      // 2. ✅ Initialize Assignments for the list view
      if (equipment.assignments && Array.isArray(equipment.assignments)) {
        // Only show assignments that belong to the current assigned user (if any).
        const currentAssignedUser = equipment.assignedUserId || equipment.userId || null;
        const assignedOnly = equipment.assignments.filter(unit => unit.userId && currentAssignedUser ? unit.userId === currentAssignedUser : unit.userId );
        // Create a copy of the filtered array so we can edit it without mutating props
        setEditedAssignments(assignedOnly.map(a => ({ ...a })));
      } else {
        setEditedAssignments([]);
      }
    }
  }, [equipment]);

  
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle Serial Number Change for Specific Unit
  const handleAssignmentChange = (index, field, value) => {
    const updated = [...editedAssignments];
    updated[index][field] = value;
    setEditedAssignments(updated);
  };

 const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return; 
    
    // ✅ Include the updated assignments array in the save payload
    const payload = {
        ...formData,
        assignments: editedAssignments 
    };
    
    onSave(payload);
  };
  

  return (
   <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">
            Edit: {equipment?.equipmentName || "Equipment"}
          </h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        {/* Body - Scrollable Form */}
        <div className="overflow-y-auto flex-1 p-6">
          <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* --- Top Level Fields (Grid) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1 */}
              <FormInput label="Equipment Name" name="equipmentName" value={formData.equipmentName} onChange={handleChange} />
              <FormInput label="Assigned User (View Only)" name="userId" value={formData.userId} onChange={handleChange} disabled={true} />
              <FormInput label="Brand" name="brand" value={formData.brand} onChange={handleChange} />
              <FormInput label="Capacity" name="capacity" value={formData.capacity} onChange={handleChange} />
              <FormInput label="Installation Date" name="installationDate" value={formData.installationDate} onChange={handleChange} type="date" />

              {/* Column 2 */}
              <FormInput label="Model/Series" name="modelSeries" value={formData.modelSeries} onChange={handleChange} />
              <FormInput label="Gross Weight" name="grossWeight" value={formData.grossWeight} onChange={handleChange} />
              <FormInput label="Content" name="content" value={formData.content} onChange={handleChange} />
              <FormInput label="Batch No" name="batchNo" value={formData.batchNo} onChange={handleChange} />
              <FormInput label="MFG Month" name="mfgMonth" value={formData.mfgMonth} onChange={handleChange} type="month" />

              {/* Column 3 */}
              <FormInput label="Expiry Date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} type="date" />
              <FormInput label="REF Due" name="refDue" value={formData.refDue} onChange={handleChange} type="date" />
              {/* Optional: Location is often specific to the unit, but kept here as default */}
              <FormInput label="Default Location" name="location" value={formData.location} onChange={handleChange} />
            </div>

            {/* Notes */}
            <FormTextarea label="Notes" name="notes" value={formData.notes} onChange={handleChange} />

            {/* ✅ SERIAL NUMBERS MANAGEMENT SECTION */}
          <div className="border-t pt-4 mt-4">
                <h4 className="text-lg font-bold text-[#DC6D18] mb-3">Manage Assigned Unit Serial Numbers</h4>
                
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {editedAssignments.length > 0 ? (
                            editedAssignments.map((unit, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded border shadow-sm">
                                    <span className="text-xs font-bold text-gray-400 w-8">#{idx+1}</span>
                                    
                                    <div className="flex-1">
                                        <label className="text-[10px] text-gray-500 uppercase font-semibold">Serial Number</label>
                                        <input 
                                            type="text" 
                                            value={unit.serialNumber || ""} 
                                            onChange={(e) => handleAssignmentChange(idx, 'serialNumber', e.target.value)}
                                            className="w-full text-sm font-mono border-b border-gray-300 focus:border-[#DC6D18] focus:outline-none py-1 transition-colors"
                                        />
                                    </div>

                                    <div className="flex-1">
                                         <label className="text-[10px] text-gray-500 uppercase font-semibold">Assigned To</label>
                                         <div className="text-sm font-medium text-green-600">
                                             {unit.userId}
                                         </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic text-sm text-center py-4">No assigned units available for this equipment.</p>
                        )}
                    </div>
                </div>
            </div>

          </form>
        </div>

        {/* Footer - Actions */}
        <div className="flex items-center justify-end p-5 border-t bg-gray-50 gap-3">
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
            form="edit-form"
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#DC6D18] rounded-lg hover:bg-[#B85B14] focus:ring-4 focus:outline-none focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}          