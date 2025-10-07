import React, { useState } from "react";
import safetickLogo from "../../assets/safetik.png";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

const ResetLink = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ sending: false, ok: false, err: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ sending: true, ok: false, err: "" });

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Always show success (don’t expose if email exists)
      if (!res.ok) {
        try {
          const data = await res.json();
          console.warn("ResetLink response:", data);
        } catch {}
      }
      setStatus({ sending: false, ok: true, err: "" });
    } catch (err) {
      console.error("ResetLink error:", err);
      setStatus({
        sending: false,
        ok: false,
        err: "Something went wrong. Try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF1E3] to-[#FDECDA] p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        <img src={safetickLogo} alt="Safetik Logo" className="w-24 mb-6" />
        <div className="text-center w-full mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Forgot Your Password?
          </h2>
          <p className="text-gray-600 mt-2">
            Enter your email. If it exists, you’ll get a reset link.
          </p>
        </div>

        {status.ok ? (
          <div className="text-center p-4 bg-green-100 text-green-800 rounded-lg">
            ✅ Check your inbox for the reset link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
            <div className="relative">
              <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
                Email Address
              </span>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-dotted border-[#DC6D18] rounded-xl text-base bg-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#DC6D18] transition"
                  required
                  disabled={status.sending}
                />
              </div>
            </div>

            {status.err && (
              <p className="text-red-600 text-sm text-center">{status.err}</p>
            )}

            <button
              type="submit"
              disabled={status.sending}
              className="w-full bg-[#DC6D18] text-white py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC6D18] disabled:opacity-70"
            >
              {status.sending ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetLink;
