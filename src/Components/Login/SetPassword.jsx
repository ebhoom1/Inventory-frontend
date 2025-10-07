import React, { useMemo, useState } from 'react';
import safetickLogo from '../../assets/safetik.png';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

function useQueryToken() {
  return useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get('token') || '';
  }, []);
}

const SetPassword = () => {
  const token = useQueryToken();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return setError('Missing token. Please use the link from your email.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');

    setError('');
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword, confirmPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setSending(false);
        return setError(data?.message || 'Failed to reset password');
      }
      setSubmitted(true);
      setSending(false);
    } catch (err) {
      setSending(false);
      setError('Network error. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF1E3] to-[#FDECDA] p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        <img src={safetickLogo} alt="Safetick Logo" className="w-24 mb-6" />
        <div className="text-center w-full mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Create a New Password</h2>
          <p className="text-gray-600 mt-2">Use a strong password you’ll remember.</p>
        </div>

        {submitted ? (
          <div className="text-center p-4 bg-green-100 text-green-800 rounded-lg">
            <h3 className="font-bold">Success!</h3>
            <p>Your password has been changed. You can now log in.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
            <div className="relative">
              <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">New Password</span>
              <div className="relative">
                <i className="fa-solid fa-lock absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"></i>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-2 border-dotted border-[#DC6D18] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#DC6D18] transition"
                  required
                  disabled={sending}
                />
                <i
                  className={`fa-solid ${showNewPass ? "fa-eye" : "fa-eye-slash"} absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-[#DC6D18]`}
                  onClick={() => setShowNewPass(!showNewPass)}
                ></i>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Confirm Password</span>
              <div className="relative">
                <i className="fa-solid fa-lock absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"></i>
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-2 border-dotted border-[#DC6D18] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#DC6D18] transition"
                  required
                  disabled={sending}
                />
                <i
                  className={`fa-solid ${showConfirmPass ? "fa-eye" : "fa-eye-slash"} absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-[#DC6D18]`}
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                ></i>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-[#DC6D18] text-white py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC6D18] mt-2"
            >
              {sending ? 'Updating…' : 'Set New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SetPassword;
