// src/components/UserList/UserList.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers } from '../../redux/features/users/userSlice';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../utils/apiConfig';

// Icons
const ViewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path
      fillRule="evenodd"
      d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
      clipRule="evenodd"
    />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path
      fillRule="evenodd"
      d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
      clipRule="evenodd"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

const UserList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { allUsers = [], loading, error } = useSelector((state) => state.users || {});
  const { userInfo } = useSelector((state) => state.users || {});
  const isSuperAdmin = userInfo?.userType === 'Super Admin';

  // filterMode: 'users' or 'admins' (only super admin can switch)
  const [filterMode, setFilterMode] = useState('users');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // Compute filtered rows based on mode
  const rows = useMemo(() => {
    if (!Array.isArray(allUsers)) return [];
    if (filterMode === 'admins') {
      return allUsers.filter((u) => u.userType === 'Admin');
    }
    return allUsers.filter((u) => u.userType === 'User');
  }, [allUsers, filterMode]);

  const handleView = (userId) => {
    if (!userId) return;
    navigate(`/view-user/${userId}`);
  };

  const handleEdit = (userId) => {
    if (!userId) return;
    navigate(`/edit-user/${userId}`);
  };

  const handleDelete = async (userId, userName) => {
    if (!userId) return;

    const confirmResult = await Swal.fire({
      title: 'Delete User?',
      html: `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 20px;">🗑️</div>
          <p style="font-size: 18px; color: #374151; margin-bottom: 15px; font-weight: 600;">
            Are you sure you want to delete <strong style="color: #dc2626;">"${userName || 'this user'}"</strong>?
          </p>
          <p style="font-size: 16px; color: #6b7280; line-height: 1.5;">
            This action cannot be undone and will permanently remove all user data.
          </p>
        </div>
      `,
      icon: false,
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete User',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      width: 550,
      padding: '2rem',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.85)',
      allowOutsideClick: false,
      allowEscapeKey: false,
      buttonsStyling: true,
      focusConfirm: false,
      focusCancel: true,
      customClass: {
        popup: 'swal2-popup-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom',
        actions: 'swal2-actions-custom'
      }
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setDeletingId(userId);

      Swal.fire({
        title: 'Deleting User...',
        html: 'Please wait while we delete the user.',
        allowOutsideClick: true,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      await axios.delete(`${API_URL}/api/auth/${userId}`);

      await Swal.fire({
        icon: 'success',
        title: '✅ Deleted Successfully!',
        text: 'User has been permanently deleted.',
        confirmButtonColor: '#059669',
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true
      });

      dispatch(getAllUsers());
    } catch (err) {
      console.error('Error deleting user:', err);
      Swal.fire({
        icon: 'error',
        title: '❌ Deletion Failed',
        text: err?.response?.data?.message || 'Failed to delete user. Please try again.',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK',
        allowOutsideClick: true,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-10">
      <style jsx>{`
        .swal2-popup-custom {
          border-radius: 16px !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4) !important;
          font-family: 'Inter', sans-serif !important;
        }
        .swal2-actions-custom { margin-top: 30px !important; gap: 15px !important; }
        .swal2-confirm-custom {
          background: #dc2626 !important; color: white !important; font-weight: 600 !important;
          font-size: 16px !important; padding: 14px 28px !important; border-radius: 8px !important;
          border: none !important; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4) !important;
          min-width: 140px !important; transition: all 0.2s ease !important;
        }
        .swal2-confirm-custom:hover { background: #b91c1c !important; transform: translateY(-1px) !important; }
        .swal2-cancel-custom {
          background: #f3f4f6 !important; color: #374151 !important; font-weight: 600 !important;
          font-size: 16px !important; padding: 14px 28px !important; border-radius: 8px !important;
          border: 2px solid #d1d5db !important; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          min-width: 140px !important; transition: all 0.2s ease !important;
        }
        .swal2-cancel-custom:hover { background: #e5e7eb !important; border-color: #9ca3af !important; transform: translateY(-1px) !important; }
      `}</style>

      {/* Header + Filter Toggle (visible only to Super Admins) */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          {filterMode === 'admins' ? 'Admin List' : 'User List'}
        </h2>

        {isSuperAdmin && (
          <div className="inline-flex rounded-lg overflow-hidden border border-orange-300">
            <button
              onClick={() => setFilterMode('users')}
              className={`px-4 py-2 text-sm font-medium transition ${
                filterMode === 'users'
                  ? 'bg-[#DC6D18] text-white'
                  : 'bg-white text-[#DC6D18] hover:bg-orange-50'
              }`}
              title="Show Users (userType = User)"
            >
              Users
            </button>
            <button
              onClick={() => setFilterMode('admins')}
              className={`px-4 py-2 text-sm font-medium transition ${
                filterMode === 'admins'
                  ? 'bg-[#DC6D18] text-white'
                  : 'bg-white text-[#DC6D18] hover:bg-orange-50'
              }`}
              title="Show Admins (userType = Admin)"
            >
              Admins
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl shadow-lg bg-white border border-gray-200">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Company Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan="5" className="text-center py-12">
                  <div className="inline-flex items-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC6D18] mr-3"></div>
                    <span className="text-lg font-medium">Loading users...</span>
                  </div>
                </td>
              </tr>
            )}

            {error && !loading && (
              <tr>
                <td colSpan="5" className="text-center py-12">
                  <div className="text-red-600 bg-red-50 p-6 rounded-lg mx-4 border border-red-200">
                    <p className="font-semibold text-lg">⚠️ Error loading list</p>
                    <p className="text-sm mt-2">{error}</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-12">
                  <div className="text-gray-500">
                    <p className="text-xl font-semibold">📭 No records found</p>
                    <p className="text-sm mt-2">
                      {filterMode === 'admins'
                        ? 'There are no Admin accounts to display.'
                        : 'There are no User accounts to display.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!loading && !error && rows.length > 0 && rows.map((user) => {
              const isDeleting = deletingId === user._id;
              const displayName = user.userId || user.firstName || user.companyName || 'Unknown User';

              return (
                <tr
                  key={user._id}
                  className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-25 transition-all duration-200 group"
                >
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-800">
                    {user.companyName || 'N/A'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">
                    {user.userId || user.firstName || 'N/A'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">
                    {user.email || 'N/A'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">
                    {user.state || user.district || 'N/A'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        className="text-[#DC6D18] hover:text-white hover:bg-[#DC6D18] transition-all duration-200 p-3 rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110"
                        onClick={() => handleView(user._id)}
                        title="View Details"
                        disabled={isDeleting}
                      >
                        <ViewIcon />
                      </button>

                      <button
                        className="text-green-600 hover:text-white hover:bg-green-600 transition-all duration-200 p-3 rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110"
                        onClick={() => handleEdit(user._id)}
                        title="Edit"
                        disabled={isDeleting}
                      >
                        <EditIcon />
                      </button>

                      <button
                        className="text-red-500 hover:text-white hover:bg-red-500 transition-all duration-200 p-3 rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110"
                        onClick={() => handleDelete(user._id, displayName)}
                        title="Delete"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <div className="flex items-center">
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                            <span className="text-xs">Deleting...</span>
                          </div>
                        ) : (
                          <DeleteIcon />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
