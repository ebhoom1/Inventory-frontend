import React, { useState } from 'react';
import safetickLogo from '../../assets/safetik.png'; // Using the consistent logo import

const ResetLink = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would call your backend API to send the reset email
    console.log('Password reset requested for:', email);
    setSubmitted(true); // Show a confirmation message
  };

  return (
    // Main container with the consistent warm gradient background
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF1E3] to-[#FDECDA] p-4">
      
      {/* Main card with updated theme colors */}
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        
        <img src={safetickLogo} alt="Safetick Logo" className="w-24 mb-6" />
        
        <div className="text-center w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Your Password?</h2>
          <p className="text-gray-600 mb-8">No problem. Enter your email below and we'll send you a link to reset it.</p>
        </div>

        {submitted ? (
          <div className="text-center p-4 bg-green-100 text-green-800 rounded-lg">
            <p>If an account with that email exists, a password reset link has been sent.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
            {/* Email input with floating label styled with the new theme */}
            <div className="relative">
              <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">Email Address</span>
              <div className="relative">
                 <i className="fa-solid fa-envelope absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-dotted border-[#DC6D18] rounded-xl text-base bg-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#DC6D18] transition"
                  required
                />
              </div>
            </div>
            
            {/* Submit button updated with the orange theme */}
            <button
              type="submit"
              className="w-full bg-[#DC6D18] text-white py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC6D18]"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetLink;