// src/pages/UseInventory/UseInventory.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  logInventoryUsage,
  resetInventoryState,
  fetchInventory,
} from "../../redux/features/inventory/inventorySlice";
import { getAllUsers } from "../../redux/features/users/userSlice";
import { API_URL } from "../../../utils/apiConfig";

function UseInventory() {
  const dispatch = useDispatch();

  // Inventory slice
  const {
    usageLoading,
    usageError,
    lastUsage,
    items: allInventoryItems = [], // expects inventory list from Redux
    loading: listLoading, // loading state for listInventory
  } = useSelector((s) => s.inventory || {});

  // Users slice
  const {
    allUsers = [],
    loading: usersLoading,
    error: usersError,
    userInfo,
  } = useSelector((s) => s.users || {});

  const isAdmin =
    userInfo?.userType === "Admin" || userInfo?.userType === "Super Admin";
  const authToken = userInfo?.token || localStorage.getItem("token");

  // Local state
  const [formData, setFormData] = useState({
    skuName: "",
    userId: "",
    quantityUsed: "",
    date: "",
    notes: "",
  });
  const selectedUserId = isAdmin ? formData.userId : userInfo?.userId || "";

  // For non-admin users: user-specific SKU options
  const [userSkuOptions, setUserSkuOptions] = useState([]);
  const [userSkuLoading, setUserSkuLoading] = useState(false);
  const [userSkuError, setUserSkuError] = useState(null);

  // =============== Effects ===============

  // Initialize userId field for non-admins
  useEffect(() => {
    if (!isAdmin && userInfo?.userId) {
      setFormData((p) => ({ ...p, userId: userInfo.userId }));
    }
  }, [isAdmin, userInfo?.userId]);

  // Admin: fetch all users & all inventory (for SKU dropdown)
  useEffect(() => {
    if (isAdmin) {
      if (!allUsers || allUsers.length === 0) {
        dispatch(getAllUsers());
      }
      dispatch(fetchInventory());
    }
  }, [dispatch, isAdmin]);

  // Non-admin: fetch user-specific inventory SKUs
  useEffect(() => {
    const fetchUserSkus = async () => {
      if (isAdmin) return; // admin doesn’t need this
      if (!userInfo?.userId) return;
      try {
        setUserSkuLoading(true);
        setUserSkuError(null);

        const res = await fetch(
          `${API_URL}/api/inventory/user/${encodeURIComponent(
            userInfo.userId
          )}`,
          {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
          }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load inventory for user");
        }

        // Expecting an array of inventory records, each with a skuName
        const uniqueSkus = Array.from(
          new Set(
            (Array.isArray(data) ? data : [])
              .map((it) => it.skuName)
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b));

        setUserSkuOptions(uniqueSkus);
      } catch (e) {
        setUserSkuError(e.message || "Failed to load SKUs");
      } finally {
        setUserSkuLoading(false);
      }
    };

    fetchUserSkus();
  }, [API_URL, authToken, isAdmin, userInfo?.userId]);

  // Handle inventory usage errors
  useEffect(() => {
    if (usageError) {
      Swal.fire({
        icon: "error",
        title: "Failed to log usage",
        text: usageError,
      });
    }
  }, [usageError]);

  // Handle users fetch error
  useEffect(() => {
    if (usersError) {
      Swal.fire({
        icon: "warning",
        title: "Could not load users",
        text: usersError,
      });
    }
  }, [usersError]);

  // Success alert + reset
  useEffect(() => {
    if (lastUsage) {
      Swal.fire({
        icon: "success",
        title: "Usage Logged",
        text: `${lastUsage.skuName}: -${lastUsage.quantityUsed} by ${lastUsage.userId}`,
        timer: 1300,
        showConfirmButton: false,
      });
      setFormData({
        skuName: "",
        userId: isAdmin ? "" : userInfo?.userId || "",
        quantityUsed: "",
        date: "",
        notes: "",
      });
      dispatch(resetInventoryState());
    }
  }, [lastUsage, dispatch, isAdmin, userInfo?.userId]);

  // =============== Derived Options ===============

  // Admin SKU options from Redux inventory list
  // const adminSkuOptions = useMemo(() => {
  //   if (!isAdmin) return [];
  //   const names = (allInventoryItems || [])
  //     .map((it) => it?.skuName)
  //     .filter(Boolean);
  //   return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  // }, [isAdmin, allInventoryItems]);
  const adminSkuOptions = useMemo(() => {
    if (!isAdmin) return [];
    if (!selectedUserId) return []; // don't show SKUs until a user is chosen
    const names = (allInventoryItems || [])
      .filter((it) => (it?.userId || "").trim() === selectedUserId.trim())
      .map((it) => it?.skuName)
      .filter(Boolean);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [isAdmin, allInventoryItems, selectedUserId]);

  // Admin user options from Redux users list
  // Admin user options from Redux users list
  const userOptions = useMemo(() => {
    if (!isAdmin) return [];
    const arr = Array.isArray(allUsers) ? allUsers : [];
    // ✅ Only include users where userType is exactly 'User'
    return arr
      .filter((u) => u.userType === "User")
      .sort((a, b) => (a.userId || "").localeCompare(b.userId || ""));
  }, [isAdmin, allUsers]);

  // =============== Handlers ===============

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      skuName: formData.skuName?.trim(),
      userId: (isAdmin ? formData.userId : userInfo?.userId)?.trim(),
      quantityUsed: Number(formData.quantityUsed),
      date: formData.date,
      notes: formData.notes?.trim(),
    };

    if (
      !payload.skuName ||
      !payload.userId ||
      !payload.quantityUsed ||
      !payload.date
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Please fill all required fields",
      });
      return;
    }
    if (payload.quantityUsed < 1) {
      Swal.fire({
        icon: "warning",
        title: "Invalid quantity",
        text: "Quantity must be at least 1",
      });
      return;
    }
    dispatch(logInventoryUsage(payload));
  };

  // =============== UI ===============

  // const skuLoading = isAdmin ? listLoading : userSkuLoading;
  // const skuError = isAdmin ? null : userSkuError;
  // const skuOptions = isAdmin ? adminSkuOptions : userSkuOptions;
  const skuLoading = isAdmin ? listLoading : userSkuLoading;
  const skuError = isAdmin ? (!selectedUserId ? null : null) : userSkuError;
  const skuOptions = isAdmin ? adminSkuOptions : userSkuOptions;

  // Clear SKU when the selected user changes (admin flow)
  useEffect(() => {
    if (isAdmin) {
      setFormData((p) => ({ ...p, skuName: "" }));
    }
  }, [isAdmin, formData.userId]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-[#DC6D18] mb-10">
        Log Inventory Usage
      </h2>

      <form className="space-y-10" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
          {/* SKU Name (Dropdown) */}
        
          {/* User Name */}
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
                {userOptions.map((u) => (
                  <option key={u._id} value={u.userId}>
                    {u.userId} - {u.companyName}
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
            <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
              SKU Name
            </span>
            <select
              name="skuName"
              value={formData.skuName}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
              // disabled={skuLoading}
              disabled={skuLoading || (isAdmin && !selectedUserId)}
            >
              <option value="">
                {skuLoading
                  ? "Loading SKUs…"
                  : isAdmin && !selectedUserId
                  ? "Select a user first"
                  : skuError
                  ? "Failed to load SKUs"
                  : "Select SKU"}
              </option>
              {!skuLoading &&
                !skuError &&
                skuOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
            </select>
          </div>


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
              placeholder="e.g., 5"
              min="1"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* Date */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Date
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
            disabled={usageLoading || skuLoading || (isAdmin && usersLoading)}
            className="px-8 py-3 bg-[#DC6D18] text-[#FFF7ED] rounded-lg font-semibold shadow-md hover:bg-[#B85B14] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC6D18] transition-all duration-200 ease-in-out disabled:opacity-60"
          >
            {usageLoading ? "Logging…" : "Log Usage"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UseInventory;
