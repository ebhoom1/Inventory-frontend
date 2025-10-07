// src/components/Users/ViewUser.jsx
import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getUserById } from '../../redux/features/users/userSlice';

const Pill = ({ children, tone = 'slate' }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-${tone}-100 text-${tone}-800`}
  >
    {children}
  </span>
);

export default function ViewUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const captureRef = useRef(null); // <-- capture area for PDF

  // ---- Users slice (robust to different state shapes) ----
  const usersState = useSelector((s) => s.users || {});
  const { loading, error } = usersState;
  const user =
    usersState.selectedUser ||
    usersState.userDetails ||
    usersState.user ||
    (usersState.byId && usersState.byId[id]) ||
    null;

  useEffect(() => {
    if (!id) return;
    dispatch(getUserById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to load user',
        text: error,
      });
    }
  }, [error]);

  // ---- Prepare sanitized data for display & (optional) download ----
  const displayUser = useMemo(() => {
    if (!user) return null;
    const { _id, __v, password, ...rest } = user; // hide internals
    return rest;
  }, [user]);

  const formattedDates = useMemo(() => {
    if (!user) return {};
    const fmt = (d) =>
      d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
    return {
      subscriptionDate: user.subscriptionDate ? fmt(user.subscriptionDate) : '—',
      createdAt: user.createdAt ? fmt(user.createdAt) : '—',
      updatedAt: user.updatedAt ? fmt(user.updatedAt) : '—',
    };
  }, [user]);

  const handleDownloadPDF = async () => {
    if (!captureRef.current) return;
    try {
      // Dynamic imports to keep bundle light
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      // Improve quality by scaling with device pixel ratio
      const canvas = await html2canvas(captureRef.current, {
        scale: Math.min(window.devicePixelRatio || 1, 2), // cap scale to avoid memory spikes
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();      // 210mm for A4
      const pageHeight = pdf.internal.pageSize.getHeight();    // 297mm for A4

      const imgWidth = pageWidth; // fit to width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Add extra pages if content overflows
      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight; // negative value shifts the image up
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const fileName = `${displayUser?.userId || 'user'}-profile.pdf`;
      pdf.save(fileName);
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: 'error',
        title: 'Could not generate PDF',
        text: e?.message || 'Please try again.',
      });
    }
  };

  if (loading || !displayUser) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-orange-100/70 rounded-lg" />
          <div className="h-40 bg-orange-100/60 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-28 bg-orange-50 rounded-xl" />
            <div className="h-28 bg-orange-50 rounded-xl" />
            <div className="h-28 bg-orange-50 rounded-xl" />
            <div className="h-28 bg-orange-50 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const {
    userId,
    companyName,
    firstName,
    email,
    additionalEmails = [],
    mobileNumber,
    userType,
    adminType,
    subscriptionPlan,
    assignOperators = [],
    assignTechnicians = [],
    assignTerritorialManager,
    address,
    district,
    state,
    latitude,
    longitude,
  } = displayUser;

  return (
    <div className="w-full max-w-5xl mx-auto mt-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-[#DC6D18] to-[#FF9A3D] text-transparent bg-clip-text">
          User Profile
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg border border-orange-300 text-orange-700 hover:bg-orange-50 transition"
          >
            Back
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 rounded-lg bg-[#DC6D18] text-white shadow hover:bg-[#b95915] transition"
            title="Download as PDF"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Capture region for PDF */}
      <div ref={captureRef} className="print:bg-white">
        {/* Top Card */}
        <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-[#FFF7ED] to-white border border-orange-200 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-xl md:text-2xl font-bold text-slate-800">
                {companyName || '—'}
              </div>
              <div className="text-sm text-slate-500">
                {firstName ? `Contact: ${firstName}` : ''}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {userType && <Pill tone="orange">Type: {userType}</Pill>}
                {adminType && <Pill tone="amber">Admin: {adminType}</Pill>}
                {subscriptionPlan && <Pill tone="emerald">Plan: {subscriptionPlan}</Pill>}
                {userId && <Pill tone="sky">User ID: {userId}</Pill>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">
                Created: <span className="font-medium">{formattedDates.createdAt}</span>
              </div>
              <div className="text-xs text-slate-500">
                Updated: <span className="font-medium">{formattedDates.updatedAt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact */}
          <div className="rounded-xl border border-orange-200 p-5 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-[#DC6D18] mb-3">Contact</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-800">{email || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Mobile</dt>
                <dd className="font-medium text-slate-800">{mobileNumber || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Additional Emails</dt>
                <dd className="flex flex-wrap gap-2">
                  {additionalEmails.length ? (
                    additionalEmails.map((em, i) => <Pill key={i}>{em}</Pill>)
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Address */}
          <div className="rounded-xl border border-orange-200 p-5 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-[#DC6D18] mb-3">Address</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Street</dt>
                <dd className="font-medium text-slate-800 text-right max-w-[60%]">{address || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">District</dt>
                <dd className="font-medium text-slate-800">{district || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">State</dt>
                <dd className="font-medium text-slate-800">{state || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Coordinates</dt>
                <dd className="font-medium text-slate-800">
                  {latitude || longitude ? `${latitude || '—'}, ${longitude || '—'}` : '—'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Team & Assignments */}
          <div className="rounded-xl border border-orange-200 p-5 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-[#DC6D18] mb-3">Assignments</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-slate-500 mb-1">Territorial Manager</dt>
                <dd className="font-medium text-slate-800">
                  {assignTerritorialManager || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Operators</dt>
                <dd className="flex flex-wrap gap-2">
                  {assignOperators.length ? (
                    assignOperators.map((op, i) => <Pill key={i} tone="violet">{op}</Pill>)
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Technicians</dt>
                <dd className="flex flex-wrap gap-2">
                  {assignTechnicians.length ? (
                    assignTechnicians.map((t, i) => <Pill key={i} tone="cyan">{t}</Pill>)
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Subscription */}
          <div className="rounded-xl border border-orange-200 p-5 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-[#DC6D18] mb-3">Subscription</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Plan</dt>
                <dd className="font-medium text-slate-800">{subscriptionPlan || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Start Date</dt>
                <dd className="font-medium text-slate-800">
                  {formattedDates.subscriptionDate}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
