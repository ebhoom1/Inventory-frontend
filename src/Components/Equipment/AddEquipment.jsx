// // AddEquipment.jsx
// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import Swal from "sweetalert2";
// import { createEquipment, resetEquipmentState } from "../../redux/features/equipment/equipmentSlice";

// function AddEquipment() {
//   const dispatch = useDispatch();
//   const { loading, error, successMessage, created } = useSelector((s) => s.equipment);

//   const [formData, setFormData] = useState({
//     equipmentName: "",
//     userId: "",
//     modelSeries: "",
//     capacity: "",
//     rateLoaded: "",
//     installationDate: "",
//     grossWeight: "",
//     content: "",
//     fireRating: "",
//     batchNo: "",
//     serialNumber: "",
//     mfgMonth: "",
//     refDue: "",
//     notes: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // IMPORTANT: backend expects `username` earlier; if your controller uses username,
//     // map userId -> username here. If your controller uses userId, leave as is.
//     const payload = {
//       ...formData,
//       // username: formData.userId, // <-- uncomment if your backend expects `username`
//     };
//     dispatch(createEquipment(payload));
//   };

//   // Show alerts and reset slice
//   useEffect(() => {
//     if (successMessage) {
//       Swal.fire({
//         title: "Equipment Added",
//         text: successMessage,
//         icon: "success",
//         timer: 1600,
//         showConfirmButton: false,
//         timerProgressBar: true,
//         backdrop: true,
//       });
//       // Clear form after success
//       setFormData({
//         equipmentName: "",
//         userId: "",
//         modelSeries: "",
//         capacity: "",
//         rateLoaded: "",
//         installationDate: "",
//         grossWeight: "",
//         content: "",
//         fireRating: "",
//         batchNo: "",
//         serialNumber: "",
//         mfgMonth: "",
//         refDue: "",
//         notes: "",
//       });
//       dispatch(resetEquipmentState());
//     }
//     if (error) {
//       Swal.fire({
//         title: "Failed to Add",
//         text: error,
//         icon: "error",
//         confirmButtonText: "Okay",
//       });
//       dispatch(resetEquipmentState());
//     }
//   }, [successMessage, error, dispatch]);

//   return (
//     <div className="w-full max-w-4xl mx-auto">
//       <h2 className="text-2xl md:text-3xl font-bold text-center text-[#DC6D18] mb-8 md:mb-10">
//         Add New Equipment
//       </h2>

//       <form className="space-y-10" onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 md:gap-y-10">
//           {/* Equipment Name */}
//           <div className="relative">
//             <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Equipment Name
//             </span>
//             <input
//               type="text"
//               name="equipmentName"
//               value={formData.equipmentName}
//               onChange={handleChange}
//               placeholder="e.g., Fire Extinguisher"
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//             />
//           </div>

//           {/* User ID */}
//           <div className="relative">
//             <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               userId
//             </span>
//             <input
//               type="text"
//               name="userId"
//               value={formData.userId}
//               onChange={handleChange}
//               placeholder="e.g., GF001"
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//             />
//           </div>

//           {/* Model / Series */}
//           <div className="relative">
//             <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Model / Series
//             </span>
//             <input
//               type="text"
//               name="modelSeries"
//               value={formData.modelSeries}
//               onChange={handleChange}
//               placeholder="e.g., ABC Powder Type"
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//             />
//           </div>

//           {/* Capacity */}
//           <div className="relative">
//             <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Capacity
//             </span>
//             <input
//               type="text"
//               name="capacity"
//               value={formData.capacity}
//               onChange={handleChange}
//               placeholder="e.g., 6 kg"
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//             />
//           </div>

//           {/* Rate Loaded */}
//           <div className="relative">
//             <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Rate Loaded
//             </span>
//             <input
//               type="text"
//               name="rateLoaded"
//               value={formData.rateLoaded}
//               onChange={handleChange}
//               placeholder="e.g., 15 bar"
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//             />
//           </div>

//           {/* Installation Date */}
//           <div className="relative">
//             <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Installation Date
//             </span>
//             <input
//               type="date"
//               name="installationDate"
//               value={formData.installationDate}
//               onChange={handleChange}
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//             />
//           </div>

//           {/* Gross Weight */}
//           <div className="relative">
//             <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Gross Weight
//             </span>
//             <input
//               type="text"
//               name="grossWeight"
//               value={formData.grossWeight}
//               onChange={handleChange}
//               placeholder="e.g., 9.5 kg"
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//             />
//           </div>

//           {/* Content */}
//           <div className="relative">
//             <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Content
//             </span>
//             <input
//               type="text"
//               name="content"
//               value={formData.content}
//               onChange={handleChange}
//               placeholder="e.g., Dry Powder"
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//             />
//           </div>

//           {/* Fire Rating */}
//           <div className="relative">
//             <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Fire Rating
//             </span>
//             <input
//               type="text"
//               name="fireRating"
//               value={formData.fireRating}
//               onChange={handleChange}
//               placeholder="e.g., 4A:55B"
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//             />
//           </div>

//           {/* Batch No */}
//           <div className="relative">
//             <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Batch No.
//             </span>
//             <input
//               type="text"
//               name="batchNo"
//               value={formData.batchNo}
//               onChange={handleChange}
//               placeholder="e.g., BT-2025-08"
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//             />
//           </div>

//           {/* Serial Number */}
//           <div className="relative">
//             <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Serial Number
//             </span>
//             <input
//               type="text"
//               name="serialNumber"
//               value={formData.serialNumber}
//               onChange={handleChange}
//               placeholder="e.g., SN-12345678"
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//             />
//           </div>

//           {/* MFG Month */}
//           <div className="relative">
//             <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               MFG Month
//             </span>
//             <input
//               type="month"
//               name="mfgMonth"
//               value={formData.mfgMonth}
//               onChange={handleChange}
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//             />
//           </div>

//           {/* REF Due */}
//           <div className="relative">
//             <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               REF Due
//             </span>
//             <input
//               type="date"
//               name="refDue"
//               value={formData.refDue}
//               onChange={handleChange}
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//             />
//           </div>

//           {/* Notes */}
//           <div className="relative md:col-span-2">
//             <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Optional Notes
//             </span>
//             <textarea
//               name="notes"
//               value={formData.notes}
//               onChange={handleChange}
//               rows="4"
//               placeholder="e.g., Additional details about the equipment."
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//             ></textarea>
//           </div>
//         </div>

//         <div className="flex justify-center mt-8">
//           <button
//             type="submit"
//             disabled={loading}
//             className={`px-8 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 ease-in-out ${
//               loading
//                 ? "bg-gray-300 text-gray-600 cursor-not-allowed"
//                 : "bg-[#DC6D18] text-[#FFF7ED] hover:bg-[#B85B14]"
//             }`}
//           >
//             {loading ? "Adding..." : "Add Equipment"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default AddEquipment;


// AddEquipment.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { createEquipment, resetEquipmentState } from "../../redux/features/equipment/equipmentSlice";
import { getAllUsers } from "../../redux/features/users/userSlice"; // <-- fetch users for dropdown

function AddEquipment() {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((s) => s.equipment);
  const { allUsers } = useSelector((s) => s.users); // <-- list of users

  const [formData, setFormData] = useState({
    equipmentName: "",
    userId: "",
    modelSeries: "",
    capacity: "",
    rateLoaded: "",
    installationDate: "",
    grossWeight: "",
    content: "",
    fireRating: "",
    batchNo: "",
    serialNumber: "",
    mfgMonth: "",
    refDue: "",
    notes: "",
  });

  useEffect(() => {
    dispatch(getAllUsers()); // populate user dropdown
  }, [dispatch]);

  // Only show users with role "User"; display companyName instead of email
  const userOptions = useMemo(() => {
    const arr = Array.isArray(allUsers) ? allUsers : [];
    return arr
      .filter((u) => (u?.userType || "").toString().toLowerCase() === "user")
      .map((u) => ({
        value: u.userId || u._id, // what we submit
        label: u.companyName || u.name || u.firstName || u.userName || u.userId || u._id, // show companyName if present
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    // If your backend expects `username` instead of `userId`, map it here:
    // payload.username = formData.userId;

    if (!payload.equipmentName?.trim()) {
      Swal.fire({ icon: "warning", title: "Equipment name required" });
      return;
    }
    if (!payload.userId) {
      Swal.fire({ icon: "warning", title: "Please select a user" });
      return;
    }

    dispatch(createEquipment(payload));
  };

  useEffect(() => {
    if (successMessage) {
      Swal.fire({
        title: "Equipment Added",
        text: successMessage,
        icon: "success",
        timer: 1600,
        showConfirmButton: false,
        timerProgressBar: true,
        backdrop: true,
      });
      setFormData({
        equipmentName: "",
        userId: "",
        modelSeries: "",
        capacity: "",
        rateLoaded: "",
        installationDate: "",
        grossWeight: "",
        content: "",
        fireRating: "",
        batchNo: "",
        serialNumber: "",
        mfgMonth: "",
        refDue: "",
        notes: "",
      });
      dispatch(resetEquipmentState());
    }
    if (error) {
      Swal.fire({ title: "Failed to Add", text: error, icon: "error", confirmButtonText: "Okay" });
      dispatch(resetEquipmentState());
    }
  }, [successMessage, error, dispatch]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-[#DC6D18] mb-8 md:mb-10">
        Add New Equipment
      </h2>

      <form className="space-y-10" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 md:gap-y-10">
          {/* Equipment Name (KEEP as text input) */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Equipment Name
            </span>
            <input
              type="text"
              name="equipmentName"
              value={formData.equipmentName}
              onChange={handleChange}
              placeholder="e.g., Fire Extinguisher"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* User (dropdown) */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              User
            </span>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            >
              <option value="">Select user</option>
              {userOptions.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          {/* Model / Series */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Model / Series
            </span>
            <input
              type="text"
              name="modelSeries"
              value={formData.modelSeries}
              onChange={handleChange}
              placeholder="e.g., ABC Powder Type"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* Capacity */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Capacity
            </span>
            <input
              type="text"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g., 6 kg"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* Rate Loaded */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Rate Loaded
            </span>
            <input
              type="text"
              name="rateLoaded"
              value={formData.rateLoaded}
              onChange={handleChange}
              placeholder="e.g., 15 bar"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* Installation Date */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Installation Date
            </span>
            <input
              type="date"
              name="installationDate"
              value={formData.installationDate}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* Gross Weight */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Gross Weight
            </span>
            <input
              type="text"
              name="grossWeight"
              value={formData.grossWeight}
              onChange={handleChange}
              placeholder="e.g., 9.5 kg"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* Content */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Content
            </span>
            <input
              type="text"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="e.g., Dry Powder"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* Fire Rating */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Fire Rating
            </span>
            <input
              type="text"
              name="fireRating"
              value={formData.fireRating}
              onChange={handleChange}
              placeholder="e.g., 4A:55B"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* Batch No */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Batch No.
            </span>
            <input
              type="text"
              name="batchNo"
              value={formData.batchNo}
              onChange={handleChange}
              placeholder="e.g., BT-2025-08"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* Serial Number */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Serial Number
            </span>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              placeholder="e.g., SN-12345678"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* MFG Month */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              MFG Month
            </span>
            <input
              type="month"
              name="mfgMonth"
              value={formData.mfgMonth}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* REF Due */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              REF Due
            </span>
            <input
              type="date"
              name="refDue"
              value={formData.refDue}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* Notes */}
          <div className="relative md:col-span-2">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Optional Notes
            </span>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="e.g., Additional details about the equipment."
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 ease-in-out ${
              loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#DC6D18] text-[#FFF7ED] hover:bg-[#B85B14]"
            }`}
          >
            {loading ? "Adding..." : "Add Equipment"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEquipment;
