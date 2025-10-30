import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import { getUserById } from '../../redux/features/users/userSlice'; // <<— your thunk

const PLACEHOLDER_AVATAR =
  'https://images.unsplash.com/photo-1557862921-37829c790f19?w=500&q=80';

const Account = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();

  // Your slice shape
  const { userInfo, selectedUser, loading, error } = useSelector((s) => s.users || {});

  // Fetch the full user doc once we know who is logged in
  useEffect(() => {
    if (userInfo?._id) {
      // Avoid refetch if the selectedUser is already this user
      if (!selectedUser || selectedUser?._id !== userInfo._id) {
        dispatch(getUserById(userInfo._id));
      }
    }
  }, [dispatch, userInfo?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Normalize fields for UI from either selectedUser (full doc) or userInfo (login payload)
  const ui = useMemo(() => {
    const u = selectedUser || {};
    const basic = userInfo || {};

    const firstName =
      (u.firstName || basic.firstName || '').trim() || 'User';
    const email = u.email || basic.email || '—';
    const companyName = u.companyName || '—';
    const userId = u.userId || basic.userId || u._id || '—';
    const userType = u.userType || basic.userType || '—';

    const subscriptionPlan = u.subscriptionPlan || '—';
    const subscriptionDate = u.subscriptionDate || null;

    const mobileNumber = u.mobileNumber || '—';
    const address =
      u.address ||
      [u.doorNo, u.street, u.city, u.district, u.state, u.pincode]
        .filter(Boolean)
        .join(', ') ||
      '—';

    const latitude =
      u.latitude !== undefined && u.latitude !== '' ? String(u.latitude) : '';
    const longitude =
      u.longitude !== undefined && u.longitude !== '' ? String(u.longitude) : '';

    // Try multiple possible keys for uploaded profile image
    const profileImage =
      u.profileImage || u.avatar || u.imageUrl || u.image || PLACEHOLDER_AVATAR;

    return {
      firstName,
      email,
      companyName,
      userId,
      userType,
      subscriptionPlan,
      subscriptionDate,
      mobileNumber,
      address,
      latitude,
      longitude,
      profileImage,
    };
  }, [selectedUser, userInfo]);

  const formattedDate = ui.subscriptionDate
    ? new Date(ui.subscriptionDate).toLocaleDateString()
    : '—';

  return (
    <div className="flex min-h-screen bg-[#DC6D18]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col bg-main-content-bg rounded-tl-[50px]">
        <Header onSidebarToggle={() => setSidebarOpen((o) => !o)} />

        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-white to-[#f0f7fa] rounded-tl-[50px]">
          <div className="relative bg-[#FFF7ED] rounded-2xl shadow-lg max-w-xl w-full p-8 pt-20 mt-12 bg-gradient-to-br from-[#236a80]/10 to-white">
            {/* Loading / Error */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#DC6D18] border-t-transparent" />
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2">
                {typeof error === 'string' ? error : 'Failed to load account details'}
              </div>
            )}

            {/* Profile Picture */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg p-2">
              <img
                src={ui.profileImage}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>

            {/* Core details */}
            <div className="text-center mt-4">
              <h3 className="mb-2 text-2xl font-bold text-[#DC6D18]">{ui.firstName}</h3>
              <p className="text-gray-600 mb-1">{ui.email}</p>
              <p className="text-gray-500 mb-3">{ui.companyName}</p>
            </div>

            {/* Essentials */}
            <div className="text-gray-700 mt-6 space-y-3">
              <p><span className="font-semibold">User ID:</span> {ui.userId}</p>
              <p><span className="font-semibold">Role:</span> {ui.userType}</p>
              <p><span className="font-semibold">Mobile:</span> {ui.mobileNumber}</p>
              <p><span className="font-semibold">Subscription Plan:</span> {ui.subscriptionPlan}</p>
              <p><span className="font-semibold">Subscription Date:</span> {formattedDate}</p>
              <p><span className="font-semibold">Address:</span> {ui.address}</p>
              {(ui.latitude || ui.longitude) && (
                <p><span className="font-semibold">Coordinates:</span> {ui.latitude} {ui.longitude && `, ${ui.longitude}`}</p>
              )}

              <div className="flex items-center gap-3">
                <span className="font-semibold">Password:</span> ************
                <Link to="/resetpassword">
                  <button className="ml-2 bg-[#DC6D18] text-white px-4 py-1 rounded hover:bg-[#B85B14] transition">
                    Change Password
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Account;
