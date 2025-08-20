// // src/components/Inventory/RequestInventory.jsx
// import React, { useEffect, useState } from "react";
// import Swal from "sweetalert2";
// import { useSelector } from "react-redux";
// import { API_URL } from "../../../utils/apiConfig";

// /** ---------- Config: update these if your backend differs ---------- */
// const INVENTORY_BASE = `${API_URL}/api/inventory`; // GET list of added inventory (for dropdown)
// const REQUESTS_BASE = `${API_URL}/api/requests`;   // POST to create a request
// /** ------------------------------------------------------------------ */

// const getAuthHeader = (userInfo) => {
//   const token =
//     userInfo?.token ||
//     userInfo?.accessToken ||
//     localStorage.getItem("token");
//   return token ? { Authorization: `Bearer ${token}` } : {};
// };

// function RequestInventory() {
//   const { userInfo } = useSelector((s) => s.users || {});
//   const [inventory, setInventory] = useState([]);
//   const [loadingInv, setLoadingInv] = useState(false);
//   const [errorInv, setErrorInv] = useState("");

//   const [formData, setFormData] = useState({
//     skuName: "",          // selected from dropdown
//     requiredQuantity: "",
//     userName: userInfo?.name || userInfo?.userName || "", // prefills
//     date: "",             // required date
//     reason: "",
//   });

//   // Load inventory items for dropdown
//   useEffect(() => {
//     (async () => {
//       setLoadingInv(true);
//       setErrorInv("");
//       try {
//         const res = await fetch(INVENTORY_BASE, {
//           headers: { ...getAuthHeader(userInfo) },
//         });
//         if (!res.ok) {
//           const text = await res.text();
//           throw new Error(text || "Failed to load inventory list");
//         }
//         const data = await res.json();
//         const items = Array.isArray(data) ? data : data?.items || [];
//         // Normalize expected fields
//         const normalized = items.map((i) => ({
//           id: i._id || i.id,
//           sku: i.sku || i.code || i.skuCode,
//           name: i.skuName || i.name || i.title || i.sku, // fallback order
//         }));
//         setInventory(normalized);
//       } catch (e) {
//         setErrorInv(e.message || "Failed to load inventory list");
//       } finally {
//         setLoadingInv(false);
//       }
//     })();
//   }, [userInfo]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.skuName) {
//       Swal.fire({ icon: "warning", text: "Please select a SKU." });
//       return;
//     }
//     if (!formData.requiredQuantity || Number(formData.requiredQuantity) <= 0) {
//       Swal.fire({ icon: "warning", text: "Quantity must be at least 1." });
//       return;
//     }
//     if (!formData.date) {
//       Swal.fire({ icon: "warning", text: "Please choose a date required." });
//       return;
//     }

//     try {
//       const payload = {
//         skuName: formData.skuName,
//         quantity: Number(formData.requiredQuantity),
//         userName: formData.userName || userInfo?.name || userInfo?.userName,
//         requestedAt: formData.date, // backend may map to requestedAt/date
//         reason: formData.reason,
//         status: "Pending", // default on server ideally, but we set for safety
//       };

//       const res = await fetch(REQUESTS_BASE, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...getAuthHeader(userInfo),
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || "Failed to submit inventory request");
//       }

//       Swal.fire({
//         icon: "success",
//         title: "Request submitted",
//         text: `Request for ${payload.quantity} of ${payload.skuName} submitted!`,
//         timer: 1600,
//         showConfirmButton: false,
//       });

//       setFormData({
//         skuName: "",
//         requiredQuantity: "",
//         userName: userInfo?.name || userInfo?.userName || "",
//         date: "",
//         reason: "",
//       });
//     } catch (e) {
//       Swal.fire({
//         icon: "error",
//         title: "Submission failed",
//         text: e.message,
//       });
//     }
//   };

//   return (
//     <div className="w-full max-w-4xl mx-auto">
//       <h2 className="text-3xl font-bold text-center text-[#DC6D18] mb-10">
//         Request Inventory
//       </h2>

//       {errorInv && (
//         <div className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
//           {errorInv.includes("Cannot GET")
//             ? "Endpoint /api/inventory not found on server. Either create the route or update INVENTORY_BASE in this file."
//             : errorInv}
//         </div>
//       )}

//       <form className="space-y-10" onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
//           {/* SKU Dropdown (from added inventory) */}
//           <div className="relative flex items-center">
//             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Select SKU
//             </span>
//             <select
//               name="skuName"
//               value={formData.skuName}
//               onChange={handleChange}
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               disabled={loadingInv}
//               required
//             >
//               <option value="">{loadingInv ? "Loading..." : "Choose SKU"}</option>
//               {inventory.map((item) => (
//                 <option key={item.id || item.name} value={item.name}>
//                   {item.name} {item.sku ? `(${item.sku})` : ""}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Required Quantity */}
//           <div className="relative flex items-center">
//             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Required Quantity
//             </span>
//             <input
//               type="number"
//               name="requiredQuantity"
//               value={formData.requiredQuantity}
//               onChange={handleChange}
//               placeholder="e.g., 25"
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//               min="1"
//             />
//           </div>

//           {/* User Name (prefilled / editable) */}
//           <div className="relative flex items-center">
//             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               User Name
//             </span>
//             <input
//               type="text"
//               name="userName"
//               value={formData.userName}
//               onChange={handleChange}
//               placeholder="e.g., Priya Kumar"
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//             />
//           </div>

//           {/* Date Required */}
//           <div className="relative flex items-center">
//             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Date Required
//             </span>
//             <input
//               type="date"
//               name="date"
//               value={formData.date}
//               onChange={handleChange}
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//               required
//             />
//           </div>

//           {/* Optional Reason */}
//           <div className="relative flex items-center md:col-span-2">
//             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
//               Optional Reason
//             </span>
//             <textarea
//               name="reason"
//               value={formData.reason}
//               onChange={handleChange}
//               placeholder="e.g., For new site deployment next month."
//               rows="3"
//               className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
//             />
//           </div>
//         </div>

//         <div className="flex justify-center mt-8">
//           <button
//             type="submit"
//             className="px-8 py-3 bg-[#DC6D18] text-[#FFF7ED] rounded-lg font-semibold shadow-md hover:bg-[#B85B14] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC6D18] transition-all duration-200 ease-in-out"
//           >
//             Submit Request
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default RequestInventory;

import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { API_URL } from "../../../utils/apiConfig";
import { getAllUsers } from "../../redux/features/users/userSlice"; 
const INVENTORY_BASE = `${API_URL}/api/inventory`; // list for dropdown
const REQUESTS_BASE = `${API_URL}/api/requests`;   // create request
/** ---------------------------- */

const getAuthHeader = (userInfo) => {
  const token =
    userInfo?.token ||
    userInfo?.accessToken ||
    localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function RequestInventory() {
  const dispatch = useDispatch();

  // Logged-in user
  const { userInfo, allUsers, loading: usersLoading } = useSelector((s) => s.users || {});
  const role = (userInfo?.userType || "").toLowerCase();
  const isAdmin = role === "admin" || role === "super admin";
  const isSuperAdmin = role === "super admin";
  const isRequesterUser = role === "user";

  const currentUserId = userInfo?._id || userInfo?.id;
  const currentDisplayName =
    userInfo?.name || userInfo?.userName || userInfo?.firstName || userInfo?.email || "User";

  // Inventory list for SKU dropdown
  const [inventory, setInventory] = useState([]);
  const [loadingInv, setLoadingInv] = useState(false);
  const [errorInv, setErrorInv] = useState("");

  // Form
  const [formData, setFormData] = useState({
    skuName: "",
    requiredQuantity: "",
    date: "",
    reason: "",
  });

  // Selected user (only for Admin/Super Admin)
  const [selectedUserId, setSelectedUserId] = useState(isRequesterUser ? currentUserId : "");

  // Normalize/all users -> only type 'user'
  const normalizedUsers = useMemo(() => {
    const raw = Array.isArray(allUsers) ? allUsers : allUsers?.users || [];
    return raw.map((u) => ({
      id: u?._id || u?.id,
      name:
        u?.name ||
        [u?.firstName, u?.lastName].filter(Boolean).join(" ") ||
        u?.userName ||
        u?.email ||
        "Unnamed",
      companyName: u?.companyName || u?.company?.name || u?.organizationName || u?.orgName || "",
      email: u?.email || "",
      role: (u?.userType || "").toLowerCase(),
    }));
  }, [allUsers]);

  const selectableUsers = useMemo(
    () => normalizedUsers.filter((u) => u.role === "user" && u.id),
    [normalizedUsers]
  );

  // Load inventory items for dropdown
  useEffect(() => {
    (async () => {
      setLoadingInv(true);
      setErrorInv("");
      try {
        const res = await fetch(INVENTORY_BASE, {
          headers: { ...getAuthHeader(userInfo) },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load inventory list");
        }
        const data = await res.json();
        const items = Array.isArray(data) ? data : data?.items || [];
        const normalized = items.map((i) => ({
          id: i._id || i.id,
          sku: i.sku || i.code || i.skuCode,
          name: i.skuName || i.name || i.title || i.sku,
        }));
        setInventory(normalized);
      } catch (e) {
        setErrorInv(e.message || "Failed to load inventory list");
      } finally {
        setLoadingInv(false);
      }
    })();
  }, [userInfo]);

  // Load users list only for Admin/Super Admin
  useEffect(() => {
    if (isAdmin) {
      dispatch(getAllUsers());
    }
  }, [dispatch, isAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.skuName) {
      Swal.fire({ icon: "warning", text: "Please select a SKU." });
      return;
    }
    if (!formData.requiredQuantity || Number(formData.requiredQuantity) <= 0) {
      Swal.fire({ icon: "warning", text: "Quantity must be at least 1." });
      return;
    }
    if (!formData.date) {
      Swal.fire({ icon: "warning", text: "Please choose a required date." });
      return;
    }
    if (isAdmin && !selectedUserId) {
      Swal.fire({ icon: "warning", text: "Please select a user to request for." });
      return;
    }

    // Resolve who the request is for
    let targetUserId = currentUserId;
    let targetUserName = currentDisplayName;

    if (isAdmin) {
      const chosen = selectableUsers.find((u) => u.id === selectedUserId);
      if (!chosen) {
        Swal.fire({ icon: "warning", text: "Selected user not found." });
        return;
      }
      targetUserId = chosen.id;
      targetUserName = chosen.name || chosen.email || "User";
    }

    try {
      const payload = {
        skuName: formData.skuName,
        quantity: Number(formData.requiredQuantity),
        userName: targetUserName,
        userId: targetUserId,
        requestedAt: formData.date,
        reason: formData.reason,
        status: "Pending",
      };

      const res = await fetch(REQUESTS_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(userInfo),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to submit inventory request");
      }

      Swal.fire({
        icon: "success",
        title: "Request submitted",
        text: `Requested ${payload.quantity} × ${payload.skuName} for ${payload.userName}`,
        timer: 1800,
      });

      setFormData({ skuName: "", requiredQuantity: "", date: "", reason: "" });
      if (isAdmin) setSelectedUserId("");
    } catch (e) {
      Swal.fire({ icon: "error", title: "Submission failed", text: e.message });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-[#DC6D18] mb-6">
        Request Inventory
      </h2>

      {errorInv && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {errorInv.includes("Cannot GET")
            ? "Endpoint /api/inventory not found on server. Either create the route or update INVENTORY_BASE in this file."
            : errorInv}
        </div>
      )}

      <form className="space-y-10" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
          {/* Admin/Super Admin: select user to request for */}
          {isAdmin && (
            <div className="relative flex items-center md:col-span-2">
              <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
                Request For (User)
              </span>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                required
                disabled={usersLoading}
              >
                <option value="">
                  {usersLoading ? "Loading users..." : "Select a user"}
                </option>
                {selectableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.companyName ? `(${u.companyName})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* SKU Dropdown */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Select SKU
            </span>
            <select
              name="skuName"
              value={formData.skuName}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              disabled={loadingInv}
              required
            >
              <option value="">{loadingInv ? "Loading..." : "Choose SKU"}</option>
              {inventory.map((item) => (
                <option key={item.id || item.name} value={item.name}>
                  {item.name} {item.sku ? `(${item.sku})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Required Quantity */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Required Quantity
            </span>
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

          {/* Date Required */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Date Required
            </span>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* Optional Reason */}
          <div className="relative flex items-center md:col-span-2">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Optional Reason
            </span>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="e.g., For new site deployment next month."
              rows="3"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            />
          </div>
        </div>

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
