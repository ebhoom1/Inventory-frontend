// // src/pages/UseInventory/UseInventory.jsx
// import React, { useState, useEffect, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import Swal from "sweetalert2";
// import {
//   logInventoryUsage,
//   resetInventoryState,
//   fetchInventory,
// } from "../../redux/features/inventory/inventorySlice";
// import {
//   assignEquipment,
//   getEquipments,
// } from "../../redux/features/equipment/equipmentSlice";
// import { getAllUsers } from "../../redux/features/users/userSlice";
// import { API_URL } from "../../../utils/apiConfig";

// function UseInventory() {
//   const dispatch = useDispatch();

//   // Inventory slice
//   const {
//     usageLoading,
//     usageError,
//     // lastUsage,
//     items: allInventoryItems = [], // expects inventory list from Redux
//     loading: listLoading, // loading state for listInventory
//   } = useSelector((s) => s.inventory || {});

//   // Users slice
//   const {
//     allUsers = [],
//     loading: usersLoading,
//     error: usersError,
//     userInfo,
//   } = useSelector((s) => s.users || {});

//   // equipmnt slice
//   const {
//     list: equipmentList = [],
//     loading: assignLoading,
//     error: assignError,
//     successMessage: assignSuccess,
//   } = useSelector((s) => s.equipment || {});

//   const role = (userInfo?.userType || "").toLowerCase();
//   const isAdmin =
//     role === "admin" || role === "super admin" || role === "technician";

//   // const isAdmin =
//   //   userInfo?.userType === "Admin" || userInfo?.userType === "Super Admin";
//   const authToken = userInfo?.token || localStorage.getItem("token");
//   const equipmentItems = useSelector((s) => s.equipment?.list || []);

//   // Local state
//   const [formData, setFormData] = useState({
//     skuName: "",
//     userId: "",
//     quantityUsed: "",
//     installationDate: "",
//     expiryDate: "",
//     refDue: "",
//     notes: "",
//   });
//   const selectedUserId = isAdmin ? formData.userId : userInfo?.userId || "";

//   // ✅ New State for Serial Numbers
//   const [availableSerials, setAvailableSerials] = useState([]);
//   const [selectedSerials, setSelectedSerials] = useState([]);
//   const [serialLocationMap, setSerialLocationMap] = useState({});

//   // For non-admin users: user-specific SKU options
//   const [userSkuOptions, setUserSkuOptions] = useState([]);
//   const [userSkuLoading, setUserSkuLoading] = useState(false);
//   const [userSkuError, setUserSkuError] = useState(null);

//   // Location options based on selected user
//   const [locationOptions, setLocationOptions] = useState([]);
//   const [locationLoading, setLocationLoading] = useState(false);

//   // =============== Effects ===============

//   // Fetch inventory summary (to know how many left per SKU)
//   const [skuLeftMap, setSkuLeftMap] = useState({});
//   useEffect(() => {
//     const fetchSummary = async () => {
//       try {
//         const res = await fetch(`${API_URL}/api/inventory/summary`, {
//           headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
//         });
//         const data = await res.json();
//         if (!res.ok)
//           throw new Error(data?.message || "Failed to fetch summary");
//         const map = {};
//         (Array.isArray(data) ? data : []).forEach((r) => {
//           if (r && r.skuName) map[r.skuName] = Number(r.left) || 0;
//         });
//         setSkuLeftMap(map);
//       } catch (e) {
//         console.warn("Could not load inventory summary", e.message || e);
//       }
//     };
//     fetchSummary();
//   }, [API_URL, authToken]);

//   // Initialize userId field for non-admins
//   useEffect(() => {
//     if (!isAdmin && userInfo?.userId) {
//       setFormData((p) => ({ ...p, userId: userInfo.userId }));
//     }
//   }, [isAdmin, userInfo?.userId]);

//   // Admin: fetch all users & all inventory (for SKU dropdown)
//   useEffect(() => {
//     if (isAdmin) {
//       if (!allUsers || allUsers.length === 0) {
//         dispatch(getAllUsers());
//       }
//       dispatch(fetchInventory());
//       // also fetch equipments to include unassigned equipment names in SKU dropdown
//       dispatch(getEquipments());
//     }
//   }, [dispatch, isAdmin]);

//   // Non-admin: fetch ALL inventory (not just user-specific)
//   useEffect(() => {
//     const fetchUserSkus = async () => {
//       if (isAdmin) return; // admin doesn't need this
//       if (!userInfo?.userId) return;
//       try {
//         setUserSkuLoading(true);
//         setUserSkuError(null);

//         // ✅ UPDATED: Changed from /api/inventory/user/:userId to /api/inventory
//         // Now fetches ALL inventory items for all users
//         const res = await fetch(`${API_URL}/api/inventory`, {
//           headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
//         });
//         const data = await res.json();
//         if (!res.ok) {
//           throw new Error(data?.message || "Failed to load inventory");
//         }

//         // Expecting an array of inventory records, each with a skuName
//         const uniqueSkus = Array.from(
//           new Set(
//             (Array.isArray(data) ? data : [])
//               .map((it) => it.skuName)
//               .filter(Boolean),
//           ),
//         ).sort((a, b) => a.localeCompare(b));

//         // Filter out SKUs that have zero left according to summary if available
//         const filtered = uniqueSkus.filter(
//           (n) => skuLeftMap[n] === undefined || Number(skuLeftMap[n]) > 0,
//         );
//         setUserSkuOptions(filtered);
//       } catch (e) {
//         setUserSkuError(e.message || "Failed to load SKUs");
//       } finally {
//         setUserSkuLoading(false);
//       }
//     };

//     fetchUserSkus();
//   }, [API_URL, authToken, isAdmin]);

//   // Handle inventory usage errors
//   useEffect(() => {
//     if (usageError) {
//       Swal.fire({
//         icon: "error",
//         title: "Failed to log usage",
//         text: usageError,
//       });
//     }
//   }, [usageError]);

//   // Handle users fetch error
//   useEffect(() => {
//     if (usersError) {
//       Swal.fire({
//         icon: "warning",
//         title: "Could not load users",
//         text: usersError,
//       });
//     }
//   }, [usersError]);

//   // Success alert + reset
//   // useEffect(() => {
//   //   if (lastUsage) {
//   //     Swal.fire({
//   //       icon: "success",
//   //       title: "Usage Logged",
//   //       text: `${lastUsage.skuName}: -${lastUsage.quantityUsed} by ${lastUsage.userId}`,
//   //       timer: 1300,
//   //       showConfirmButton: false,
//   //     });
//   //     setFormData({
//   //       skuName: "",
//   //       userId: isAdmin ? "" : userInfo?.userId || "",
//   //       quantityUsed: "",
//   //       location: "",
//   //       notes: "",
//   //     });
//   //     setSelectedSerials([]); // Reset serial selection
//   //     dispatch(resetInventoryState());
//   //     if (isAdmin) dispatch(getEquipments());
//   //   }
//   // },

//   // =============== Logic Implementation for Serial Numbers ===============

//   // 1. Find Available Serials when SKU changes
//   useEffect(() => {
//     const rawVal = formData.skuName;

//     if (!rawVal) {
//       setAvailableSerials([]);
//       return;
//     }

//     let targetName = rawVal;

//     // Parse the dropdown value (e.g., "eq:123" or "sku:Hammer")
//     if (rawVal.startsWith("eq:")) {
//       const id = rawVal.slice(3);
//       const eq = equipmentList.find(
//         (e) => e._id === id || e.equipmentId === id,
//       );
//       if (eq) targetName = eq.equipmentName;
//     } else if (rawVal.startsWith("sku:")) {
//       targetName = rawVal.slice(4); // Remove "sku:"
//     } else {
//       targetName = rawVal; // Fallback for simple string
//     }

//     if (!targetName) return;

//     // Filter equipment list for matches
//     const matches = equipmentList.filter((e) => e.equipmentName === targetName);

//     // Extract unassigned serial numbers (flat structure: each equipment is a single unit)
//     const serials = [];
//     matches.forEach((eq) => {
//       // Check if userId is null/empty (Unassigned)
//       if (!eq.userId && eq.serialNumber) {
//         serials.push(eq.serialNumber);
//       }
//     });

//     setAvailableSerials(serials.sort());
//     setSelectedSerials([]); // Reset selection on item change
//     setSerialLocationMap({}); // Reset serial-location map on item change
//   }, [formData.skuName, equipmentList]);

//   // 2. Auto-update Quantity based on Serial Selection
//   useEffect(() => {
//     if (selectedSerials.length > 0) {
//       setFormData((prev) => ({
//         ...prev,
//         quantityUsed: selectedSerials.length,
//       }));
//     }
//   }, [selectedSerials]);

//   // =============== Derived Options ===============

//   // Admin SKU options from Redux inventory list
//   // ✅ UPDATED: Show ALL inventory items, not filtered by user
//   // ✅ DEDUPLICATION: Properly handles restocked inventory (original + restock batches)
//   const adminSkuOptions = useMemo(() => {
//     if (!isAdmin) return [];

//     // ✅ Step 1: Deduplicate inventory SKUs (removes duplicates from original + restock batches)
//     const uniqueSkuMap = new Map();
//     (allInventoryItems || []).forEach((it) => {
//       if (it?.skuName) {
//         // Keep first occurrence, discard duplicates
//         if (!uniqueSkuMap.has(it.skuName)) {
//           uniqueSkuMap.set(it.skuName, it);
//         }
//       }
//     });

//     // ✅ Step 2: Filter by remaining stock
//     const skuOptionsFiltered = Array.from(uniqueSkuMap.keys()).filter(
//       (n) => skuLeftMap[n] === undefined || Number(skuLeftMap[n]) > 0,
//     );

//     // ✅ Step 3: Create SKU options (already deduplicated)
//     const skuOptions = skuOptionsFiltered.map((n) => ({
//       type: "sku",
//       label: n,
//       value: `sku:${n}`,
//       skuName: n,
//     }));

//     // ✅ Step 4: Deduplicate equipment items (remove duplicates by equipmentName)
//     const uniqueEquipmentMap = new Map();
//     (equipmentItems || [])
//       .filter((e) => !e.userId) // Only unassigned equipment
//       .forEach((e) => {
//         if (e?.equipmentName) {
//           // Keep first occurrence by equipmentName, discard duplicates
//           const key = e.equipmentName;
//           if (!uniqueEquipmentMap.has(key)) {
//             uniqueEquipmentMap.set(key, e);
//           }
//         }
//       });

//     // ✅ Step 5: Create equipment options (already deduplicated)
//     const equipmentOptions = Array.from(uniqueEquipmentMap.values()).map(
//       (e) => ({
//         type: "equipment",
//         label: e.equipmentName,
//         value: `eq:${e._id}`,
//         equipmentId: e._id,
//         equipmentName: e.equipmentName,
//       }),
//     );

//     // ✅ Step 6: Final deduplication by label (in case SKU name matches equipment name)
//     const finalOptions = [];
//     const seenLabels = new Set();
//     for (const opt of [...skuOptions, ...equipmentOptions]) {
//       if (opt.label && !seenLabels.has(opt.label)) {
//         finalOptions.push(opt);
//         seenLabels.add(opt.label);
//       }
//     }

//     return finalOptions.sort((a, b) => a.label.localeCompare(b.label));
//   }, [isAdmin, allInventoryItems, equipmentItems, skuLeftMap]);

//   // Admin user options from Redux users list
//   const userOptions = useMemo(() => {
//     if (!isAdmin) return [];
//     const arr = Array.isArray(allUsers) ? allUsers : [];
//     // Only include non-admin users for assignment (e.g., userType === 'User')
//     // This prevents admin accounts from appearing in the assignment dropdown.
//     const filtered = arr.filter((u) => {
//       const t = (u.userType || "").toLowerCase();
//       return t === "user"; // only include end-users for assignment
//     });
//     return [...filtered].sort((a, b) =>
//       (a.userId || "").localeCompare(b.userId || ""),
//     );
//   }, [isAdmin, allUsers]);

//   // =============== Handlers ===============

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({ ...p, [name]: value }));
//   };

//   useEffect(() => {
//     if (selectedSerials.length > 0) {
//       setFormData((prev) => ({
//         ...prev,
//         quantityUsed: selectedSerials.length,
//       }));
//     }
//   }, [selectedSerials]);

//   const handleSerialToggle = (serial) => {
//     setSelectedSerials((prev) => {
//       const isSelected = prev.includes(serial);

//       const nextSelected = isSelected
//         ? prev.filter((s) => s !== serial)
//         : [...prev, serial];

//       setSerialLocationMap((prevMap) => {
//         const nextMap = { ...prevMap };

//         if (isSelected) {
//           delete nextMap[serial];
//         } else {
//           // use current global location as default, if selected
//           nextMap[serial] = formData.location || "";
//         }

//         return nextMap;
//       });

//       return nextSelected;
//     });
//   };

//   const handleSerialLocationChange = (serial, location) => {
//     setSerialLocationMap((prev) => ({
//       ...prev,
//       [serial]: location,
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // serial
//     if (!formData.skuName || !formData.userId) {
//       Swal.fire({ icon: "warning", title: "Missing fields" });
//       return;
//     }

//     // 1. Robust SKU Parsing
//     const rawSku = formData.skuName || "";
//     let skuName = rawSku;
//     let skuType = "sku"; // default
//     let matchedEquipmentId = null;

//     if (rawSku.startsWith("eq:")) {
//       skuType = "equipment";
//       matchedEquipmentId = rawSku.slice(3);

//       // Attempt to find the equipment in the loaded list
//       const eq = equipmentItems.find(
//         (e) => (e._id || e.equipmentId) === matchedEquipmentId,
//       );

//       // FALLBACK: If we can't find the object, we can't reliably get the name.
//       // We must alert the user instead of sending empty data.
//       if (eq && eq.equipmentName) {
//         skuName = eq.equipmentName;
//       } else {
//         Swal.fire({
//           icon: "error",
//           title: "Selection Error",
//           text: "Could not identify the equipment name for the selected item. Please refresh and try again.",
//         });
//         return;
//       }
//     } else if (rawSku.startsWith("sku:")) {
//       skuType = "sku";
//       skuName = rawSku.slice(4);
//     }
//     // If it doesn't start with eq: or sku:, it's a simple string (Non-Admin case),
//     // so skuName = rawSku is already correct.
//     // 2. Prepare serial-wise location map
//     const selectedSerialLocationMap = selectedSerials.reduce((acc, serial) => {
//       acc[serial] = (serialLocationMap[serial] || "").trim();
//       return acc;
//     }, {});

//     const missingLocationSerials = selectedSerials.filter(
//       (serial) => !selectedSerialLocationMap[serial],
//     );

//     if (selectedSerials.length > 0 && missingLocationSerials.length > 0) {
//       Swal.fire({
//         icon: "warning",
//         title: "Location missing",
//         text: `Please select location for serial(s): ${missingLocationSerials.join(", ")}`,
//         confirmButtonColor: "#DC6D18",
//       });
//       return;
//     }

//     // 3. Prepare Payload
//     const payload = {
//       skuName: skuName?.trim(),
//       userId: (isAdmin ? formData.userId : userInfo?.userId)?.trim(),

//       quantityUsed:
//         selectedSerials.length > 0
//           ? selectedSerials.length
//           : Number(formData.quantityUsed),

//       // kept for old fallback / non-serial assignment
//       location: formData.location,

//       notes: formData.notes?.trim(),
//       installationDate: formData.installationDate || undefined,
//       expiryDate: formData.expiryDate || undefined,
//       refDue: formData.refDue || undefined,

//       serialNumbers: selectedSerials.length > 0 ? selectedSerials : undefined,

//       // new field for per-serial location
//       serialLocationMap:
//         selectedSerials.length > 0 ? selectedSerialLocationMap : undefined,
//     };

//     // 3. Validation
//     if (!payload.skuName || !payload.userId || !payload.quantityUsed) {
//       Swal.fire({
//         icon: "warning",
//         title: "Missing fields",
//         text: `Please fill all required fields. Missing: ${!payload.skuName ? "Inventory Item" : ""} ${!payload.userId ? "User" : ""}`,
//       });
//       return;
//     }

//     if (payload.quantityUsed < 1) {
//       Swal.fire({
//         icon: "warning",
//         title: "Invalid quantity",
//         text: "Quantity must be at least 1",
//       });
//       return;
//     }

//     // Debugging: Check console to see exactly what is being sent
//     console.log("Submitting Payload:", payload);

//     // 4. Optimistic Update & Dispatch
//     const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

//     // ... existing optimistic logic ...
//     const optimisticItem = {
//       _tempId: tempId,
//       userId: payload.userId,
//       username: payload.userId,
//       companyName:
//         (isAdmin
//           ? userOptions.find((u) => u.userId === payload.userId)?.companyName ||
//             ""
//           : userInfo?.companyName) || "",
//       skuName: payload.skuName,
//       location:
//         selectedSerials.length > 0
//           ? Object.values(selectedSerialLocationMap).filter(Boolean).join(", ")
//           : payload.location || "",
//       totalUsed: payload.quantityUsed,
//       lastUsedAt: new Date().toISOString(),
//     };

//     try {
//       window.dispatchEvent(
//         new CustomEvent("inventory:optimisticAdd", { detail: optimisticItem }),
//       );

//       // ✅ 5. DISPATCH & RESET (Manual Reset Logic Added Here)
//       dispatch(assignEquipment(payload))
//         .unwrap()
//         .then((res) => {
//           // Notify Optimistic Update Confirmed
//           const usage = res?.usage || res;
//           window.dispatchEvent(
//             new CustomEvent("inventory:confirmAdd", {
//               detail: { tempId, usage },
//             }),
//           );

//           // ✅ SUCCESS ALERT
//           Swal.fire({
//             icon: "success",
//             title: "Assignment Successful",
//             text: `${payload.skuName}: ${payload.quantityUsed} units assigned to ${payload.userId}`,
//             timer: 1500,
//             showConfirmButton: false,
//           });

//           // ✅ RESET FORM FIELDS
//           setFormData({
//             skuName: "",
//             userId: isAdmin ? "" : userInfo?.userId || "",
//             quantityUsed: "",
//             location: "",
//             notes: "",
//             installationDate: "",
//             expiryDate: "",
//             refDue: "",
//           });
//           setSelectedSerials([]);
//           setSerialLocationMap({});

//           // ✅ REFRESH LISTS
//           dispatch(resetInventoryState());
//           if (isAdmin) {
//             dispatch(getEquipments());
//             dispatch(fetchInventory()); // Also refresh inventory to see stock reduction
//           }
//         })
//         .catch((err) => {
//           console.error("Submission Failed:", err);
//           window.dispatchEvent(
//             new CustomEvent("inventory:rollbackAdd", { detail: { tempId } }),
//           );
//         });
//     } catch (err) {
//       console.error("Optimistic add failed", err);
//       window.dispatchEvent(
//         new CustomEvent("inventory:rollbackAdd", { detail: { tempId } }),
//       );
//     }
//   };
//   // catch (err) {
//   //   console.error('Optimistic add failed', err);
//   //   window.dispatchEvent(new CustomEvent('inventory:rollbackAdd', { detail: { tempId } }));
//   // }

//   // =============== UI ===============

//   // const skuLoading = isAdmin ? listLoading : userSkuLoading;
//   // const skuError = isAdmin ? null : userSkuError;
//   // const skuOptions = isAdmin ? adminSkuOptions : userSkuOptions;
//   const skuLoading = isAdmin ? listLoading : userSkuLoading;
//   const skuError = isAdmin ? null : userSkuError;
//   const skuOptions = isAdmin ? adminSkuOptions : userSkuOptions;

//   // Fetch location options based on selected user
//   useEffect(() => {
//     const fetchUserLocations = async () => {
//       if (!selectedUserId) {
//         setLocationOptions([]);
//         setSerialLocationMap({});
//         return;
//       }

//       try {
//         setLocationLoading(true);

//         // Find the selected user in allUsers to get their equipment locations
//         const selectedUser = allUsers.find((u) => u.userId === selectedUserId);

//         console.log("Selected User ID:", selectedUserId);
//         console.log("Selected User:", selectedUser);
//         console.log("Equipment Locations:", selectedUser?.equipmentLocations);

//         if (
//           selectedUser &&
//           selectedUser.equipmentLocations &&
//           selectedUser.equipmentLocations.length > 0
//         ) {
//           setLocationOptions(selectedUser.equipmentLocations);
//           console.log(
//             "Setting location options:",
//             selectedUser.equipmentLocations,
//           );
//         } else {
//           console.log("No equipment locations found for user");
//           setLocationOptions([]);
//         }
//       } catch (e) {
//         console.error("Error fetching locations:", e);
//         setLocationOptions([]);
//       } finally {
//         setLocationLoading(false);
//       }
//     };

//     fetchUserLocations();
//   }, [selectedUserId, allUsers]);

//   return (
//     <div className="w-full max-w-4xl mx-auto">
//       <h2 className="text-3xl font-bold text-center text-[#DC6D18] mb-10">
//         Assign Inventory Usage
//       </h2>

//       <form className="space-y-10" onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
//           {/* Select Inventory (Dropdown) - moved to be first field */}
//           <div className="relative flex items-center">
//             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Select Inventory
//             </span>
//             <select
//               name="skuName"
//               value={formData.skuName}
//               onChange={handleChange}
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//               disabled={skuLoading}
//             >
//               <option value="">
//                 {skuLoading
//                   ? "Loading inventory…"
//                   : skuError
//                     ? "Failed to load inventory"
//                     : "Select inventory"}
//               </option>
//               {!skuLoading &&
//                 !skuError &&
//                 skuOptions.map((opt) =>
//                   typeof opt === "string" ? (
//                     <option key={opt} value={opt}>
//                       {opt}
//                     </option>
//                   ) : (
//                     <option key={opt.value} value={opt.value}>
//                       {opt.label}
//                     </option>
//                   ),
//                 )}
//             </select>
//           </div>

//           {/* User Name */}
//           <div className="relative flex items-center">
//             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               {isAdmin ? "User (userId - company)" : "Your User ID"}
//             </span>

//             {isAdmin ? (
//               <select
//                 name="userId"
//                 value={formData.userId}
//                 onChange={handleChange}
//                 className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//                 required
//                 disabled={usersLoading}
//               >
//                 <option value="">
//                   {usersLoading ? "Loading users…" : "Select user"}
//                 </option>
//                 {userOptions.map((u) => (
//                   <option key={u._id} value={u.userId}>
//                     {u.userId} - {u.companyName}
//                   </option>
//                 ))}
//               </select>
//             ) : (
//               <select
//                 name="userId"
//                 value={formData.userId}
//                 onChange={handleChange}
//                 className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//                 required
//                 disabled
//               >
//                 <option value={formData.userId}>
//                   {formData.userId || "—"}
//                 </option>
//               </select>
//             )}
//           </div>

//           {/* ✅ Serial Selection UI */}
//           {isAdmin && (
//             <div className="relative md:col-span-2">
//               {availableSerials.length > 0 && (
//                 <div className="md:col-span-2 relative">
//                   <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
//                     Select Serial Numbers & Location
//                   </span>

//                   <div className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl p-4 bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md">
//                     <div className="grid grid-cols-1 gap-3">
//                       {availableSerials.map((serial) => {
//                         const checked = selectedSerials.includes(serial);

//                         return (
//                           <div
//                             key={serial}
//                             className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center bg-white/60 rounded-lg p-3 border border-orange-100"
//                           >
//                             <label className="flex items-center gap-3 text-sm font-medium text-gray-800">
//                               <input
//                                 type="checkbox"
//                                 checked={checked}
//                                 onChange={() => handleSerialToggle(serial)}
//                                 className="w-4 h-4 accent-[#DC6D18]"
//                               />
//                               <span>{serial}</span>
//                             </label>

//                             <div className="md:col-span-2">
//                               <select
//                                 value={serialLocationMap[serial] || ""}
//                                 onChange={(e) =>
//                                   handleSerialLocationChange(
//                                     serial,
//                                     e.target.value,
//                                   )
//                                 }
//                                 disabled={!checked}
//                                 className="w-full border border-orange-300 rounded-lg py-2 px-3 bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//                               >
//                                 <option value="">
//                                   {checked
//                                     ? "Select location for this serial"
//                                     : "Select serial first"}
//                                 </option>

//                                 {locationOptions.map((loc) => (
//                                   <option key={loc} value={loc}>
//                                     {loc}
//                                   </option>
//                                 ))}
//                               </select>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Quantity Used */}
//           <div className="relative flex items-center">
//             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Quantity Used
//             </span>
//             <input
//               type="number"
//               name="quantityUsed"
//               value={formData.quantityUsed}
//               onChange={(e) =>
//                 setFormData({ ...formData, quantityUsed: e.target.value })
//               }
//               readOnly={selectedSerials.length > 0}
//               className={`w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 ${selectedSerials.length > 0 ? "bg-gray-100 cursor-not-allowed" : ""}`}
//               required
//             />
//           </div>

//           {/* Date removed: server will timestamp assignments */}

//           {/* Installation Date (moved from Add Equipment) */}
//           <div className="relative flex items-center">
//             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Installation Date
//             </span>
//             <input
//               type="date"
//               name="installationDate"
//               value={formData.installationDate}
//               onChange={handleChange}
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//             />
//           </div>

//           {/* Expiry Date (moved from Add Equipment) */}
//           <div className="relative flex items-center">
//             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Expiry Date
//             </span>
//             <input
//               type="date"
//               name="expiryDate"
//               value={formData.expiryDate}
//               onChange={handleChange}
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//             />
//           </div>

//           {/* REF Due (moved from Add Equipment) */}
//           <div className="relative flex items-center">
//             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               REF Due
//             </span>
//             <input
//               type="date"
//               name="refDue"
//               value={formData.refDue}
//               onChange={handleChange}
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//             />
//           </div>

//           {/* Location */}
//           <div className="relative flex items-center">
//             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Location
//             </span>
//             <select
//               name="location"
//               value={formData.location}
//               onChange={handleChange}
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               disabled={locationLoading || locationOptions.length === 0}
//             >
//               <option value="">
//                 {locationLoading
//                   ? "Loading locations…"
//                   : locationOptions.length === 0
//                     ? "No locations available"
//                     : "Select location"}
//               </option>
//               {!locationLoading &&
//                 locationOptions.map((loc) => (
//                   <option key={loc} value={loc}>
//                     {loc}
//                   </option>
//                 ))}
//             </select>
//           </div>

//           {/* Notes */}
//           <div className="relative flex items-center md:col-span-2">
//             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Optional Notes
//             </span>
//             <textarea
//               name="notes"
//               value={formData.notes}
//               onChange={handleChange}
//               placeholder="e.g., For project X, afternoon shift."
//               rows="3"
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//             />
//           </div>
//         </div>

//         <div className="flex justify-center mt-8">
//           <button
//             type="submit"
//             disabled={usageLoading || skuLoading || (isAdmin && usersLoading)}
//             className="px-8 py-3 bg-[#DC6D18] text-[#FFF7ED] rounded-lg font-semibold shadow-md hover:bg-[#B85B14] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC6D18] transition-all duration-200 ease-in-out disabled:opacity-60"
//           >
//             {usageLoading ? "Assigning…" : "Assign"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default UseInventory;








// src/pages/UseInventory/UseInventory.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  resetInventoryState,
  fetchInventory,
} from "../../redux/features/inventory/inventorySlice";
import {
  assignEquipment,
  getEquipments,
} from "../../redux/features/equipment/equipmentSlice";
import { getAllUsers } from "../../redux/features/users/userSlice";
import { API_URL } from "../../../utils/apiConfig";

function UseInventory() {
  const dispatch = useDispatch();

  const {
    items: allInventoryItems = [],
    loading: listLoading,
  } = useSelector((s) => s.inventory || {});

  const {
    allUsers = [],
    loading: usersLoading,
    error: usersError,
    userInfo,
  } = useSelector((s) => s.users || {});

  const {
    list: equipmentList = [],
    loading: assignLoading,
  } = useSelector((s) => s.equipment || {});

  const role = (userInfo?.userType || "").toLowerCase();
  const isAdmin =
    role === "admin" || role === "super admin" || role === "technician";

  const authToken = userInfo?.token || localStorage.getItem("token");

  const [formData, setFormData] = useState({
    skuName: "",
    userId: "",
    quantityUsed: "",
    installationDate: "",
    expiryDate: "",
    refDue: "",
    notes: "",
  });

  const selectedUserId = isAdmin ? formData.userId : userInfo?.userId || "";

  const [availableSerials, setAvailableSerials] = useState([]);
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [serialLocationMap, setSerialLocationMap] = useState({});

  const [userSkuOptions, setUserSkuOptions] = useState([]);
  const [userSkuLoading, setUserSkuLoading] = useState(false);
  const [userSkuError, setUserSkuError] = useState(null);

  const [locationOptions, setLocationOptions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);

  const [skuLeftMap, setSkuLeftMap] = useState({});

  // Fetch inventory summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`${API_URL}/api/inventory/summary`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch summary");
        }

        const map = {};
        (Array.isArray(data) ? data : []).forEach((r) => {
          if (r?.skuName) {
            map[r.skuName] = Number(r.left) || 0;
          }
        });

        setSkuLeftMap(map);
      } catch (e) {
        console.warn("Could not load inventory summary", e.message || e);
      }
    };

    fetchSummary();
  }, [authToken]);

  // Set userId for non-admin users
  useEffect(() => {
    if (!isAdmin && userInfo?.userId) {
      setFormData((p) => ({ ...p, userId: userInfo.userId }));
    }
  }, [isAdmin, userInfo?.userId]);

  // Admin fetch users, inventory, equipment
  useEffect(() => {
    if (isAdmin) {
      if (!allUsers || allUsers.length === 0) {
        dispatch(getAllUsers());
      }

      dispatch(fetchInventory());
      dispatch(getEquipments());
    }
  }, [dispatch, isAdmin, allUsers?.length]);

  // Non-admin fetch inventory SKUs
  useEffect(() => {
    const fetchUserSkus = async () => {
      if (isAdmin) return;
      if (!userInfo?.userId) return;

      try {
        setUserSkuLoading(true);
        setUserSkuError(null);

        const res = await fetch(`${API_URL}/api/inventory`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load inventory");
        }

        const uniqueSkus = Array.from(
          new Set(
            (Array.isArray(data) ? data : [])
              .map((it) => it.skuName)
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b));

        const filtered = uniqueSkus.filter(
          (name) => skuLeftMap[name] === undefined || Number(skuLeftMap[name]) > 0
        );

        setUserSkuOptions(filtered);
      } catch (e) {
        setUserSkuError(e.message || "Failed to load SKUs");
      } finally {
        setUserSkuLoading(false);
      }
    };

    fetchUserSkus();
  }, [authToken, isAdmin, userInfo?.userId, skuLeftMap]);

  useEffect(() => {
    if (usersError) {
      Swal.fire({
        icon: "warning",
        title: "Could not load users",
        text: usersError,
      });
    }
  }, [usersError]);

  // Find available serials when SKU changes
  useEffect(() => {
    const rawVal = formData.skuName;

    if (!rawVal) {
      setAvailableSerials([]);
      setSelectedSerials([]);
      setSerialLocationMap({});
      return;
    }

    let targetName = rawVal;

    if (rawVal.startsWith("eq:")) {
      const id = rawVal.slice(3);
      const eq = equipmentList.find(
        (e) => e._id === id || e.equipmentId === id
      );
      if (eq) targetName = eq.equipmentName;
    } else if (rawVal.startsWith("sku:")) {
      targetName = rawVal.slice(4);
    }

    if (!targetName) {
      setAvailableSerials([]);
      setSelectedSerials([]);
      setSerialLocationMap({});
      return;
    }

    const serials = equipmentList
      .filter((eq) => eq.equipmentName === targetName)
      .filter((eq) => !eq.userId && eq.serialNumber)
      .map((eq) => eq.serialNumber)
      .sort();

    setAvailableSerials(serials);
    setSelectedSerials([]);
    setSerialLocationMap({});
    setFormData((prev) => ({ ...prev, quantityUsed: "" }));
  }, [formData.skuName, equipmentList]);

  // Auto update quantity from selected serial count
  useEffect(() => {
    if (selectedSerials.length > 0) {
      setFormData((prev) => ({
        ...prev,
        quantityUsed: selectedSerials.length,
      }));
    }
  }, [selectedSerials]);

  // Admin SKU options
  const adminSkuOptions = useMemo(() => {
    if (!isAdmin) return [];

    const uniqueSkuMap = new Map();

    (allInventoryItems || []).forEach((item) => {
      if (item?.skuName && !uniqueSkuMap.has(item.skuName)) {
        uniqueSkuMap.set(item.skuName, item);
      }
    });

    const skuOptions = Array.from(uniqueSkuMap.keys())
      .filter(
        (name) => skuLeftMap[name] === undefined || Number(skuLeftMap[name]) > 0
      )
      .map((name) => ({
        type: "sku",
        label: name,
        value: `sku:${name}`,
        skuName: name,
      }));

    const uniqueEquipmentMap = new Map();

    (equipmentList || [])
      .filter((eq) => !eq.userId)
      .forEach((eq) => {
        if (eq?.equipmentName && !uniqueEquipmentMap.has(eq.equipmentName)) {
          uniqueEquipmentMap.set(eq.equipmentName, eq);
        }
      });

    const equipmentOptions = Array.from(uniqueEquipmentMap.values()).map(
      (eq) => ({
        type: "equipment",
        label: eq.equipmentName,
        value: `eq:${eq._id}`,
        equipmentId: eq._id,
        equipmentName: eq.equipmentName,
      })
    );

    const finalOptions = [];
    const seenLabels = new Set();

    [...skuOptions, ...equipmentOptions].forEach((option) => {
      if (option.label && !seenLabels.has(option.label)) {
        finalOptions.push(option);
        seenLabels.add(option.label);
      }
    });

    return finalOptions.sort((a, b) => a.label.localeCompare(b.label));
  }, [isAdmin, allInventoryItems, equipmentList, skuLeftMap]);

  // Admin user options
  const userOptions = useMemo(() => {
    if (!isAdmin) return [];

    return [...(Array.isArray(allUsers) ? allUsers : [])]
      .filter((user) => (user.userType || "").toLowerCase() === "user")
      .sort((a, b) => (a.userId || "").localeCompare(b.userId || ""));
  }, [isAdmin, allUsers]);

  const skuLoading = isAdmin ? listLoading : userSkuLoading;
  const skuError = isAdmin ? null : userSkuError;
  const skuOptions = isAdmin ? adminSkuOptions : userSkuOptions;

  // Fetch selected user's predefined equipment locations
  useEffect(() => {
    const fetchUserLocations = async () => {
      if (!selectedUserId) {
        setLocationOptions([]);
        setSerialLocationMap({});
        return;
      }

      try {
        setLocationLoading(true);

        const selectedUser = allUsers.find(
          (user) => user.userId === selectedUserId
        );

        if (
          selectedUser &&
          Array.isArray(selectedUser.equipmentLocations) &&
          selectedUser.equipmentLocations.length > 0
        ) {
          setLocationOptions(
            selectedUser.equipmentLocations
              .map((loc) => String(loc || "").trim())
              .filter(Boolean)
          );
        } else {
          setLocationOptions([]);
        }

        setSerialLocationMap({});
      } catch (e) {
        console.error("Error fetching locations:", e);
        setLocationOptions([]);
        setSerialLocationMap({});
      } finally {
        setLocationLoading(false);
      }
    };

    fetchUserLocations();
  }, [selectedUserId, allUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "userId") {
      setSelectedSerials([]);
      setSerialLocationMap({});
    }
  };

  const handleSerialToggle = (serial) => {
    setSelectedSerials((prev) => {
      const isAlreadySelected = prev.includes(serial);

      const nextSelected = isAlreadySelected
        ? prev.filter((item) => item !== serial)
        : [...prev, serial];

      setSerialLocationMap((prevMap) => {
        const nextMap = { ...prevMap };

        if (isAlreadySelected) {
          delete nextMap[serial];
        } else {
          nextMap[serial] = "";
        }

        return nextMap;
      });

      return nextSelected;
    });
  };

  const handleSerialLocationChange = (serial, location) => {
    setSerialLocationMap((prev) => ({
      ...prev,
      [serial]: location,
    }));
  };

  const parseSelectedSkuName = () => {
    const rawSku = formData.skuName || "";

    if (rawSku.startsWith("eq:")) {
      const id = rawSku.slice(3);
      const eq = equipmentList.find(
        (item) => (item._id || item.equipmentId) === id
      );

      if (!eq?.equipmentName) {
        throw new Error(
          "Could not identify the equipment name for the selected item. Please refresh and try again."
        );
      }

      return eq.equipmentName;
    }

    if (rawSku.startsWith("sku:")) {
      return rawSku.slice(4);
    }

    return rawSku;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.skuName) {
      Swal.fire({
        icon: "warning",
        title: "Missing inventory",
        text: "Please select an inventory item.",
        confirmButtonColor: "#DC6D18",
      });
      return;
    }

    const finalUserId = isAdmin ? formData.userId : userInfo?.userId || "";

    if (!finalUserId) {
      Swal.fire({
        icon: "warning",
        title: "Missing user",
        text: "Please select a user.",
        confirmButtonColor: "#DC6D18",
      });
      return;
    }

    let skuName = "";

    try {
      skuName = parseSelectedSkuName();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Selection Error",
        text: err.message,
        confirmButtonColor: "#DC6D18",
      });
      return;
    }

    if (availableSerials.length > 0 && selectedSerials.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Select serial number",
        text: "Please select at least one serial number.",
        confirmButtonColor: "#DC6D18",
      });
      return;
    }

    const selectedSerialLocationMap = selectedSerials.reduce((acc, serial) => {
      acc[serial] = String(serialLocationMap[serial] || "").trim();
      return acc;
    }, {});

    const missingLocationSerials = selectedSerials.filter(
      (serial) => !selectedSerialLocationMap[serial]
    );

    if (missingLocationSerials.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Location missing",
        text: `Please select location for serial(s): ${missingLocationSerials.join(
          ", "
        )}`,
        confirmButtonColor: "#DC6D18",
      });
      return;
    }

    const quantityUsed =
      selectedSerials.length > 0
        ? selectedSerials.length
        : Number(formData.quantityUsed);

    if (!quantityUsed || quantityUsed < 1) {
      Swal.fire({
        icon: "warning",
        title: "Invalid quantity",
        text: "Quantity must be at least 1.",
        confirmButtonColor: "#DC6D18",
      });
      return;
    }

    const payload = {
      skuName: skuName.trim(),
      userId: String(finalUserId).trim(),
      quantityUsed,
      location: "",
      notes: formData.notes?.trim() || "",
      installationDate: formData.installationDate || undefined,
      expiryDate: formData.expiryDate || undefined,
      refDue: formData.refDue || undefined,
      serialNumbers: selectedSerials.length > 0 ? selectedSerials : undefined,
      serialLocationMap:
        selectedSerials.length > 0 ? selectedSerialLocationMap : undefined,
    };

    console.log("Submitting Payload:", payload);

    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const optimisticItem = {
      _tempId: tempId,
      userId: payload.userId,
      username: payload.userId,
      companyName:
        (isAdmin
          ? userOptions.find((u) => u.userId === payload.userId)?.companyName ||
            ""
          : userInfo?.companyName) || "",
      skuName: payload.skuName,
      location:
        selectedSerials.length > 0
          ? Object.values(selectedSerialLocationMap).filter(Boolean).join(", ")
          : "",
      totalUsed: payload.quantityUsed,
      lastUsedAt: new Date().toISOString(),
    };

    window.dispatchEvent(
      new CustomEvent("inventory:optimisticAdd", {
        detail: optimisticItem,
      })
    );

    dispatch(assignEquipment(payload))
      .unwrap()
      .then((res) => {
        const usage = res?.usage || res;

        window.dispatchEvent(
          new CustomEvent("inventory:confirmAdd", {
            detail: { tempId, usage },
          })
        );

        Swal.fire({
          icon: "success",
          title: "Assignment Successful",
          text: `${payload.skuName}: ${payload.quantityUsed} unit(s) assigned to ${payload.userId}`,
          timer: 1500,
          showConfirmButton: false,
        });

        setFormData({
          skuName: "",
          userId: isAdmin ? "" : userInfo?.userId || "",
          quantityUsed: "",
          notes: "",
          installationDate: "",
          expiryDate: "",
          refDue: "",
        });

        setAvailableSerials([]);
        setSelectedSerials([]);
        setSerialLocationMap({});
        setLocationOptions([]);

        dispatch(resetInventoryState());

        if (isAdmin) {
          dispatch(getEquipments());
          dispatch(fetchInventory());
        }
      })
      .catch((err) => {
        console.error("Submission Failed:", err);

        window.dispatchEvent(
          new CustomEvent("inventory:rollbackAdd", {
            detail: { tempId },
          })
        );

        Swal.fire({
          icon: "error",
          title: "Assignment failed",
          text:
            typeof err === "string"
              ? err
              : err?.message || "Could not assign inventory.",
          confirmButtonColor: "#DC6D18",
        });
      });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-[#DC6D18] mb-10">
        Assign Inventory Usage
      </h2>

      <form className="space-y-10" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
          {/* Select Inventory */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Select Inventory
            </span>

            <select
              name="skuName"
              value={formData.skuName}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
              disabled={skuLoading}
            >
              <option value="">
                {skuLoading
                  ? "Loading inventory…"
                  : skuError
                  ? "Failed to load inventory"
                  : "Select inventory"}
              </option>

              {!skuLoading &&
                !skuError &&
                skuOptions.map((opt) =>
                  typeof opt === "string" ? (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ) : (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  )
                )}
            </select>
          </div>

          {/* User */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
              {isAdmin ? "User (userId - company)" : "Your User ID"}
            </span>

            {isAdmin ? (
              <select
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                required
                disabled={usersLoading}
              >
                <option value="">
                  {usersLoading ? "Loading users…" : "Select user"}
                </option>

                {userOptions.map((user) => (
                  <option key={user._id || user.userId} value={user.userId}>
                    {user.userId} - {user.companyName}
                  </option>
                ))}
              </select>
            ) : (
              <select
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                required
                disabled
              >
                <option value={formData.userId}>
                  {formData.userId || "—"}
                </option>
              </select>
            )}
          </div>

          {/* Serial-wise Location */}
          {isAdmin && availableSerials.length > 0 && (
            <div className="relative md:col-span-2">
              <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
                Select Serial Numbers & Location
              </span>

              <div className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl p-4 bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md">
                {locationLoading ? (
                  <div className="text-sm text-gray-500">
                    Loading locations…
                  </div>
                ) : locationOptions.length === 0 ? (
                  <div className="text-sm text-red-600 font-medium">
                    No predefined locations found for this user. Add equipment
                    locations in Manage Users first.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {availableSerials.map((serial) => {
                      const checked = selectedSerials.includes(serial);

                      return (
                        <div
                          key={serial}
                          className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center bg-white/60 rounded-lg p-3 border border-orange-100"
                        >
                          <label className="flex items-center gap-3 text-sm font-medium text-gray-800">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleSerialToggle(serial)}
                              className="w-4 h-4 accent-[#DC6D18]"
                            />
                            <span>{serial}</span>
                          </label>

                          <div className="md:col-span-2">
                            <select
                              value={serialLocationMap[serial] || ""}
                              onChange={(e) =>
                                handleSerialLocationChange(
                                  serial,
                                  e.target.value
                                )
                              }
                              disabled={!checked}
                              className="w-full border border-orange-300 rounded-lg py-2 px-3 bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                            >
                              <option value="">
                                {checked
                                  ? "Select location for this serial"
                                  : "Select serial first"}
                              </option>

                              {locationOptions.map((loc) => (
                                <option key={loc} value={loc}>
                                  {loc}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quantity Used */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Quantity Used
            </span>

            <input
              type="number"
              name="quantityUsed"
              value={formData.quantityUsed}
              onChange={handleChange}
              readOnly={selectedSerials.length > 0}
              className={`w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18] ${
                selectedSerials.length > 0
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
              required
            />
          </div>

          {/* Installation Date */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Installation Date
            </span>

            <input
              type="date"
              name="installationDate"
              value={formData.installationDate}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            />
          </div>

          {/* Expiry Date */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Expiry Date
            </span>

            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            />
          </div>

          {/* REF Due */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
              REF Due
            </span>

            <input
              type="date"
              name="refDue"
              value={formData.refDue}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            />
          </div>

          {/* Notes */}
          <div className="relative flex items-center md:col-span-2">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Optional Notes
            </span>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g., For project X, afternoon shift."
              rows="3"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            />
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={assignLoading || skuLoading || (isAdmin && usersLoading)}
            className="px-8 py-3 bg-[#DC6D18] text-[#FFF7ED] rounded-lg font-semibold shadow-md hover:bg-[#B85B14] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC6D18] transition-all duration-200 ease-in-out disabled:opacity-60"
          >
            {assignLoading ? "Assigning…" : "Assign"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UseInventory;
