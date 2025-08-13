import React, { useState } from 'react';
import kspcb from '../../assets/kspcb.png';

const ResetLink = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // handle reset link logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-[#f0f7fa]">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <img src={kspcb} alt="KSPCB Logo" className="w-20 h-20 mb-6" />
        <h2 className="text-xl font-bold text-[#236a80] mb-4 text-center">Email to receive Reset Password link</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div className="relative flex items-center justify-center">
            <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] z-10">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-white to-[#f0f7fa] shadow-md focus:outline-none focus:ring-2 focus:ring-[#236a80]"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-[#236a80] text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-[#1d5566] transition border border-[#236a80]"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetLink; 