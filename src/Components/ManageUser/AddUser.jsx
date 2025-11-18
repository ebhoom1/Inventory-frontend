import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { registerUser, reset } from "../../redux/features/users/userSlice";

const initialFormState = {
  userId: "",
  companyName: "",
  firstName: "",
  email: "",
  additionalEmails: "",
  mobileNumber: "",
  password: "",
  confirmPassword: "",
  subscriptionDate: "",
  subscriptionPlan: "",
  userType: "",
  adminType: "",
  assignOperators: "",
  assignTerritorialManager: "",
  assignTechnicians: "",
  district: "",
  state: "",
  address: "",
  latitude: "",
  longitude: "",
  equipmentLocations: [""],
};

const AddUser = () => {
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState("");
  const [passShow, setPassShow] = useState(false);
  const [confirmPassShow, setConfirmPassShow] = useState(false);
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.users);
  const { loading, error, registerSuccess, registerMessage, registerData } =
    useSelector((state) => state.users);

  useEffect(() => {
    if (error) {
      const errMsg =
        typeof error === "string"
          ? error
          : error?.message || "Registration failed. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Could not add user",
        html: `<div class="text-left">
                 <p class="font-semibold mb-2">${errMsg}</p>
                 <p class="text-sm text-gray-500">If this keeps happening, please re-check required fields or try again later.</p>
               </div>`,
        allowOutsideClick: true,
        confirmButtonColor: "#DC6D18",
        showConfirmButton: false,
        background: "#fff",
        color: "#111827",
        backdrop: `rgba(0,0,0,0.4) left top no-repeat`,
      });
      setFormError(errMsg);
    }
  }, [error]);

  useEffect(() => {
    if (registerSuccess) {
      const createdEmail = registerData?.email || form.email;
      const createdUserId = registerData?.userId || form.userId;

      Swal.fire({
        icon: "success",
        title: "User Added 🎉",
        html: `
        <div class="text-left">
          <p class="font-semibold mb-1">${
            registerMessage || "User registered successfully!"
          }</p>
          <div class="text-sm text-gray-600 mt-2">
            <div><span class="font-semibold">User ID:</span> ${
              createdUserId || "-"
            }</div>
            <div><span class="font-semibold">Email:</span> ${
              createdEmail || "-"
            }</div>
          </div>
        </div>
      `,
        background: "#ffffff",
        color: "#111827",
        confirmButtonColor: "#DC6D18",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        backdrop: `linear-gradient(120deg, rgba(220,109,24,0.25), rgba(255,237,213,0.35)) left top no-repeat`,
        didClose: () => {
          setForm(initialFormState);
          dispatch(reset());
          setFormError("");
        },
      });
    }
  }, [
    registerSuccess,
    registerMessage,
    registerData,
    dispatch,
    form.email,
    form.userId,
  ]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Equipment Locations handlers
  const handleEquipmentLocationChange = (index, value) => {
    setForm((prev) => {
      const equipmentLocations = Array.isArray(prev.equipmentLocations) ? [...prev.equipmentLocations] : [""];
      equipmentLocations[index] = value;
      return { ...prev, equipmentLocations };
    });
  };

  const addEquipmentLocationField = () => {
    setForm((prev) => ({ ...prev, equipmentLocations: [...(prev.equipmentLocations || []), ""] }));
  };

  const removeEquipmentLocationField = (index) => {
    setForm((prev) => {
      const equipmentLocations = [...(prev.equipmentLocations || [])];
      equipmentLocations.splice(index, 1);
      return { ...prev, equipmentLocations: equipmentLocations.length ? equipmentLocations : [""] };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    if (form.password !== form.confirmPassword) {
      setFormError("Passwords do not match!");
      Swal.fire({
        icon: "warning",
        title: "Password mismatch",
        text: "Please make sure both password fields match.",
        confirmButtonText: "Fix it",
        confirmButtonColor: "#DC6D18",
      });
      return;
    }
    dispatch(registerUser({
      ...form,
      equipmentLocations: form.equipmentLocations ? form.equipmentLocations.filter(Boolean) : [],
    }));
  };

  const roleOptions =
    userInfo?.userType === "Admin"
      ? ["User", "Technician"] // Admins can only add these
      : ["Admin", "User", "Super Admin", "Technician"]; // Super Admin sees all

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 mx-auto">
      <h2 className="text-xl font-bold text-[#DC6D18] mb-6 text-center">
        Add User
      </h2>

      {formError && (
        <div className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg mb-4 text-center font-semibold">
          {formError}
        </div>
      )}

      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8"
        onSubmit={handleSubmit}
      >
        {/* User ID */}
        <div className="relative">
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            User ID
          </span>
          <input
            name="userId"
            value={form.userId}
            onChange={handleChange}
            placeholder="Enter User ID"
            className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            required
          />
        </div>

        {/* Company Name */}
        <div className="relative">
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            Company Name
          </span>
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
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            First Name
          </span>
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
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            Email
          </span>
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
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            Additional Emails
          </span>
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
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            Mobile Number
          </span>
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

        {/* Password */}
        <div className="relative">
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            Password
          </span>
          <i className="fa-solid fa-lock absolute top-[15px] left-4 text-gray-400" />
          <input
            name="password"
            value={form.password}
            type={passShow ? "text" : "password"}
            onChange={handleChange}
            placeholder="Enter Password"
            className="w-full pl-12 pr-12 border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            required
          />
          <i
            className={`fa-solid ${
              passShow ? "fa-eye" : "fa-eye-slash"
            } absolute top-[15px] right-4 cursor-pointer text-[#DC6D18]`}
            onClick={() => setPassShow((v) => !v)}
            title={passShow ? "Hide password" : "Show password"}
          />
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            Confirm Password
          </span>
          <i className="fa-solid fa-lock absolute top-[15px] left-4 text-gray-400" />
          <input
            name="confirmPassword"
            value={form.confirmPassword}
            type={confirmPassShow ? "text" : "password"}
            onChange={handleChange}
            placeholder="Confirm Password"
            className="w-full pl-12 pr-12 border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            required
          />
          <i
            className={`fa-solid ${
              confirmPassShow ? "fa-eye" : "fa-eye-slash"
            } absolute top-[15px] right-4 cursor-pointer text-[#DC6D18]`}
            onClick={() => setConfirmPassShow((v) => !v)}
            title={confirmPassShow ? "Hide password" : "Show password"}
          />
        </div>

        {/* Date of Subscription */}
        <div className="relative">
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            Date of Subscription
          </span>
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
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            Subscription Plan
          </span>
          <input
            name="subscriptionPlan"
            value={form.subscriptionPlan}
            onChange={handleChange}
            placeholder="e.g., Annual, Monthly"
            className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
          />
        </div>

        {/* User Type */}
        <div className="relative">
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            User Type
          </span>
          <select
            name="userType"
            value={form.userType}
            onChange={handleChange}
            className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            required
          >
            {/* <option value="">Select user type</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Technician">Technician</option> */}
            <option value="">Select user type</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Admin Type - changed to dropdown */}
        <div className="relative">
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            Admin Type
          </span>
          <select
            name="adminType"
            value={form.adminType}
            onChange={handleChange}
            className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            required
          >
            {/* <option value="">Select Admin Type</option> */}
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* Assign Operator(s) */}
        <div className="relative">
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            Assign Operator(s)
          </span>
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
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            Assign Territorial Manager
          </span>
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
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            Assign Technician(s)
          </span>
          <input
            name="assignTechnicians"
            value={form.assignTechnicians}
            onChange={handleChange}
            placeholder="Enter Technician IDs"
            className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
          />
        </div>

        {/* Equipment Locations (dynamic) */}
        <div className="relative md:col-span-2">
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            Equipment Locations
          </span>
          <div className="space-y-2 mt-3">
            {(form.equipmentLocations || [""]).map((loc, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  name={`equipmentLocation-${idx}`}
                  value={loc}
                  onChange={(e) => handleEquipmentLocationChange(idx, e.target.value)}
                  placeholder={`Equipment Location ${idx + 1}`}
                  className="flex-1 border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
                <button type="button" onClick={() => removeEquipmentLocationField(idx)} title="Remove" className="text-red-500 px-3">
                  <i className="fa-solid fa-minus" />
                </button>
                {idx === (form.equipmentLocations || []).length - 1 && (
                  <button type="button" onClick={addEquipmentLocationField} title="Add" className="text-green-600 px-3">
                    <i className="fa-solid fa-plus" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* District */}
        <div className="relative">
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            District
          </span>
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
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            State
          </span>
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="Enter State"
            className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
          />
        </div>

        {/* Address */}
        <div className="relative">
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            Address
          </span>
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
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            Latitude
          </span>
          <input
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
            placeholder="e.g., 10.5276"
            className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
          />
        </div>

        {/* Longitude */}
        <div className="relative">
          <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
            Longitude
          </span>
          <input
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
            placeholder="e.g., 76.2144"
            className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-sm bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-center md:col-span-2 mt-6">
          <button
            type="submit"
            className="bg-[#DC6D18] text-white px-8 py-3 rounded-lg text-sm font-semibold shadow-md hover:bg-[#B85B14] transition w-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Adding User..." : "Add User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
