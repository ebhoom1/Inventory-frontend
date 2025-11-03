import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Redux actions
import { updateUser, getUserById, reset } from '../../redux/features/users/userSlice';

// Layout
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

// Same initial state as AddUser
const initialFormState = {
  userId: '',
  companyName: '',
  firstName: '',
  email: '',
  additionalEmails: '',
  mobileNumber: '',
  subscriptionDate: '',
  subscriptionPlan: '',
  userType: '', // This will now be controlled by the dropdown
  adminType: '',
  assignOperators: '',
  assignTerritorialManager: '',
  assignTechnicians: '',
  district: '',
  state: '',
  address: '',
  latitude: '',
  longitude: '',
};

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form state
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState('');

  // ✅ 1. Get userInfo (logged-in user) AND selectedUser (user being edited)
  const { loading, error, updateSuccess, selectedUser, userInfo } = useSelector((state) => state.users);

  // ✅ 2. Define role options based on the logged-in user's role
  const roleOptions =
    userInfo?.userType === "Admin"
      ? ["User", "Technician"] // Admins can only add/edit these
      : ["Admin", "User", "Super Admin", "Technician"]; // Super Admin sees all

  // --- SIDE EFFECTS ---

  // Fetch when ID changes
  useEffect(() => {
    if (id) {
      console.log('Fetching user data for ID:', id);
      dispatch(getUserById(id));
    }
  }, [dispatch, id]);

  // Reset local form and Redux state on component lifecycle changes
  useEffect(() => {
    // Reset local form state when the user ID changes
    setForm(initialFormState);
    setFormError('');
    
    // Cleanup function: reset Redux state when component unmounts
    return () => {
      dispatch(reset());
    };
  }, [id, dispatch]);

  // Populate form when selectedUser data arrives from the server
  useEffect(() => {
    console.log('Effect to populate form triggered. selectedUser:', selectedUser, 'route ID:', id);

    // This condition is now robust. It populates the form initially and also
    // repopulates it with the fresh data after a successful update.
    if (selectedUser && String(selectedUser._id) === String(id)) {
      console.log('Populating form with selected user data:', selectedUser);

      const formattedDate = selectedUser.subscriptionDate
        ? new Date(selectedUser.subscriptionDate).toISOString().split('T')[0]
        : '';

      setForm({
        userId: selectedUser.userId || '',
        companyName: selectedUser.companyName || '',
        firstName: selectedUser.firstName || '',
        email: selectedUser.email || '',
        mobileNumber: selectedUser.mobileNumber || '',
        subscriptionPlan: selectedUser.subscriptionPlan || '',
        userType: selectedUser.userType || '',
        adminType: selectedUser.adminType || '',
        assignTerritorialManager: selectedUser.assignTerritorialManager || '',
        district: selectedUser.district || '',
        state: selectedUser.state || '',
        address: selectedUser.address || '',
        latitude: selectedUser.latitude ? String(selectedUser.latitude) : '',
        longitude: selectedUser.longitude ? String(selectedUser.longitude) : '',
        subscriptionDate: formattedDate,
        additionalEmails: Array.isArray(selectedUser.additionalEmails)
          ? selectedUser.additionalEmails.join(', ')
          : (selectedUser.additionalEmails || ''),
        assignOperators: Array.isArray(selectedUser.assignOperators)
          ? selectedUser.assignOperators.join(', ')
          : (selectedUser.assignOperators || ''),
        assignTechnicians: Array.isArray(selectedUser.assignTechnicians)
          ? selectedUser.assignTechnicians.join(', ')
          : (selectedUser.assignTechnicians || ''),
      });
    } else if (selectedUser && String(selectedUser._id) !== String(id)) {
      // This log is still useful for catching other potential logic errors
      console.warn('Stale user data detected. The selectedUser in Redux does not match the route ID.');
    }
  }, [selectedUser, id]);

  // --- SweetAlerts ---

  const showSuccessAlert = () => {
    return Swal.fire({
      icon: 'success',
      title: 'User Updated!',
      text: 'The user details have been updated successfully.',
      timer: 2000,
      timerProgressBar: true,
      confirmButtonColor: '#DC6D18',
      allowOutsideClick: true,
      showConfirmButton: false, 
    });
  };

  const showErrorAlert = (errorMessage) => {
    return Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: errorMessage || 'Something went wrong. Please try again.',
      confirmButtonColor: '#f44336',
    });
  };

  const showLoadingAlert = () => {
    Swal.fire({
      title: 'Updating User...',
      text: 'Please wait.',
      allowOutsideClick: true,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };

  // Use 'updateSuccess' to handle success/error alerts
  useEffect(() => {
    if (error) {
      Swal.close();
      showErrorAlert(error);
      dispatch(reset()); // Reset error state
    }
    if (updateSuccess) {
      Swal.close();
      showSuccessAlert().then(() => {
        dispatch(reset()); // Reset success state
        navigate('/manageuser');
      });
    }
  }, [updateSuccess, error, dispatch, navigate]);


  // --- HANDLERS ---

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(''); // Clear previous local errors
    
    // The loading alert is now triggered by the 'pending' state in Redux
    // but we can still show a gentle loading state on submit
    showLoadingAlert();

    const processedFormData = {
      ...form,
      additionalEmails: form.additionalEmails
        ? form.additionalEmails.split(',').map((email) => email.trim()).filter(Boolean)
        : [],
      assignOperators: form.assignOperators
        ? form.assignOperators.split(',').map((op) => op.trim()).filter(Boolean)
        : [],
      assignTechnicians: form.assignTechnicians
        ? form.assignTechnicians.split(',').map((tech) => tech.trim()).filter(Boolean)
        : [],
    };

    dispatch(updateUser({ id, updatedData: processedFormData }));
  };

  // --- RENDER ---
  return (
    <div className="flex min-h-screen bg-[#DC6D18]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col rounded-tl-[50px] min-w-0">
        <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />

        <main className="flex-1 p-1 sm:p-4 md:p-8 bg-gradient-to-br from-white to-[#FFF7ED] rounded-tl-[50px]">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 mx-auto max-w-4xl">
            <h2 className="text-xl sm:text-2xl font-bold text-[#DC6D18] mb-6 text-center">EDIT USER DETAILS</h2>

            {loading && !updateSuccess && (
              <div className="text-center text-gray-500 mb-4">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#DC6D18] mr-2"></div>
                  Loading user data...
                </div>
              </div>
            )}

            {formError && (
              <div className="text-red-600 bg-red-100 p-3 rounded-lg mb-4 text-center font-semibold border border-red-200">
                {formError}
              </div>
            )}
            
            <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8" onSubmit={handleSubmit}>
              {/* User ID */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">User ID</span>
                <input
                  name="userId"
                  value={form.userId}
                  onChange={handleChange}
                  placeholder="Enter User ID"
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                  required
                  disabled
                />
              </div>

              {/* Company Name */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Company Name</span>
                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Enter Company Name"
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                  required
                />
              </div>

              {/* First Name */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">First Name</span>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter First Name"
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Email</span>
                <input
                  name="email"
                  value={form.email}
                  type="email"
                  onChange={handleChange}
                  placeholder="Enter Email"
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                  required
                />
              </div>

              {/* Additional Emails */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Additional Emails</span>
                <input
                  name="additionalEmails"
                  value={form.additionalEmails}
                  onChange={handleChange}
                  placeholder="Comma-separated emails"
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
              </div>

              {/* Mobile Number */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Mobile Number</span>
                <input
                  name="mobileNumber"
                  value={form.mobileNumber}
                  type="tel"
                  onChange={handleChange}
                  placeholder="Enter Mobile Number"
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                  required
                />
              </div>

              {/* Date of subscription */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Date of Subscription</span>
                <input
                  name="subscriptionDate"
                  value={form.subscriptionDate}
                  type="date"
                  onChange={handleChange}
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
              </div>

              {/* Subscription Plan */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Subscription Plan</span>
                <input
                  name="subscriptionPlan"
                  value={form.subscriptionPlan}
                  onChange={handleChange}
                  placeholder="e.g., Annual, Monthly"
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
              </div>

              {/* ✅ 3. MODIFIED User Type (Dropdown) */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">User Type</span>
                <select
                  name="userType"
                  value={form.userType}
                  onChange={handleChange}
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18] appearance-none"
                  required
                >
                  <option value="" disabled>Select a user type</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                  <svg className="w-5 h-5 text-[#DC6D18]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              {/* Admin Type */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Admin Type</span>
                <input
                  name="adminType"
                  value={form.adminType}
                  onChange={handleChange}
                  placeholder="e.g., Super, Regional"
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
              </div>

              {/* Assign Operator(s) */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Assign Operator(s)</span>
                <input
                  name="assignOperators"
                  value={form.assignOperators}
                  onChange={handleChange}
                  placeholder="Enter Operator IDs"
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
              </div>

              {/* Assign Territorial Manager */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Assign Territorial Manager</span>
                <input
                  name="assignTerritorialManager"
                  value={form.assignTerritorialManager}
                  onChange={handleChange}
                  placeholder="Enter Manager ID"
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
              </div>

              {/* Assign Technician(s) */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Assign Technician(s)</span>
                <input
                  name="assignTechnicians"
                  value={form.assignTechnicians}
                  onChange={handleChange}
                  placeholder="Enter Technician IDs"
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
              </div>

              {/* District */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">District</span>
                <input
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="Enter District"
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
              </div>

              {/* State */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">State</span>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Enter State"
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
              </div>

              {/* Address */}
              <div className="relative md:col-span-2">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Address</span>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
              </div>

              {/* Latitude */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Latitude</span>
                <input
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="e.g., 9.9312"
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
              </div>

              {/* Longitude */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Longitude</span>
                <input
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="e.g., 76.2673"
                  className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-center md:col-span-2 mt-6">
                <button
                  type="submit"
                  className="bg-[#DC6D18] text-white px-8 py-3 rounded-lg text-sm font-semibold shadow-md hover:bg-[#B85B14] transition-all duration-200 w-auto disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update User Details'
                  )}
                </button>
              </div>
            </form>

          </div>
        </main>
      </div>
    </div>
  );
};

export default EditUser;
