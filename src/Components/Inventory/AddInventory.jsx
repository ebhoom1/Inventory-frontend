import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { addInventory, resetInventoryState } from '../../redux/features/inventory/inventorySlice';
import { getAllUsers } from '../../redux/features/users/userSlice';

function AddInventory() {
  const dispatch = useDispatch();

  // inventory slice state
  const { loading: inventoryLoading, error, lastAdded } = useSelector((s) => s.inventory);

  // users slice state
  const {
    allUsers = [],
    loading: usersLoading,
    error: usersError,
  } = useSelector((s) => s.users || {});
  const { userInfo } = useSelector((state) => state.users);

  // Correct role flag (includes Technician as per your code)
  const role = (userInfo?.userType || '').toLowerCase();
  const isAdmin = role === "admin" || role === "super admin" || role === "technician";

  const [formData, setFormData] = useState({
    userId: '',
    skuName: '',
    quantity: '',
    date: '',
  });

  // If admin, fetch all users on mount (if not already loaded)
  useEffect(() => {
    if (!userInfo?.token) return; // wait until token ready
    if (isAdmin) {
      if (!allUsers || allUsers.length === 0) {
        dispatch(getAllUsers());
      }
    }
  }, [dispatch, isAdmin, userInfo?.token, allUsers?.length]); // Added allUsers.length to prevent duplicates

  // If NOT admin, pre-fill userId with the logged-in user's userId
  useEffect(() => {
    if (!isAdmin && userInfo?.userId) {
      setFormData((p) => ({ ...p, userId: userInfo.userId }));
    }
  }, [isAdmin, userInfo?.userId]);

  // SweetAlert for inventory add error (uncomment if you want popup; console for now)
  useEffect(() => {
    if (error) {
      console.warn("Add inventory failed:", error); // Enhanced logging
      // Uncomment for popup:
      // Swal.fire({
      //   icon: 'error',
      //   title: 'Failed to Add',
      //   text: error,
      //   confirmButtonText: 'OK',
      // });
    }
  }, [error]);

  // SweetAlert for users fetch error
  useEffect(() => {
    if (usersError) {
      Swal.fire({
        icon: 'warning',
        title: 'Could not load users',
        text: usersError,
        confirmButtonText: 'OK',
      });
    }
  }, [usersError]);

  // Success toast on add
  useEffect(() => {
    if (lastAdded) {
      Swal.fire({
        icon: 'success',
        title: 'Inventory Added',
        text: `${lastAdded.skuName} x ${lastAdded.quantity} for ${lastAdded.userId}`,
        timer: 1400,
      });
      setFormData({ 
        userId: isAdmin ? '' : (userInfo?.userId || ''), 
        skuName: '', 
        quantity: '', 
        date: '' 
      });
      dispatch(resetInventoryState());
    }
  }, [lastAdded, dispatch, isAdmin, userInfo?.userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      userId: formData.userId?.trim(),
      skuName: formData.skuName?.trim(),
      quantity: Number(formData.quantity),
      date: formData.date,
    };

    if (!payload.userId || !payload.skuName || !payload.quantity || !payload.date) {
      Swal.fire({ icon: 'warning', title: 'Missing fields', text: 'Please fill all fields' });
      return;
    }
    if (payload.quantity < 1) {
      Swal.fire({ icon: 'warning', title: 'Invalid quantity', text: 'Quantity must be at least 1' });
      return;
    }

    dispatch(addInventory(payload));
  };

  // Pre-sort and filter users by userType === 'User' for admin dropdown
  const userOptions = useMemo(() => {
    if (!isAdmin) return [];
    const arr = Array.isArray(allUsers) ? allUsers : [];
    return arr
      .filter(u => u.userType === 'User') // Only normal users (excludes admins/techs)
      .sort((a, b) => (a.userId || '').localeCompare(b.userId || ''));
  }, [allUsers, isAdmin]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-[#DC6D18] mb-8 md:mb-10">
        Add Inventory
      </h2>

      <form className="space-y-10" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 md:gap-y-10">
          {/* User (dropdown or locked) */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              {isAdmin ? 'User (userId - company)' : 'Your User ID'}
            </span>

            {isAdmin ? (
              <select
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                required
                disabled={usersLoading}
              >
                <option value="">
                  {usersLoading ? 'Loading users…' : 'Select a user'}
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
                className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                required
                disabled
              >
                <option value={formData.userId}>
                  {formData.userId || '—'}
                </option>
              </select>
            )}
          </div>

          {/* SKU Name */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              SKU Name
            </span>
            <input
              type="text"
              name="skuName"
              value={formData.skuName}
              onChange={handleChange}
              placeholder="e.g., VALVE"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* Quantity */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Quantity
            </span>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g., 50"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
              min="1"
            />
          </div>

          {/* Date */}
          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Date
            </span>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>
        </div>

        <div className="flex justify-center mt-8 gap-3">
          <button
            type="submit"
            disabled={inventoryLoading || usersLoading || !userInfo?.token} // Added token check for safety
            className="px-7 py-3 md:px-8 bg-[#DC6D18] text-[#FFF7ED] rounded-lg font-semibold shadow-md hover:bg-[#B85B14] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC6D18] transition-all duration-200 ease-in-out disabled:opacity-60"
          >
            {inventoryLoading ? 'Adding…' : 'Add Inventory'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddInventory;
